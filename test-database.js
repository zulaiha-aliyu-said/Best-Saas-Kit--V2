/**
 * Database Connection Test Script
 * Tests your Neon database connection and setup
 * Run with: node test-database.js
 */

const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Get DATABASE_URL from environment or .env.local
let DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
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
  console.error('');
  console.error('Example .env.local:');
  console.error('DATABASE_URL="postgresql://username:password@your-neon-host.neon.tech/database_name?sslmode=require"');
  console.error('');
  console.error('Get your connection string from: https://console.neon.tech/');
  process.exit(1);
}

console.log('🧪 Database Connection Test');
console.log('═══════════════════════════');
console.log('');
console.log('📡 Testing connection to:');
console.log('   ' + DATABASE_URL.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
console.log('');

async function testDatabase() {
  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    // Test 1: Basic connection
    console.log('🔌 Test 1: Basic connection...');
    const result = await pool.query('SELECT NOW()');
    console.log('   ✅ Connected successfully!');
    console.log('   🕐 Database time:', result.rows[0].now);
    console.log('');

    // Test 2: Check existing tables
    console.log('📊 Test 2: Checking existing tables...');
    const tablesResult = await pool.query(`
      SELECT table_name, table_schema
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('   📋 Found', tablesResult.rows.length, 'tables:');
    tablesResult.rows.forEach(row => {
      console.log('      -', row.table_name);
    });
    console.log('');

    // Test 3: Check competitor tables specifically
    console.log('🎯 Test 3: Checking competitor analysis tables...');
    const competitorTables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('competitors', 'competitor_stats', 'competitor_posts', 'content_gaps')
      ORDER BY table_name
    `);

    if (competitorTables.rows.length === 0) {
      console.log('   ❌ Competitor analysis tables not found!');
      console.log('');
      console.log('   🔧 To fix this:');
      console.log('   1. Go to your Neon console: https://console.neon.tech/');
      console.log('   2. Click "SQL Editor"');
      console.log('   3. Copy and paste: sql-queries/16-create-competitor-analysis-schema.sql');
      console.log('   4. Click "Run"');
      console.log('   5. Restart your server: npm run dev');
    } else {
      console.log('   ✅ Found competitor tables:');
      competitorTables.rows.forEach(row => {
        console.log('      -', row.table_name);
      });
      console.log('');
      console.log('   🎉 Competitor analysis is ready to use!');
    }

    console.log('');
    console.log('📈 Test 4: Database statistics...');
    const statsResult = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tables,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public') as total_columns,
        (SELECT COUNT(*) FROM information_schema.indexes WHERE schemaname = 'public') as total_indexes
    `);

    const stats = statsResult.rows[0];
    console.log('   📊 Total tables:', stats.total_tables);
    console.log('   📊 Total columns:', stats.total_columns);
    console.log('   📊 Total indexes:', stats.total_indexes);

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('');
    console.error('💡 Troubleshooting:');
    console.error('1. Check your DATABASE_URL is correct');
    console.error('2. Verify your Neon database is still active');
    console.error('3. Make sure the connection string format is valid');
    console.error('4. Try creating a new Neon database if needed');
    console.error('');
    console.error('🔗 Get help: https://console.neon.tech/');
  } finally {
    await pool.end();
  }
}

testDatabase();
