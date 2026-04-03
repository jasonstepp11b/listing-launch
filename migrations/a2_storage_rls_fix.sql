-- ============================================================
-- Migration A2: Fix Storage RLS — add UPDATE policy
-- Drops and recreates all property-images storage policies
-- to ensure INSERT, UPDATE, DELETE, and SELECT are all covered.
--
-- Root cause: the original A1 migration omitted an UPDATE policy.
-- Supabase Storage upsert (replacing an existing file) internally
-- issues an UPDATE on storage.objects. Without an UPDATE policy,
-- RLS blocks the replace even though INSERT is allowed.
--
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

-- Drop existing policies (IF EXISTS is safe to re-run)
drop policy if exists "Public read property images"
  on storage.objects;

drop policy if exists "Users can upload their own property images"
  on storage.objects;

drop policy if exists "Users can delete their own property images"
  on storage.objects;

drop policy if exists "Users can update their own property images"
  on storage.objects;


-- 1. Public read — anyone can view property images
create policy "Public read property images"
  on storage.objects for select
  using ( bucket_id = 'property-images' );


-- 2. Authenticated users can INSERT into their own folder
--    Path convention: {userId}/{listingId}/{filename}
create policy "Users can upload their own property images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'property-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );


-- 3. Authenticated users can UPDATE (replace) files in their own folder
--    Required for upsert: true to work when the file already exists.
create policy "Users can update their own property images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'property-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'property-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );


-- 4. Authenticated users can DELETE files in their own folder
create policy "Users can delete their own property images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'property-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
