-- Comprehensive schema sync script for Supabase SQL Editor
-- Run this script directly in your Supabase SQL Editor to support all marketplace features:
-- (Business gigs, platform cuts, dual order completions, pro status & ratings)

create extension if not exists pgcrypto;

-- 1. Profiles Table Updates
alter table public.profiles add column if not exists is_pro boolean default false;
alter table public.profiles add column if not exists orders_count integer default 0;
alter table public.profiles add column if not exists rating numeric(3,2) default 5.00;

-- 2. Gigs Table Schema Upgrades
alter table public.gigs add column if not exists business_id uuid references public.profiles(id) on delete cascade;
alter table public.gigs add column if not exists price integer;
alter table public.gigs add column if not exists cut integer default 0;
alter table public.gigs add column if not exists creator_marked_complete boolean default false;
alter table public.gigs add column if not exists business_marked_complete boolean default false;

-- Sync price with charge if price is empty
update public.gigs set price = charge where price is null;

-- Drop check constraint if present to allow order tracking statuses
alter table public.gigs drop constraint if exists gigs_status_check;

-- Enable Row Level Security Policies on Gigs for Business Users & Creators
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'gigs' and policyname = 'update_business_gigs'
  ) then
    create policy "update_business_gigs" on public.gigs
      for update to authenticated using (auth.uid() = business_id) with check (auth.uid() = business_id);
  end if;
end $$;
