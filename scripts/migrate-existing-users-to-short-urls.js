#!/usr/bin/env node

/**
 * Migration script to create short URLs for all existing users
 * This fixes the Apple Wallet token breaking issue for existing passes
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Generate short ID for Apple Wallet (no hyphens, no breaking)
function generateShortId() {
  return crypto.randomBytes(4).toString('hex'); // 8 chars, no hyphens possible
}

// Generate short URL for Apple Wallet
function generateShortUrl(shortId) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hushh-gold-pass-mvp.vercel.app';
  return `${baseUrl}/s/${shortId}`;
}

async function migrateExistingUsers() {
  console.log('🚀 Starting migration of existing users to short URLs...\n');

  try {
    // Get all members who don't have short URLs yet
    const { data: existingMembers, error: fetchError } = await supabase
      .from('members')
      .select('uid, edit_token_hash, profile_url')
      .not('profile_url', 'like', '%/s/%'); // Filter out users who already have short URLs

    if (fetchError) {
      console.error('❌ Error fetching existing members:', fetchError);
      return;
    }

    if (!existingMembers || existingMembers.length === 0) {
      console.log('✅ No existing users need migration - all already have short URLs!');
      return;
    }

    console.log(`📊 Found ${existingMembers.length} users to migrate:\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const member of existingMembers) {
      try {
        // Extract original token from edit_token_hash
        // We'll need to generate a new short token for the short URL
        const newShortToken = crypto.randomBytes(8).toString('hex'); // 16 chars for compatibility
        const shortId = generateShortId();
        const shortUrl = generateShortUrl(shortId);

        console.log(`Processing user ${member.uid}...`);

        // Create short URL mapping
        const { error: shortUrlError } = await supabase
          .from('short_urls')
          .insert({
            short_id: shortId,
            uid: member.uid,
            token: newShortToken // Store the new short token
          });

        if (shortUrlError) {
          console.error(`  ❌ Error creating short URL for ${member.uid}:`, shortUrlError.message);
          errorCount++;
          continue;
        }

        // Update member's profile_url to use short URL
        const { error: updateError } = await supabase
          .from('members')
          .update({
            profile_url: shortUrl
          })
          .eq('uid', member.uid);

        if (updateError) {
          console.error(`  ❌ Error updating member ${member.uid}:`, updateError.message);
          errorCount++;
          continue;
        }

        console.log(`  ✅ Migrated ${member.uid} → ${shortUrl}`);
        successCount++;

      } catch (error) {
        console.error(`  ❌ Unexpected error for ${member.uid}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`✅ Successfully migrated: ${successCount} users`);
    console.log(`❌ Errors: ${errorCount} users`);
    console.log(`📊 Total processed: ${existingMembers.length} users\n`);

    if (successCount > 0) {
      console.log('🎉 Migration completed! Existing users now have Apple Wallet safe short URLs.');
      console.log('⚠️  Note: Users will need to access their passes to get the new short URLs in Apple Wallet.');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Special function to create short URL for a specific user (for immediate testing)
async function createShortUrlForUser(uid) {
  console.log(`🎯 Creating short URL for specific user: ${uid}...\n`);

  try {
    // Get the user
    const { data: member, error: fetchError } = await supabase
      .from('members')
      .select('uid, edit_token_hash, profile_url')
      .eq('uid', uid)
      .single();

    if (fetchError || !member) {
      console.error('❌ User not found:', uid);
      return;
    }

    // Check if user already has short URL
    if (member.profile_url && member.profile_url.includes('/s/')) {
      console.log('✅ User already has short URL:', member.profile_url);
      return;
    }

    // Generate new short URL
    const newShortToken = crypto.randomBytes(8).toString('hex');
    const shortId = generateShortId();
    const shortUrl = generateShortUrl(shortId);

    // Create short URL mapping
    const { error: shortUrlError } = await supabase
      .from('short_urls')
      .insert({
        short_id: shortId,
        uid: member.uid,
        token: newShortToken
      });

    if (shortUrlError) {
      console.error('❌ Error creating short URL:', shortUrlError);
      return;
    }

    // Update member's profile_url
    const { error: updateError } = await supabase
      .from('members')
      .update({
        profile_url: shortUrl
      })
      .eq('uid', uid);

    if (updateError) {
      console.error('❌ Error updating member:', updateError);
      return;
    }

    console.log(`✅ Created short URL for ${uid}:`);
    console.log(`   Original: ${member.profile_url}`);
    console.log(`   New: ${shortUrl}`);
    console.log(`   Short ID: ${shortId}`);
    console.log(`   Access URL: ${shortUrl}\n`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    // Create short URL for specific user
    await createShortUrlForUser(args[0]);
  } else {
    // Migrate all existing users
    await migrateExistingUsers();
  }
}

main().catch(console.error);
