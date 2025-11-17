-- Migration: Create proper HUSHH Gold Pass MVP schema
-- Based on specification requirements

-- Drop existing table if it exists
DROP TABLE IF EXISTS public.users;

-- Create members table (main table)
CREATE TABLE public.members (
    uid text PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL,
    phone_e164 text NOT NULL,
    profile_city text,
    profile_state text,
    profile_zip text,
    profile_gender text CHECK (profile_gender IN ('male', 'female')),
    profile_age integer CHECK (profile_age >= 13 AND profile_age <= 120),
    profile_last_updated_at timestamptz,
    edit_token_hash text NOT NULL,
    public_url text NOT NULL,
    profile_url text NOT NULL,
    pass_serial text,
    pass_status text NOT NULL DEFAULT 'active' CHECK (pass_status IN ('active', 'voided')),
    created_at timestamptz DEFAULT now() NOT NULL,
    last_seen_at timestamptz
);

-- Create pass_events table (audit log)
CREATE TABLE public.pass_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    uid text NOT NULL REFERENCES public.members(uid) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('claim_submitted', 'pass_issued', 'qr_scanned', 'profile_opened', 'profile_saved', 'voided', 'reissued', 'api_error')),
    meta_json jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Create rate_limits table
CREATE TABLE public.rate_limits (
    bucket text PRIMARY KEY,
    count integer NOT NULL DEFAULT 0,
    reset_at timestamptz NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_members_email ON public.members(email);
CREATE INDEX idx_members_phone_e164 ON public.members(phone_e164);
CREATE INDEX idx_pass_events_uid_created_at ON public.pass_events(uid, created_at);
CREATE INDEX idx_rate_limits_bucket ON public.rate_limits(bucket);
CREATE INDEX idx_pass_events_type ON public.pass_events(type);

-- Enable Row Level Security (RLS)
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pass_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create policies to deny all for anon role
CREATE POLICY "Deny all anon access to members" ON public.members
    FOR ALL TO anon USING (false);

CREATE POLICY "Deny all anon access to pass_events" ON public.pass_events
    FOR ALL TO anon USING (false);

CREATE POLICY "Deny all anon access to rate_limits" ON public.rate_limits
    FOR ALL TO anon USING (false);

-- Create policies to allow service role full access
CREATE POLICY "Service role full access to members" ON public.members
    FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access to pass_events" ON public.pass_events
    FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access to rate_limits" ON public.rate_limits
    FOR ALL TO service_role USING (true);

-- Create view for public verification (PII-safe)
CREATE VIEW public.member_verify_view AS
SELECT 
    uid,
    name,
    pass_status,
    created_at
FROM public.members;

-- Grant read access to anon role on the view
GRANT SELECT ON public.member_verify_view TO anon;
