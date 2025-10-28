from typing import Optional
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.vault import Vault

from ..schemas.vault import VaultInfo, VaultRecordRequest

async def get_vault_by_id(session: AsyncSession, vault_id: int) -> Optional[Vault]:
    """Retrieves a vault by its primary ID."""
    return await session.get(Vault, vault_id)

async def create_update_vault(session: AsyncSession, vault_data: VaultRecordRequest) -> Vault:
    """Creates or updates a vault record in the database."""

    # Handle both create and update
    if vault_data.id:
        # Update existing record
        db_vault = await session.get(Vault, vault_data.id)
        if not db_vault:
            raise ValueError("Vault record not found for update.")
        
        # Update fields (don't update user_id as it shouldn't change)
        db_vault.title = vault_data.title
        db_vault.login_id = vault_data.login_id
        db_vault.notes = vault_data.notes
        db_vault.password_ciphertext = vault_data.password_ciphertext

        db_vault.encryption_iv = vault_data.encryption_iv
        # db_vault.login_id_ciphertext = vault_data.login_id_ciphertext
        
        # Handle tags if provided
        if vault_data.tags is not None:
            db_vault.tags = vault_data.tags
    else:
        # Create new record
        db_vault = Vault(
            user_id=vault_data.user_id,
            title=vault_data.title,
            login_id=vault_data.login_id,
            notes=vault_data.notes,
            password_ciphertext=vault_data.password_ciphertext,
            encryption_iv=vault_data.encryption_iv,
            # login_id_ciphertext=vault_data.login_id_ciphertext,
            tags=vault_data.tags  # Will be None if not provided
        )

    session.add(db_vault)
    await session.commit()
    await session.refresh(db_vault, attribute_names=['user'])

    stmt = select(Vault).options(selectinload(Vault.user)).where(Vault.id == db_vault.id)
    vault_with_user = await session.execute(stmt)

    vault_with_user = vault_with_user.scalar_one()

    return vault_with_user

async def get_vault_by_id(session: AsyncSession, vault_id: int) -> Optional[Vault]:
    """Retrieves a vault by its primary ID, including the related user."""
    result = await session.execute(
        select(Vault).where(Vault.id == vault_id).options(selectinload(Vault.user))
    )
    return result.scalar_one_or_none()

async def get_vaults_by_user_id(session: AsyncSession, user_id: str) -> list[Vault]:
    """Retrieves all vaults for a given user ID ordered by creation date descending."""
    result = await session.execute(
        select(Vault).where(Vault.user_id == user_id).options(selectinload(Vault.user)).order_by(Vault.created_at.desc())
    )
    return result.scalars().all()

async def delete_vault_by_id(session: AsyncSession, vault_id: int) -> bool:
    """Deletes a vault by its primary ID."""
    db_vault = await session.get(Vault, vault_id)
    if not db_vault:
        return False

    await session.delete(db_vault)
    await session.commit()
    return True

async def get_vaults_by_tag(session: AsyncSession, user_id: str, tag: str) -> list[Vault]:
    """Retrieves all vaults for a given user ID that contain a specific tag."""
    result = await session.execute(
        select(Vault)
        .where(Vault.user_id == user_id)
        .where(func.lower(func.array_to_string(Vault.tags, ',')).contains(func.lower(tag)))
        .options(selectinload(Vault.user))
    )
    return result.scalars().all()

async def search_vaults(session: AsyncSession, user_id: str, query: str | None, tag: str | None) -> list[Vault]:
    """Searches vaults for a given user ID by title or notes."""
    lower_query = f"%{query.lower()}%" if query else None
    lower_tag = tag.lower() if tag else None

    stmt = select(Vault).where(Vault.user_id == user_id).options(selectinload(Vault.user))

    if lower_query:
        stmt = stmt.where((func.lower(Vault.title).like(lower_query)) | (func.lower(Vault.notes).like(lower_query)))

    if lower_tag:
        stmt = stmt.where(func.lower(func.array_to_string(Vault.tags, ',')).contains(lower_tag))

    result = await session.execute(stmt)
    return result.scalars().all()

async def get_unique_tags(session: AsyncSession, user_id: str) -> list[str]:
    """Retrieves a list of unique tags for a given user ID."""
    result = await session.execute(
        select(Vault.tags).where(Vault.user_id == user_id)
    )
    tags_lists = result.scalars().all()
    
    unique_tags = {}
    for tags in tags_lists:
        if tags:
            for tag in tags:
                lower_tag = tag.lower()
                unique_tags.setdefault(lower_tag, tag)  # Preserve first occurrence's case
    
    return list(unique_tags.values())