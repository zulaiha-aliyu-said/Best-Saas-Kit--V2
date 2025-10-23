# 🧪 Tier-Based Feature Testing Guide

## 📋 **Pre-Testing Setup**

### **1. Identify Your Test Users**

First, let's check what tier users you have:

```sql
SELECT 
  email,
  ltd_tier,
  credits,
  monthly_credit_limit,
  stacked_codes,
  plan_type
FROM users 
WHERE plan_type = 'ltd'
ORDER BY ltd_tier DESC;
```

**Expected Result:**
- maccidomuhammad1313@gmail.com - Tier 4 (2009 credits)
- zulaihaaliyu440@gmail.com - Tier 3 (500 credits)
- saasmamu@gmail.com - Tier 3 (737 credits)
- mamutech.online@gmail.com - Tier 2 (760 credits)

### **2. Check Current Usage Stats**

```sql
-- Check scheduling usage
SELECT * FROM user_monthly_scheduling_usage;

-- Check chat usage
SELECT * FROM user_monthly_chat_usage;
```

---

## 🎯 **FEATURE #1: Viral Hook Generator (Tier 2+)**

### **Test Scenario 1: Tier 1 User (if available)**
**Expected:** Should be BLOCKED with upgrade prompt

1. Sign in as Tier 1 user (or create one by redeeming a Tier 1 code)
2. Navigate to: `http://localhost:3000/dashboard/hooks`
3. Enter a topic (e.g., "AI marketing")
4. Select platform (e.g., "Twitter")
5. Click "Generate 10 Hooks"

**✅ Expected Result:**
```
🔒 Tier 2+ Required

You're currently on Tier 1. This feature requires Tier 2+.

Stack another code to unlock!
```

---

### **Test Scenario 2: Tier 2+ User**
**Expected:** Should WORK

**Test User:** mamutech.online@gmail.com (Tier 2, 760 credits)

1. Sign in as Tier 2 user
2. Navigate to: `http://localhost:3000/dashboard/hooks`
3. Enter topic: "Content marketing tips"
4. Select platform: "LinkedIn"
5. Click "Generate 10 Hooks"

**✅ Expected Result:**
- ✅ 10 viral hooks generated
- ✅ Sorted by engagement score
- ✅ Credits deducted: 2 credits
- ✅ Remaining credits: 758

**Verify in Database:**
```sql
SELECT credits FROM users WHERE email = 'mamutech.online@gmail.com';
-- Should show 758 (760 - 2)

SELECT * FROM credit_usage 
WHERE user_id = (SELECT id FROM users WHERE email = 'mamutech.online@gmail.com')
ORDER BY created_at DESC LIMIT 1;
-- Should show action_type = 'viral_hook', credits_used = 2
```

---

## 📅 **FEATURE #2: Content Scheduling (Tier 2+)**

### **Test Scenario 3: Tier 1 User**
**Expected:** Should be BLOCKED

1. Navigate to: `http://localhost:3000/dashboard/schedule`
2. Click "Schedule New Post" or "Advanced Scheduler"
3. Fill in content and schedule time
4. Click "Schedule Post"

**✅ Expected Result:**
```json
{
  "error": "Tier 2+ Required",
  "message": "Content Scheduling is a Tier 2+ feature. Upgrade to unlock scheduling up to 30 posts/month.",
  "code": "TIER_RESTRICTED",
  "currentTier": 1,
  "requiredTier": 2
}
```

---

### **Test Scenario 4: Tier 2 User - Monthly Limit**
**Expected:** Should WORK up to 30 posts/month

**Test User:** mamutech.online@gmail.com (Tier 2)

1. Sign in as Tier 2 user
2. Navigate to: `http://localhost:3000/dashboard/schedule`
3. Schedule 1 post:
   - Platform: Twitter
   - Content: "Test scheduled post #1"
   - Time: Tomorrow 9 AM
4. Click "Schedule Post"

**✅ Expected Result:**
- ✅ Post scheduled successfully
- ✅ Credits deducted: 0.5 credits
- ✅ Remaining: 757.5 credits
- ✅ Monthly count: 1/30

