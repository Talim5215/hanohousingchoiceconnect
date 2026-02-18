
-- Create inquiries table for tenant-to-landlord messages
CREATE TABLE public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  landlord_id uuid NOT NULL,
  tenant_name text NOT NULL,
  tenant_email text NOT NULL,
  tenant_phone text,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an inquiry (public form)
CREATE POLICY "Anyone can submit an inquiry"
  ON public.inquiries FOR INSERT
  WITH CHECK (true);

-- Landlords can view inquiries for their own properties
CREATE POLICY "Landlords can view their inquiries"
  ON public.inquiries FOR SELECT
  USING (auth.uid() = landlord_id);

-- Landlords can update (mark as read) their own inquiries
CREATE POLICY "Landlords can update their inquiries"
  ON public.inquiries FOR UPDATE
  USING (auth.uid() = landlord_id);

-- Landlords can delete their own inquiries
CREATE POLICY "Landlords can delete their inquiries"
  ON public.inquiries FOR DELETE
  USING (auth.uid() = landlord_id);
