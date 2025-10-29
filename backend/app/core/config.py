from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
import logging
import sys

class Settings(BaseSettings):
    APP_VERSION: Optional[str] = "1.0.0"

    # Database Configuration
    DB_HOST: str
    DB_PORT: int
    DB_USER: str
    DB_PASS: str
    DB_NAME: str

    # JWT Authentication Key for the API 
    API_SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15

    # Security Configuration
    MASTER_KEY_KDF_SALT_LENGTH: int = 32 
    MASTER_KEY_VERIFIER_LENGTH: int = 64

    SERVER_KEY: str
    SERVER_IDENTITY: str = "VigiPastore"

    LOG_LEVEL: str = "INFO"
    
    # Pydantic configuration to load variables from a .env file
    # In production (AWS), these would be loaded from environment variables
    model_config = SettingsConfigDict(env_file='.env')

settings = Settings()

class ColoredFormatter(logging.Formatter):
    COLORS = {
        'DEBUG': '\033[94m',    # Blue
        'INFO': '\033[92m',     # Green
        'WARNING': '\033[93m',  # Yellow
        'ERROR': '\033[91m',    # Red
        'CRITICAL': '\033[91m\033[1m',  # Red bold
    }
    RESET = '\033[0m'

    def format(self, record):
        levelname = record.levelname
        if levelname in self.COLORS:
            colored_levelname = f"{self.COLORS[levelname]}{levelname}{self.RESET}"
            record.levelname = colored_levelname
        return super().format(record)

def setup_logging(level_str='INFO', format_str='%(levelname)s: \t %(asctime)s - %(name)s - %(message)s'):
    """Reusable function to set up colored logging."""
    level_str = settings.LOG_LEVEL.upper()  # Ensure uppercase
    level_int = getattr(logging, level_str, logging.INFO)

    logger = logging.getLogger()
    logger.setLevel(level_int)
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(ColoredFormatter(format_str))
    logger.addHandler(handler)
    return logger