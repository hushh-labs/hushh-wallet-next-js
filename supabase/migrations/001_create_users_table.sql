-- Migration: Create users table for HUSHH Gold Pass MVP
-- Description: Single table to store all user data including identity, profile, tokens, and metadata

CREATE TABLE IF NOT EXISTS public.users (
    -- Primary key
    uid text PRIMARY KEY,
    
    -- Identity information (required)
    identity jsonb NOT NULL DEFAULT '{}',
    
    -- Profile information (optional, filled later)
    profile jsonb DEFAULT NULL,
    
    -- Application links
    links jsonb NOT NULL DEFAULT '{}',
    
    -- Security tokens
    tokens jsonb NOT NULL DEFAULT '{}',
    
    -- Pass information
    pass jsonb DEFAULT NULL,
    
    -- Metadata
    meta jsonb NOT NULL DEFAULT '{}',
    
    -- Timestamps
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_updated_at ON public.users(updated_at);

-- Create index on identity email for lookups (using btree for text)
CREATE INDEX IF NOT EXISTS idx_users_identity_email ON public.users USING btree ((identity->>'email'));

-- Create index on meta tier for filtering (using btree for text)
CREATE INDEX IF NOT EXISTS idx_users_meta_tier ON public.users USING btree ((meta->>'tier'));

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role full access (for server operations)
CREATE POLICY "Service role can manage all users" ON public.users
    FOR ALL USING (auth.role() = 'service_role');

-- Create policy to allow public read access for specific UIDs (for QR verification)
CREATE POLICY "Public can read user by UID" ON public.users
    FOR SELECT USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insert example data structure (commented out)
/*
INSERT INTO public.users (uid, identity, links, tokens, meta) VALUES (
    'example_uid_123',
    '{"name": "John Doe", "email": "john@example.com", "phone_e164": "+11234567890"}',
    '{"public_url": "https://example.com/u/example_uid_123", "profile_url": "https://example.com/u/example_uid_123/complete?token=abc123"}',
    '{"profile_token": "abc123def456"}',
    '{"tier": "gold", "created_at": "2024-01-01T00:00:00Z", "last_seen_at": "2024-01-01T00:00:00Z"}'
);
*/
