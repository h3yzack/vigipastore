import logging
from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
from .api.v1 import user_router, auth_router, vault_router
from .core.config import settings, setup_logging

# Configure logging to show DEBUG and above
setup_logging(level_str=settings.LOG_LEVEL)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="VigiPastore Backend API",
    version=settings.APP_VERSION,
    description="Zero-Knowledge API for encrypted vault data.",
)

# origins = [
#     "http://localhost:5173",
#     "http://0.0.0.0:5173",
#     "http://127.0.0.1:5173",
# ]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

@app.get("/", tags=["root"])
async def root():
    return {"message": "Welcome to VigiPastore Backend"}

app.include_router(user_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1") 
app.include_router(vault_router, prefix="/api/v1")