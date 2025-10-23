# ⚡ Quick Fix Reference - Intermittent Competitor Error

## 🚨 Problem
"Failed to fetch competitors" - works sometimes, fails randomly

---

## ✅ Solution Applied

### What was fixed:
1. **Automatic retry** (2 retries, 1s delay)
2. **10-second timeout** (prevents hanging)
3. **Error logging** (browser + server console)
4. **Error UI** (red banner + retry button)
5. **Database schema** (added status column)

---

## 🎯 What to Do Right Now

### Quick Test:
```bash
npm run dev
```
Then open Competitor Analysis page and press F12 to see logs.

### Full Test:
```bash
node test-competitor-fix.js
```

### If issues persist:
```bash
node setup-competitor-tables.js
npm run dev
```

---

## 🔍 Quick Debugging

### Check Browser Console (F12):
✅ Good: `Successfully fetched X competitors`  
❌ Bad: `API Error: [message]` → Read error message

### Check Server Console:
✅ Good: `Query successful - Found X competitors in XXms`  
❌ Bad: See error message for specific issue

### Common Errors:

| Error | Quick Fix |
|-------|-----------|
| "Database not configured" | Check `.env.local` has `DATABASE_URL` |
| "relation 'competitors' does not exist" | Run `node setup-competitor-tables.js` |
| "timeout" | Network issue - retry will handle it |
| "Missing userId parameter" | Re-login |

---

## 📋 Test Checklist

- [ ] Open competitor page → Works
- [ ] Refresh 3 times → All work  
- [ ] Check F12 console → See logs
- [ ] If error shows → Click retry button

---

## 📚 Detailed Guides

Need more help? Read these:

1. **`COMPETITOR_FIX_SUMMARY.md`** - Complete overview
2. **`INTERMITTENT_ERROR_FIX.md`** - Deep troubleshooting
3. **`test-competitor-fix.js`** - Run automated tests

---

## ⚡ One-Line Commands

```bash
# Test everything
node test-competitor-fix.js

# Setup database
node setup-competitor-tables.js

# Restart server
npm run dev
```

---

**That's it! The error should now auto-retry and work consistently.**

Press F12 to see it in action! 🎉




