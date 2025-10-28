
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ...services.user_service import process_get_user_record, process_reset_master_pwd_finish, process_user_register_or_reset_start, process_user_update_profile

from ...schemas.user import ResetFinishRequest, ResetFinishResponse, ResetStartRequest, ResetStartResponse, UserProfile, UserPublicBase, UserRecord, UserRecordResponse
from ...core.auth_filter import get_current_user_from_header
from ...database import get_db
from ...crud import user_crud

router = APIRouter(prefix="/user", tags=["users"],
                   dependencies=[Depends(get_current_user_from_header)])

# GET USER BY ID


@router.get("/{user_id}/public", response_model=UserPublicBase)
async def get_user(user_id: str, db: AsyncSession = Depends(get_db)):
    user = await user_crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# GET USER ACCOUNT RECORD
@router.get("/{user_id}/record", response_model=UserRecord)
async def get_user_record(user_id: str, db: AsyncSession = Depends(get_db),
                          current_user=Depends(get_current_user_from_header)):

    response = await process_get_user_record(
        user_id=user_id,
        authenticated_user_id=current_user.id,
        db=db
    )

    return response

# GET USER BY EMAIL


@router.get("/email/{email}", response_model=UserPublicBase)
async def get_user_by_email(email: str, db: AsyncSession = Depends(get_db)):
    user = await user_crud.get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# UPDATE USER EMAIL By ID


@router.put("/{user_id}/email", response_model=UserPublicBase)
async def update_email(user_id: str, new_email: str, db: AsyncSession = Depends(get_db)):
    user = await user_crud.get_user_by_id(db, user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    updated_user = await user_crud.update_user_email(db, user_id, new_email)
    return updated_user

# DELETE USER BY ID


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str, db: AsyncSession = Depends(get_db)):
    """Deletes a user record by ID."""
    if not await user_crud.delete_user(db, user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return {"ok": True}

# Update self user profile information


@router.put("/profile", response_model=UserRecordResponse)
async def update_user_profile(
    profile_data: UserProfile,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user_from_header),
) -> UserRecordResponse:

    response = await process_user_update_profile(
        user_id=current_user.id,
        profile_data=profile_data,
        db=db
    )

    return response

@router.post("/reset/start", response_model=ResetStartResponse)
async def reset_start(request: ResetStartRequest,
                      current_user=Depends(get_current_user_from_header)):
    
    print("Received reset start request:", request)
    if current_user.email != request.email:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    response = process_user_register_or_reset_start(request)

    return response

@router.post("/reset/finish", response_model=ResetFinishResponse)
async def reset_finish(request: ResetFinishRequest, 
                       db: AsyncSession = Depends(get_db),
                       current_user=Depends(get_current_user_from_header)):

    print("Received reset finish request:", request.user_id)

    if (current_user.id != request.user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    response = await process_reset_master_pwd_finish(request, db)

    return response