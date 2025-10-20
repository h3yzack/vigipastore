from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.v1 import user_router
from .core.config import settings

app = FastAPI(
    title="VigiPastore Backend API",
    version=settings.APP_VERSION,
    description="Zero-Knowledge API for encrypted vault data.",
)

origins = [
    "http://localhost:3000",  # Frontend local development URL
    # TODO Additional allowed origins will be added here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["root"])
async def root():
    return {"message": "Welcome to VigiPastore Backend"}

app.include_router(user_router, prefix="/api/v1")