**Verify in Database:**
```sql
SELECT * FROM user_monthly_scheduling_usage 
WHERE user_id = (SELECT id FROM users WHERE email = 'mamutech.online@gmail.com');
-- Should show scheduled_count = 1, month_year = '2025-10'
```

**Test Monthly Limit:**
Manually set limit to test blocking:
```sql
UPDATE user_monthly_scheduling_usage 
SET scheduled_count = 30 
WHERE user_id = (SELECT id FROM users WHERE email = 'mamutech.online@gmail.com');
```

Try scheduling another post:

**✅ Expected Result:**
```json
{
  "error": "Scheduling Limit Reached",
  "message": "Monthly scheduling limit reached (30 posts/month for Tier 2)",
  "code": "LIMIT_EXCEEDED",
  "current": 30,
  "limit": 30
}
```

---

### **Test Scenario 5: Tier 3 User - Higher Limit**
**Expected:** Should allow 100 posts/month

**Test User:** zulaihaaliyu440@gmail.com (Tier 3)

**Verify Limit:**
```sql
-- Set to 99 posts
UPDATE user_monthly_scheduling_usage 
SET scheduled_count = 99 
WHERE user_id = (SELECT id FROM users WHERE email = 'zulaihaaliyu440@gmail.com');
```

Schedule a post:
**✅ Expected:** Should work (99 < 100)

Set to 100:
```sql
UPDATE user_monthly_scheduling_usage 
SET scheduled_count = 100 
WHERE user_id = (SELECT id FROM users WHERE email = 'zulaihaaliyu440@gmail.com');
```

Try again:
**✅ Expected:** Should block (100 >= 100)

---

### **Test Scenario 6: Tier 4 User - Unlimited**
**Expected:** No monthly limit

**Test User:** maccidomuhammad1313@gmail.com (Tier 4)

```sql
-- Set to 1000 posts
UPDATE user_monthly_scheduling_usage 
SET scheduled_count = 1000 
WHERE user_id = (SELECT id FROM users WHERE email = 'maccidomuhammad1313@gmail.com');
```

Try scheduling:
**✅ Expected:** Should still work (unlimited)

---

## 💬 **FEATURE #3: AI Chat Assistant (Tier 3+)**

### **Test Scenario 7: Tier 1-2 User**
**Expected:** Should be BLOCKED

**Test User:** mamutech.online@gmail.com (Tier 2)

1. Navigate to: `http://localhost:3000/dashboard/chat`
2. Type a message: "What is content marketing?"
3. Send message

**✅ Expected Result:**
```json
{
  "error": "Tier 3+ Required",
  "message": "AI Chat Assistant is a Tier 3+ feature. Upgrade to unlock 200 messages/month.",
  "code": "TIER_RESTRICTED",
  "currentTier": 2,
  "requiredTier": 3
}
```

---

### **Test Scenario 8: Tier 3 User - Message Limit**
**Expected:** Should work up to 200 messages/month

**Test User:** zulaihaaliyu440@gmail.com (Tier 3, 500 credits)

1. Sign in as Tier 3 user
2. Navigate to: `http://localhost:3000/dashboard/chat`
3. Send message: "Explain viral marketing"
4. Wait for response

**✅ Expected Result:**
- ✅ AI responds with helpful content
- ✅ Credits deducted: ~0.05-0.1 credits (depends on message length)
- ✅ Message count: 1/200

**Verify in Database:**
```sql
SELECT * FROM user_monthly_chat_usage 
WHERE user_id = (SELECT id FROM users WHERE email = 'zulaihaaliyu440@gmail.com');
-- Should show message_count = 1
```

**Test Monthly Limit:**
```sql
UPDATE user_monthly_chat_usage 
SET message_count = 200 
WHERE user_id = (SELECT id FROM users WHERE email = 'zulaihaaliyu440@gmail.com');
```

Send another message:

**✅ Expected Result:**
```json
{
  "error": "Chat Limit Reached",
  "message": "Monthly chat limit reached (200 messages/month for Tier 3)",
  "code": "LIMIT_EXCEEDED",
  "current": 200,
  "limit": 200
}
```

---

### **Test Scenario 9: Tier 4 User - Unlimited**
**Expected:** No monthly limit

**Test User:** maccidomuhammad1313@gmail.com (Tier 4)

