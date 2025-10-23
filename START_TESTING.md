# 🧪 START TESTING - Quick Guide

## ✅ **Setup Complete!**

Your testing environment is ready:
- ✅ Dev server running at http://localhost:3000
- ✅ Database connected with test users
- ✅ 6 tier-gated features implemented
- ✅ Test helper scripts created

---

## 🚀 **START HERE - 5 Minute Quick Test**

### **Test #1: Viral Hook Generator (Tier 2+)**

**Step 1:** Sign in as Tier 2 user
- Email: `mamutech.online@gmail.com`
- Go to: http://localhost:3000/dashboard/hooks

**Step 2:** Generate hooks
- Enter topic: "AI content marketing"
- Select platform: "LinkedIn"
- Click "Generate 10 Hooks"

**Expected Result:**
```
✅ 10 viral hooks displayed
✅ Credits deducted: 2 (from 744 → 742)
✅ Hooks sorted by engagement score
```

**If you see error:** Check console/terminal for details

---

### **Test #2: Content Scheduling (Tier 2+)**

**Step 1:** Stay signed in as `mamutech.online@gmail.com`
- Go to: http://localhost:3000/dashboard/schedule

**Step 2:** Schedule a post
- Platform: Twitter
- Content: "Test scheduled post #1"
- Time: Tomorrow at 9 AM
- Click "Schedule Post"

**Expected Result:**
```
✅ Post scheduled successfully
✅ Credits deducted: 0.5 (from 742 → 741.5)
✅ Monthly count: 1/30
```

---

### **Test #3: AI Chat (Tier 3+ - Should Block Tier 2)**

**Step 1:** Still as `mamutech.online@gmail.com` (Tier 2)
- Go to: http://localhost:3000/dashboard/chat

**Step 2:** Try to send message
- Type: "What is viral marketing?"
- Click send

**Expected Result:**
```
🔒 BLOCKED with error:
"Tier 3+ Required
AI Chat Assistant is a Tier 3+ feature. Upgrade to unlock 200 messages/month."
```

**If it works (should NOT):** ❌ Bug - tier check failed

---

### **Test #4: AI Chat (Tier 3+ - Should Work)**

**Step 1:** Sign OUT and sign in as Tier 3 user
- Email: `zulaihaaliyu440@gmail.com`
- Go to: http://localhost:3000/dashboard/chat

**Step 2:** Send message
- Type: "Explain viral marketing"
- Click send

**Expected Result:**
```
✅ AI responds with helpful answer
✅ Credits deducted: ~0.1 (from 500 → 499.9)
✅ Message count: 1/200
```

---

### **Test #5: Templates (Tier-based Limits)**

**Step 1:** Sign in as Tier 2 user
- Email: `mamutech.online@gmail.com`
- Go to: http://localhost:3000/dashboard/templates

**Expected:**
```
✅ Header shows: "X / 40 Professional Templates • 5 Custom"
✅ Can see 40 templates
✅ Upgrade prompt visible for more
```

**Step 2:** Sign in as Tier 3 user
- Email: `zulaihaaliyu440@gmail.com`
- Go to: http://localhost:3000/dashboard/templates

**Expected:**
```
✅ Header shows: "X / 60 Professional Templates • Unlimited Custom"
✅ Crown icon (👑) visible
✅ Can see all 60 templates
```

---

## ✅ **If All 5 Tests Pass:**

Congratulations! The implementation is working correctly. Next steps:

1. ✅ Mark testing as complete
2. 🔨 Build remaining features:
   - YouTube Trending (Tier 2+)
   - Style Training (Tier 3+)
   - Bulk Generation (Tier 3+)
   - Team Collaboration (Tier 4+)
   - API Access (Tier 4+)

---

## ❌ **If Tests Fail:**

### **Common Issues:**

**1. "Unauthorized" error**
- Clear browser cookies
- Sign out completely
- Sign in again

**2. Features work on wrong tier**
- Check database: `node test-current-implementation.js`
- Verify user's actual tier

**3. Credits not deducting**
- Check terminal/console for errors
- Verify `credit_usage` table exists
- Check API response in Network tab

