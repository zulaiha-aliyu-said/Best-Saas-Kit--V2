# 📧 Production Email Setup Guide

## ✅ What's Been Updated

Your email system is now configured to use your verified domain: **repurposeai.spendify.com.ng**

### Updated Files:
1. `src/lib/email.ts` - Default "from" email updated
2. `env.example` - Added RESEND_FROM_EMAIL variable

---

## 🔧 Setup Instructions

### Step 1: Add to Your `.env.local` File

Open your `.env.local` file and add this line:

```bash
RESEND_FROM_EMAIL="RepurposeAI <noreply@repurposeai.spendify.com.ng>"
```

**Or use any of these email addresses:**
- `noreply@repurposeai.spendify.com.ng` - For automated emails
- `admin@repurposeai.spendify.com.ng` - For admin campaigns
- `support@repurposeai.spendify.com.ng` - For support emails
- `hello@repurposeai.spendify.com.ng` - For welcome emails

### Step 2: Restart Your Dev Server

```bash
# Stop the current server (Ctrl + C)
# Then restart it
npm run dev
```

---

## 📬 Email Types That Will Use This

### 1. **LTD Code Redemption Welcome Email**
- **From:** RepurposeAI <noreply@repurposeai.spendify.com.ng>
- **Subject:** "🎉 Welcome to RepurposeAI LTD!"
- **When:** First time user redeems LTD code

### 2. **Code Stacking Confirmation Email**
- **From:** RepurposeAI <noreply@repurposeai.spendify.com.ng>
- **Subject:** "🎊 Code Stacked Successfully!"
- **When:** User stacks additional LTD codes

### 3. **Admin Email Campaigns**
- **From:** RepurposeAI <noreply@repurposeai.spendify.com.ng>
- **Subject:** Custom (set by admin)
- **When:** Admin sends campaign from `/admin/ltd/campaigns`

### 4. **Credit Low Warning (Future)**
- **From:** RepurposeAI <noreply@repurposeai.spendify.com.ng>
- **Subject:** "⚠️ Credit Balance Low"
- **When:** User has < 20% credits remaining

---

## ✨ Test Your Production Email

### Test 1: Send a Campaign

1. Go to: `http://localhost:3000/admin/ltd/campaigns`

2. **Subject:**
   ```
   🎉 Testing Production Email!
   ```

3. **Message:**
   ```
   Hi {{name}},

   This is a test from our verified domain!

   Your Tier: {{tier}}
   Your Credits: {{credits}}

   Cheers! 🚀
   ```

4. **Target:** Check **Tier 3** (yourself)

5. **Click "Send Campaign"**

6. **Check your inbox!** 📬

### Test 2: Redeem Another Code (Code Stacking)

1. Generate a new LTD code from `/admin/ltd/codes/generate`
2. Go to `/redeem` page
3. Enter the new code
4. You should receive a "Code Stacked Successfully" email

---

## 🔍 Verify Email Delivery

### What to Check:
1. ✅ Email arrives in inbox (not spam)
2. ✅ "From" shows: **RepurposeAI <noreply@repurposeai.spendify.com.ng>**
3. ✅ Email HTML renders properly
4. ✅ All placeholders are replaced ({{name}}, {{tier}}, etc.)

### If Email Goes to Spam:
1. Check your SPF and DKIM records in Resend dashboard
2. Warm up your domain by sending gradual emails
3. Avoid spam trigger words in subject lines

---

## 📋 Resend Dashboard

**Check your Resend dashboard for:**
- Email delivery status
- Bounce rates
- Open rates (if enabled)
- Domain verification status

**Link:** https://resend.com/emails

---

## 🎯 Advanced: Multiple Email Addresses

If you want different emails for different purposes, update the code like this:

### Example: Different Emails by Type

```typescript
// In src/lib/email.ts

export async function sendEmail({ to, subject, html, emailType }: SendEmailParams) {
  const fromEmails = {
    welcome: 'RepurposeAI <hello@repurposeai.spendify.com.ng>',
    campaign: 'RepurposeAI <admin@repurposeai.spendify.com.ng>',
    support: 'RepurposeAI Support <support@repurposeai.spendify.com.ng>',
    default: 'RepurposeAI <noreply@repurposeai.spendify.com.ng>',
  };

  const from = fromEmails[emailType] || fromEmails.default;

  // ... rest of the code
}
```

---

## ✅ Production Checklist

Before going live:

- [ ] Added `RESEND_FROM_EMAIL` to `.env.local`
- [ ] Restarted dev server
- [ ] Tested admin campaign email
- [ ] Tested code redemption email
- [ ] Verified emails arrive in inbox (not spam)
- [ ] Checked email formatting looks good
- [ ] Confirmed "from" email shows verified domain

---

## 🚀 You're All Set!

Your emails will now be sent from your verified domain: **repurposeai.spendify.com.ng**

This means:
- ✅ Higher deliverability rates
- ✅ Professional brand identity
- ✅ Can send to any recipient (not just your own email)
- ✅ Better email reputation

---

**Questions?** Check Resend docs: https://resend.com/docs