```sql
UPDATE user_monthly_chat_usage 
SET message_count = 500 
WHERE user_id = (SELECT id FROM users WHERE email = 'maccidomuhammad1313@gmail.com');
```

Send message:
**✅ Expected:** Should still work (unlimited)

---

## 🎯 **FEATURE #4: AI Performance Predictions (Tier 3+)**

### **Test Scenario 10: Tier 1-2 User**
**Expected:** Should be BLOCKED

**Test User:** mamutech.online@gmail.com (Tier 2)

1. Navigate to repurpose page or any page with performance prediction
2. Generate some content
3. Click "Predict Performance" or similar button

**✅ Expected Result:**
```json
{
  "error": "Tier 3+ Required",
  "message": "AI Performance Predictions is a Tier 3+ feature. Upgrade to unlock predictive scoring with optimization tips.",
  "code": "TIER_RESTRICTED",
  "currentTier": 2,
  "requiredTier": 3
}
```

---

### **Test Scenario 11: Tier 3+ User**
**Expected:** Should WORK

**Test User:** zulaihaaliyu440@gmail.com (Tier 3)

1. Generate content or paste text
2. Click "Predict Performance"
3. Select platform (e.g., Twitter)

**✅ Expected Result:**
- ✅ Performance score displayed (0-100)
- ✅ 5-factor breakdown shown
- ✅ Insights & recommendations
- ✅ Credits deducted: 1 credit
- ✅ Remaining: 499 credits

---

## 📚 **FEATURE #5: Enhanced Templates (Tier-based)**

### **Test Scenario 12: Tier 1 User**
**Expected:** Should see only 15 templates

1. Navigate to: `http://localhost:3000/dashboard/templates`
2. Check template count displayed

**✅ Expected Result:**
- ✅ Header shows: "15 / 15 Professional Templates"
- ✅ Upgrade prompt visible
- ✅ Only 15 templates accessible

---

### **Test Scenario 13: Tier 2 User**
**Expected:** Should see 40 templates + 5 custom option

**Test User:** mamutech.online@gmail.com (Tier 2)

1. Navigate to: `http://localhost:3000/dashboard/templates`

**✅ Expected Result:**
- ✅ Header shows: "15 / 40 Professional Templates • 5 Custom"
- ✅ Can see up to 40 templates
- ✅ Custom template option available (5 limit)

---

### **Test Scenario 14: Tier 3+ User**
**Expected:** Should see 60 templates + unlimited custom

**Test User:** zulaihaaliyu440@gmail.com (Tier 3)

1. Navigate to: `http://localhost:3000/dashboard/templates`

**✅ Expected Result:**
- ✅ Header shows: "15 / 60 Professional Templates • Unlimited Custom"
- ✅ Crown icon displayed (👑)
- ✅ Can see all 60 templates
- ✅ Unlimited custom templates

---

## 🔄 **MONTHLY LIMIT RESET TESTING**

### **Test Monthly Reset Logic**

Manually change month to test reset:

```sql
-- Set to previous month
UPDATE user_monthly_scheduling_usage 
SET month_year = '2025-09', scheduled_count = 30;

UPDATE user_monthly_chat_usage 
SET month_year = '2025-09', message_count = 200;
```

**Expected Behavior:**
- ✅ New month creates new row with count = 0
- ✅ Old month data preserved for analytics
- ✅ Limits reset automatically

---

## 💳 **CREDIT DEDUCTION TESTING**

### **Verify Credit Costs**

Check each feature deducts correct credits:

| Feature | Cost | Test User |
|---------|------|-----------|
| Viral Hooks | 2 credits | Any Tier 2+ |
| Scheduling | 0.5 credits | Any Tier 2+ |
| AI Chat | 0.5 per 10 msgs | Any Tier 3+ |
| Performance Prediction | 1 credit | Any Tier 3+ |

