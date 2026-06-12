"""Initialize Best4Life database objects in Supabase PostgreSQL.

This script reads SQL from sql/best4life_tables.sql and executes it.
Run this after setting DATABASE_URL in backend/.env.
"""

from pathlib import Path

from psycopg2 import Error as PsycopgError

from app.supabase_db import get_connection


def main() -> None:
    sql_path = Path(__file__).resolve().parent / "sql" / "best4life_tables.sql"
    if not sql_path.exists():
        raise FileNotFoundError(f"SQL file not found: {sql_path}")

    sql_text = sql_path.read_text(encoding="utf-8")

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(sql_text)
            conn.commit()
    except PsycopgError as exc:
        raise RuntimeError(f"Database initialization failed: {exc}") from exc

    print("Database initialization completed successfully")


if __name__ == "__main__":
    main()
