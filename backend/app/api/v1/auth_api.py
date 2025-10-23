
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from ...database import get_db
from ...services.user_service import process_user_login_finish, process_user_login_start, process_user_register_finish, process_user_register_start
from ...schemas.user import AuthResponse, LoginFinishRequest, LoginStartRequest, LoginStartResponse, RegisterFinishRequest, RegisterFinishResponse, RegisterStartRequest, RegistrationStartResponse


router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register/start", response_model=RegistrationStartResponse)
async def register_start(request: RegisterStartRequest):
    print("Received registration start request:", request)

    response = process_user_register_start(request)

    return response

@router.post("/register/finish", response_model=RegisterFinishResponse)
async def register_finish(request: RegisterFinishRequest, db: AsyncSession = Depends(get_db)):

    print("Received registration finish request:", request.user_info)

    response = await process_user_register_finish(request, db)

    return response

@router.post("/login/start", response_model=LoginStartResponse)
async def login_start(request: LoginStartRequest, db: AsyncSession = Depends(get_db)):
    print("Received login start request:", request)

    try:
        response = await process_user_login_start(request, db)
        print("Login start response:", response)

        return response
    except Exception as e:
        print("Error printing login start response:", e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login/finish", response_model=AuthResponse)
async def login_finish(request: LoginFinishRequest, db: AsyncSession = Depends(get_db)):
    print("Received login finish request: ", request)

    try:
        response = await process_user_login_finish(request, db)
        print("Login finish response:", response)

        return response
    except Exception as e:
        print("Error printing login finish response:", e)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
