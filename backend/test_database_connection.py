"""Quick DB connectivity check for Supabase PostgreSQL.

This script does a simple `SELECT 1` and prints a success message.
It does not print secrets such as DATABASE_PWD.
"""

from psycopg2 import Error as PsycopgError

from app.supabase_db import get_connection


def main() -> None:
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1;")
                _ = cur.fetchone()
    except PsycopgError as exc:
        raise RuntimeError(f"Database connection failed: {exc}") from exc

    print("Database connection successful")


if __name__ == "__main__":
    main()
