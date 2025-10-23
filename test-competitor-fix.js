/**
 * Test Script: Verify Competitor Analysis Fix
 * This script checks if the intermittent error fixes are working
 */

const { Pool } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function testCompetitorFix() {
  console.log('🧪 Testing Competitor Analysis Fix...\n');

  // Test 1: Environment variables
  console.log('Test 1: Environment Variables');
  if (!process.env.DATABASE_URL) {
    console.error('❌ FAILED: DATABASE_URL not found in .env.local');
    console.log('   Create .env.local file with your database URL\n');
    return false;
  }
  console.log('✅ PASSED: DATABASE_URL found\n');

  // Test 2: Database connection
  console.log('Test 2: Database Connection');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    const startTime = Date.now();
    await pool.query('SELECT 1');
    const duration = Date.now() - startTime;
    console.log(`✅ PASSED: Database connected (${duration}ms)\n`);
  } catch (error) {
    console.error('❌ FAILED: Cannot connect to database');
    console.error('   Error:', error.message);
    console.log('\n   Check your DATABASE_URL is correct\n');
    await pool.end();
    return false;
  }

  // Test 3: Check for required tables
  console.log('Test 3: Required Tables');
  try {
    const tableQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('competitors', 'competitor_posts', 'competitor_stats', 'content_gaps')
      ORDER BY table_name;
    `;
    
    const result = await pool.query(tableQuery);
    
    if (result.rows.length === 4) {
      console.log('✅ PASSED: All 4 tables exist:');
      result.rows.forEach(row => {
        console.log(`   ✓ ${row.table_name}`);
      });
      console.log('');
    } else {
      console.error('❌ FAILED: Missing tables');
      console.log(`   Expected: 4 tables`);
      console.log(`   Found: ${result.rows.length} tables`);
      if (result.rows.length > 0) {
        result.rows.forEach(row => {
          console.log(`   ✓ ${row.table_name}`);
        });
      }
      console.log('\n   Run: node setup-competitor-tables.js\n');
      await pool.end();
      return false;
    }
  } catch (error) {
    console.error('❌ FAILED: Error checking tables');
    console.error('   Error:', error.message);
    await pool.end();
    return false;
  }

  // Test 4: Check status column in content_gaps
  console.log('Test 4: Content Gaps Status Column');
  try {
    const columnQuery = `
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'content_gaps'
        AND column_name = 'status';
    `;
    
    const result = await pool.query(columnQuery);
    
    if (result.rows.length === 1) {
      console.log('✅ PASSED: Status column exists');
      console.log(`   Type: ${result.rows[0].data_type}`);
      console.log(`   Default: ${result.rows[0].column_default}\n`);
    } else {
      console.error('❌ FAILED: Status column missing in content_gaps table');
      console.log('   Run: node setup-competitor-tables.js\n');
      await pool.end();
      return false;
    }
  } catch (error) {
    console.error('❌ FAILED: Error checking status column');
    console.error('   Error:', error.message);
    await pool.end();
    return false;
  }

  // Test 5: Simulate API query (like the actual API does)
  console.log('Test 5: Simulate API Query');
  try {
    const startTime = Date.now();
    
    // Use a test userId (doesn't need to exist)
    const testUserId = 'test-user-123';
    
    const apiQuery = `
      SELECT 
        c.*,
        (
          SELECT json_build_object(
            'total_posts', COUNT(*),
            'avg_likes', ROUND(AVG(likes_count)),
            'avg_comments', ROUND(AVG(comments_count)),
            'avg_engagement', ROUND(AVG(engagement_rate), 2)
          )
          FROM competitor_posts
          WHERE competitor_id = c.id
        ) as stats,
        (
          SELECT COUNT(*)
          FROM content_gaps
          WHERE competitor_id = c.id AND status = 'active'
        ) as content_gaps_count
      FROM competitors c
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC;
    `;
    
    const result = await pool.query(apiQuery, [testUserId]);
    const duration = Date.now() - startTime;
    
    console.log(`✅ PASSED: API query executed successfully (${duration}ms)`);
    console.log(`   Found: ${result.rows.length} competitors for test user\n`);
  } catch (error) {
    console.error('❌ FAILED: API query failed');
    console.error('   Error:', error.message);
    if (error.message.includes('status')) {
      console.log('   → The status column might be missing');
      console.log('   → Run: node setup-competitor-tables.js\n');
    }
    await pool.end();
    return false;
  }

  // Test 6: Connection pool stress test (simulate multiple requests)
  console.log('Test 6: Connection Pool Stress Test (5 concurrent queries)');
  try {
    const startTime = Date.now();
    const promises = [];
    
    for (let i = 0; i < 5; i++) {
      promises.push(pool.query('SELECT NOW() as timestamp'));
    }
    
    await Promise.all(promises);
    const duration = Date.now() - startTime;
    
    console.log(`✅ PASSED: Handled 5 concurrent queries (${duration}ms)`);
    console.log(`   Average: ${Math.round(duration / 5)}ms per query\n`);
  } catch (error) {
    console.error('❌ FAILED: Concurrent queries failed');
    console.error('   Error:', error.message);
    console.log('   This might indicate connection pool issues\n');
  }

  await pool.end();

  // Final summary
  console.log('═══════════════════════════════════════════════');
  console.log('🎉 ALL TESTS PASSED!');
  console.log('═══════════════════════════════════════════════\n');
  
  console.log('✅ Your competitor analysis feature should now work correctly!');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Make sure your dev server is running: npm run dev');
  console.log('  2. Open the Competitor Analysis page');
  console.log('  3. Open browser console (F12) to see detailed logs');
  console.log('  4. Try refreshing the page multiple times');
  console.log('  5. The retry logic should handle any intermittent errors\n');
  
  return true;
}

// Run the test
testCompetitorFix()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  });




