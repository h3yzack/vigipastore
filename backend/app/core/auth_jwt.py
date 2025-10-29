from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import jwt, JWTError
import uuid
from .config import settings


# Create JWT access token
def create_access_token(subject: str, *, expires_delta: Optional[timedelta] = None) -> str:
   if expires_delta is None:
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

   now = datetime.now(timezone.utc)
   exp = now + expires_delta
   jti = str(uuid.uuid4())
   
   payload = {
        "sub": subject,
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
        "jti": jti,
        "type": "access"
   }

   token = jwt.encode(payload, settings.API_SECRET_KEY, algorithm=settings.ALGORITHM)
   return token

# Decode token
def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.API_SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError as e:
        raise
