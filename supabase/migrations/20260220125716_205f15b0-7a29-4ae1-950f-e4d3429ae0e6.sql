-- Add uniqueness constraint so each entity_id can only be registered once
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_entity_id_unique UNIQUE (entity_id);

-- Add a format CHECK constraint requiring at least letters/numbers (tighter than the current regex)
-- This mirrors the client-side validation: 3-50 chars, alphanumeric/hyphen/underscore only
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_entity_id_format
  CHECK (entity_id ~ '^[A-Za-z0-9\-_]{3,50}$');