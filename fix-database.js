/**
 * Quick Database Fix Script
 * Fixes user_id column type mismatch
 * Run with: node fix-database.js
 */

const { Pool } = require('@neondatabase/serverless');

// Get DATABASE_URL from environment or .env.local
let DATABASE_URL = process.env.DATABASE_URL;

// Try to load from .env.local if not in environment
if (!DATABASE_URL) {
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '.env.local');
  
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    const match = envFile.match(/DATABASE_URL=["']?([^"'\n]+)["']?/);
    if (match) {
      DATABASE_URL = match[1];
    }
  }
}

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found!');
  console.error('');
  console.error('Please set DATABASE_URL in .env.local or as an environment variable.');
  process.exit(1);
}

console.log('🔧 Database Migration: Fix user_id Type');
console.log('═══════════════════════════════════════');
console.log('');

async function runMigration() {
  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    console.log('🔌 Connecting to database...');
    
    // Step 1: Fix competitors table
    console.log('📝 Updating competitors.user_id to VARCHAR(255)...');
    await pool.query(`
      ALTER TABLE competitors 
        ALTER COLUMN user_id TYPE VARCHAR(255);
    `);
    console.log('   ✅ competitors.user_id updated');
    
    // Step 2: Fix content_gaps table
    console.log('📝 Updating content_gaps.user_id to VARCHAR(255)...');
    await pool.query(`
      ALTER TABLE content_gaps 
        ALTER COLUMN user_id TYPE VARCHAR(255);
    `);
    console.log('   ✅ content_gaps.user_id updated');
    
    // Step 3: Verify
    console.log('🔍 Verifying changes...');
    const result = await pool.query(`
      SELECT 
        table_name,
        column_name,
        data_type,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_name IN ('competitors', 'content_gaps')
        AND column_name = 'user_id'
      ORDER BY table_name;
    `);
    
    console.log('');
    console.log('📊 Verification Results:');
    result.rows.forEach(row => {
      console.log(`   ${row.table_name}.${row.column_name}: ${row.data_type}(${row.character_maximum_length})`);
    });
    
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('✅ Migration completed successfully!');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('1. Restart your Next.js dev server');
    console.log('2. Go to http://localhost:3000/dashboard/competitors');
    console.log('3. Try adding a competitor again');
    console.log('');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('');
    console.error('💡 Tips:');
    console.error('1. Check DATABASE_URL is correct');
    console.error('2. Verify database connection');
    console.error('3. Make sure tables exist');
    console.error('');
    console.error('Or run manually in Neon Console:');
    console.error('   ALTER TABLE competitors ALTER COLUMN user_id TYPE VARCHAR(255);');
    console.error('   ALTER TABLE content_gaps ALTER COLUMN user_id TYPE VARCHAR(255);');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();

