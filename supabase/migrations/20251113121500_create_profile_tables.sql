-- Create 5 profile tables for forms: identity, networth, bodyfit, food, lifestyle
-- Each table follows common pattern: user_id FK, data JSONB, visibility JSONB

-- 1. Identity Profiles
CREATE TABLE IF NOT EXISTS identity_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users_anon(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  visibility JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id) -- One row per user
);

-- 2. Net Worth Profiles  
CREATE TABLE IF NOT EXISTS networth_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users_anon(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  visibility JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- 3. Body & Fit Profiles
CREATE TABLE IF NOT EXISTS bodyfit_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users_anon(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  visibility JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- 4. Food Preferences
CREATE TABLE IF NOT EXISTS food_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users_anon(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  visibility JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- 5. Lifestyle Profiles
CREATE TABLE IF NOT EXISTS lifestyle_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users_anon(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  visibility JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- Create indexes for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_identity_profiles_user_id ON identity_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_networth_profiles_user_id ON networth_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_bodyfit_profiles_user_id ON bodyfit_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_food_preferences_user_id ON food_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_lifestyle_profiles_user_id ON lifestyle_profiles(user_id);

-- Enable RLS on all tables
ALTER TABLE identity_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE networth_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bodyfit_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE lifestyle_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for all operations (permissive for MVP - service role access)
CREATE POLICY "Allow all operations on identity_profiles" ON identity_profiles
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on networth_profiles" ON networth_profiles  
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on bodyfit_profiles" ON bodyfit_profiles
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on food_preferences" ON food_preferences
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on lifestyle_profiles" ON lifestyle_profiles
FOR ALL USING (true) WITH CHECK (true);

-- Functions to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_identity_profiles_updated_at
    BEFORE UPDATE ON identity_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_networth_profiles_updated_at
    BEFORE UPDATE ON networth_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_bodyfit_profiles_updated_at
    BEFORE UPDATE ON bodyfit_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_food_preferences_updated_at
    BEFORE UPDATE ON food_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_lifestyle_profiles_updated_at
    BEFORE UPDATE ON lifestyle_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
