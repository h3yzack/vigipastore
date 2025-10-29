from datetime import datetime
import traceback
from typing import Optional
from fastapi import HTTPException, status
import opaque
from sqlalchemy.ext.asyncio import AsyncSession
import time

from ..core.auth_jwt import create_access_token
from ..core.common import base64url_decode, base64url_encode
from ..schemas.user import AuthResponse, LoginFinishRequest, LoginStartRequest, LoginStartResponse, RegisterFinishRequest, RegisterFinishResponse, RegisterStartRequest, RegistrationStartResponse, ResetFinishRequest, ResetFinishResponse, UserPublic, UserRecord, UserRecordResponse, UserRegister
from ..crud.user_crud import get_user_by_email, create_user, get_user_by_id, update_user, update_user_profile
from ..core import settings
import logging

logger = logging.getLogger(__name__)

_registration_state_store: dict[str, tuple[bytes, float]] = {}
_login_state_store: dict[str, tuple[bytes, float]] = {}
_REGISTRATION_STATE_TTL = 300  # seconds (5 minutes)
_LOGIN_STATE_TTL = 300  # seconds (5 minutes)

# TODO replace this temporary storage with better solution
def _cleanup_registration_store() -> None:
    now = time.time()
    expired = [k for k, (_, ts) in _registration_state_store.items() if now - ts > _REGISTRATION_STATE_TTL]
    for k in expired:
        del _registration_state_store[k]

def store_secS_for_email(email: str, secS: bytes) -> None:
    _cleanup_registration_store()
    _registration_state_store[email] = (secS, time.time())

def pop_secS_for_email(email: str) -> Optional[bytes]:
    entry = _registration_state_store.pop(email, None)
    return entry[0] if entry is not None else None

def _cleanup_login_store() -> None:
    now = time.time()
    expired = [k for k, (_, ts) in _login_state_store.items() if now - ts > _LOGIN_STATE_TTL]
    for k in expired:
        del _login_state_store[k]

def store_login_secS_for_email(email: str, secS: bytes) -> None:
    _cleanup_login_store()
    _login_state_store[email] = (secS, time.time())

def pop_login_secS_for_email(email: str) -> Optional[bytes]:
    entry = _login_state_store.pop(email, None)
    return entry[0] if entry is not None else None


def process_user_register_or_reset_start(request: RegisterStartRequest) -> RegistrationStartResponse:
    logger.debug("Processing user registration start...")

    server_key = base64url_decode(settings.SERVER_KEY)

    secS, pub = opaque.CreateRegistrationResponse(request.registration_request, server_key)

    # length of secS
    logger.debug("Length of secS: %d, Expected: %d", len(secS), opaque.OPAQUE_REGISTER_SECRET_LEN)

    try:
        store_secS_for_email(request.email, secS)
    except Exception:
        # don't expose internal errors to client; log and continue
        logger.error("Warning: failed to store secS in temporary store for %s", request.email)
    

    return RegistrationStartResponse(
        registration_response=base64url_encode(pub)
    )

async def process_user_register_finish(request: RegisterFinishRequest, db: AsyncSession) -> RegisterFinishResponse:

    logger.debug("Processing user registration finish...")

    #  check user existence
    existing = await get_user_by_email(db, request.user_info.email)
    if existing:
        logger.warning("User already exists with email: %s", request.user_info.email)
        return RegisterFinishResponse(status=False)

    secS = pop_secS_for_email(request.user_info.email)

    rec1 = opaque.StoreUserRecord(
        secS,
        request.master_key_verifier,
    )

    # Create new user
    user_data = UserRegister(
        full_name=request.user_info.full_name,
        email=request.user_info.email,
        master_key_salt=request.master_key_salt,
        master_key_verifier=rec1,
        vault_key_encrypted=request.encrypted_vault_key,
        vault_key_nonce=request.vault_key_nonce
    )

    new_user = await create_user(db, user_data)

    if not new_user:
        print("Failed to create new user.")
        return RegisterFinishResponse(status=False)

    logger.info("Successfully created new user with ID: %s", new_user.id)

    return RegisterFinishResponse(status=True)