**4. Monthly limits not enforcing**
- Verify usage tables exist:
  ```bash
  node -e "const {Pool}=require('pg');require('dotenv').config({path:'.env.local'});const p=new Pool({connectionString:process.env.DATABASE_URL});p.query('SELECT tablename FROM pg_tables WHERE schemaname=\'public\' AND tablename LIKE \'user_monthly%\'').then(r=>{console.log(r.rows);p.end();});"
  ```

**5. Database errors**
- Check terminal running `npm run dev`
- Look for SQL errors
- Verify `.env.local` has correct `DATABASE_URL`

---

## 🧪 **Advanced Testing (Optional)**

### **Test Monthly Limits:**

**Set Tier 2 user to 29 scheduled posts:**
```bash
node test-helpers.js set mamutech.online@gmail.com scheduling 29
```

Then try scheduling 2 posts:
- 1st should work (29 → 30)
- 2nd should block (at limit)

**Set Tier 3 user to 199 chat messages:**
```bash
node test-helpers.js set zulaihaaliyu440@gmail.com chat 199
```

Then send 2 messages:
- 1st should work (199 → 200)
- 2nd should block (at limit)

---

### **Test Tier 4 Unlimited:**

**Set Tier 4 user to 1000 scheduled posts:**
```bash
node test-helpers.js set maccidomuhammad1313@gmail.com scheduling 1000
```

Sign in as: `maccidomuhammad1313@gmail.com`
- Try scheduling a post
- **Expected:** Should still work (unlimited for Tier 4)

---

## 📊 **View Test Results:**

```bash
# Check overall stats
node test-current-implementation.js

# Check specific user
node test-helpers.js view mamutech.online@gmail.com

# Reset a user's usage
node test-helpers.js reset mamutech.online@gmail.com
```

---

## 📝 **Test Report Template**

Copy this and fill it out:

```markdown
## Test Session: [Current Date]

### Quick Tests (5 min):
- [ ] Viral Hooks (Tier 2): ✅/❌
- [ ] Scheduling (Tier 2): ✅/❌
- [ ] AI Chat blocked (Tier 2): ✅/❌
- [ ] AI Chat works (Tier 3): ✅/❌
- [ ] Templates (Tier-based): ✅/❌

### Issues Found:
1. _______________________
2. _______________________
3. _______________________

### Overall Status: ✅ PASS / ❌ FAIL

### Next Action:
[ ] Build remaining features
[ ] Fix issues first
```

---

## 🎯 **Test Users Reference**

| Email | Tier | Credits | Use For |
|-------|------|---------|---------|
| mamutech.online@gmail.com | 2 | 744 | Test Tier 2 features |
| zulaihaaliyu440@gmail.com | 3 | 500 | Test Tier 3 features |
| saasmamu@gmail.com | 3 | 737 | Backup Tier 3 |
| maccidomuhammad1313@gmail.com | 4 | 2009 | Test Tier 4 unlimited |

---

## 🔍 **Detailed Testing Available In:**

- **`TESTING_GUIDE.md`** - Full test scenarios (2-3 hours)
- **`QUICK_TEST_CHECKLIST.md`** - Checkbox-style quick tests
- **`TIER_GATING_TEST_SUMMARY.md`** - Complete implementation overview

---

## ⏱️ **Time Estimates**

- **Quick Test (this guide):** 5-10 minutes
- **Full Smoke Test:** 30 minutes
- **Comprehensive Testing:** 2-3 hours

---

**🚀 Ready? Open http://localhost:3000 and start with Test #1!**

---

## 💡 **Pro Tips**

1. **Use different browsers** for different tiers (easier than signing out)
2. **Keep terminal visible** to see API logs
3. **Open browser DevTools** (F12) to see Network tab
4. **Take screenshots** of any errors
5. **Test incrementally** - one feature at a time

---

## 📞 **Need Help?**

If stuck:
1. Check terminal running `npm run dev` for errors
2. Check browser console (F12) for errors
3. Run `node test-current-implementation.js` to verify database
4. Check `QUICK_TEST_CHECKLIST.md` for common issues

---

**Let's test! 🧪**


