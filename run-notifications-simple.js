const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Running notifications migration...\n');

    // Create notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        action_url VARCHAR(500),
        action_text VARCHAR(100),
        icon VARCHAR(50),
        is_read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created notifications table');

    // Create indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC)`);
    console.log('✅ Created indexes for notifications');

    // Create user_feedback table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_feedback (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        category VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        page_url VARCHAR(500),
        screenshot_url VARCHAR(500),
        email_followup BOOLEAN DEFAULT FALSE,
        status VARCHAR(50) DEFAULT 'new',
        admin_response TEXT,
        responded_at TIMESTAMP,
        responded_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created user_feedback table');

    // Create indexes for feedback
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON user_feedback(status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON user_feedback(created_at DESC)`);
    console.log('✅ Created indexes for user_feedback');

    // Create welcome notifications for existing users
    const result = await client.query(`
      INSERT INTO notifications (user_id, type, title, message, icon, action_url, action_text)
      SELECT 
        id,
        'welcome',
        'Welcome to RepurposeAI! 🎉',
        'We''re excited to have you here. Explore our features and start creating amazing content!',
        'Sparkles',
        '/dashboard/repurpose',
        'Get Started'
      FROM users
      WHERE NOT EXISTS (
        SELECT 1 FROM notifications WHERE notifications.user_id = users.id
      )
      LIMIT 100
    `);
    console.log(`✅ Created ${result.rowCount} welcome notifications for existing users`);

    console.log('\n🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Error running migration:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});






