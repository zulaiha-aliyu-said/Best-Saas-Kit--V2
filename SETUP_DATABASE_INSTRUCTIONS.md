# Database Setup Instructions for Viral Hook Generator

## Option 1: Using Your Current Database Connection (Recommended)

Since your app is already connected to a PostgreSQL database via `DATABASE_URL`, use this simple approach:

### Windows (PowerShell)

```powershell
# Get your DATABASE_URL from .env or .env.local
# Then run:

# Step 1: Create schema
psql $env:DATABASE_URL -f sql-queries/11-create-viral-hooks-schema.sql

# Step 2: Insert hook patterns
psql $env:DATABASE_URL -f sql-queries/12-insert-hook-patterns.sql
```

### If you don't have psql installed on Windows:

**Option A: Use pgAdmin**
1. Open pgAdmin
2. Connect to your database
3. Open Query Tool
4. Copy and paste contents of `sql-queries/11-create-viral-hooks-schema.sql`
5. Execute
6. Repeat for `sql-queries/12-insert-hook-patterns.sql`

**Option B: Install psql via PostgreSQL**
1. Download from: https://www.postgresql.org/download/windows/
2. Install (just select "psql" component)
3. Run the commands above

---

## Option 2: Using Neon MCP Server (Requires Setup)

If you want to use the Neon MCP server, you need to:

### 1. Get Neon API Key
1. Go to https://neon.tech
2. Login to your account
3. Navigate to Account Settings → API Keys
4. Create a new API key
5. Copy the key

### 2. Configure Neon MCP
Add your Neon API key to your MCP configuration file.

Location: 
- Windows: `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`
- Or check Cursor's MCP settings

Add this configuration:
```json
{
  "mcpServers": {
    "neon": {
      "command": "npx",
      "args": ["-y", "@neondatabase/mcp-server-neon"],
      "env": {
        "NEON_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### 3. Restart Cursor
After configuration, restart Cursor for changes to take effect.

---

## Quick Verification

After running the SQL files, verify the setup:

```sql
-- Check if tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('hook_patterns', 'generated_hooks', 'hook_analytics');

-- Check pattern count
SELECT platform, niche, COUNT(*) as pattern_count
FROM hook_patterns 
GROUP BY platform, niche 
ORDER BY platform, niche;

-- Should show ~500 total patterns across all platforms
```

Expected output:
```
 platform  |   niche    | pattern_count
-----------+------------+---------------
 email     | newsletter |     20
 email     | sales      |     20
 instagram | education  |     20
 instagram | lifestyle  |     20
 instagram | motivation |     20
 linkedin  | business   |     20
 linkedin  | career     |     20
 linkedin  | leadership |     15
 twitter   | business   |     60
 twitter   | marketing  |     40
 twitter   | personal   |     40
 twitter   | tech       |     50
```

Total: 500+ patterns ✅

---

## Troubleshooting

### Issue: "psql: command not found"
**Solution:** Install PostgreSQL client tools or use pgAdmin (see Option A above)

### Issue: "connection refused"
**Solution:** Check your DATABASE_URL is correct in your .env file

### Issue: "permission denied"
**Solution:** Ensure your database user has CREATE TABLE permissions

### Issue: "relation already exists"
**Solution:** The tables are already created. You can skip schema creation and just run the inserts, or drop existing tables first:
```sql
DROP TABLE IF EXISTS generated_hooks CASCADE;
DROP TABLE IF EXISTS hook_analytics CASCADE;
DROP TABLE IF EXISTS hook_patterns CASCADE;
```

---

## What Gets Created

### Tables (3)
1. `hook_patterns` - 500+ viral hook templates
2. `generated_hooks` - User's generated hooks history
3. `hook_analytics` - Daily analytics aggregation

### Indexes (6)
- Fast lookups by platform/niche
- User-specific queries optimized
- Analytics queries optimized

### Functions (2)
- `update_hook_analytics()` - Auto-update analytics
- `track_hook_copy()` - Track copy actions

### Triggers (1)
- Auto-update analytics on hook generation

### Views (2)
- `admin_hook_analytics` - System-wide analytics
- `user_hook_stats` - Per-user statistics

---

## Next Steps

After database setup:
1. Start your development server
2. Navigate to `/dashboard/hooks`
3. Generate your first viral hooks!

---

## Need Help?

Check these files for details:
- `VIRAL_HOOKS_QUICK_START.md` - Quick start guide
- `VIRAL_HOOK_GENERATOR_GUIDE.md` - Complete documentation









