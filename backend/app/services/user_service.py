import traceback
from typing import Optional
from fastapi import HTTPException, status
import opaque
from sqlalchemy.ext.asyncio import AsyncSession
import time

from ..core.auth_jwt import create_access_token
from ..core.common import base64url_decode, base64url_encode
from ..schemas.user import AuthResponse, LoginFinishRequest, LoginStartRequest, LoginStartResponse, RegisterFinishRequest, RegisterFinishResponse, RegisterStartRequest, RegistrationStartResponse, UserPublic, UserRegister
from ..crud.user_crud import get_user_by_email, create_user
from ..core import settings

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


def process_user_register_start(request: RegisterStartRequest) -> RegistrationStartResponse:
    print("Processing user registration start...")
    print("Received registration request:", request)

    server_key = base64url_decode(settings.SERVER_KEY)

    print("length of server key:", len(server_key))

    secS, pub = opaque.CreateRegistrationResponse(request.registration_request, server_key)

    # length of secS
    print("Length of secS:", len(secS), "Expected:", opaque.OPAQUE_REGISTER_SECRET_LEN)

    try:
        store_secS_for_email(request.email, secS)
    except Exception:
        # don't expose internal errors to client; log and continue
        print("Warning: failed to store secS in temporary store for", request.email)
    
    #  calculate length of pub
    print("Length of public key:", len(pub))

    return RegistrationStartResponse(
        registration_response=base64url_encode(pub)
    )

async def process_user_register_finish(request: RegisterFinishRequest, db: AsyncSession) -> RegisterFinishResponse:

    print("Processing user registration finish...", len(request.master_key_verifier))

    #  check user existence
    existing = await get_user_by_email(db, request.user_info.email)
    if existing:
        print("User already exists with email:", request.user_info.email)
        return RegisterFinishResponse(status=False)

    secS = pop_secS_for_email(request.user_info.email)

    # length of secS
    print("Length of retrieved secS:", len(secS) if secS else "None")

    rec1 = opaque.StoreUserRecord(
        secS,
        request.master_key_verifier,
    )

    print("Created user record of length:", len(rec1))


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

    print("Successfully created new user with ID:", new_user.id)

    return RegisterFinishResponse(status=True)

async def process_user_login_start(request: LoginStartRequest, db: AsyncSession):
    try:
        print("processing user login start...")
        user = await get_user_by_email(db, request.email)
        if not user:
            print("No user found with email:", request.email)
            raise HTTPException(status_code=400, detail="Invalid credentials")
        

        ids = opaque.Ids(request.email, settings.SERVER_ID)
        ctx = settings.SERVER_ID + "-" + settings.APP_VERSION
        
        print("master verifier length :", len(user.master_key_verifier))
        print("OPAQUE_USER_RECORD_LEN: ", opaque.OPAQUE_USER_RECORD_LEN)
        print("OPAQUE_USER_SESSION_PUBLIC_LEN: ", opaque.OPAQUE_USER_SESSION_PUBLIC_LEN)

        print("Length of login request:", len(request.login_request))

        resp, sk, secS = opaque.CreateCredentialResponse(request.login_request, user.master_key_verifier, ids, ctx )

        try:
            store_login_secS_for_email(request.email, secS)
        except Exception:
            # don't expose internal errors to client; log and continue
            print("Warning: failed to store login secS in temporary store for", request.email)

        base64Resp = base64url_encode(resp)

        print("Create Credential Response: ", base64Resp)

        return LoginStartResponse(login_response=base64Resp)

    except Exception as e:
        print("Error processing user login start:", e)
        raise HTTPException(status_code=500, detail="Failed to process user login start")

async def process_user_login_finish(request: LoginFinishRequest, db: AsyncSession):
    try:
        print("processing user login finish...")
        user = await get_user_by_email(db, request.email)
        if not user:
            print("No user found with email:", request.email)
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

        return auth_response

    except Exception as e:
        print("Error processing user login finish:", e)
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Failed to process user login finish")