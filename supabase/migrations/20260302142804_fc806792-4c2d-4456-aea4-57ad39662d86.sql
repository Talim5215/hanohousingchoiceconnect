
-- Drop the existing INSERT policy
DROP POLICY "Authenticated users can submit inquiries" ON public.inquiries;

-- Recreate with authentication requirement
CREATE POLICY "Authenticated users can submit inquiries"
ON public.inquiries
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND tenant_name IS NOT NULL
  AND length(TRIM(BOTH FROM tenant_name)) > 0
  AND length(tenant_name) <= 200
  AND tenant_email IS NOT NULL
  AND length(TRIM(BOTH FROM tenant_email)) > 0
  AND length(tenant_email) <= 255
  AND message IS NOT NULL
  AND length(TRIM(BOTH FROM message)) > 0
  AND length(message) <= 2000
  AND (tenant_phone IS NULL OR length(tenant_phone) <= 30)
  AND check_inquiry_rate_limit()
);
