import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    gemini_api_key: str = ""
    gemma_model: str = "gemma-4-26b-a4b-it"
    database_url: str = "sqlite:///./evidence_os.db"
    upload_dir: str = "./uploads"
    max_upload_size_mb: int = 10
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()

# Ensure uploads dir exists
os.makedirs(settings.upload_dir, exist_ok=True)
