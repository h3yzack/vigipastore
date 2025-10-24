from typing import Optional
from datetime import datetime
import uuid
from sqlalchemy import String, Boolean, LargeBinary, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped, mapped_column
from ..database import Base 

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))

    full_name: Mapped[str] = mapped_column(String, nullable=False)

    email: Mapped[str] = mapped_column(String, index=True, nullable=False, unique=True)

    master_key_salt: Mapped[bytes] = mapped_column(LargeBinary(length=32), nullable=False)  # Salt for KDF

    master_key_verifier: Mapped[bytes] = mapped_column(LargeBinary(length=64), nullable=False)  # Verifier for authentication

    vault_key_encrypted: Mapped[bytes] = mapped_column(LargeBinary, nullable=True)  # Encrypted vault key

    vault_key_nonce: Mapped[bytes] = mapped_column(LargeBinary(length=12), nullable=True)  # Nonce for vault key encryption

    # ----------------------------------------------------------------------
    # --- Two-Factor Authentication (2FA)  ---
    # ----------------------------------------------------------------------

    two_fa_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    two_factor_secret_encrypted: Mapped[Optional[bytes]] = mapped_column(
        LargeBinary, 
        default=None
    )  # Encrypted 2FA secret

    recovery_codes_hash: Mapped[Optional[str]] = mapped_column(
        String, 
        default=None
    )  # Hashed recovery codes for 2FA

    # --- Metadata/Tracking Fields ---
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now(), nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now(), nullable=True, onupdate=func.now()
    ) 

    last_login_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, default=None, nullable=True
    )