async def process_user_login_start(request: LoginStartRequest, db: AsyncSession):
    try:
        logger.debug("Processing user login start...")
        user = await get_user_by_email(db, request.email)
        if not user:
            logger.warning("No user found with email: %s", request.email)
            raise HTTPException(status_code=400, detail="Invalid credentials")
        

        ids = opaque.Ids(request.email, settings.SERVER_IDENTITY)
        ctx = settings.SERVER_IDENTITY + "-" + settings.APP_VERSION

        resp, sk, secS = opaque.CreateCredentialResponse(request.login_request, user.master_key_verifier, ids, ctx )

        try:
            store_login_secS_for_email(request.email, secS)
        except Exception:
            # don't expose internal errors to client; log and continue
            logger.error("Warning: failed to store login secS in temporary store for %s", request.email)

        base64Resp = base64url_encode(resp)

        logger.debug("Create Credential Response: %s", base64Resp)

        return LoginStartResponse(login_response=base64Resp)

    except Exception as e:
        logger.error("Error processing user login start: %s", e)
        raise HTTPException(status_code=500, detail="Failed to process user login start")

async def process_user_login_finish(request: LoginFinishRequest, db: AsyncSession):
    try:
        logger.debug("Processing user login finish...")
        user = await get_user_by_email(db, request.email)
        if not user:
            logger.warning("No user found with email: %s", request.email)
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        
        secS = pop_login_secS_for_email(request.email)
        # if matched, no error thrown
        opaque.UserAuth(secS, request.finish_login_request) 

        # JWT token
        access_token = create_access_token(subject=user.id)

        auth_response = AuthResponse(
            status=True,
            access_token=access_token,
            master_key_salt=user.master_key_salt,
            encrypted_vault_key=user.vault_key_encrypted,
            vault_key_nonce=user.vault_key_nonce,
            user=UserPublic.model_validate(user)
        )

        # update login timestamp
        user.last_login_at = datetime.now()
        await db.commit()
        await db.refresh(user)

        return auth_response

    except Exception as e:
        logger.error("Error processing user login finish: %s", e)
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Failed to process user login finish")

    
async def process_user_update_profile (
        user_id: str,
        profile_data: UserPublic,
        db: AsyncSession
    ) -> UserRecordResponse:
        
        user = await get_user_by_id(db, user_id)
        if not user or user.id != user_id:
            return UserRecordResponse(
                status=False,
                user=None,
                message="User not found or unauthorized"
            )
        
        try:
            updated_user = await update_user_profile(db, profile_data)
            return UserRecordResponse(
                status=True,
                user=UserPublic.model_validate(updated_user),
                message="User profile updated successfully"
            )
        except Exception as e:
            print("Error logging user profile update:", e)
            return UserRecordResponse(
                status=False,
                user=None,
                message=str(e)
            )

async def process_get_user_record(
        user_id: str,
        authenticated_user_id: str,
        db: AsyncSession
    ) -> UserRecord:
        
        user = await get_user_by_id(db, user_id)
        if not user or user.id != authenticated_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

        return UserRecord.model_validate(user)

async def process_reset_master_pwd_finish(request: ResetFinishRequest, db: AsyncSession) -> ResetFinishResponse:

    logger.debug("Processing user reset master pwd finish...")

    #  check user existence
    user = await get_user_by_id(db, request.user_id)
    if not user:
        logger.warning("User not found: %s", request.user_id)
        return ResetFinishResponse(status=False)

    secS = pop_secS_for_email(user.email)

    logger.debug("Length of retrieved secS: %s", len(secS) if secS else "None")

    rec1 = opaque.StoreUserRecord(
        secS,
        request.master_key_verifier,
    )

    user.master_key_salt = request.master_key_salt
    user.master_key_verifier = rec1
    user.vault_key_encrypted = request.encrypted_vault_key
    user.vault_key_nonce = request.vault_key_nonce


    updated_user = await update_user(db, user)

    if not updated_user:
        logger.error("Failed to update user.")
        return ResetFinishResponse(status=False)

    logger.info("Successfully updated user with ID: %s", updated_user.id)

    return ResetFinishResponse(status=True, user_info=UserPublic.model_validate(updated_user))