-- ==========================================
-- MASTER SUPABASE DATABASE SCHEMA FOR MULTIPLY.
-- Copy & Run this once in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/jponttyhfcpxktvdhdst/sql
-- ==========================================
-- SAFE TO RE-RUN: drops and recreates all policies idempotently.

create extension if not exists pgcrypto;

-- =====================
-- 1. PROFILES TABLE
-- =====================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('creator', 'business')),
  state text not null,
  city text not null,
  username text unique,
  email text,
  phone text,
  is_pro boolean default false,
  orders_count integer default 0,
  rating numeric(3,2) default 5.00,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Drop all existing policies first to avoid conflicts
drop policy if exists "public_read_profiles" on public.profiles;
drop policy if exists "select_own_profile" on public.profiles;
drop policy if exists "insert_own_profile" on public.profiles;
drop policy if exists "update_own_profile" on public.profiles;
drop policy if exists "delete_own_profile" on public.profiles;

-- Any authenticated user can read ANY profile (required for feed)
create policy "public_read_profiles" on public.profiles
  for select to authenticated using (true);

-- Users can only insert/update their own profile
create policy "insert_own_profile" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

create policy "update_own_profile" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);


-- =====================
-- 2. CREATOR PROFILES
-- =====================
create table if not exists public.creator_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  instagram_handle text,
  bio text,
  content_categories text[] default '{}',
  gig_charge integer check (gig_charge is null or gig_charge >= 500),
  portfolio_url text,
  profile_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.creator_profiles enable row level security;

drop policy if exists "public_read_creator_profiles" on public.creator_profiles;
drop policy if exists "select_own_creator_profile" on public.creator_profiles;
drop policy if exists "select_creator_profiles_public" on public.creator_profiles;
drop policy if exists "insert_own_creator_profile" on public.creator_profiles;
drop policy if exists "update_own_creator_profile" on public.creator_profiles;

create policy "public_read_creator_profiles" on public.creator_profiles
  for select to authenticated using (true);

create policy "insert_own_creator_profile" on public.creator_profiles
  for insert to authenticated with check (auth.uid() = id);

create policy "update_own_creator_profile" on public.creator_profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);


-- =====================
-- 3. GIGS TABLE
-- =====================
create table if not exists public.gigs (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references public.profiles(id) on delete cascade,
  business_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  charge integer not null default 500 check (charge >= 500),
  price integer default 500,
  cut integer default 19,
  status text default 'open',
  creator_marked_complete boolean default false,
  business_marked_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.gigs enable row level security;

drop policy if exists "public_read_gigs" on public.gigs;
drop policy if exists "select_gigs" on public.gigs;
drop policy if exists "insert_own_gigs" on public.gigs;
drop policy if exists "update_own_gigs" on public.gigs;
drop policy if exists "update_business_gigs" on public.gigs;
drop policy if exists "delete_own_gigs" on public.gigs;

-- ANY authenticated user can see ALL gigs (required for marketplace feed)
create policy "public_read_gigs" on public.gigs
  for select to authenticated using (true);

create policy "insert_own_gigs" on public.gigs
  for insert to authenticated with check (auth.uid() = creator_id or auth.uid() = business_id);

create policy "update_own_gigs" on public.gigs
  for update to authenticated using (auth.uid() = creator_id or auth.uid() = business_id);

create policy "delete_own_gigs" on public.gigs
  for delete to authenticated using (auth.uid() = creator_id or auth.uid() = business_id);


-- =====================
-- 4. MESSAGES TABLE
-- =====================
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

drop policy if exists "read_own_messages" on public.messages;
drop policy if exists "insert_messages" on public.messages;

-- Users can read messages they sent or received
create policy "read_own_messages" on public.messages
  for select to authenticated using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- Users can send messages as themselves
create policy "insert_messages" on public.messages
  for insert to authenticated with check (auth.uid() = sender_id);

-- Enable realtime for messages
alter publication supabase_realtime add table public.messages;
