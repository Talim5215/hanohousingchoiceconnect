
-- Create a public view excluding sensitive fields (phone, entity_id)
CREATE VIEW public.landlord_profiles_public
WITH (security_invoker = on) AS
SELECT id, user_id, account_type, full_name, created_at
FROM public.profiles
WHERE account_type = 'landlord';

-- Drop the overly permissive policy
DROP POLICY "Anyone can view landlord profiles" ON public.profiles;

-- Replace with a restrictive policy: only authenticated users can view their own profile
-- (the existing "Users can view their own profile" policy already covers this,
--  so we just need to grant SELECT on the view for public/landlord listing)
GRANT SELECT ON public.landlord_profiles_public TO anon, authenticated;
