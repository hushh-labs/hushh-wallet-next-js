#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration from env
const supabaseUrl = 'https://xicjnlrlbvqzlhtjzuuo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpY2pubHJsYnZxemxodGp6dXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA4ODgwMiwiZXhwIjoyMDc4NjY0ODAyfQ.iVWG0vTx_qgQ1ju1m7R-1Acu1s8jQMs4x0Ux1Z_8nOE';

// Create Supabase client with service role (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function clearDatabase() {
  console.log('🗑️  Starting database cleanup...\n');

  try {
    // List of tables to clear (in dependency order - clear dependent tables first)
    const tablesToClear = [
      { name: 'pass_events', primaryKey: 'id' },      // Clear events first (depends on members)
      { name: 'short_urls', primaryKey: 'short_id' }, // Clear short URLs (depends on members)  
      { name: 'members', primaryKey: 'uid' }          // Clear members last
    ];

    let totalDeleted = 0;

    for (const table of tablesToClear) {
      const { name: tableName, primaryKey } = table;
      console.log(`📋 Clearing table: ${tableName}`);
      
      // First check if table exists and count records
      const { count, error: countError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (countError) {
        if (countError.message.includes('does not exist')) {
          console.log(`   ⚠️  Table ${tableName} does not exist, skipping...`);
          continue;
        }
        console.error(`   ❌ Error counting ${tableName}:`, countError.message);
        continue;
      }

      console.log(`   📊 Found ${count} records in ${tableName}`);

      if (count > 0) {
        // Delete all records from the table using the correct primary key
        const { error: deleteError } = await supabase
          .from(tableName)
          .delete()
          .neq(primaryKey, 'NEVER_MATCH_THIS_VALUE'); // Delete all records

        if (deleteError) {
          console.error(`   ❌ Error clearing ${tableName}:`, deleteError.message);
        } else {
          console.log(`   ✅ Successfully cleared ${count} records from ${tableName}`);
          totalDeleted += count;
        }
      } else {
        console.log(`   ✨ Table ${tableName} is already empty`);
      }
    }

    console.log(`\n🎉 Database cleanup complete!`);
    console.log(`📊 Total records deleted: ${totalDeleted}`);
    
    // Verify tables are empty
    console.log(`\n🔍 Verifying cleanup...`);
    for (const table of tablesToClear) {
      const { name: tableName } = table;
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (!error) {
        console.log(`   ${tableName}: ${count} records remaining`);
      }
    }

  } catch (error) {
    console.error('💥 Database cleanup failed:', error.message);
    process.exit(1);
  }
}

// Run the cleanup
clearDatabase().then(() => {
  console.log('\n✅ Database cleanup script completed successfully!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
