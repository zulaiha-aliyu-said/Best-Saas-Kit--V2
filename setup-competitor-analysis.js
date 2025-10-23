/**
 * Competitor Analysis Setup Script
 * Sets up the database tables needed for competitor analysis
 * Run with: node setup-competitor-analysis.js
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

console.log('🔧 Competitor Analysis Setup');
console.log('════════════════════════════');
console.log('');
console.log('📡 Database URL:', DATABASE_URL.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
console.log('');

async function setupDatabase() {
  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    console.log('🔌 Connecting to database...');

    // Test connection
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Connected! Database time:', result.rows[0].now);
    console.log('');

    // Read and execute the competitor analysis schema
    const schemaPath = path.join(__dirname, 'sql-queries', '16-create-competitor-analysis-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');

    console.log('📝 Executing competitor analysis schema...');

    // Split SQL into individual statements and execute them
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
      }
    }

    console.log('✅ Schema executed successfully!');
    console.log('');

    // Verify tables were created
    console.log('🔍 Verifying tables...');
    const tableCheck = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('competitors', 'competitor_stats', 'competitor_posts', 'content_gaps')
      ORDER BY table_name;
    `);

    if (tableCheck.rows.length === 0) {
      console.log('⚠️ No competitor analysis tables found. There might be an issue with the SQL execution.');
    } else {
      console.log('✅ Tables created:');
      tableCheck.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    }

    console.log('');
    console.log('🎉 Setup completed successfully!');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('1. Restart your Next.js dev server: npm run dev');
    console.log('2. Go to: http://localhost:3000/dashboard/competitors');
    console.log('3. Try adding a competitor!');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('');
    console.error('💡 Troubleshooting:');
    console.error('1. Check your DATABASE_URL is correct');
    console.error('2. Verify database is accessible');
    console.error('3. Make sure you have CREATE TABLE permissions');
    console.error('4. Try running the SQL manually in your database console');
    console.error('');
    console.error('Manual SQL execution:');
    console.error('- Go to your Neon console: https://console.neon.tech/');
    console.error('- Open SQL Editor');
    console.error('- Copy and paste contents of: sql-queries/16-create-competitor-analysis-schema.sql');
    console.error('- Click Run');

    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.error('');
      console.error('🔧 This error suggests some tables already exist but are missing columns.');
      console.error('Try running the fix script instead:');
      console.error('node fix-database.js');
    }
  } finally {
    await pool.end();
  }
}

setupDatabase();
