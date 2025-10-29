from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..crud.vault_crud import create_update_vault, get_unique_tags, get_vault_by_id, get_vaults_by_tag, get_vaults_by_user_id, search_vaults
from ..schemas.vault import VaultRecordRequest, VaultRecordResponse, VaultRecordsResponse, VaultTagsResponse
import logging

logger = logging.getLogger(__name__)

async def process_vault_add_update(request: VaultRecordRequest, db: AsyncSession) -> VaultRecordResponse:
    logger.debug("Processing vault add/update request...")

    try:
        # Check if updating existing record
        if request.id:
            logger.info("Updating existing vault record with ID: %s", request.id)
            existing_vault = await get_vault_by_id(db, request.id)
            if not existing_vault:
                logger.warning("Vault record not found for update: %s", request.id)
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Vault record not found for update."
                )
        else:
            logger.info("Creating new vault record for user ID: %s", request.user_id)

        # Create or update the vault record
        vault_model = await create_update_vault(db, request)

        logger.info("Vault record processed successfully with ID: %s", vault_model.id)
        
        return VaultRecordResponse(
            status=True,
            record=vault_model
        )
    except HTTPException:
        # Re-raise HTTPExceptions to be handled by FastAPI
        raise
    except Exception as e:
        logger.error("Error processing vault add/update request: %s", e)
        return VaultRecordResponse(
            status=False,
            record=None,
            message=str(e)
        )

async def get_user_vaults(user_id: str, db: AsyncSession) -> VaultRecordsResponse:
    """Retrieve all vault records for a specific user."""

    try:
        result = await get_vaults_by_user_id(db, user_id)
        logger.debug("Retrieved user vaults successfully: %d records", len(result))

        return VaultRecordsResponse(
            status=True,
            records=result
        )
    except Exception as e:
        logger.error("Error retrieving user vaults: %s", e)
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
            logger.debug("Vault record with ID %s retrieved successfully.", record_id)
            return VaultRecordResponse(
                status=True,
                record=vault_record
            )
        else:
            logger.warning("Vault record with ID %s not found.", record_id)
            return VaultRecordResponse(
                status=False,
                record=None
            )
    except Exception as e:
        logger.error("Error retrieving vault record by ID: %s", e)
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
        logger.info("Vault record with ID %s deleted successfully.", record_id)
        return VaultRecordResponse(
            status=True,
            record=None,
            message="Vault record deleted successfully."
        )
    except Exception as e:
        logger.error("Error deleting vault record: %s", e)
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
        logger.error("Error retrieving user vault tags: %s", e)
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
        logger.error("Error retrieving vault records by tag: %s", e)
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
        logger.error("Error searching vault records: %s", e)
        return VaultRecordsResponse(
            status=False,
            records=None,
            message=str(e)
        )