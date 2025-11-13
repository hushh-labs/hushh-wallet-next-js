-- Create users_anon table for anonymous user identity
CREATE TABLE IF NOT EXISTS users_anon (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hushh_uid TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_seen_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_anon_hushh_uid ON users_anon(hushh_uid);

-- Enable RLS (Row Level Security) - Optional for now
ALTER TABLE users_anon ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (since we're not using auth)
CREATE POLICY "Allow all operations on users_anon" ON users_anon
FOR ALL USING (true) WITH CHECK (true);
