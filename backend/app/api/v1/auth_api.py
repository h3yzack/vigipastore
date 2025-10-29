
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from ...database import get_db
from ...services.user_service import process_user_login_finish, process_user_login_start, process_user_register_finish, process_user_register_or_reset_start
from ...schemas.user import AuthResponse, LoginFinishRequest, LoginStartRequest, LoginStartResponse, RegisterFinishRequest, RegisterFinishResponse, RegisterStartRequest, RegistrationStartResponse
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register/start", response_model=RegistrationStartResponse)
async def register_start(request: RegisterStartRequest):
    logger.info("Received registration start request from: %s", request.email)

    response = process_user_register_or_reset_start(request)

    return response

@router.post("/register/finish", response_model=RegisterFinishResponse)
async def register_finish(request: RegisterFinishRequest, db: AsyncSession = Depends(get_db)):

    logger.info("Received registration finish request from: %s", request.user_info.email)

    response = await process_user_register_finish(request, db)

    return response

@router.post("/login/start", response_model=LoginStartResponse)
async def login_start(request: LoginStartRequest, db: AsyncSession = Depends(get_db)):
    logger.info("Received login start request from: %s", request.email)

    try:
        response = await process_user_login_start(request, db)
        logger.debug("Login start response: %s", response.login_response)

        return response
    except Exception as e:
        logger.error("Error printing login start response: %s", e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login/finish", response_model=AuthResponse)
async def login_finish(request: LoginFinishRequest, db: AsyncSession = Depends(get_db)):
    logger.info("Received login finish request from: %s", request.email)

    try:
        response = await process_user_login_finish(request, db)
        logger.debug("Login finish response: %s: %s", response.user.email, response.status)

        return response
    except Exception as e:
        logger.error("Error printing login finish response: %s", e)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
