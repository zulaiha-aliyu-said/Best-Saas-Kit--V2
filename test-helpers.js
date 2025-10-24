import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function resetUsageCounters(email) {
  try {
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (userResult.rows.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    const userId = userResult.rows[0].id;
    
    // Reset scheduling usage
    await pool.query(
      'DELETE FROM user_monthly_scheduling_usage WHERE user_id = $1',
      [userId]
    );
    
    // Reset chat usage
    await pool.query(
      'DELETE FROM user_monthly_chat_usage WHERE user_id = $1',
      [userId]
    );
    
    console.log(`✅ Reset usage counters for ${email}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

async function setUsageLimit(email, type, count) {
  try {
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (userResult.rows.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    const userId = userResult.rows[0].id;
    const monthYear = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    if (type === 'scheduling') {
      await pool.query(`
        INSERT INTO user_monthly_scheduling_usage (user_id, month_year, scheduled_count)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, month_year)
        DO UPDATE SET scheduled_count = $3
      `, [userId, monthYear, count]);
      
      console.log(`✅ Set scheduling count to ${count} for ${email}`);
    } else if (type === 'chat') {
      await pool.query(`
        INSERT INTO user_monthly_chat_usage (user_id, month_year, message_count)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, month_year)
        DO UPDATE SET message_count = $3
      `, [userId, monthYear, count]);
      
      console.log(`✅ Set chat count to ${count} for ${email}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

async function viewUsage(email) {
  try {
    const userResult = await pool.query(
      'SELECT id, ltd_tier, credits FROM users WHERE email = $1',
      [email]
    );
    
    if (userResult.rows.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    const user = userResult.rows[0];
    
    console.log(`\n📊 Usage for ${email} (Tier ${user.ltd_tier}, ${user.credits} credits)\n`);
    
    const scheduling = await pool.query(
      'SELECT * FROM user_monthly_scheduling_usage WHERE user_id = $1',
      [user.id]
    );
    
    if (scheduling.rows.length > 0) {
      console.log('Scheduling:');
      scheduling.rows.forEach(row => {
        console.log(`  ${row.month_year}: ${row.scheduled_count} posts`);
      });
    } else {
      console.log('Scheduling: No usage yet');
    }
    
    const chat = await pool.query(
      'SELECT * FROM user_monthly_chat_usage WHERE user_id = $1',
      [user.id]
    );
    
    if (chat.rows.length > 0) {
      console.log('Chat:');
      chat.rows.forEach(row => {
        console.log(`  ${row.month_year}: ${row.message_count} messages`);
      });
    } else {
      console.log('Chat: No usage yet');
    }
    
    console.log('');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

// Parse command line arguments
const command = process.argv[2];
const email = process.argv[3];
const type = process.argv[4];
const count = parseInt(process.argv[5]);

if (command === 'reset') {
  resetUsageCounters(email);
} else if (command === 'set') {
  setUsageLimit(email, type, count);
} else if (command === 'view') {
  viewUsage(email);
} else {
  console.log(`
🧪 Test Helper Commands:

1. View usage:
   node test-helpers.js view EMAIL

2. Reset usage counters:
   node test-helpers.js reset EMAIL

3. Set usage limit:
   node test-helpers.js set EMAIL TYPE COUNT
   
   Examples:
   node test-helpers.js set mamutech.online@gmail.com scheduling 29
   node test-helpers.js set zulaihaaliyu440@gmail.com chat 199

Available emails:
- maccidomuhammad1313@gmail.com (Tier 4)
- zulaihaaliyu440@gmail.com (Tier 3)
- saasmamu@gmail.com (Tier 3)
- mamutech.online@gmail.com (Tier 2)
  `);
}

