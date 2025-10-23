# 🔧 Fix: Intermittent "Failed to Fetch Competitors" Error

## Problem
The competitor fetch error happens **sometimes** but not always:
```
Error: Failed to fetch competitors
```

This is an **intermittent error** - different from a complete failure. The feature works sometimes but randomly fails.

---

## ✅ What I Fixed

### 1. **Added Retry Logic** 
- Automatically retries failed requests up to 2 times
- 1-second delay between retries
- Only retries on network/timeout errors

### 2. **Added Request Timeout**
- 10-second timeout to prevent hanging requests
- Prevents infinite loading states

### 3. **Better Error Logging**
- Server-side: Detailed error logs with timing
- Client-side: Console logs for debugging
- Error messages now include specific details

### 4. **Improved Error Handling**
- Database connection check before queries
- Better error messages from API
- Error display UI with retry button

### 5. **Error Display in UI**
- Red banner shows specific error message
- "Retry" button to manually retry
- Console hints for debugging

---

## 🔍 Common Causes of Intermittent Errors

### 1. **Database Connection Issues**
**Symptoms:**
- Works on first load, fails on refresh
- Random failures after inactivity

**Cause:** Serverless databases (Neon) can "sleep" after inactivity

**Solution:**
```bash
# Check your DATABASE_URL in .env.local
# Make sure it includes sslmode=require for Neon:
DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/db?sslmode=require"
```

### 2. **Network Timeouts**
**Symptoms:**
- Slow connection, then failure
- Works on fast network, fails on slow

**Cause:** Request takes too long (>10 seconds)

**Solution:** 
- The timeout is now set to 10 seconds
- Retry logic will attempt again
- Check your internet connection

### 3. **Cold Start Issues**
**Symptoms:**
- First request after deployment fails
- Works on subsequent requests

**Cause:** Serverless function needs to "warm up"

**Solution:**
- Retry logic handles this automatically
- Or refresh the page once

### 4. **Missing Environment Variables**
**Symptoms:**
- Works in development, fails in production
- Inconsistent behavior

**Cause:** `.env.local` not loaded properly

**Solution:**
```bash
# Restart your dev server
npm run dev

# Or check if .env.local exists:
dir .env.local    # Windows
ls .env.local     # Mac/Linux
```

### 5. **Race Conditions**
**Symptoms:**
- Fast clicking causes errors
- Works when using slowly

**Cause:** Multiple requests at once

**Solution:**
- The hook now prevents duplicate requests
- Loading state prevents multiple clicks

---

## 🛠️ Debugging Steps

### Step 1: Check Browser Console
Open browser console (F12) and look for logs:

**Good logs:**
```
[useCompetitors] Fetching competitors for userId: abc123 (attempt 1)
[Competitors API] Request received for userId: abc123
[Competitors API] Query successful - Found 3 competitors in 234ms
[useCompetitors] Successfully fetched 3 competitors
```

**Bad logs (shows problem):**
```
[useCompetitors] API Error: relation "competitors" does not exist
→ Database tables not created (run setup script)

[useCompetitors] API Error: timeout
→ Network/database timeout (retry or check connection)

[useCompetitors] API Error: Database not configured
→ Missing DATABASE_URL in .env.local
```

### Step 2: Check Server Console
Look at your terminal where `npm run dev` is running:

**Good:**
```
[Competitors API] Request received for userId: abc123
[Competitors API] Executing query for userId: abc123
[Competitors API] Query successful - Found 3 competitors in 156ms
```

**Bad:**
```
[Competitors API] Error after 5234 ms: Error: relation "competitors" does not exist
→ Run database setup

[Competitors API] DATABASE_URL not configured
→ Check .env.local file
```

### Step 3: Test Database Connection
```bash
# Run the test script
node test-database.js
```

Expected output:
```
✅ Database connected
✅ Found 4 competitor tables
```

If it fails, your database setup is incomplete.

### Step 4: Verify Tables Exist
Run this in your database console (Neon, pgAdmin, etc.):

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('competitors', 'competitor_posts', 'competitor_stats', 'content_gaps');
```

Should return **4 rows**. If not, run:
```bash
node setup-competitor-tables.js
```

---

## 🚀 Quick Fixes

### Fix 1: Restart Everything
```bash
# Stop dev server (Ctrl+C)
# Then restart:
npm run dev
```

### Fix 2: Clear Browser Cache
1. Open browser console (F12)
2. Right-click refresh button → "Empty Cache and Hard Reload"
3. Or: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

### Fix 3: Re-run Database Setup
```bash
node setup-competitor-tables.js
```

### Fix 4: Check Environment File
```bash
# Make sure .env.local exists and has DATABASE_URL
type .env.local     # Windows
cat .env.local      # Mac/Linux
```

### Fix 5: Manual Retry
If you see the error banner in the UI, click the **"Retry"** button.

---

## 📊 Monitoring & Prevention

### Enable Detailed Logging
The code now logs everything to console. Keep browser console open (F12) to see:
- When requests start
- How long they take
- Exact error messages
- Retry attempts

### Check Database Performance
If you're on Neon:
1. Go to https://console.neon.tech
2. Check your project dashboard
3. Look for "Connection" issues or "Sleeping" status
4. Upgrade plan if hitting limits

### Network Issues
Test your connection:
```bash
# Ping your database (example)
ping ep-xxx.region.aws.neon.tech
```

---

## 🔧 Advanced Troubleshooting

### Increase Timeout
If your database is slow, edit `src/hooks/useCompetitors.ts`:

```typescript
signal: AbortSignal.timeout(10000), // Change to 20000 for 20 seconds
```

### Increase Retries
Edit `src/hooks/useCompetitors.ts`:

```typescript
const maxRetries = 2; // Change to 3 or 4
```

### Add Connection Pooling
If using many concurrent requests, update `src/app/api/competitors/route.ts`:

```typescript
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10, // Maximum connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});
```

---

## ✅ Verification Checklist

Test these to ensure the fix works:

- [ ] Open competitor page - loads successfully
- [ ] Refresh page 3-5 times - all successful
- [ ] Check browser console - see detailed logs
- [ ] Check server console - see API logs
- [ ] Click retry button (if error shows) - works
- [ ] Add a competitor - works
- [ ] Close/reopen browser - still works
- [ ] Wait 5 minutes, refresh - still works

---

## 💡 When to Get Help

If you still have issues after trying everything above:

1. **Copy browser console logs** (F12 → Console → Copy all)
2. **Copy server console logs** (terminal where npm run dev runs)
3. **Note when it fails:** First load? After refresh? Random?
4. **Check database provider status:** Neon/Supabase might have outages

Common patterns:
- **Fails on first load only** → Cold start (normal, retry handles it)
- **Fails randomly ~10% of time** → Network/database timeout (check connection)
- **Always fails** → Database tables missing (run setup script)
- **Works locally, fails in production** → Environment variables missing

---

## 📝 Files Modified

These files now have better error handling:

1. **`src/hooks/useCompetitors.ts`**
   - Added retry logic
   - Added timeout (10s)
   - Better error messages
   - Detailed console logging

2. **`src/app/api/competitors/route.ts`**
   - Database connection check
   - Detailed server-side logging
   - Better error responses
   - Request timing

3. **`src/app/dashboard/competitors/CompetitorAnalysisClient.tsx`**
   - Error display UI
   - Retry button
   - Error state handling

4. **`sql-queries/16-create-competitor-analysis-schema.sql`**
   - Added `status` column to content_gaps
   - Fixed missing column issue

---

**Status:** ✅ Fixed with retry logic and better error handling  
**Last Updated:** Oct 2025




