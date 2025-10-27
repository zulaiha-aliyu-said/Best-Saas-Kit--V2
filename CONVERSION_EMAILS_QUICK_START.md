# 🚀 Conversion Emails - Quick Start Guide

## 📧 Three High-Converting Email Templates Implemented

### 1. 💳 Credit Warning & Upgrade Email
**Highest Conversion Potential** - Triggers when users run low on credits

### 2. 🔄 Re-engagement Email  
**Reduce Churn** - Brings back inactive users with bonus credits

### 3. 📊 Performance Summary Email
**Showcase Value** - Weekly stats with gamification elements

---

## ⚡ Quick Setup (5 Minutes)

### Step 1: Run Database Migration
```bash
psql $DATABASE_URL < sql-queries/20-email-automation-table.sql
```

### Step 2: Add Environment Variable
```bash
# Add to .env.local
EMAIL_AUTOMATION_SECRET=your-random-secret-key-here
```

### Step 3: Test the Emails
```bash
# Preview in browser:
http://localhost:3000/api/emails/test-conversion?type=credit_warning
http://localhost:3000/api/emails/test-conversion?type=reengagement
http://localhost:3000/api/emails/test-conversion?type=performance

# Send test email:
curl -X POST http://localhost:3000/api/emails/test-conversion \
  -H "Content-Type: application/json" \
  -d '{"emailType": "credit_warning", "testEmail": "you@email.com", "userName": "Test"}'
```

---

## 🤖 Automation Options

### Option A: Cron Job (Recommended)
```bash
# Run daily at 9 AM
0 9 * * * curl "http://localhost:3000/api/emails/automation?secret=YOUR_SECRET&type=all"
```

### Option B: Manual Trigger
```bash
curl -X POST http://localhost:3000/api/emails/automation \
  -H "Content-Type: application/json" \
  -d '{"type": "all", "secret": "YOUR_SECRET"}'
```

---

## 📊 What Gets Sent

| Email Type | Trigger | Frequency |
|------------|---------|-----------|
| Credit Warning | ≤2 credits remaining | Max 1x per 7 days |
| Re-engagement | 14, 30, or 60 days inactive | At specific intervals |
| Performance Summary | Posted content this week | Every Monday |

---

## 📈 Expected Results

- **Credit Warning**: 3-7% conversion rate → **Direct Revenue** 💰
- **Re-engagement**: 10-15% reactivation rate
- **Performance**: 20-30% engagement boost

---

## 📚 Full Documentation

See `CONVERSION_EMAIL_SYSTEM_GUIDE.md` for:
- Complete setup instructions
- Customization guide
- Troubleshooting
- Production deployment
- Best practices

---

## 🎯 What Each Email Includes

### Credit Warning Email:
- ⚠️ Warning header with progress bar
- 🔥 20% discount offer (urgency)
- 📋 Feature comparison table
- 💬 Social proof testimonial
- 💰 Clear upgrade CTAs

### Re-engagement Email:
- 💜 Warm welcoming design
- 🎁 50 bonus credits (60+ days)
- ✨ New features showcase
- 🔥 Trending topics
- 🏆 Success stories

### Performance Summary:
- 🏆 Achievement celebration
- 📈 Stats with % change
- ⏱️ Time saved calculation
- 🎯 Milestone tracker
- 🚀 Next challenge

---

## ✅ Checklist

- [ ] Run database migration
- [ ] Add EMAIL_AUTOMATION_SECRET to `.env.local`
- [ ] Test emails in browser
- [ ] Send test email to your inbox
- [ ] Set up cron job for automation
- [ ] Monitor results in Resend dashboard

---

**Ready to boost conversions? Start with Step 1!** 🚀


