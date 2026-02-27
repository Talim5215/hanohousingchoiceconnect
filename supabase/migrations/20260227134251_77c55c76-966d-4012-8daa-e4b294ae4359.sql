
-- Add latitude and longitude columns to properties for map integration
ALTER TABLE public.properties
ADD COLUMN latitude double precision,
ADD COLUMN longitude double precision;

-- Add index for geospatial queries
CREATE INDEX idx_properties_coordinates ON public.properties (latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
