
-- Drop the overly broad policy that exposes all landlord profile columns
DROP POLICY IF EXISTS "Public can view landlord profiles" ON public.profiles;

-- Create a security definer function that returns only safe landlord fields
CREATE OR REPLACE FUNCTION public.get_landlord_profiles()
RETURNS TABLE(id uuid, user_id uuid, account_type text, full_name text, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.user_id, p.account_type::text, p.full_name, p.created_at
  FROM public.profiles p
  WHERE p.account_type = 'landlord';
$$;

-- Drop the view since we'll use the function instead
DROP VIEW IF EXISTS public.landlord_profiles_public;
