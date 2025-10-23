# 🔧 Fix: Failed to Fetch Competitors Error

## Problem
You're seeing this error:
```
Error: Failed to fetch competitors
    at useCompetitors.useCallback[fetchCompetitors]
```

## Root Causes
1. ❌ Missing `.env.local` file with database credentials
2. ❌ Competitor analysis tables not created in database
3. ❌ Missing `status` column in `content_gaps` table

## ✅ Solution (Step-by-Step)

### Step 1: Create Environment File

1. **Copy the example file:**
   ```bash
   copy env.example .env.local
   ```
   
   Or on Mac/Linux:
   ```bash
   cp env.example .env.local
   ```

2. **Edit `.env.local`** and update these **REQUIRED** values:

   ```env
   # REQUIRED: Your Neon Database URL
   DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/database?sslmode=require"
   
   # REQUIRED: Generate a random secret (use: openssl rand -base64 32)
   NEXTAUTH_SECRET="your-random-32-character-string"
   
   # REQUIRED: Your local URL
   NEXTAUTH_URL="http://localhost:3000"
   
   # REQUIRED: Google OAuth credentials (from Google Cloud Console)
   GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxx"
   ```

3. **Optional but recommended** - Add these API keys:
   ```env
   OPENAI_API_KEY="sk-proj-xxxxx"  # For AI features
   RAPIDAPI_KEY="xxxxx"              # For competitor analysis
   ```

### Step 2: Setup Database Tables

Run the setup script to create all necessary tables:

```bash
node setup-competitor-tables.js
```

**Expected Output:**
```
🚀 Starting Competitor Analysis Setup...
📊 Creating competitor analysis tables...
✅ Tables created successfully!
🔍 Verifying tables...
✅ All tables verified:
   ✓ competitors
   ✓ competitor_posts
   ✓ competitor_stats
   ✓ content_gaps
🎉 Setup completed successfully!
```

### Step 3: Restart Your Development Server

1. Stop your current dev server (Ctrl+C)
2. Start it again:
   ```bash
   npm run dev
   ```

### Step 4: Test the Fix

1. Navigate to the Competitor Analysis page
2. Try adding a competitor
3. The error should be gone! ✅

## 🔍 Alternative: Manual Database Setup

If the script doesn't work, you can run the SQL manually:

1. **Connect to your database** (using psql, pgAdmin, or Neon Console)

2. **Run this SQL file:**
   ```
   sql-queries/16-create-competitor-analysis-schema.sql
   ```

3. **Verify tables exist:**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
     AND table_name IN ('competitors', 'competitor_stats', 'competitor_posts', 'content_gaps');
   ```

   Should return 4 rows.

## 🚨 Troubleshooting

### Error: "DATABASE_URL not found"
- Make sure `.env.local` exists in your project root
- Verify the file contains `DATABASE_URL="..."`
- Restart your dev server after creating the file

### Error: "Connection refused" or "ECONNREFUSED"
- Check your database URL is correct
- Verify your database is running (if local)
- For Neon/Supabase, check your internet connection

### Error: "Permission denied to create table"
- Your database user needs CREATE TABLE permissions
- Contact your database admin or check your database provider settings

### Tables created but still getting error
1. Check browser console for more detailed error messages
2. Verify you're passing a `userId` to the component
3. Clear your browser cache and reload

## 📚 What Was Fixed

### Database Schema Changes
- ✅ Added `status` column to `content_gaps` table
- ✅ Added default value `'active'` for status
- ✅ Added check constraint for valid status values
- ✅ Added index on status column for performance

### Files Updated
1. `sql-queries/16-create-competitor-analysis-schema.sql` - Added status column
2. `setup-competitor-tables.js` - Created automated setup script

## 🎯 Verification Checklist

- [ ] `.env.local` file exists with DATABASE_URL
- [ ] Database connection works
- [ ] 4 tables created (competitors, competitor_stats, competitor_posts, content_gaps)
- [ ] content_gaps table has `status` column
- [ ] Dev server restarted
- [ ] Competitor Analysis page loads without error

## 💡 Need More Help?

If you're still having issues:

1. Check the browser console (F12) for detailed error messages
2. Check your terminal/console for server-side errors
3. Verify your database credentials in `.env.local`
4. Try the manual database setup method above

---

**Last Updated:** Oct 2025
**Status:** ✅ Ready to use




