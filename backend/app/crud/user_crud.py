from sqlalchemy import select
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.user import User
from ..schemas.user import UserRegister

# --- CREATE ---
async def create_user(session: AsyncSession, user_data: UserRegister) -> User:
    """Creates a new user record in the database."""

    db_user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        master_key_salt=user_data.master_key_salt,
        master_key_verifier=user_data.master_key_verifier,
        vault_key_encrypted=user_data.vault_key_encrypted,
        vault_key_nonce=user_data.vault_key_nonce,
        two_fa_enabled=False
    )

    session.add(db_user)
    await session.commit()
    await session.refresh(db_user)
    return db_user

# --- GET USER BY ID ---


async def get_user_by_id(session: AsyncSession, user_id: int) -> Optional[User]:
    """Retrieves a user by their primary ID."""
    return await session.get(User, user_id)


async def get_user_by_email(session: AsyncSession, email: str) -> Optional[User]:
    """Retrieves a user by their email (used for login/uniqueness checks)."""
    statement = select(User).where(User.email == email)
    result = await session.execute(statement)
    return result.scalars().first()

# --- UPDATE ---


async def update_user_email(session: AsyncSession, user_id: int, new_email: str) -> Optional[User]:
    """Updates a user's email address."""
    user = await session.get(User, user_id)
    if user:
        user.email = new_email

        await session.commit()
        await session.refresh(user)

        print(f"Updated user: {user}")
    return user

# --- DELETE ---


async def delete_user(session: AsyncSession, user_id: int) -> bool:
    """Deletes a user record."""
    user = await session.get(User, user_id)
    if user:
        await session.delete(user)
        await session.commit()
        return True
    return False
