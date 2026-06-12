-- Best4Life database schema + RLS policies for Supabase PostgreSQL.
-- This script is idempotent where practical (safe to run multiple times).
-- IMPORTANT: This script intentionally does NOT create any loan-related tables.

-- Needed for gen_random_uuid(). In Supabase this extension is usually available,
-- but this statement ensures the function exists.
create extension if not exists pgcrypto;

-- =========================
-- 1) TABLES
-- =========================

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text,
    first_name text,
    last_name text,
    full_name text,
    height numeric,
    weight numeric,
    age integer,
    gender text,
    allergies jsonb not null default '[]'::jsonb,
    dietary_preferences jsonb not null default '[]'::jsonb,
    cuisine_preferences jsonb not null default '[]'::jsonb,
    health_goal text,
    activity_level text,
    budget numeric(10, 2),
    is_profile_complete boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.meal_plans (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    title text not null,
    preferences jsonb not null default '{}'::jsonb,
    weekly_plan jsonb not null,
    estimated_total_cost numeric(10, 2),
    total_calories integer,
    total_protein numeric(10, 2),
    status text not null default 'draft',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.shopping_lists (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    meal_plan_id uuid references public.meal_plans(id) on delete set null,
    title text not null,
    items jsonb not null default '[]'::jsonb,
    supermarket_totals jsonb not null default '{}'::jsonb,
    cheapest_store text,
    cheapest_combination jsonb not null default '[]'::jsonb,
    estimated_total_cost numeric(10, 2),
    selected_supermarket text,
    selected_suburb text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Helpful indexes for common filters by logged-in user and optional relation.
create index if not exists idx_meal_plans_user_id on public.meal_plans(user_id);
create index if not exists idx_shopping_lists_user_id on public.shopping_lists(user_id);
create index if not exists idx_shopping_lists_meal_plan_id on public.shopping_lists(meal_plan_id);


-- =========================
-- 2) FUNCTIONS + TRIGGERS
-- =========================

-- Keeps updated_at current whenever a row is changed.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_meal_plans_updated_at on public.meal_plans;
create trigger set_meal_plans_updated_at
before update on public.meal_plans
for each row execute function public.set_updated_at();

drop trigger if exists set_shopping_lists_updated_at on public.shopping_lists;
create trigger set_shopping_lists_updated_at
before update on public.shopping_lists
for each row execute function public.set_updated_at();


-- Creates a profile automatically when a new Supabase Auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (
        id,
        email,
        first_name,
        last_name,
        full_name
    )
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'first_name', ''),
        coalesce(new.raw_user_meta_data->>'last_name', ''),
        coalesce(new.raw_user_meta_data->>'full_name', '')
    )
    on conflict (id) do nothing;

    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();


-- =========================
-- 3) RLS + POLICIES
-- =========================

alter table public.profiles enable row level security;
alter table public.meal_plans enable row level security;
alter table public.shopping_lists enable row level security;

-- Drop old policies first so reruns are safe.
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

drop policy if exists "Users can view own meal plans" on public.meal_plans;
drop policy if exists "Users can insert own meal plans" on public.meal_plans;
drop policy if exists "Users can update own meal plans" on public.meal_plans;
drop policy if exists "Users can delete own meal plans" on public.meal_plans;

drop policy if exists "Users can view own shopping lists" on public.shopping_lists;
drop policy if exists "Users can insert own shopping lists" on public.shopping_lists;
drop policy if exists "Users can update own shopping lists" on public.shopping_lists;
drop policy if exists "Users can delete own shopping lists" on public.shopping_lists;


-- profiles policies
create policy "Users can view own profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "Users can insert own profile"
on public.profiles
for insert
with check (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);


-- meal_plans policies
create policy "Users can view own meal plans"
on public.meal_plans
for select
using (auth.uid() = user_id);

create policy "Users can insert own meal plans"
on public.meal_plans
for insert
with check (auth.uid() = user_id);

create policy "Users can update own meal plans"
on public.meal_plans
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own meal plans"
on public.meal_plans
for delete
using (auth.uid() = user_id);


-- shopping_lists policies
create policy "Users can view own shopping lists"
on public.shopping_lists
for select
using (auth.uid() = user_id);

create policy "Users can insert own shopping lists"
on public.shopping_lists
for insert
with check (auth.uid() = user_id);

create policy "Users can update own shopping lists"
on public.shopping_lists
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own shopping lists"
on public.shopping_lists
for delete
using (auth.uid() = user_id);
