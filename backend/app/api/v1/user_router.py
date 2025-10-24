
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ...schemas.user import UserPublicBase
from ...core.auth_filter import get_current_user_from_header
from ...database import get_db
from ...crud import user_crud

router = APIRouter(prefix="/user", tags=["users"],
                   dependencies=[Depends(get_current_user_from_header)])

# GET USER BY ID
@router.get("/{user_id}", response_model=UserPublicBase)
async def get_user(user_id: str, db: AsyncSession = Depends(get_db)):
    user = await user_crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

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

    print(new_email)

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