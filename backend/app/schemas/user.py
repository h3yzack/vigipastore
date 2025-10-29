import datetime
from typing import Annotated, Optional
from pydantic import BaseModel, EmailStr, Field, PlainSerializer, field_validator

from ..core.common import base64url_decode, base64url_encode, serialize_datetime

class UserInfo(BaseModel):
    id: Optional[str] = None
    full_name: str
    email: EmailStr

    class Config:
        from_attributes = True

class RegisterStartRequest(BaseModel):
    email: EmailStr = Field(..., example="john.doe@example.com")
    registration_request: bytes

    @field_validator("email")
    def _validate_email(cls, v):
        if not v:
            raise ValueError("Email is required")
        return v

    @field_validator("registration_request", mode="before")
    def _decode_b64url(cls, v):
        if isinstance(v, str):
            return base64url_decode(v)
        raise TypeError("expected bytes or base64 string for binary field")

class RegistrationStartResponse(BaseModel):
    registration_response: str = Field(..., example="QWxhZGRpbjpvcGVuIHNlc2FtZQ==")  # Opaque registration response as a base64-encoded string

class RegisterFinishRequest(BaseModel):
    user_info: UserInfo
    master_key_salt: bytes
    encrypted_vault_key: bytes
    vault_key_nonce: bytes
    master_key_verifier: bytes

    @field_validator(
            "master_key_salt",
            "encrypted_vault_key",
            "vault_key_nonce",
            "master_key_verifier",
            mode="before",
            )
    def _decode_b64url(cls, v):
        if isinstance(v, str):
            return base64url_decode(v)
        raise TypeError("expected bytes or base64 string for binary field")

class RegisterFinishResponse(BaseModel):
    user_info: Optional[UserInfo] = None
    status: bool

class UserPublicBase(BaseModel):
    id: str = Field(..., example=1)
    full_name: str = Field(..., example="John Doe")
    email: EmailStr = Field(..., example="john.doe@example.com")
    two_fa_enabled: bool = Field(..., example=False)

    class Config:
        from_attributes = True

class UserRegister(BaseModel):
    full_name: str = Field(..., example="John Doe")
    email: EmailStr = Field(..., example="john.doe@example.com")
    master_key_salt: bytes
    master_key_verifier: bytes
    vault_key_encrypted: bytes
    vault_key_nonce: bytes

class LoginStartRequest(BaseModel):
    email: EmailStr = Field(..., example="john.doe@example.com")
    login_request: bytes = Field(..., example="QWxhZGRpbjpvcGVuIHNlc2FtZQ==")  # Opaque login request as a base64-encoded string

    @field_validator("email")
    def _validate_email(cls, v):
        if not v:
            raise ValueError("Email is required")
        return v
    
    @field_validator("login_request", mode="before")
    def _decode_b64url(cls, v):
        if isinstance(v, str):
            return base64url_decode(v)
        raise TypeError("expected bytes or base64 string for binary field")

class LoginStartResponse(BaseModel):
    login_response: str = Field(..., example="QWxhZGRpbjpvcGVuIHNlc2FtZQ==") 

class LoginFinishRequest(BaseModel):
    email: EmailStr = Field(..., example="john.doe@example.com")
    finish_login_request: bytes = Field(..., example="QWxhZGRpbjpvcGVuIHNlc2FtZQ==")

    @field_validator("email")
    def _validate_email(cls, v):
        if not v:
            raise ValueError("Email is required")
        return v
    
    @field_validator("finish_login_request", mode="before")
    def _decode_b64url(cls, v):
        if isinstance(v, str):
            return base64url_decode(v)
        raise TypeError("expected bytes or base64 string for binary field")

class UserLogin(BaseModel):
    email: EmailStr = Field(..., example="john.doe@example.com")
    master_key_verifier_hash: str

class UserPublic(UserPublicBase):
    pass

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: str
    exp: int
    jti: Optional[str] = None

class AuthResponse(BaseModel):
    status: bool
    access_token: str 
    master_key_salt: Annotated[bytes, PlainSerializer(lambda x: base64url_encode(x), return_type=str)]
    encrypted_vault_key: Annotated[bytes, PlainSerializer(lambda x: base64url_encode(x), return_type=str)]
    vault_key_nonce: Annotated[bytes, PlainSerializer(lambda x: base64url_encode(x), return_type=str)]

    # 3. Public User Details (Optional)
    user: Optional[UserPublic] = None


class UserCreateInternal(BaseModel):
    full_name: str
    email: EmailStr
    master_key_salt: bytes
    master_key_verifier: bytes
    vault_key_encrypted: bytes
    two_fa_enabled: bool = False

    class Config:
        from_attributes = True

class UserProfile(BaseModel):
    id: str = Field(..., example=1)
    full_name: str = Field(..., example="John Doe")
    two_fa_enabled: bool = Field(..., example=False)

class UserRecordResponse(BaseModel):
    status: bool
    user: Optional[UserPublic] = None
    message: Optional[str] = None

class UserRecord(UserPublicBase):
    master_key_salt: Annotated[bytes, PlainSerializer(lambda x: base64url_encode(x), return_type=str)]
    # master_key_verifier: Annotated[bytes, PlainSerializer(lambda x: base64url_encode(x), return_type=str)]
    vault_key_encrypted: Annotated[bytes, PlainSerializer(lambda x: base64url_encode(x), return_type=str)]
    vault_key_nonce: Annotated[bytes, PlainSerializer(lambda x: base64url_encode(x), return_type=str)]

    created_at: Annotated[
        datetime.datetime,
        PlainSerializer(serialize_datetime, return_type=str)
    ]
    updated_at: Annotated[
        datetime.datetime,
        PlainSerializer(serialize_datetime, return_type=str)
    ]

class ResetStartRequest(RegisterStartRequest):
    pass

class ResetStartResponse(RegistrationStartResponse):
    pass
class ResetFinishRequest(BaseModel):
    user_id: str
    master_key_salt: bytes
    encrypted_vault_key: bytes
    vault_key_nonce: bytes
    master_key_verifier: bytes

    @field_validator(
            "master_key_salt",
            "encrypted_vault_key",
            "vault_key_nonce",
            "master_key_verifier",
            mode="before",
            )
    def _decode_b64url(cls, v):
        if isinstance(v, str):
            return base64url_decode(v)
        raise TypeError("expected bytes or base64 string for binary field")
class ResetFinishResponse(BaseModel):
    user_info: Optional[UserInfo] = None
    status: bool