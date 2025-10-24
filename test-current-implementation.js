import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testCurrentImplementation() {
  try {
    console.log('\n📊 === CURRENT TEST USERS ===\n');
    
    const usersResult = await pool.query(`
      SELECT email, ltd_tier, credits, monthly_credit_limit, stacked_codes 
      FROM users 
      WHERE plan_type = 'ltd' 
      ORDER BY ltd_tier DESC
    `);
    
    usersResult.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Tier: ${user.ltd_tier} | Credits: ${user.credits}/${user.monthly_credit_limit} | Stacked: ${user.stacked_codes}`);
      console.log('');
    });
    
    console.log('\n📈 === CURRENT USAGE STATS ===\n');
    
    const schedulingResult = await pool.query(`
      SELECT u.email, s.month_year, s.scheduled_count 
      FROM user_monthly_scheduling_usage s 
      JOIN users u ON s.user_id = u.id
      ORDER BY u.ltd_tier DESC
    `);
    
    console.log(`Scheduling Usage: ${schedulingResult.rows.length} records`);
    if (schedulingResult.rows.length > 0) {
      schedulingResult.rows.forEach(row => {
        console.log(`  ${row.email}: ${row.scheduled_count} posts in ${row.month_year}`);
      });
    } else {
      console.log('  (No scheduling usage yet)');
    }
    
    const chatResult = await pool.query(`
      SELECT u.email, c.month_year, c.message_count 
      FROM user_monthly_chat_usage c 
      JOIN users u ON c.user_id = u.id
      ORDER BY u.ltd_tier DESC
    `);
    
    console.log(`\nChat Usage: ${chatResult.rows.length} records`);
    if (chatResult.rows.length > 0) {
      chatResult.rows.forEach(row => {
        console.log(`  ${row.email}: ${row.message_count} messages in ${row.month_year}`);
      });
    } else {
      console.log('  (No chat usage yet)');
    }
    
    console.log('\n💳 === RECENT CREDIT USAGE ===\n');
    
    const creditResult = await pool.query(`
      SELECT 
        u.email,
        cu.action_type,
        cu.credits_used,
        cu.created_at
      FROM credit_usage cu
      JOIN users u ON cu.user_id = u.id
      ORDER BY cu.created_at DESC
      LIMIT 10
    `);
    
    if (creditResult.rows.length > 0) {
      creditResult.rows.forEach((row, index) => {
        const date = new Date(row.created_at).toLocaleString();
        console.log(`${index + 1}. ${row.email} - ${row.action_type}`);
        console.log(`   Credits: ${row.credits_used} | ${date}`);
      });
    } else {
      console.log('  (No credit usage yet)');
    }
    
    console.log('\n✅ === TESTING SETUP COMPLETE ===\n');
    console.log('Next steps:');
    console.log('1. Open TESTING_GUIDE.md for comprehensive test scenarios');
    console.log('2. Start with Feature #1: Viral Hook Generator');
    console.log('3. Test each tier level systematically');
    console.log('\nTier Breakdown:');
    
    const tierSummary = await pool.query(`
      SELECT ltd_tier, COUNT(*) as count 
      FROM users 
      WHERE plan_type = 'ltd' 
      GROUP BY ltd_tier 
      ORDER BY ltd_tier DESC
    `);
    
    tierSummary.rows.forEach(row => {
      console.log(`  Tier ${row.tier}: ${row.count} user(s)`);
    });
    
    console.log('\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testCurrentImplementation();

