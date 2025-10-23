/**
 * Setup Script for Competitor Analysis Tables
 * This script creates all necessary tables for the competitor analysis feature
 */

const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function setupCompetitorTables() {
  console.log('🚀 Starting Competitor Analysis Setup...\n');

  // Check for DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL not found in environment variables');
    console.log('\n📝 Please create a .env.local file with your database connection string:');
    console.log('   DATABASE_URL="your-neon-database-url"');
    console.log('\n💡 You can copy env.example to .env.local and update the values');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'sql-queries', '16-create-competitor-analysis-schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('📊 Creating competitor analysis tables...');
    
    // Execute the SQL
    await pool.query(sqlContent);

    console.log('✅ Tables created successfully!\n');
    
    // Verify tables were created
    console.log('🔍 Verifying tables...');
    const verifyQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('competitors', 'competitor_stats', 'competitor_posts', 'content_gaps')
      ORDER BY table_name;
    `;
    
    const result = await pool.query(verifyQuery);
    
    if (result.rows.length === 4) {
      console.log('✅ All tables verified:');
      result.rows.forEach(row => {
        console.log(`   ✓ ${row.table_name}`);
      });
      console.log('\n🎉 Setup completed successfully!');
      console.log('\n📖 Next steps:');
      console.log('   1. Make sure all API keys are set in .env.local');
      console.log('   2. Restart your development server');
      console.log('   3. Navigate to the Competitor Analysis page');
      console.log('   4. Start adding competitors!\n');
    } else {
      console.log('⚠️  Warning: Some tables may be missing');
      console.log('   Expected: 4 tables');
      console.log(`   Found: ${result.rows.length} tables`);
    }

  } catch (error) {
    console.error('❌ Error during setup:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check your DATABASE_URL is correct');
    console.error('   2. Ensure you have network access to your database');
    console.error('   3. Verify your database user has CREATE TABLE permissions');
    console.error('\n📝 Full error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the setup
setupCompetitorTables();




