-- Create legacy_cards table for Step 4
-- One legacy card per user with public_token for QR sharing

CREATE TABLE IF NOT EXISTS legacy_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users_anon(id) ON DELETE CASCADE,
  public_token TEXT NOT NULL UNIQUE,
  card_title TEXT NOT NULL DEFAULT 'Hushh Legacy Signature Card',
  include_identity BOOLEAN NOT NULL DEFAULT true,
  include_networth BOOLEAN NOT NULL DEFAULT false, 
  include_bodyfit BOOLEAN NOT NULL DEFAULT true,
  include_food BOOLEAN NOT NULL DEFAULT true,
  include_lifestyle BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_viewed_at TIMESTAMPTZ,
  UNIQUE(user_id) -- One card per user
);

-- Create index for public_token lookups
CREATE INDEX IF NOT EXISTS idx_legacy_cards_public_token ON legacy_cards(public_token);
CREATE INDEX IF NOT EXISTS idx_legacy_cards_user_id ON legacy_cards(user_id);

-- Enable RLS
ALTER TABLE legacy_cards ENABLE ROW LEVEL SECURITY;

-- Create policy for all operations (permissive for MVP)
CREATE POLICY "Allow all operations on legacy_cards" ON legacy_cards
FOR ALL USING (true) WITH CHECK (true);

-- Function to generate random public token
CREATE OR REPLACE FUNCTION generate_public_token()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..12 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to ensure unique public token
CREATE OR REPLACE FUNCTION generate_unique_public_token()
RETURNS TEXT AS $$
DECLARE
  new_token TEXT;
  token_exists BOOLEAN;
BEGIN
  LOOP
    new_token := generate_public_token();
    SELECT EXISTS(SELECT 1 FROM legacy_cards WHERE public_token = new_token) INTO token_exists;
    
    IF NOT token_exists THEN
      RETURN new_token;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_legacy_cards_updated_at
  BEFORE UPDATE ON legacy_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
