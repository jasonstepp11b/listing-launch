-- ============================================================
-- Migration A3: Listing status management
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Add status column to listings (default: active)
alter table public.listings
  add column if not exists status text not null default 'active';

-- 2. Enforce valid values
alter table public.listings
  drop constraint if exists listings_status_check;

alter table public.listings
  add constraint listings_status_check
  check (status in ('active', 'sold', 'inactive'));
