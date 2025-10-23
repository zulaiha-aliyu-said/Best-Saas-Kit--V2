# 🎯 Competitor Analysis Setup Guide

## ✅ Current Status
The competitor analysis feature is **partially implemented** but needs database setup to work fully.

## 🚨 Current Error
```
Error: Internal server error at useCompetitors.useCallback[analyzeCompetitor]
```

## 🔧 What's Missing

### 1. **Database Tables** (Required)
The competitor analysis API tries to save data to these tables that don't exist yet:
- `competitors` - Main competitor profiles
- `competitor_stats` - Daily statistics
- `competitor_posts` - Individual posts
- `content_gaps` - AI-identified opportunities

### 2. **Database Connection** (Required)
Your `DATABASE_URL` needs to be configured in `.env.local`

## 📋 Setup Steps

### Step 1: Set Up Database Connection

**Option A: Use Neon (Recommended)**
1. Go to [Neon Console](https://console.neon.tech/)
2. Create/select your project
3. Copy the connection string (should look like: `postgresql://user:pass@host.neon.tech/db?sslmode=require`)
4. Add to `.env.local`:
   ```env
   DATABASE_URL="your-neon-connection-string-here"
   ```

**Option B: Use Local PostgreSQL**
1. Install PostgreSQL locally
2. Create a database
3. Add to `.env.local`:
   ```env
   DATABASE_URL="postgresql://localhost:5432/your_database_name"
   ```

### Step 2: Create Competitor Analysis Tables

Run this SQL file in your database:

**Using Neon Console:**
1. Go to your Neon project dashboard
2. Click "SQL Editor"
3. Copy and paste the contents of `sql-queries/16-create-competitor-analysis-schema.sql`
4. Click "Run"

**Using Command Line:**
```bash
# If you have psql installed
psql "your-database-url" -f sql-queries/16-create-competitor-analysis-schema.sql
```

### Step 3: Restart Development Server
```bash
npm run dev
```

### Step 4: Test the Feature
1. Go to `http://localhost:3000/dashboard/competitors`
2. Try adding a competitor (e.g., Twitter user ID: `44196397` for Elon Musk)

## ✅ What Works Already

- ✅ **RapidAPI Integration** - Twitter and Instagram APIs are working
- ✅ **Frontend Components** - All UI components are implemented
- ✅ **API Routes** - Backend endpoints are ready
- ✅ **Error Handling** - Better error messages now implemented

## 🚀 What Happens After Setup

Once the database is configured, the competitor analysis will:

1. **Fetch real data** from Twitter/Instagram APIs
2. **Analyze engagement** and posting patterns
3. **Identify content gaps** using AI
4. **Store everything** in your database
5. **Show insights** in the dashboard

## 🔍 Testing

You can verify the setup by:

1. **Check API endpoints**: `http://localhost:3000/api/competitors/analyze`
2. **Test database connection**: Run the SQL file and check if tables are created
3. **Try adding a competitor**: Use a real Twitter user ID or Instagram username

## 🆘 Troubleshooting

### "Database not configured" Error
- Run the SQL setup file in your database
- Check that all 4 tables were created: `competitors`, `competitor_stats`, `competitor_posts`, `content_gaps`

### "Database connection failed" Error
- Verify your `DATABASE_URL` in `.env.local`
- Make sure the database is accessible
- Try the connection test script from `DATABASE_CONNECTION_FIX.md`

### "API service unavailable" Error
- Check your RapidAPI subscription is active
- Verify the API key is correct (already set in `src/lib/rapidapi.ts`)

## 🎯 Next Steps

After successful setup:
1. Test with a few competitors
2. Review the analysis dashboard
3. Customize the AI analysis logic if needed
4. Add more platforms (LinkedIn) if desired

---

## 💡 Quick Fix Summary

1. **Add DATABASE_URL** to `.env.local`
2. **Run SQL setup** in your database console
3. **Restart server**
4. **Test competitor analysis**

The feature should work perfectly after these steps! 🚀
