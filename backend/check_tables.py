"""Verify Best4Life tables and profile trigger exist in Supabase PostgreSQL."""

from psycopg2 import Error as PsycopgError

from app.supabase_db import get_connection


TABLES_TO_CHECK = [
    ("public", "profiles"),
    ("public", "meal_plans"),
    ("public", "shopping_lists"),
]


def check_tables() -> None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            for schema_name, table_name in TABLES_TO_CHECK:
                cur.execute(
                    """
                    select exists (
                        select 1
                        from information_schema.tables
                        where table_schema = %s
                          and table_name = %s
                    );
                    """,
                    (schema_name, table_name),
                )
                exists = cur.fetchone()[0]
                if exists:
                    print(f"Table found: {schema_name}.{table_name}")
                else:
                    print(f"Table missing: {schema_name}.{table_name}")


def check_profile_trigger() -> None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                select exists (
                    select 1
                    from pg_trigger t
                    join pg_class c on c.oid = t.tgrelid
                    join pg_namespace n on n.oid = c.relnamespace
                    where t.tgname = 'on_auth_user_created'
                      and n.nspname = 'auth'
                      and c.relname = 'users'
                      and not t.tgisinternal
                );
                """
            )
            exists = cur.fetchone()[0]
            if exists:
                print("Profile trigger found")
            else:
                print("Profile trigger missing")


def main() -> None:
    try:
        check_tables()
        check_profile_trigger()
    except PsycopgError as exc:
        raise RuntimeError(f"Table/trigger check failed: {exc}") from exc


if __name__ == "__main__":
    main()