**SQL to verify:**
```sql
SELECT 
  action_type,
  credits_used,
  metadata,
  created_at
FROM credit_usage
WHERE user_id = (SELECT id FROM users WHERE email = 'YOUR_TEST_EMAIL')
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🎨 **UI/UX TESTING**

### **Test Upgrade Prompts**

For each blocked feature:
- ✅ Error message is clear and helpful
- ✅ Explains which tier is required
- ✅ Shows current tier
- ✅ Provides upgrade link (`/redeem`)
- ✅ Doesn't crash or show errors

### **Test Credit Display**

- ✅ Credits display correctly in UI
- ✅ Credits update after each action
- ✅ Low credit warnings show when appropriate

---

## 📊 **TESTING SUMMARY CHECKLIST**

### **Feature Access:**
- [ ] Tier 1 blocked from: Viral Hooks, Scheduling, Chat, Predictions
- [ ] Tier 2 can access: Viral Hooks, Scheduling
- [ ] Tier 2 blocked from: Chat, Predictions
- [ ] Tier 3 can access: All features
- [ ] Tier 4 has unlimited: Scheduling, Chat

### **Monthly Limits:**
- [ ] Scheduling: 30 (T2), 100 (T3), Unlimited (T4)
- [ ] AI Chat: 200 (T3), Unlimited (T4)
- [ ] Limits tracked in database
- [ ] Limits reset on month change

### **Credit Costs:**
- [ ] Viral Hooks: 2 credits
- [ ] Scheduling: 0.5 credits
- [ ] AI Chat: ~0.05-0.1 per message
- [ ] Performance: 1 credit

### **UI/UX:**
- [ ] Clear error messages
- [ ] Upgrade prompts visible
- [ ] Tier badges/indicators shown
- [ ] Credit balance updates

---

## 🐛 **COMMON ISSUES TO WATCH FOR**

1. **Database Connection Errors**
   - Check `.env.local` has correct `DATABASE_URL`
   - Verify tables exist: `user_monthly_scheduling_usage`, `user_monthly_chat_usage`

2. **Authentication Issues**
   - Clear cookies if seeing "Unauthorized"
   - Sign out and sign in again

3. **Credits Not Deducting**
   - Check `credit_usage` table for entries
   - Verify `credits` column in `users` table updates

4. **Limits Not Working**
   - Check month_year format is correct ('YYYY-MM')
   - Verify usage tables have correct user_id

---

## 📝 **Test Results Template**

Use this to track your testing:

```markdown
## Test Session: [Date]

### Viral Hooks (Tier 2+)
- [ ] Tier 1 blocked: ✅/❌
- [ ] Tier 2+ works: ✅/❌
- [ ] Credits deducted: ✅/❌
- [ ] Issues found: _____________

### Content Scheduling (Tier 2+)
- [ ] Tier 1 blocked: ✅/❌
- [ ] Tier 2 limit (30): ✅/❌
- [ ] Tier 3 limit (100): ✅/❌
- [ ] Tier 4 unlimited: ✅/❌
- [ ] Issues found: _____________

### AI Chat (Tier 3+)
- [ ] Tier 1-2 blocked: ✅/❌
- [ ] Tier 3 limit (200): ✅/❌
- [ ] Tier 4 unlimited: ✅/❌
- [ ] Issues found: _____________

### Performance Predictions (Tier 3+)
- [ ] Tier 1-2 blocked: ✅/❌
- [ ] Tier 3+ works: ✅/❌
- [ ] Issues found: _____________

### Templates (Tier-based)
- [ ] Tier 1: 15 templates: ✅/❌
- [ ] Tier 2: 40 templates: ✅/❌
- [ ] Tier 3: 60 templates: ✅/❌
- [ ] Issues found: _____________
```

---

## 🚀 **Quick Test Script**

Run this to quickly verify database setup:

```sql
-- Check all LTD users
SELECT email, ltd_tier, credits, monthly_credit_limit FROM users WHERE plan_type = 'ltd';

-- Check usage tables exist
SELECT COUNT(*) FROM user_monthly_scheduling_usage;
SELECT COUNT(*) FROM user_monthly_chat_usage;
SELECT COUNT(*) FROM credit_usage;

-- Check recent activity
SELECT 
  u.email,
  cu.action_type,
  cu.credits_used,
  cu.created_at
FROM credit_usage cu
JOIN users u ON cu.user_id = u.id
ORDER BY cu.created_at DESC
LIMIT 10;
```

---

**Ready to test!** Start with Feature #1 and work through each scenario. Report any issues you find! 🧪


