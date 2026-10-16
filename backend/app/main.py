import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.api import investigations, evidence, analysis, reports

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("evidence_os")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    logger.info("Initializing EvidenceOS database schema...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database schema initialized successfully.")
    yield


app = FastAPI(
    title="EvidenceOS Intelligence API",
    description="Backend API for AI-powered digital evidence analysis and intelligence extraction using Gemma 4.",
    version="1.0.0",
    lifespan=lifespan
)

# Restrictive CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/api/health", tags=["Health"])
def health_check():
    """
    Health check endpoint returning service status, configured model, and API key readiness.
    """
    has_key = bool(settings.gemini_api_key and settings.gemini_api_key != "your_api_key_here")
    return {
        "status": "healthy",
        "service": "EvidenceOS Intelligence Platform",
        "version": "1.0.0",
        "configured_model": settings.gemma_model,
        "ai_ready": has_key,
        "mode": "live_api" if has_key else "evaluation_demo"
    }


# Include Routers
app.include_router(investigations.router)
app.include_router(evidence.router)
app.include_router(analysis.router)
app.include_router(reports.router)
