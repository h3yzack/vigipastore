from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..crud.vault_crud import create_update_vault, get_unique_tags, get_vault_by_id, get_vaults_by_tag, get_vaults_by_user_id, search_vaults
from ..schemas.vault import VaultRecordRequest, VaultRecordResponse, VaultRecordsResponse, VaultTagsResponse


async def process_vault_add_update(request: VaultRecordRequest, db: AsyncSession) -> VaultRecordResponse:
    print("Processing vault add/update request...")

    try:
        # Check if updating existing record
        if request.id:
            print(f"Updating existing vault record with ID: {request.id}")
            existing_vault = await get_vault_by_id(db, request.id)
            if not existing_vault:
                print("Vault record not found for update.")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Vault record not found for update."
                )
        else:
            print(f"Creating new vault record for user ID: {request.user_id}")

        # Create or update the vault record
        vault_model = await create_update_vault(db, request)
        
        print(f"Vault record processed successfully with ID: {vault_model.id}")
        
        return VaultRecordResponse(
            status=True,
            record=vault_model
        )
    except HTTPException:
        # Re-raise HTTPExceptions to be handled by FastAPI
        raise
    except Exception as e:
        print("Error processing vault add/update request:", e)
        return VaultRecordResponse(
            status=False,
            record=None,
            message=str(e)
        )

async def get_user_vaults(user_id: str, db: AsyncSession) -> VaultRecordsResponse:
    """Retrieve all vault records for a specific user."""

    try:
        result = await get_vaults_by_user_id(db, user_id)
        print("Retrieved user vaults successfully.", result)

        return VaultRecordsResponse(
            status=True,
            records=result
        )
    except Exception as e:
        print("Error retrieving user vaults:", e)
        return VaultRecordsResponse(
            status=False,
            records=None,
            message=str(e)
        )

async def get_user_vault_by_id(db: AsyncSession, record_id: str, user_id: str) -> VaultRecordResponse:
    """Retrieve a vault record by its ID."""
    try:
        vault_record = await get_vault_by_id(db, record_id)
        if vault_record and vault_record.user_id == user_id:
            print(f"Vault record with ID {record_id} retrieved successfully.")
            return VaultRecordResponse(
                status=True,
                record=vault_record
            )
        else:
            print(f"Vault record with ID {record_id} not found.")
            return VaultRecordResponse(
                status=False,
                record=None
            )
    except Exception as e:
        print("Error retrieving vault record by ID:", e)
        return VaultRecordResponse(
            status=False,
            record=None,
            message=str(e)
        )

async def process_vault_delete(record_id: str, user_id: str, db: AsyncSession) -> VaultRecordResponse:
    """Delete a vault record by its ID."""
    try:
        vault_record = await get_vault_by_id(db, record_id)
        if not vault_record or vault_record.user_id != user_id:
            return VaultRecordResponse(
                status=False,
                record=None,
                message="Vault record not found or access denied."
            )

        await db.delete(vault_record)
        await db.commit()
        print(f"Vault record with ID {record_id} deleted successfully.")
        return VaultRecordResponse(
            status=True,
            record=None,
            message="Vault record deleted successfully."
        )
    except Exception as e:
        print("Error deleting vault record:", e)
        return VaultRecordResponse(
            status=False,
            record=None,
            message=str(e)
        )

async def get_user_vault_tags(user_id: str, db: AsyncSession) -> VaultTagsResponse:
    """Retrieve all unique tags for a specific user's vault records."""

    try:
        tags_list = await get_unique_tags(db, user_id)

        return VaultTagsResponse(
            status=True,
            tags=tags_list
        )
    except Exception as e:
        print("Error retrieving user vault tags:", e)
        return VaultTagsResponse(
            status=False,
            tags=None,
            message=str(e)
        )

async def get_user_vault_by_tag(user_id: str, tag: str, db: AsyncSession) -> VaultRecordsResponse:
    """Retrieve vault records for a specific user filtered by tag."""

    try:
        all_vaults = await get_vaults_by_tag(db, user_id, tag)
        
        return VaultRecordsResponse(
            status=True,
            records=all_vaults
        )
    except Exception as e:
        print("Error retrieving vault records by tag:", e)
        return VaultRecordsResponse(
            status=False,
            records=None,
            message=str(e)
        )

async def search_vault_records(user_id: str, query: str | None, tag: str | None, db: AsyncSession) -> VaultRecordsResponse:
    """Search vault records for a specific user based on a query string."""

    try:
        all_vaults = await search_vaults(db, user_id, query, tag)

        return VaultRecordsResponse(
            status=True,
            records=all_vaults
        )
    except Exception as e:
        print("Error searching vault records:", e)
        return VaultRecordsResponse(
            status=False,
            records=None,
            message=str(e)
        )