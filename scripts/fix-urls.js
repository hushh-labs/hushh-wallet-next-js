const { createClient } = require('@supabase/supabase-js');

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CORRECT_BASE_URL = 'https://hushh-gold-pass-mvp.vercel.app';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function fixUrls() {
  try {
    console.log('🔧 Starting URL fix for existing members...');
    
    // Get all members
    const { data: members, error: fetchError } = await supabase
      .from('members')
      .select('uid, public_url, profile_url');

    if (fetchError) {
      throw fetchError;
    }

    console.log(`📋 Found ${members.length} members to update`);

    let updated = 0;
    let skipped = 0;

    for (const member of members) {
      const correctPublicUrl = `${CORRECT_BASE_URL}/u/${member.uid}`;
      
      // Check if URLs need updating
      if (member.public_url === correctPublicUrl && 
          member.profile_url && member.profile_url.startsWith(CORRECT_BASE_URL)) {
        console.log(`✅ Skipping ${member.uid} - URLs already correct`);
        skipped++;
        continue;
      }

      // Extract token from existing profile URL if possible
      let token = '';
      if (member.profile_url) {
        const tokenMatch = member.profile_url.match(/token=([^&]+)/);
        if (tokenMatch) {
          token = tokenMatch[1];
        }
      }

      const correctProfileUrl = token ? 
        `${CORRECT_BASE_URL}/complete/${member.uid}?token=${token}` :
        `${CORRECT_BASE_URL}/complete/${member.uid}`;

      // Update the member
      const { error: updateError } = await supabase
        .from('members')
        .update({
          public_url: correctPublicUrl,
          profile_url: correctProfileUrl
        })
        .eq('uid', member.uid);

      if (updateError) {
        console.error(`❌ Failed to update ${member.uid}:`, updateError);
        continue;
      }

      console.log(`🔄 Updated ${member.uid}`);
      updated++;
    }

    console.log('\n🎉 URL fix completed!');
    console.log(`✅ Updated: ${updated} members`);
    console.log(`⏭️  Skipped: ${skipped} members`);

  } catch (error) {
    console.error('💥 Error fixing URLs:', error);
    process.exit(1);
  }
}

// Run the fix
fixUrls();
