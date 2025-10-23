from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    APP_VERSION: Optional[str] = "1.0.1"

    # Database Configuration
    DB_HOST: str
    DB_PORT: int
    DB_USER: str
    DB_PASS: str
    DB_NAME: str

    # JWT Authentication Key for the API 
    API_SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 1 day token

    # Security Configuration
    MASTER_KEY_KDF_SALT_LENGTH: int = 32 
    MASTER_KEY_VERIFIER_LENGTH: int = 64

    SERVER_KEY: str
    SERVER_ID: str = "VigiPastore"
    
    # Pydantic configuration to load variables from a .env file
    # In production (AWS), these would be loaded from environment variables
    model_config = SettingsConfigDict(env_file='.env')

settings = Settings()