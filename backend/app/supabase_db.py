"""PostgreSQL helper utilities for Best4Life.

This module intentionally keeps the connection code beginner-friendly.
It reads DATABASE_URL from backend/.env via app.config.get_database_url().
"""

from __future__ import annotations

from contextlib import contextmanager
from typing import Any, Iterator

import httpx
import psycopg2
from fastapi import HTTPException, status
from psycopg2.extensions import connection as PgConnection

from app.config import Settings, get_database_url


def create_connection() -> PgConnection:
    """Create a psycopg2 connection using DATABASE_URL from backend/.env."""

    database_url = get_database_url()
    return psycopg2.connect(database_url)


@contextmanager
def get_connection() -> Iterator[PgConnection]:
    """Context manager that always closes the DB connection.

    Usage:
        with get_connection() as conn:
            ...
    """

    conn = create_connection()
    try:
        yield conn
    finally:
        conn.close()


def _supabase_rest_headers(settings: Settings, access_token: str) -> dict[str, str]:
    return {
        "apikey": settings.supabase_anon_key,
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }


def _supabase_rest_url(settings: Settings, table: str, query: str = "") -> str:
    base = f"{settings.supabase_url}/rest/v1/{table}"
    return f"{base}?{query}" if query else base


async def _supabase_get(
    settings: Settings,
    access_token: str,
    table: str,
    query: str,
    accept_single: bool = False,
) -> Any:
    headers = _supabase_rest_headers(settings, access_token)
    if accept_single:
        headers["Accept"] = "application/vnd.pgrst.object+json"

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.get(_supabase_rest_url(settings, table, query), headers=headers)
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not reach Supabase data service.",
        ) from exc

    data = response.json() if response.content else {}
    if response.status_code == 406 and accept_single:
        return {}
    if response.status_code >= 400:
        detail = (
            data.get("message") if isinstance(data, dict) else None
        ) or (
            data.get("error") if isinstance(data, dict) else None
        ) or "Failed to load data."
        raise HTTPException(status_code=response.status_code, detail=detail)

    return data


async def _supabase_write(
    settings: Settings,
    access_token: str,
    table: str,
    payload: dict[str, Any],
    method: str = "POST",
    query: str = "",
    prefer: str = "return=representation",
) -> list[dict[str, Any]]:
    headers = _supabase_rest_headers(settings, access_token)
    headers["Prefer"] = prefer

    url = _supabase_rest_url(settings, table, query)

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            if method.upper() == "PATCH":
                response = await client.patch(url, headers=headers, json=payload)
            else:
                response = await client.post(url, headers=headers, json=payload)
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not reach Supabase data service.",
        ) from exc

    data = response.json() if response.content else []
    if response.status_code >= 400:
        detail = data.get("message") if isinstance(data, dict) else None
        detail = detail or (data.get("error") if isinstance(data, dict) else None)
        raise HTTPException(status_code=response.status_code, detail=detail or "Failed to save data.")

    if isinstance(data, dict):
        return [data]
    return data


async def get_profile(settings: Settings, access_token: str, user_id: str) -> dict[str, Any]:
    query = f"id=eq.{user_id}&select=*"
    profile = await _supabase_get(settings, access_token, "profiles", query, accept_single=True)
    return profile


async def update_profile(
    settings: Settings,
    access_token: str,
    user_id: str,
    profile_updates: dict[str, Any],
) -> dict[str, Any]:
    query = f"id=eq.{user_id}&select=*"
    rows = await _supabase_write(
        settings,
        access_token,
        table="profiles",
        payload=profile_updates,
        method="PATCH",
        query=query,
    )
    return rows[0] if rows else {}


async def list_meal_plans(settings: Settings, access_token: str, user_id: str) -> list[dict[str, Any]]:
    query = f"user_id=eq.{user_id}&select=*&order=created_at.desc"
    return await _supabase_get(settings, access_token, "meal_plans", query)


async def create_meal_plan(
    settings: Settings,
    access_token: str,
    user_id: str,
    payload: dict[str, Any],
) -> dict[str, Any]:
    body = {**payload, "user_id": user_id}
    rows = await _supabase_write(settings, access_token, "meal_plans", body)
    return rows[0] if rows else {}


async def get_latest_meal_plan(
    settings: Settings,
    access_token: str,
    user_id: str,
) -> dict[str, Any]:
    query = f"user_id=eq.{user_id}&select=*&order=created_at.desc&limit=1"
    rows = await _supabase_get(settings, access_token, "meal_plans", query)
    return rows[0] if rows else {}


async def list_shopping_lists(
    settings: Settings,
    access_token: str,
    user_id: str,
) -> list[dict[str, Any]]:
    query = f"user_id=eq.{user_id}&select=*&order=created_at.desc"
    return await _supabase_get(settings, access_token, "shopping_lists", query)


async def create_shopping_list(
    settings: Settings,
    access_token: str,
    user_id: str,
    payload: dict[str, Any],
) -> dict[str, Any]:
    body = {**payload, "user_id": user_id}
    rows = await _supabase_write(settings, access_token, "shopping_lists", body)
    return rows[0] if rows else {}
