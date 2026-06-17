-- Repair and bootstrap core tables used by the app.
-- Safe to run multiple times.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('creator', 'business')),
  state text not null,
  city text not null,
  username text,
  email text,
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists email text;
alter table public.profiles enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'select_own_profile'
  ) then
    create policy "select_own_profile" on public.profiles
      for select to authenticated using (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'insert_own_profile'
  ) then
    create policy "insert_own_profile" on public.profiles
      for insert to authenticated with check (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'update_own_profile'
  ) then
    create policy "update_own_profile" on public.profiles
      for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'delete_own_profile'
  ) then
    create policy "delete_own_profile" on public.profiles
      for delete to authenticated using (auth.uid() = id);
  end if;
end $$;

create table if not exists public.creator_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  instagram_handle text,
  bio text,
  content_categories text[] default '{}',
  gig_charge integer check (gig_charge is null or gig_charge >= 100),
  portfolio_url text,
  profile_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.creator_profiles enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'creator_profiles' and policyname = 'select_own_creator_profile'
  ) then
    create policy "select_own_creator_profile" on public.creator_profiles
      for select to authenticated using (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'creator_profiles' and policyname = 'insert_own_creator_profile'
  ) then
    create policy "insert_own_creator_profile" on public.creator_profiles
      for insert to authenticated with check (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'creator_profiles' and policyname = 'update_own_creator_profile'
  ) then
    create policy "update_own_creator_profile" on public.creator_profiles
      for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'creator_profiles' and policyname = 'select_creator_profiles_public'
  ) then
    create policy "select_creator_profiles_public" on public.creator_profiles
      for select to authenticated using (true);
  end if;
end $$;

create table if not exists public.gigs (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  charge integer not null check (charge >= 100),
  status text default 'open' check (status in ('open', 'closed', 'completed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.gigs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'gigs' and policyname = 'select_gigs'
  ) then
    create policy "select_gigs" on public.gigs
      for select to authenticated using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'gigs' and policyname = 'insert_own_gigs'
  ) then
    create policy "insert_own_gigs" on public.gigs
      for insert to authenticated with check (auth.uid() = creator_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'gigs' and policyname = 'update_own_gigs'
  ) then
    create policy "update_own_gigs" on public.gigs
      for update to authenticated using (auth.uid() = creator_id) with check (auth.uid() = creator_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'gigs' and policyname = 'delete_own_gigs'
  ) then
    create policy "delete_own_gigs" on public.gigs
      for delete to authenticated using (auth.uid() = creator_id);
  end if;
end $$;
