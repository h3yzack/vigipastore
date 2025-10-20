from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from ..core import settings
# Import the engine from the database setup file

DATABASE_URL = (
    f"postgresql+asyncpg://{settings.DB_USER}:{settings.DB_PASS}"
    f"@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
)



# ---------------------------------------------------------------------
# Create async engine & session factory
# ---------------------------------------------------------------------
engine = create_async_engine(
    DATABASE_URL,
    echo=True,              # set True for SQL debug logs
    future=True,             
    pool_pre_ping=True,      # auto-check broken connections
)

# Async session
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# ---------------------------------------------------------------------
# Dependency for FastAPI routes
# ---------------------------------------------------------------------
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()