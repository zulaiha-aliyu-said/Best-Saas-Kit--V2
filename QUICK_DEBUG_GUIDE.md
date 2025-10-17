# 🔧 Quick Debug Guide - Trends API

## ⚠️ Important: Where to Look for Logs

### Server Logs (Most Important!)
The API fetching happens on the **SERVER**, so logs appear in your **TERMINAL** (where you ran `npm run dev`), NOT in the browser console!

**Look here:**
- Your terminal/command prompt window
- Where you see "Local: http://localhost:3000"

### Browser Logs
Client-side logs appear in browser console (F12)

---

## 🧪 Step 1: Test the API

### Option A: Use Test Page (Easiest)
1. Go to: http://localhost:3000/dashboard/trends/test-api
2. Click "Test API Status"
3. Click "Test Trends API"
4. Check the results on the page

### Option B: Direct API Call
Open browser console and run:
```javascript
fetch('/api/trends/test').then(r => r.json()).then(console.log)
```

---

## 🔍 Step 2: Check Your Terminal

**After clicking "Refresh Trends", look at your TERMINAL for:**

### ✅ Success (APIs Working):
```
🚀 [Trends Fetcher] Starting to fetch from all sources...

🔴 [Reddit API] Starting fetch...
✅ [Reddit API] Successfully fetched 10 trends

📰 [News API] Starting fetch...
✅ [News API] Successfully fetched 10 trends

🔍 [Google Trends] Starting fetch...
✅ [Google Trends] Successfully fetched 10 trends

✨ [Trends Fetcher] Total: 20 trends combined
```

### ⚠️ Missing Keys:
```
⚠️ [Reddit API] Credentials not configured - skipping
⚠️ [News API] Key not configured - skipping
✅ [Google Trends] Successfully fetched 10 trends
```

---

## 📋 Step 3: Check Browser Console

**Open browser console (F12) and look for:**

```
🌐 [Client] Starting to fetch trends...
🌐 [Client] Calling API: /api/trends?platform=all&category=all
🌐 [Client] Response status: 200
🌐 [Client] Received data: { topicsCount: 20, sources: ['reddit', 'news', 'google'] }
✅ [Client] Real API data detected!
```

---

## 🔑 Step 4: Verify Environment Variables

### Check if keys are loaded:
1. Go to: http://localhost:3000/dashboard/trends/test-api
2. Click "Test API Status"
3. Look at the result:

```json
{
  "status": "ok",
  "environment": {
    "hasRedditId": true,      // ✅ Should be true
    "hasRedditSecret": true,  // ✅ Should be true
    "hasNewsKey": true        // ✅ Should be true
  }
}
```

### If all are `false`:
1. Check your `.env.local` file exists
2. Verify keys are formatted correctly:
   ```env
   REDDIT_CLIENT_ID=your_id_here
   REDDIT_CLIENT_SECRET=your_secret_here
   NEWS_API_KEY=your_key_here
   ```
3. **Restart your dev server** (Ctrl+C, then `npm run dev`)

---

## 🐛 Common Issues

### Issue 1: No Logs in Browser Console
**Solution:** Logs are in your TERMINAL, not browser!

### Issue 2: "Showing curated trends" toast
**Cause:** API keys not configured or APIs failed
**Check:** Terminal for error messages

### Issue 3: No source badges on cards
**Cause:** Using fallback data (no real API data)
**Fix:** Configure API keys and restart server

### Issue 4: Server not restarting
**Solution:** 
1. Press Ctrl+C in terminal
2. Run `npm run dev` again
3. Wait for "Ready" message

---

## ✅ Verification Checklist

- [ ] Server is running (`npm run dev`)
- [ ] `.env.local` file exists with API keys
- [ ] Server was restarted after adding keys
- [ ] Test page shows keys are loaded
- [ ] Terminal shows emoji logs when refreshing
- [ ] Browser console shows client logs
- [ ] Trend cards show source badges (🔴 📰 🔍)

---

## 🎯 Quick Test Commands

### Test 1: Check if server is running
```bash
curl http://localhost:3000/api/trends/test
```

### Test 2: Test trends endpoint
```bash
curl http://localhost:3000/api/trends
```

### Test 3: Browser console test
```javascript
// Open browser console (F12) and paste:
fetch('/api/trends/test')
  .then(r => r.json())
  .then(data => {
    console.log('API Status:', data);
    console.log('Reddit configured:', data.environment.hasRedditId);
    console.log('News configured:', data.environment.hasNewsKey);
  });
```

---

## 📞 Still Not Working?

### Share these details:
1. **Terminal output** when you click "Refresh Trends"
2. **Browser console output** (F12)
3. **Test API result** from http://localhost:3000/dashboard/trends/test-api
4. Confirm: Did you restart server after adding keys?

---

## 💡 Pro Tips

1. **Always check TERMINAL first** - that's where API logs appear
2. **Restart server** after changing `.env.local`
3. **Use test page** for quick diagnostics
4. **Check both** terminal AND browser console
5. **Source badges** are the easiest visual indicator
