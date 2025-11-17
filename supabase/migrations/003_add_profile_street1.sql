-- Add missing profile_street1 column
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS profile_street1 text;
