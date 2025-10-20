from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserPublicBase(BaseModel):
    id: int = Field(..., example=1)
    full_name: str = Field(..., example="John Doe")
    email: EmailStr = Field(..., example="john.doe@example.com")
    two_fa_enabled: bool = Field(..., example=False)

    class Config:
        from_attributes = True

class UserRegister(BaseModel):
    full_name: str = Field(..., example="John Doe")
    email: EmailStr = Field(..., example="john.doe@example.com")
    password: str

class UserLogin(BaseModel):
    email: EmailStr = Field(..., example="john.doe@example.com")
    master_key_verifier_hash: str

class UserPublic(UserPublicBase):
    pass

class AuthResponse(BaseModel):
    access_token: str 
    token_type: str = "bearer"
    
    # 1. Zero-Knowledge Keys
    vault_key_encrypted: bytes
    
    # 2. 2FA Check
    two_fa_enabled: bool
    
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