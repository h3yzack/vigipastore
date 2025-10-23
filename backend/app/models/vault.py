
from datetime import datetime
import uuid
from sqlalchemy import ForeignKey, Integer, LargeBinary, String, func, DateTime
from sqlalchemy.orm import Mapped, relationship, mapped_column

from .user import User
from ..database import Base


class Vault(Base):
    __tablename__ = "vaults"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))

    user_id: Mapped[str] = mapped_column(ForeignKey('users.id'))  

    title: Mapped[str] = mapped_column(String, index=True, nullable=False)

    notes: Mapped[str] = mapped_column(String, nullable=True)

    website: Mapped[str] = mapped_column(String, nullable=True)

    login_id_ciphertext: Mapped[bytes] = mapped_column(
        LargeBinary,
        nullable=False
    )

    password_ciphertext: Mapped[bytes] = mapped_column(
        LargeBinary, nullable=False)  # Encrypted password data

    # Initialization Vector
    encryption_iv: Mapped[bytes] = mapped_column(LargeBinary(length=16), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now(), nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now(), nullable=True, onupdate=func.now()
    )

    # Many-to-one relationship with User
    user: Mapped["User"] = relationship(back_populates="vault")
