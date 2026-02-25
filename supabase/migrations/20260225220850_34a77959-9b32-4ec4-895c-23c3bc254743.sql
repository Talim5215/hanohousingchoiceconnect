
-- Recreate view with security_invoker (safe default)
DROP VIEW IF EXISTS public.landlord_profiles_public;

CREATE VIEW public.landlord_profiles_public
WITH (security_invoker = on)
AS
  SELECT id, user_id, account_type, full_name, created_at
  FROM public.profiles
  WHERE account_type = 'landlord';

GRANT SELECT ON public.landlord_profiles_public TO anon, authenticated;

-- Add a limited SELECT policy on profiles so the view can read landlord rows
-- This only exposes rows where account_type = 'landlord' and the view further limits columns
CREATE POLICY "Public can view landlord profiles"
ON public.profiles
FOR SELECT
USING (account_type = 'landlord');
