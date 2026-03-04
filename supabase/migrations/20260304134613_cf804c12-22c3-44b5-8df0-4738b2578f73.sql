
-- Fix profiles policies: change from RESTRICTIVE to PERMISSIVE
DROP POLICY "Users can view their own profile" ON public.profiles;
DROP POLICY "Users can insert their own profile" ON public.profiles;
DROP POLICY "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Fix properties policies: change from RESTRICTIVE to PERMISSIVE
DROP POLICY "Anyone can view available properties" ON public.properties;
DROP POLICY "Landlords can view own properties" ON public.properties;
DROP POLICY "Landlords can insert properties" ON public.properties;
DROP POLICY "Landlords can update own properties" ON public.properties;
DROP POLICY "Landlords can delete own properties" ON public.properties;

CREATE POLICY "Anyone can view available properties" ON public.properties FOR SELECT USING (is_available = true);
CREATE POLICY "Landlords can view own properties" ON public.properties FOR SELECT TO authenticated USING (auth.uid() = landlord_id);
CREATE POLICY "Landlords can insert properties" ON public.properties FOR INSERT TO authenticated WITH CHECK (auth.uid() = landlord_id);
CREATE POLICY "Landlords can update own properties" ON public.properties FOR UPDATE TO authenticated USING (auth.uid() = landlord_id);
CREATE POLICY "Landlords can delete own properties" ON public.properties FOR DELETE TO authenticated USING (auth.uid() = landlord_id);

-- Fix inquiries policies: change from RESTRICTIVE to PERMISSIVE
DROP POLICY "Authenticated users can submit inquiries" ON public.inquiries;
DROP POLICY "Landlords can view their inquiries" ON public.inquiries;
DROP POLICY "Landlords can update their inquiries" ON public.inquiries;
DROP POLICY "Landlords can delete their inquiries" ON public.inquiries;

CREATE POLICY "Authenticated users can submit inquiries" ON public.inquiries FOR INSERT TO authenticated WITH CHECK (
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
CREATE POLICY "Landlords can view their inquiries" ON public.inquiries FOR SELECT TO authenticated USING (auth.uid() = landlord_id);
CREATE POLICY "Landlords can update their inquiries" ON public.inquiries FOR UPDATE TO authenticated USING (auth.uid() = landlord_id);
CREATE POLICY "Landlords can delete their inquiries" ON public.inquiries FOR DELETE TO authenticated USING (auth.uid() = landlord_id);
