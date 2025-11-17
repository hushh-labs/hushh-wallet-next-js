-- Create short URL mappings table
CREATE TABLE public.short_urls (
    short_id text PRIMARY KEY,
    uid text NOT NULL REFERENCES public.members(uid) ON DELETE CASCADE,
    token text NOT NULL, -- original token for verification
    created_at timestamptz DEFAULT now() NOT NULL,
    accessed_at timestamptz,
    access_count integer DEFAULT 0
);

-- Create index for performance
CREATE INDEX idx_short_urls_uid ON public.short_urls(uid);

-- Enable RLS
ALTER TABLE public.short_urls ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Deny all anon access to short_urls" ON public.short_urls
    FOR ALL TO anon USING (false);

CREATE POLICY "Service role full access to short_urls" ON public.short_urls
    FOR ALL TO service_role USING (true);

-- Create function to increment access count
CREATE OR REPLACE FUNCTION increment_access_count(short_id_param text)
RETURNS void AS $$
BEGIN
  UPDATE public.short_urls 
  SET 
    access_count = access_count + 1,
    accessed_at = now()
  WHERE short_id = short_id_param;
END;
$$ LANGUAGE plpgsql;
