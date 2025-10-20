from typing import Optional
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, LargeBinary, DateTime
from sqlalchemy.sql import func
from ..database import Base 

class User(Base):
    __tablename__ = "users"

    id: int = Column(Integer, primary_key=True, index=True)

    full_name: str = Column(String, nullable=False)

    email: str = Column(String, index=True, nullable=False, unique=True)

    master_key_salt: bytes = Column(LargeBinary(length=32), nullable=False)  # Salt for KDF

    master_key_verifier: bytes = Column(LargeBinary(length=64), nullable=False)  # Verifier for password check

    vault_key_encrypted: bytes = Column(LargeBinary, nullable=False)  # Encrypted vault key

    # ----------------------------------------------------------------------
    # --- Two-Factor Authentication (2FA)  ---
    # ----------------------------------------------------------------------

    two_fa_enabled: bool = Column(Boolean, default=False, nullable=False)

    two_factor_secret_encrypted: Optional[bytes] = Column(
        LargeBinary, 
        default=None
    )  # Encrypted 2FA secret

    recovery_codes_hash: Optional[str] = Column(
        String, 
        default=None
    )  # Hashed recovery codes for 2FA

    # --- Metadata/Tracking Fields ---
    created_at: datetime = Column(
        DateTime, default=datetime.now(), nullable=False
    )

    updated_at: datetime = Column(
        DateTime, default=datetime.now(), nullable=True, onupdate=func.now()
    ) 

    last_login_at: Optional[datetime] = Column(DateTime, default=None, nullable=True)