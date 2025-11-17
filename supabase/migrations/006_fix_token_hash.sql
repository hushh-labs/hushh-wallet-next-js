-- Fix token hash for the simple token
-- Update user's edit_token_hash to match the new simple token

-- Hash the simple token 'quickfixtoken123' and update
UPDATE public.members 
SET edit_token_hash = encode(sha256('quickfixtoken123'::bytea), 'hex')
WHERE uid = '8qh49kwfkwj1otggd24wnx324xty81w';

-- Verify the update
SELECT 
    'TOKEN HASH FIXED' as status,
    uid,
    edit_token_hash,
    'Now matches quickfixtoken123' as message
FROM public.members 
WHERE uid = '8qh49kwfkwj1otggd24wnx324xty81w';
