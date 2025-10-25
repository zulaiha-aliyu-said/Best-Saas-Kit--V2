// Setup script for Prompt Library
// Run: node setup-prompt-library.js

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function setupPromptLibrary() {
  const client = await pool.connect();

  try {
    console.log('🚀 Starting Prompt Library Setup...\n');

    // Read SQL file
    const sqlPath = path.join(__dirname, 'sql-queries', '18-create-prompt-library.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Executing SQL script...');
    await client.query(sql);
    console.log('✅ SQL script executed successfully!\n');

    // Verify tables created
    console.log('🔍 Verifying installation...\n');

    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name IN ('prompt_library', 'prompt_templates')
    `);
    console.log('Tables created:', tablesResult.rows.map(r => r.table_name).join(', '));

    // Check template count
    const templateCount = await client.query('SELECT COUNT(*) FROM prompt_templates');
    console.log('Templates loaded:', templateCount.rows[0].count);

    // Check templates by category
    const categoryBreakdown = await client.query(`
      SELECT category, COUNT(*) as count
      FROM prompt_templates
      GROUP BY category
      ORDER BY category
    `);

    console.log('\n📊 Templates by Category:');
    categoryBreakdown.rows.forEach(row => {
      console.log(`  ${row.category}: ${row.count} templates`);
    });

    // Check functions created
    const functionsResult = await client.query(`
      SELECT routine_name
      FROM information_schema.routines
      WHERE routine_name LIKE '%prompt%'
      ORDER BY routine_name
    `);

    console.log('\n⚙️ Database Functions Created:');
    functionsResult.rows.forEach(row => {
      console.log(`  - ${row.routine_name}()`);
    });

    console.log('\n✅ Prompt Library Setup Complete!');
    console.log('\n📝 Next Steps:');
    console.log('1. Go to Dashboard → Chat');
    console.log('2. See Prompt Library panel on right');
    console.log('3. Click "Templates" tab to browse 17 templates');
    console.log('4. Start using prompts!');
    console.log('\n📚 Documentation: PROMPT_LIBRARY_QUICK_START.md');

  } catch (error) {
    console.error('❌ Error setting up Prompt Library:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run setup
setupPromptLibrary()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Setup failed:', error.message);
    process.exit(1);
  });
