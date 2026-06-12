"""Helpers that call Supabase Auth REST endpoints using httpx.

In production, add stronger timeout/retry strategy and structured logging.
"""

from typing import Any

import httpx
from fastapi import HTTPException, status

from app.config import Settings


def _build_headers(settings: Settings) -> dict[str, str]:
    return {
        "apikey": settings.supabase_anon_key,
        "Content-Type": "application/json",
    }


async def signup_user(settings: Settings, payload: dict[str, Any]) -> dict[str, Any]:
    url = f"{settings.supabase_url}/auth/v1/signup"
    headers = _build_headers(settings)

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(url, headers=headers, json=payload)
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Could not reach Supabase Auth service: {exc}",
        ) from exc

    data = response.json() if response.content else {}
    if response.status_code >= 400:
        detail = data.get("msg") or data.get("error_description") or data.get("error") or data
        raise HTTPException(status_code=response.status_code, detail=detail)

    return data


async def login_user(settings: Settings, payload: dict[str, Any]) -> dict[str, Any]:
    url = f"{settings.supabase_url}/auth/v1/token?grant_type=password"
    headers = _build_headers(settings)

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(url, headers=headers, json=payload)
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Could not reach Supabase Auth service: {exc}",
        ) from exc

    data = response.json() if response.content else {}
    if response.status_code >= 400:
        detail = data.get("msg") or data.get("error_description") or data.get("error") or data
        raise HTTPException(status_code=response.status_code, detail=detail)

    return data


async def get_user_from_token(settings: Settings, access_token: str) -> dict[str, Any]:
    """Resolve current Supabase Auth user from a bearer token."""

    url = f"{settings.supabase_url}/auth/v1/user"
    headers = {
        "apikey": settings.supabase_anon_key,
        "Authorization": f"Bearer {access_token}",
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.get(url, headers=headers)
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not reach Supabase Auth service.",
        ) from exc

    data = response.json() if response.content else {}
    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
        )

    if not data.get("id"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication context.",
        )

    return data
