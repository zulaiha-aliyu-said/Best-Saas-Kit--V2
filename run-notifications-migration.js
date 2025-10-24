const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting notifications & feedback migration...\n');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'sql-queries', '27-create-notifications.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Run the migration
    await client.query(sql);
    
    console.log('✅ Successfully created:');
    console.log('   - notifications table');
    console.log('   - user_feedback table');
    console.log('   - All indexes');
    console.log('\n🎉 Migration complete!\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
