-- ============================================================
-- Migration A1: Property Image Upload
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================


-- ------------------------------------------------------------
-- 1. Add image_url column to listings
-- ------------------------------------------------------------
alter table public.listings
  add column if not exists image_url text;


-- ------------------------------------------------------------
-- 2. Create the property-images storage bucket
--    Public read, authenticated upload/delete
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;


-- ------------------------------------------------------------
-- 3. Storage RLS policies
-- ------------------------------------------------------------

-- Anyone can read (public bucket, but belt-and-suspenders)
create policy "Public read property images"
  on storage.objects for select
  using ( bucket_id = 'property-images' );

-- Authenticated users can upload their own images
-- Path convention: {userId}/{listingId}/{filename}
create policy "Users can upload their own property images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'property-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete only their own images
create policy "Users can delete their own property images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'property-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
