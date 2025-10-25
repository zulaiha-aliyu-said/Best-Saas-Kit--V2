# 🔍 Analytics Data Mismatch - Debug Guide

## 🐛 Issue Identified

Your Advanced Analytics is showing **mock data** (20,200 posts, 7,750 posts) instead of the **real 24 posts** that were fetched from Twitter.

---

## ✅ Debug Logging Added

I've added detailed console logging to trace the data flow:

### 1. **Analytics API Endpoint**
`src/app/api/competitors/[id]/analytics/route.ts`

Added logs:
```javascript
[Analytics] Competitor ID: {id}
[Analytics] Posts found: {count}
[Analytics] Processing {count} posts for analytics...
```

### 2. **AdvancedAnalytics Component**
`src/components/competitor/AdvancedAnalytics.tsx`

Added logs:
```javascript
[AdvancedAnalytics] API Response: {success, hasAnalytics, message}
[AdvancedAnalytics] Setting analytics data: {...}
```

### 3. **PerformanceCharts Component**
`src/components/competitor/PerformanceCharts.tsx`

Added logs:
```javascript
[PerformanceCharts] Received data: {hasData, postingPatternLength, stats}
```

---

## 🧪 Test Steps

### Step 1: Refresh Analytics Page
1. Go to `/dashboard/competitors`
2. Click "View Analysis" on National Geographic
3. Open browser Developer Tools (F12)
4. Go to **Console** tab
5. Look for the logs

### Step 2: Check What You'll See

#### ✅ **If Working Correctly:**
```
[Analytics] Competitor ID: abc-123
[Analytics] Posts found: 24
[Analytics] Processing 24 posts for analytics...
[AdvancedAnalytics] API Response: {success: true, hasAnalytics: true, ...}
[AdvancedAnalytics] Setting analytics data: {...}
[PerformanceCharts] Received data: {hasData: true, postingPatternLength: 7, ...}
```

#### ❌ **If Showing Mock Data:**
```
[Analytics] Competitor ID: abc-123
[Analytics] Posts found: 0
[Analytics] No posts found - returning null analytics
[AdvancedAnalytics] No analytics data, message: "No posts available..."
[PerformanceCharts] Received data: {hasData: false, postingPatternLength: undefined}
```

---

## 🔍 Possible Issues & Solutions

### **Issue 1: Posts Not in Database**
**Symptom:** `[Analytics] Posts found: 0`

**Solution:**
```sql
-- Check if posts were actually stored:
SELECT COUNT(*) FROM competitor_posts 
WHERE competitor_id = 'YOUR_COMPETITOR_ID';

-- If 0, the analyze endpoint didn't store them
-- Re-analyze the competitor
```

### **Issue 2: Wrong Competitor ID**
**Symptom:** API returns 0 posts but database has posts

**Solution:**
- Check that the competitor ID in the URL matches the database
- Look at browser Network tab → Analytics request URL
- Compare with database: `SELECT id FROM competitors;`

### **Issue 3: Date Parsing Issues**
**Symptom:** Posts found but charts show weird data

**Solution:**
- Check `posted_at` field format in database
- Twitter timestamps might be in different format
- Check console for JavaScript date errors

---

## 🛠️ Quick Fixes

### **Fix 1: Clear and Re-Analyze**
```bash
# If posts aren't showing up:
1. Delete the competitor
2. Add it again
3. Wait for analysis to complete
4. Check terminal logs for post insertion
5. View analytics again
```

### **Fix 2: Check Database Directly**
```sql
-- Get competitor ID
SELECT id, name, username FROM competitors;

-- Check posts for that ID
SELECT COUNT(*), MIN(posted_at), MAX(posted_at) 
FROM competitor_posts 
WHERE competitor_id = 'YOUR_ID';

-- See actual posts
SELECT id, content, likes_count, posted_at 
FROM competitor_posts 
WHERE competitor_id = 'YOUR_ID'
LIMIT 5;
```

### **Fix 3: Force Refresh**
```javascript
// In browser console, force a refresh:
localStorage.clear();
location.reload();
```

---

## 📊 Expected Log Output (Success)

Here's what you should see in the console when everything works:

```
[Analytics] Competitor ID: d290f1ee-6c54-4b01-90e6-d701748f0851
[Analytics] Posts found: 24
[Analytics] Processing 24 posts for analytics...

[AdvancedAnalytics] API Response: {
  success: true,
  hasAnalytics: true,
  message: undefined,
  analyticsKeys: ['postingPattern', 'contentTypes', 'engagementTrend', 'bestTimes', 'stats', 'topPosts', 'contentGaps']
}

[AdvancedAnalytics] Setting analytics data: {
  postingPattern: [
    {day: 'Mon', posts: 3, engagement: 1250},
    {day: 'Tue', posts: 5, engagement: 2340},
    // ... etc
  ],
  contentTypes: [
    {name: 'Text', value: 58, count: 14, engagement: 1500},
    {name: 'Photo', value: 42, count: 10, engagement: 2100}
  ],
  stats: {
    avgEngagement: 1850,
    trendPercentage: 12,
    totalPosts: 24,
    peakDay: 'Tuesday',
    peakTime: '12-3 PM'
  }
}

[PerformanceCharts] Received data: {
  hasData: true,
  hasPostingPattern: true,
  postingPatternLength: 7,
  hasContentTypes: true,
  contentTypesLength: 2,
  stats: {avgEngagement: 1850, ...}
}
```

---

## 🎯 Next Steps

1. **Run the test** - View analytics and check browser console
2. **Take a screenshot** of the console logs
3. **Share the logs** so I can see exactly what's happening
4. **Check the terminal** for the analytics API logs too

---

## 🔧 Quick SQL Debugging

Run these queries to check your data:

```sql
-- 1. List all competitors
SELECT id, name, username, platform FROM competitors;

-- 2. Count posts per competitor
SELECT c.name, COUNT(cp.id) as post_count
FROM competitors c
LEFT JOIN competitor_posts cp ON c.id = cp.competitor_id
GROUP BY c.id, c.name;

-- 3. Check a specific competitor's posts
SELECT 
  id,
  LEFT(content, 50) as content_preview,
  media_type,
  likes_count,
  comments_count,
  posted_at
FROM competitor_posts
WHERE competitor_id = 'YOUR_COMPETITOR_ID'
ORDER BY posted_at DESC
LIMIT 10;

-- 4. Check content gaps
SELECT * FROM content_gaps
WHERE competitor_id = 'YOUR_COMPETITOR_ID';
```

---

## 💡 What to Send Me

After testing, please share:
1. ✅ **Browser console logs** (screenshot or copy/paste)
2. ✅ **Terminal logs** when viewing analytics
3. ✅ **SQL query results** from above
4. ✅ **Competitor ID** you're testing with

This will help me identify exactly where the data is getting lost!

---

**Last Updated:** Just now  
**Status:** 🔍 Debugging in progress
















