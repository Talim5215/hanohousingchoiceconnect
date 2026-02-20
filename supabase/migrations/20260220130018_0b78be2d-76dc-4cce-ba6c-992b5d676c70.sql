-- Make the property-images bucket private
UPDATE storage.buckets SET public = false WHERE id = 'property-images';

-- Drop the overly permissive INSERT policy (allows any authenticated user)
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;

-- Replace with a policy that restricts uploads to the user's own folder
CREATE POLICY "Landlords can upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'property-images'
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Keep the SELECT policy open (signed URLs will be used, but RLS still applies)
-- Drop the existing open SELECT policy and replace with owner-check (edge fn uses service role)
DROP POLICY IF EXISTS "Anyone can view property images" ON storage.objects;

CREATE POLICY "Landlords can view own images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'property-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );