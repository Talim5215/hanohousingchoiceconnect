
-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can submit an inquiry" ON public.inquiries;

-- Create a rate-limiting function to prevent spam (max 5 inquiries per hour per IP/session)
CREATE OR REPLACE FUNCTION public.check_inquiry_rate_limit()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    SELECT count(*)
    FROM public.inquiries
    WHERE tenant_email = current_setting('request.jwt.claims', true)::json->>'email'
      AND created_at > now() - interval '1 hour'
  ) < 5;
$$;

-- New INSERT policy: only authenticated users can submit, with rate limiting
CREATE POLICY "Authenticated users can submit inquiries"
ON public.inquiries
FOR INSERT
TO authenticated
WITH CHECK (
  -- Ensure required fields are not empty
  tenant_name IS NOT NULL AND length(trim(tenant_name)) > 0 AND length(tenant_name) <= 200
  AND tenant_email IS NOT NULL AND length(trim(tenant_email)) > 0 AND length(tenant_email) <= 255
  AND message IS NOT NULL AND length(trim(message)) > 0 AND length(message) <= 2000
  AND (tenant_phone IS NULL OR length(tenant_phone) <= 30)
  -- Rate limit check
  AND public.check_inquiry_rate_limit()
);
