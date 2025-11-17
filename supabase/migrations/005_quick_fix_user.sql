-- Quick fix for Apple Wallet token breaking issue
-- User: 8qh49kwfkwj1otggd24wnx324xty81w

-- Create short URL for this specific user
INSERT INTO public.short_urls (short_id, uid, token) 
VALUES ('quickfix', '8qh49kwfkwj1otggd24wnx324xty81w', 'quickfixtoken123')
ON CONFLICT (short_id) DO UPDATE SET token = 'quickfixtoken123';

-- Update user's profile_url to use short URL
UPDATE public.members 
SET profile_url = 'https://hushh-gold-pass-mvp.vercel.app/s/quickfix'
WHERE uid = '8qh49kwfkwj1otggd24wnx324xty81w';

-- Verify the fix
SELECT 
    'QUICK FIX APPLIED' as status,
    uid,
    profile_url,
    'Apple Wallet safe URL created' as message
FROM public.members 
WHERE uid = '8qh49kwfkwj1otggd24wnx324xty81w';
