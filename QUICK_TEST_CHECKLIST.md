# 🧪 Quick Test Checklist

## ✅ **Current Implementation Status**

### **Test Users Available:**
1. ✅ **Tier 4:** maccidomuhammad1313@gmail.com (2009 credits)
2. ✅ **Tier 3:** zulaihaaliyu440@gmail.com (500 credits)
3. ✅ **Tier 3:** saasmamu@gmail.com (737 credits)
4. ✅ **Tier 2:** mamutech.online@gmail.com (744 credits)
5. ❌ **Tier 1:** Need to create (redeem a Tier 1 code)

---

## 🎯 **PRIORITY TESTS (Start Here)**

### **Test #1: Viral Hook Generator (Tier 2+)**

**Quick Test:**
1. Sign in as: `mamutech.online@gmail.com` (Tier 2)
2. Go to: http://localhost:3000/dashboard/hooks
3. Enter topic: "AI content marketing"
4. Click "Generate 10 Hooks"
5. **Expected:** ✅ Should work, deduct 2 credits

**Verify:**
```bash
node test-helpers.js view mamutech.online@gmail.com
```

---

### **Test #2: Content Scheduling (Tier 2+)**

**Quick Test:**
1. Sign in as: `mamutech.online@gmail.com` (Tier 2)
2. Go to: http://localhost:3000/dashboard/schedule
3. Schedule a test post
4. **Expected:** ✅ Should work, deduct 0.5 credits

**Test Monthly Limit (30 for Tier 2):**
```bash
# Set to 29 posts
node test-helpers.js set mamutech.online@gmail.com scheduling 29

# Try scheduling 1 more (should work)
# Try scheduling another (should block)

# Set to 30 to test blocking
node test-helpers.js set mamutech.online@gmail.com scheduling 30
```

---

### **Test #3: AI Chat Assistant (Tier 3+)**

**Quick Test:**
1. Sign in as: `zulaihaaliyu440@gmail.com` (Tier 3)
2. Go to: http://localhost:3000/dashboard/chat
3. Send a message: "What is viral marketing?"
4. **Expected:** ✅ Should work, deduct ~0.1 credits

**Test Tier 2 Blocking:**
1. Sign in as: `mamutech.online@gmail.com` (Tier 2)
2. Go to: http://localhost:3000/dashboard/chat
3. Try to send a message
4. **Expected:** 🔒 Should show "Tier 3+ Required" error

**Test Monthly Limit (200 for Tier 3):**
```bash
# Set to 199 messages
node test-helpers.js set zulaihaaliyu440@gmail.com chat 199

# Send 1 more message (should work)
# Send another (should block)
```

---

### **Test #4: AI Performance Predictions (Tier 3+)**

**Quick Test:**
1. Sign in as: `zulaihaaliyu440@gmail.com` (Tier 3)
2. Go to repurpose page
3. Generate content
4. Look for "Predict Performance" button
5. **Expected:** ✅ Should work, deduct 1 credit

**Test Tier 2 Blocking:**
1. Sign in as: `mamutech.online@gmail.com` (Tier 2)
2. Try to predict performance
3. **Expected:** 🔒 Should show "Tier 3+ Required" error

---

### **Test #5: Enhanced Templates (Tier-based)**

**Test Tier 2 (40 templates):**
1. Sign in as: `mamutech.online@gmail.com` (Tier 2)
2. Go to: http://localhost:3000/dashboard/templates
3. **Expected:** 
   - Header: "X / 40 Professional Templates • 5 Custom"
   - Can access 40 templates
   - Upgrade prompt visible

**Test Tier 3 (60 templates + unlimited custom):**
1. Sign in as: `zulaihaaliyu440@gmail.com` (Tier 3)
2. Go to: http://localhost:3000/dashboard/templates
3. **Expected:**
   - Header: "X / 60 Professional Templates • Unlimited Custom"
   - Crown icon (👑) visible
   - Can access all 60 templates

---

## 🔄 **Test Tier 4 Unlimited Features**

### **Test Unlimited Scheduling:**
```bash
# Set scheduling count to 1000
node test-helpers.js set maccidomuhammad1313@gmail.com scheduling 1000

# Try scheduling a post - should still work!
```

### **Test Unlimited Chat:**
```bash
# Set chat count to 500
node test-helpers.js set maccidomuhammad1313@gmail.com chat 500

# Try sending a message - should still work!
```

---

## 🐛 **Common Issues & Fixes**

### **Issue: "Unauthorized" error**
**Fix:** Clear cookies, sign out, sign in again

### **Issue: Features not working**
**Fix:** Check if Next.js dev server is running
```bash
npm run dev
```

### **Issue: Database errors**
**Fix:** Verify tables exist
```bash
node -e "const {Pool}=require('pg');require('dotenv').config({path:'.env.local'});const p=new Pool({connectionString:process.env.DATABASE_URL});p.query('SELECT tablename FROM pg_tables WHERE schemaname=\'public\' AND tablename LIKE \'user_monthly%\'').then(r=>{console.log('Tables:',r.rows);p.end();});"
```

### **Issue: Credits not deducting**
**Fix:** Check credit_usage table
```bash
node test-current-implementation.js
```

---

## 📝 **Quick Test Results**

Mark as you test:

- [ ] **Viral Hooks (Tier 2+):**
  - [ ] Tier 2 works ✅
  - [ ] Credits deducted (2) ✅
  - [ ] UI shows hooks ✅

- [ ] **Scheduling (Tier 2+):**
  - [ ] Tier 2 works ✅
  - [ ] Tier 2 limit (30) enforced ✅
  - [ ] Tier 3 limit (100) enforced ✅
  - [ ] Tier 4 unlimited ✅
  - [ ] Credits deducted (0.5) ✅

- [ ] **AI Chat (Tier 3+):**
  - [ ] Tier 2 blocked 🔒
  - [ ] Tier 3 works ✅
  - [ ] Tier 3 limit (200) enforced ✅
  - [ ] Tier 4 unlimited ✅

- [ ] **Performance Predictions (Tier 3+):**
  - [ ] Tier 2 blocked 🔒
  - [ ] Tier 3 works ✅
  - [ ] Credits deducted (1) ✅

- [ ] **Templates (Tier-based):**
  - [ ] Tier 2: 40 templates ✅
  - [ ] Tier 3: 60 templates ✅
  - [ ] Tier 3: Custom templates ✅

---

## 🚀 **Next Steps After Testing**

If all tests pass:
1. ✅ Mark "Test Current Implementation" as complete
2. 🔨 Move to "Build Remaining Features"
3. 📹 Build YouTube Trending (Tier 2+)
4. ✍️ Build Style Training (Tier 3+)
5. 📦 Build Bulk Generation (Tier 3+)

---

## 💡 **Pro Tips**

1. **Test incrementally:** One feature at a time
2. **Use different browsers:** Chrome for Tier 2, Firefox for Tier 3, etc.
3. **Check database:** After each test to verify data
4. **Reset counters:** Between tests for consistent results
5. **Take screenshots:** Of error messages for documentation

---

**Ready to test!** Start with Test #1 and check off each item. 🧪


