# 📧 Resend Webhook Setup for Open/Click Tracking

## 🎯 What This Does

Enables real-time tracking when users:
- ✅ Open your emails (email.opened)
- ✅ Click links in your emails (email.clicked)
- ✅ Email is delivered (email.delivered)
- ✅ Email bounces (email.bounced)
- ✅ Email marked as spam (email.complained)

---

## 🚀 Quick Setup (2 Options)

### **Option 1: Production Setup (After Deployment)** ✅ Recommended

Once your app is deployed (Vercel, Railway, etc.):

1. **Go to Resend Dashboard**
   - https://resend.com/webhooks

2. **Click "Create Webhook"**

3. **Enter Webhook URL:**
   ```
   https://yourdomain.com/api/webhooks/resend
   ```
   Replace `yourdomain.com` with your actual domain.

4. **Select Events:**
   - ☑ email.sent
   - ☑ email.delivered
   - ☑ email.opened ← **Important!**
   - ☑ email.clicked ← **Important!**
   - ☑ email.bounced
   - ☑ email.complained

5. **Click "Create"**

6. **Done!** ✅

---

### **Option 2: Local Development Setup** (Using Ngrok)

For testing on `localhost:3000`:

#### Step 1: Install Ngrok

**Windows (PowerShell):**
```bash
# Using Chocolatey
choco install ngrok

# OR download from: https://ngrok.com/download
```

**Or just download:** https://ngrok.com/download

#### Step 2: Start Your Dev Server
```bash
npm run dev
```

#### Step 3: Expose Local Server with Ngrok
```bash
ngrok http 3000
```

You'll see output like:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3000
```

Copy the `https://abc123.ngrok-free.app` URL.

#### Step 4: Add Webhook in Resend

1. Go to: https://resend.com/webhooks
2. Click "Create Webhook"
3. Enter URL:
   ```
   https://abc123.ngrok-free.app/api/webhooks/resend
   ```
   (Replace with your ngrok URL)

4. Select events (email.opened, email.clicked, etc.)
5. Save

#### Step 5: Test!

Send a test email:
1. Go to: `http://localhost:3000/admin/ltd/campaigns`
2. Send a campaign to yourself
3. Open your email
4. Check terminal - you should see:
   ```
   📧 Resend webhook received: email.opened
   👁️ Email abc123 opened
   ```

---

## 🧪 Testing Without Ngrok

If you can't use ngrok, you can **manually test** the webhook:

### Test the Webhook Endpoint Locally:

```bash
# In a new terminal, send a fake webhook
curl -X POST http://localhost:3000/api/webhooks/resend \
  -H "Content-Type: application/json" \
  -d '{
    "type": "email.opened",
    "data": {
      "email_id": "test-email-123"
    }
  }'
```

**Expected Response:**
```json
{"received":true}
```

**Expected in Terminal:**
```
📧 Resend webhook received: email.opened
👁️ Email test-email-123 opened
```

---

## ✅ Verify It's Working

### After Setting Up Webhook:

1. **Send a Test Campaign:**
   - Go to: `/admin/ltd/campaigns`
   - Send to yourself
   - Subject: "Testing Open Tracking"

2. **Open the Email:**
   - Check your inbox
   - Open the email
   - Wait 10-30 seconds

3. **Check Analytics:**
   - Go to: `/admin/ltd/email-analytics`
   - Refresh the page
   - You should see:
     - ✅ "1 sent"
     - ✅ "1 opened" (100% open rate)

4. **Click a Link in Email:**
   - Click any link in the email
   - Refresh analytics
   - You should see:
     - ✅ "1 clicked"

---

## 🔍 Debugging

### Check Terminal Logs:

When webhook is received, you'll see:
```
📧 Resend webhook received: email.opened
📧 Event data: { ... }
👁️ Email abc123 opened
```

### Check Resend Dashboard:

https://resend.com/webhooks
- Click on your webhook
- See "Recent Deliveries"
- Should show 200 OK responses

### Common Issues:

**Issue:** "No webhooks received"
- ✅ Check Resend webhook URL is correct
- ✅ Make sure ngrok is running (for local dev)
- ✅ Check your dev server is running

**Issue:** "Webhook returns error"
- ✅ Check terminal for error messages
- ✅ Make sure database is running
- ✅ Check email_id exists in database

**Issue:** "Opens not tracking"
- ✅ Make sure you selected "email.opened" event
- ✅ Some email clients block tracking pixels
- ✅ Gmail may cache emails (try different client)

---

## 📊 What Gets Tracked

When webhook is received:

| Event | What Happens |
|-------|-------------|
| `email.sent` | Logged in terminal (already tracked on send) |
| `email.delivered` | Updates status to "delivered" in database |
| `email.opened` | Sets `opened = TRUE`, `opened_at = NOW()` |
| `email.clicked` | Sets `clicked = TRUE`, `clicked_at = NOW()` |
| `email.bounced` | Updates status to "bounced" |
| `email.complained` | Updates status to "failed" (marked as spam) |

---

## 🎯 Production Checklist

Before going live:

- [ ] Deploy app to production (Vercel, Railway, etc.)
- [ ] Get production URL (e.g., `repurposeai.com`)
- [ ] Add webhook in Resend: `https://repurposeai.com/api/webhooks/resend`
- [ ] Select all events (especially email.opened, email.clicked)
- [ ] Send test campaign
- [ ] Verify opens/clicks are tracked
- [ ] Remove ngrok webhook (if you added one for testing)

---

## 🔐 Security (Optional)

### Add Webhook Signature Verification:

Resend can sign webhooks for security. To enable:

1. **In Resend Dashboard:**
   - Go to webhook settings
   - Copy the "Signing Secret"

2. **Add to `.env.local`:**
   ```bash
   RESEND_WEBHOOK_SECRET="whsec_your_signing_secret"
   ```

3. **Update Webhook Route:**
   ```typescript
   // In src/app/api/webhooks/resend/route.ts
   
   const signature = request.headers.get('svix-signature');
   const secret = process.env.RESEND_WEBHOOK_SECRET;
   
   // Verify signature here
   ```

(I can add this if you want extra security!)

---

## 🚀 Quick Start (Production)

**If your app is already deployed:**

1. Go to: https://resend.com/webhooks
2. Click "Create Webhook"
3. URL: `https://your-production-url.com/api/webhooks/resend`
4. Select: email.opened, email.clicked (and others)
5. Save
6. Done! ✅

**For local testing:**

1. Download ngrok: https://ngrok.com/download
2. Run: `ngrok http 3000`
3. Copy the `https://` URL
4. Add webhook in Resend with that URL
5. Test by sending a campaign!

---

## 📞 Need Help?

**Resend Docs:**
- https://resend.com/docs/dashboard/webhooks/introduction

**Ngrok Docs:**
- https://ngrok.com/docs

**Test Webhook:**
```bash
curl -X POST http://localhost:3000/api/webhooks/resend \
  -H "Content-Type: application/json" \
  -d '{"type":"email.opened","data":{"email_id":"test-123"}}'
```

---

## ✅ Next Steps

After webhook is set up:
1. Send a test campaign
2. Open the email
3. Check `/admin/ltd/email-analytics`
4. See real-time open/click tracking! 🎉


