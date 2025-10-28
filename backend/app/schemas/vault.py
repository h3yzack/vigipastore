
import datetime
from typing import List, Optional
from typing_extensions import Annotated
from pydantic import BaseModel, Field, PlainSerializer, field_validator

from ..core.common import base64url_decode, base64url_encode, serialize_datetime

from ..schemas.user import UserInfo

class VaultBasicInfo(BaseModel):
    id: str
    title: str

    class Config:
        from_attributes = True

class VaultInfo(BaseModel):
    id: Optional[str] = None
    title: str
    login_id: str
    notes: Optional[str] = None
    password_ciphertext: Annotated[bytes, PlainSerializer(lambda x: base64url_encode(x), return_type=str)]
    # login_id_ciphertext: Optional[Annotated[bytes, PlainSerializer(lambda x: base64url_encode(x), return_type=str)]] = None
    encryption_iv: Annotated[bytes, PlainSerializer(lambda x: base64url_encode(x), return_type=str)]
    tags: Optional[List[str]] = None
    created_at: Annotated[
        datetime.datetime,
        PlainSerializer(serialize_datetime, return_type=str)
    ]
    updated_at: Annotated[
        datetime.datetime,
        PlainSerializer(serialize_datetime, return_type=str)
    ]
    user: UserInfo = Field(alias="user")

    class Config:
        from_attributes = True

class VaultRecordRequest(BaseModel):
    id: Optional[str] = None
    user_id: str = Field(exclude=True)
    title: str
    login_id: str
    notes: Optional[str] = None
    password_ciphertext: bytes
    encryption_iv: bytes
    tags: Optional[List[str]] = None
    # login_id_ciphertext: Optional[bytes] = None

    @field_validator(
            "password_ciphertext",
            "encryption_iv",
            mode="before",
            )
    def _decode_b64url(cls, v):
        if isinstance(v, str):
            return base64url_decode(v)
        raise TypeError("expected string for binary field")

class VaultRecordResponse(BaseModel):
    status: bool
    record: Optional[VaultInfo] = None
    message: Optional[str] = None

class VaultRecordsResponse(BaseModel):
    status: bool
    records: Optional[List[VaultInfo]] = None
    message: Optional[str] = None

class VaultTagsResponse(BaseModel):
    status: bool
    tags: Optional[List[str]] = None
    message: Optional[str] = None