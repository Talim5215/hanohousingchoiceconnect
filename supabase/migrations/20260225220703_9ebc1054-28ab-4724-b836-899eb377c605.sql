
-- Recreate the view as security_definer so it can read profiles regardless of caller
-- This is safe because it only exposes: id, user_id, account_type, full_name, created_at
-- Sensitive fields (phone, entity_id) are excluded
DROP VIEW IF EXISTS public.landlord_profiles_public;

CREATE VIEW public.landlord_profiles_public
WITH (security_invoker = off)
AS
  SELECT id, user_id, account_type, full_name, created_at
  FROM public.profiles
  WHERE account_type = 'landlord';

-- Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.landlord_profiles_public TO anon, authenticated;
