const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  try {
    console.log('🔄 Running onboarding migration...\n');

    // Add onboarding fields to users table
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS onboarding_skipped BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP;
    `);
    console.log('✅ Added onboarding fields to users table');

    // Create user tips table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_tips (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        tip_id VARCHAR(100) NOT NULL,
        dismissed BOOLEAN DEFAULT FALSE,
        dismissed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, tip_id)
      );
    `);
    console.log('✅ Created user_tips table');

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_tips_user_id ON user_tips(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_tips_dismissed ON user_tips(user_id, dismissed);
    `);
    console.log('✅ Created indexes');

    console.log('\n🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Error running migration:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration();

