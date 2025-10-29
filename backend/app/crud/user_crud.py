from sqlalchemy import select
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.user import User
from ..schemas.user import UserInfo, UserPublic, UserRegister

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


async def update_user_profile(session: AsyncSession, user_info: UserPublic) -> Optional[User]:
    """Updates a user's profile information."""
    user = await session.get(User, user_info.id)
    if user:
        # user.email = user_info.email # cannot update email once registered
        user.full_name = user_info.full_name
        user.two_fa_enabled = user_info.two_fa_enabled

        await session.commit()
        await session.refresh(user)

    return user

async def update_user(session: AsyncSession, user: User) -> Optional[User]:
    """Updates a user's information."""
    existing_user = await session.get(User, user.id)
    if existing_user:
        existing_user.full_name = user.full_name
        existing_user.email = user.email
        existing_user.master_key_salt = user.master_key_salt
        existing_user.master_key_verifier = user.master_key_verifier
        existing_user.vault_key_encrypted = user.vault_key_encrypted
        existing_user.vault_key_nonce = user.vault_key_nonce
        existing_user.two_fa_enabled = user.two_fa_enabled

        await session.commit()
        await session.refresh(existing_user)

    return existing_user