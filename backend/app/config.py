"""Configuration loader for the Best4Life backend.

This module reads environment variables from a local .env file.
For teaching purposes we keep it very simple and explicit.
"""

from dataclasses import dataclass
import os

from dotenv import load_dotenv


load_dotenv()


@dataclass(frozen=True)
class Settings:
    """Application settings loaded from environment variables."""

    supabase_url: str
    supabase_anon_key: str
    database_url: str = ""
    database_pwd: str = ""
    frontend_origin: str = "http://localhost:5173"


def get_settings() -> Settings:
    """Read and validate required environment variables.

    Raises:
        ValueError: If required variables are missing.
    """

    supabase_url = os.getenv("SUPABASE_URL", "").strip().rstrip("/")
    supabase_anon_key = os.getenv("SUPABASE_ANON_KEY", "").strip()
    database_url = os.getenv("DATABASE_URL", "").strip()
    database_pwd = os.getenv("DATABASE_PWD", "").strip()
    frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173").strip()

    missing = []
    if not supabase_url:
        missing.append("SUPABASE_URL")
    if not supabase_anon_key:
        missing.append("SUPABASE_ANON_KEY")

    if missing:
        raise ValueError(
            "Missing required environment variables in backend/.env: "
            + ", ".join(missing)
        )

    return Settings(
        supabase_url=supabase_url,
        supabase_anon_key=supabase_anon_key,
        database_url=database_url,
        database_pwd=database_pwd,
        frontend_origin=frontend_origin,
    )


def get_database_url() -> str:
    """Return DATABASE_URL from backend/.env or raise a clear error."""

    database_url = os.getenv("DATABASE_URL", "").strip()
    if not database_url:
        raise ValueError(
            "Missing required environment variable in backend/.env: DATABASE_URL"
        )

    return database_url
