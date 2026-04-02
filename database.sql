-- ============================================================
-- ListingIgnite – Database Schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================


-- ------------------------------------------------------------
-- PROFILES
-- Extends auth.users; auto-populated via trigger on signup
-- ------------------------------------------------------------
create table public.profiles (
  id               uuid primary key references auth.users (id) on delete cascade,
  full_name        text,
  email            text,
  credits_remaining integer not null default 3,
  created_at       timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);


-- ------------------------------------------------------------
-- TRIGGER: create a profile row on new user signup
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ------------------------------------------------------------
-- LISTINGS
-- ------------------------------------------------------------
create table public.listings (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references public.profiles (id) on delete cascade,
  address                text,
  price                  numeric,
  bedrooms               integer,
  bathrooms              numeric,
  sqft                   integer,
  property_type          text,
  features               text[],
  neighborhood_highlights text,
  target_buyer           text,
  additional_notes       text,
  created_at             timestamptz not null default now()
);

alter table public.listings enable row level security;

create policy "Users can view their own listings"
  on public.listings for select
  using (auth.uid() = user_id);

create policy "Users can insert their own listings"
  on public.listings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own listings"
  on public.listings for update
  using (auth.uid() = user_id);

create policy "Users can delete their own listings"
  on public.listings for delete
  using (auth.uid() = user_id);


-- ------------------------------------------------------------
-- GENERATED OUTPUTS
-- ------------------------------------------------------------
create table public.generated_outputs (
  id               uuid primary key default gen_random_uuid(),
  listing_id       uuid not null references public.listings (id) on delete cascade,
  user_id          uuid not null references public.profiles (id) on delete cascade,
  mls_description  text,
  social_facebook  text,
  social_instagram text,
  social_x         text,
  email_blast      text,
  flyer_copy       text,
  video_script     text,
  seo_landing_page text,
  created_at       timestamptz not null default now()
);

alter table public.generated_outputs enable row level security;

create policy "Users can view their own generated outputs"
  on public.generated_outputs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own generated outputs"
  on public.generated_outputs for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own generated outputs"
  on public.generated_outputs for delete
  using (auth.uid() = user_id);
