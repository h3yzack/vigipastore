
import urllib
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ...services.vault_service import get_user_vault_by_id, get_user_vault_by_tag, get_user_vault_tags, get_user_vaults, get_vault_by_id, process_vault_add_update, process_vault_delete, search_vault_records
from ...schemas.vault import VaultRecordRequest, VaultRecordResponse, VaultRecordsResponse, VaultTagsResponse
from ...database import get_db
from ...core.auth_filter import get_current_user_from_header


router = APIRouter(
    prefix="/vault",
    tags=["vault"],
    dependencies=[Depends(get_current_user_from_header)]
)


@router.post("/", response_model=VaultRecordResponse)
async def add_update_record(
    request: VaultRecordRequest,
    current_user=Depends(get_current_user_from_header),
    db: AsyncSession = Depends(get_db)
):
    print("Received add_update_record request:", request)

    # Set user_id from authenticated user to prevent unauthorized access
    request.user_id = current_user.id

    response = await process_vault_add_update(request, db)

    return response

@router.get("/user", response_model=VaultRecordsResponse)
async def get_vaults_record_for_user(
    current_user=Depends(get_current_user_from_header),
    db: AsyncSession = Depends(get_db)
):
    print("Received get_vaults_record_for_user request")

    response = await get_user_vaults(current_user.id, db)

    return response

@router.get("/user/{record_id}", response_model=VaultRecordResponse)
async def get_vault_record(
    record_id: str,
    current_user=Depends(get_current_user_from_header),
    db: AsyncSession = Depends(get_db)
):
    print(f"Received get_vault_record request for record ID: {record_id}")

    response = await get_user_vault_by_id(db, record_id=record_id, user_id=current_user.id)

    return response

@router.delete("/{record_id}", response_model=VaultRecordResponse)
async def delete_vault_record(
    record_id: str,
    current_user=Depends(get_current_user_from_header),
    db: AsyncSession = Depends(get_db)
):
    print(f"Received delete_vault_record request for record ID: {record_id}")

    response = await process_vault_delete(record_id, current_user.id, db)  
    return response

@router.get("/tags", response_model=VaultTagsResponse)
async def get_vault_tags_for_user(
    current_user=Depends(get_current_user_from_header),
    db: AsyncSession = Depends(get_db)
):
    print("Received get_vault_tags_for_user request")

    response = await get_user_vault_tags(current_user.id, db)

    return response

@router.get("/filter/{tag}", response_model=VaultRecordsResponse)
async def filter_vaults_by_tag(
    tag: str,
    current_user=Depends(get_current_user_from_header),
    db: AsyncSession = Depends(get_db)
):
    print(f"Received filter_vaults_by_tag request for tag: {tag}")

    # decode url-encoded tag
    decoded_tag = urllib.parse.unquote(tag)

    response = await get_user_vault_by_tag(current_user.id, decoded_tag, db)

    return response

@router.get("/search", response_model=VaultRecordsResponse)
async def search_vaults(
    query: str | None = None,
    tag: str | None = None,
    current_user=Depends(get_current_user_from_header),
    db: AsyncSession = Depends(get_db)
):
    print(f"Received search_vaults request for query: {query}")
    decoded_query = urllib.parse.unquote(query) if query else None
    decoded_tag = urllib.parse.unquote(tag) if tag else None

    response = await search_vault_records(current_user.id, decoded_query, decoded_tag, db)

    return response