# ⚡ Quick Test: Email Open/Click Tracking

## 🎯 The Issue

Email tracking shows **emails sent** ✅ but **not opens/clicks** ❌

**Why?** Resend needs to send webhooks to your app when users open/click emails.

---

## ✅ Solution: 2 Ways to Test

### **Option 1: Manual Test (No Setup Required)** 🚀 Easiest!

Test the webhook **right now** without any configuration:

#### Step 1: Send a Test Email

1. Go to: `http://localhost:3000/admin/ltd/campaigns`
2. Send a test campaign to yourself
3. **Check terminal** - you'll see:
   ```
   ✅ Email sent successfully: {id: 're_abc123...'}
   📊 Email ID for tracking: re_abc123...
   ```
4. **Copy the email ID** (the `re_abc123...` part)

#### Step 2: Open Test Page

1. Go to: `http://localhost:3000/admin/test-webhook`
2. Paste the email ID
3. Click **"Test email.opened"**
4. You'll see: ✅ Webhook event "email.opened" sent successfully!

#### Step 3: Check Analytics

1. Go to: `http://localhost:3000/admin/ltd/email-analytics`
2. Refresh the page
3. You should now see:
   - ✅ 1 sent
   - ✅ 1 opened (100% open rate) 🎉

#### Step 4: Test Click Tracking

1. Back to: `http://localhost:3000/admin/test-webhook`
2. Same email ID
3. Click **"Test email.clicked"**
4. Refresh analytics
5. Should show: ✅ 1 clicked

---

### **Option 2: Real Webhook (Production)** 🌐 For Live App

**If your app is deployed** (Vercel, Railway, etc.):

1. Go to: https://resend.com/webhooks
2. Click "Create Webhook"
3. URL: `https://your-domain.com/api/webhooks/resend`
4. Select events:
   - ☑ email.opened
   - ☑ email.clicked
   - ☑ email.delivered
   - ☑ email.bounced
5. Save
6. Done! Opens/clicks will track automatically ✅

**For local testing with ngrok:**
- See full guide: `RESEND_WEBHOOK_SETUP.md`

---

## 🧪 Quick Test Commands

### Test in Terminal (Alternative):

```bash
# Test email.opened
curl -X POST http://localhost:3000/api/webhooks/resend -H "Content-Type: application/json" -d '{"type":"email.opened","data":{"email_id":"test-123"}}'

# Test email.clicked
curl -X POST http://localhost:3000/api/webhooks/resend -H "Content-Type: application/json" -d '{"type":"email.clicked","data":{"email_id":"test-123"}}'
```

Expected response: `{"received":true}`

---

## ✅ What You'll See

### In Terminal (when webhook is received):
```
📧 Resend webhook received: email.opened
📧 Event data: {...}
👁️ Email re_abc123 opened
```

### In Email Analytics:
Before:
```
Total Sent: 1
Open Rate: 0%
```

After webhook:
```
Total Sent: 1
Open Rate: 100% ✅
```

---

## 🎯 Next Steps

1. **Test manually first:** Use `/admin/test-webhook` page
2. **For production:** Set up real webhook in Resend
3. **For local dev:** Use ngrok (see `RESEND_WEBHOOK_SETUP.md`)

---

## 📁 Files Created

- ✅ `/api/webhooks/resend` - Webhook endpoint
- ✅ `/admin/test-webhook` - Manual test page
- ✅ `RESEND_WEBHOOK_SETUP.md` - Full setup guide
- ✅ This file - Quick test guide

---

## 🚀 Try It Now!

1. Go to: `http://localhost:3000/admin/test-webhook`
2. Follow the on-screen instructions
3. Test email opens and clicks!


