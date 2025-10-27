# 🚀 Conversion Email System - Complete Implementation Guide

## 📋 Overview

You now have **3 high-converting email templates** fully implemented and ready to boost user engagement and conversions:

1. **💳 Credit Warning & Upgrade Email** - Highest conversion potential
2. **🔄 Re-engagement Email** - Reduce churn and win back users
3. **📊 Performance Summary Email** - Showcase value and increase engagement

---

## ✅ What's Been Implemented

### 📧 Email Templates (src/lib/resend.ts)

All three email templates feature:
- ✨ Beautiful gradient designs matching your brand
- 📱 Mobile-responsive layouts
- 🎯 Clear call-to-action buttons
- 💬 Social proof and testimonials
- 📈 Progress bars and visual stats
- 🏆 Gamification elements (badges, milestones)

### 🤖 Automation System (src/lib/email-automation.ts)

Automatic email triggers based on user behavior:
- **Credit warnings**: Sent when users have ≤2 credits
- **Re-engagement**: Sent at 14, 30, and 60 days of inactivity
- **Performance summaries**: Sent weekly on Mondays

### 🗄️ Database Tracking (sql-queries/20-email-automation-table.sql)

Email automation log table to:
- Track all sent emails
- Prevent duplicate sends
- Monitor open/click rates
- Store email metadata

### 🧪 Test Endpoints

- `/api/emails/test-conversion` - Test and preview all emails
- `/api/emails/automation` - Trigger automation manually

---

## 🎯 Quick Start

### 1. Run Database Migration

First, create the email automation log table:

```bash
# Connect to your database
psql $DATABASE_URL

# Run the migration
\i sql-queries/20-email-automation-table.sql
```

**Or manually:**
```sql
CREATE TABLE IF NOT EXISTS email_automation_log (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  email_type VARCHAR(50) NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  email_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'sent',
  metadata JSONB,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_email_automation_user_type_sent 
  ON email_automation_log(user_id, email_type, sent_at);
```

---

### 2. Add Environment Variables

Add to your `.env.local`:

```bash
# Email Automation Secret (generate a random string)
EMAIL_AUTOMATION_SECRET=your-secret-key-here-make-it-random

# Resend API Key (already configured)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

### 3. Test the Emails

#### Preview in Browser:

**Credit Warning Email:**
```
http://localhost:3000/api/emails/test-conversion?type=credit_warning
```

**Re-engagement Email:**
```
http://localhost:3000/api/emails/test-conversion?type=reengagement
```

**Performance Summary Email:**
```
http://localhost:3000/api/emails/test-conversion?type=performance
```

#### Send Test Emails:

```bash
# Credit Warning Email
curl -X POST http://localhost:3000/api/emails/test-conversion \
  -H "Content-Type: application/json" \
  -d '{
    "emailType": "credit_warning",
    "testEmail": "your@email.com",
    "userName": "Test User"
  }'

# Re-engagement Email
curl -X POST http://localhost:3000/api/emails/test-conversion \
  -H "Content-Type: application/json" \
  -d '{
    "emailType": "reengagement",
    "testEmail": "your@email.com",
    "userName": "Test User"
  }'

# Performance Summary Email
curl -X POST http://localhost:3000/api/emails/test-conversion \
  -H "Content-Type: application/json" \
  -d '{
    "emailType": "performance",
    "testEmail": "your@email.com",
    "userName": "Test User"
  }'
```

---

## 🤖 Setting Up Automation

### Option 1: Cron Job (Recommended)

Set up a cron job to run the automation daily:

```bash
# Add to your crontab (run at 9 AM every day)
0 9 * * * curl -X GET "http://localhost:3000/api/emails/automation?secret=your-secret-key&type=all"
```

**Or use cron expressions in your deployment platform:**

**Vercel (vercel.json):**
```json
{
  "crons": [
    {
      "path": "/api/emails/automation?secret=your-secret-key&type=all",
      "schedule": "0 9 * * *"
    }
  ]
}
```

---

### Option 2: Manual Trigger

Trigger automation manually via API:

```bash
curl -X POST http://localhost:3000/api/emails/automation \
  -H "Content-Type: application/json" \
  -d '{
    "type": "all",
    "secret": "your-secret-key"
  }'
```

**Or trigger specific types:**
```bash
# Only credit warnings
curl -X POST http://localhost:3000/api/emails/automation \
  -H "Content-Type: application/json" \
  -d '{
    "type": "credit_warning",
    "secret": "your-secret-key"
  }'

# Only re-engagement
curl -X POST http://localhost:3000/api/emails/automation \
  -H "Content-Type: application/json" \
  -d '{
    "type": "reengagement",
    "secret": "your-secret-key"
  }'

# Only performance summaries
curl -X POST http://localhost:3000/api/emails/automation \
  -H "Content-Type: application/json" \
  -d '{
    "type": "performance",
    "secret": "your-secret-key"
  }'
```

---

### Option 3: Run from Code

Import and run directly in your code:

```typescript
import { runEmailAutomation } from '@/lib/email-automation';

// Run all automation
const result = await runEmailAutomation();
console.log(result);
// { success: true, creditWarnings: 5, reengagement: 3, summaries: 10 }
```

---

## 📊 Email Template Details

### 1. 💳 Credit Warning & Upgrade Email

**When it's sent:**
- User has ≤2 credits remaining
- User has used 70%+ of their credits
- User has 0 credits (out of credits)

**Key features:**
- ⚠️ Warning header with gradient design
- 📊 Visual progress bar showing credit usage
- 🔥 Urgency banner with 20% discount offer
- 📋 Feature comparison table (Free vs Pro)
- 💬 Social proof testimonial
- 💰 Multiple upgrade CTAs
- 🎁 Alternative options (LTD, referrals)

**Conversion triggers:**
- Limited-time 20% discount
- Visual credit depletion
- Feature comparison showing what they're missing
- Testimonials from successful users

---

### 2. 🔄 Re-engagement Email

**When it's sent:**
- 14 days of inactivity
- 30 days of inactivity
- 60 days of inactivity (includes 50 bonus credits offer!)

**Key features:**
- 💜 Warm, welcoming design
- 🎁 Bonus credits for 60+ day inactive users
- 🚀 "What you're missing" stats
- ✨ New features showcase
- 🔥 Trending topics in their niche
- 🏆 Success stories from other users
- ⚙️ Easy email preference management

**Conversion triggers:**
- Bonus credits incentive (60+ days)
- FOMO (what other users are doing)
- New features announcement
- Personalized trending topics
- Low-friction return (1-click)

---

### 3. 📊 Performance Summary Email

**When it's sent:**
- Every Monday morning (weekly summary)
- Only to users who created content in the past week

**Key features:**
- 🏆 Trophy header celebrating achievements
- 📈 Posts created count (with % change)
- ⏱️ Time saved calculation
- 📱 Top platform identified
- 📊 Credit usage progress bar
- 🎉 Achievement badges unlocked
- 🎯 Milestone tracker (1, 10, 50, 100 posts)
- 💡 Personalized insights
- 🚀 Next challenge
- 📱 Social sharing prompt

**Conversion triggers:**
- Gamification (badges, milestones)
- Positive reinforcement
- Progress visualization
- Upgrade prompt when credits low
- Social sharing (viral growth)

---

## 🎨 Customization

### Change Email Content

Edit `src/lib/resend.ts`:

```typescript
// 1. Credit Warning Email
export function createCreditWarningUpgradeEmail(...) {
  // Modify subject line
  const subject = `Your custom subject here`;
  
  // Modify discount code
  <p>Use code: <strong>YOURCUSTOMCODE</strong></p>
  
  // Modify comparison table features
  <tr>
    <td>Your Custom Feature</td>
    ...
  </tr>
}

// 2. Re-engagement Email
export function createReengagementEmail(...) {
  // Modify bonus credits amount
  <div class="bonus-badge">
    100 BONUS CREDITS  {/* Changed from 50 */}
  </div>
}

// 3. Performance Summary
export function createPerformanceSummaryEmail(...) {
  // Modify milestone thresholds
  <div class="milestone-item">
    <div class="milestone-icon">${stats.postsCreated >= 25 ? '✅' : '⭕'}</div>
    <div>
      <p>25 Posts Created</p>  {/* New milestone */}
    </div>
  </div>
}
```

---

### Change Automation Triggers

Edit `src/lib/email-automation.ts`:

```typescript
// Credit warning threshold (currently ≤2 credits)
WHERE u.credits <= 5  // Change to 5 credits

// Re-engagement intervals (currently 14, 30, 60 days)
if (![7, 21, 45].some(...))  // Change to 7, 21, 45 days

// Weekly summary day (currently Monday = 1)
if (today === 5) {  // Change to Friday = 5
```

---

### Change Email Frequency

Edit the "last X days" check:

```typescript
// Currently: Don't send same email within 7 days
AND e.sent_at > NOW() - INTERVAL '7 days'

// Change to 3 days:
AND e.sent_at > NOW() - INTERVAL '3 days'
```

---

## 📈 Success Metrics

Track these metrics in Resend dashboard:

### Email Performance:
- ✉️ **Open Rate**: Aim for 25-35%
- 🖱️ **Click-through Rate**: Aim for 5-10%
- 💰 **Conversion Rate**: Track upgrades from emails
- 🚫 **Unsubscribe Rate**: Keep below 0.5%

### Automation Performance:
- 📊 Emails sent per day
- 💳 Credit warning conversion rate
- 🔄 Re-engagement success rate
- 📈 Performance summary engagement

---

## 🔍 Monitoring & Debugging

### Check Sent Emails:

```sql
-- View all sent emails
SELECT 
  u.email,
  e.email_type,
  e.sent_at,
  e.status,
  e.metadata
FROM email_automation_log e
JOIN users u ON e.user_id = u.id
ORDER BY e.sent_at DESC
LIMIT 100;

-- Count emails by type
SELECT 
  email_type,
  COUNT(*) as total_sent,
  COUNT(CASE WHEN status = 'opened' THEN 1 END) as opened
FROM email_automation_log
WHERE sent_at > NOW() - INTERVAL '30 days'
GROUP BY email_type;
```

### Check Users Eligible for Emails:

```sql
-- Users with low credits
SELECT id, email, name, credits, monthly_credit_limit
FROM users
WHERE credits <= 2;

-- Inactive users
SELECT id, email, name, last_login, 
       EXTRACT(DAY FROM NOW() - last_login) as days_inactive
FROM users
WHERE last_login < NOW() - INTERVAL '14 days'
ORDER BY last_login DESC;

-- Active users (for performance summary)
SELECT 
  u.id, u.email, u.name,
  COUNT(p.*) as posts_this_week
FROM users u
LEFT JOIN post_history p ON u.id = p.user_id 
  AND p.created_at > NOW() - INTERVAL '7 days'
GROUP BY u.id
HAVING COUNT(p.*) > 0;
```

---

## 🐛 Troubleshooting

### Emails Not Sending?

1. **Check Resend API Key:**
```bash
echo $RESEND_API_KEY
```

2. **Check database connection:**
```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

3. **Check automation logs:**
```bash
# View Node.js logs
pm2 logs  # if using pm2
# or
tail -f /var/log/your-app.log
```

4. **Manually trigger to see errors:**
```bash
curl -X POST http://localhost:3000/api/emails/automation \
  -H "Content-Type: application/json" \
  -d '{"type": "credit_warning", "secret": "your-secret"}'
```

### Duplicate Emails?

Check the email_automation_log query:
```sql
-- Should prevent duplicates within 7 days
SELECT user_id, email_type, COUNT(*)
FROM email_automation_log
WHERE sent_at > NOW() - INTERVAL '7 days'
GROUP BY user_id, email_type
HAVING COUNT(*) > 1;
```

### Email Going to Spam?

1. **Add SPF record** to DNS:
```
v=spf1 include:amazonses.com ~all
```

2. **Add DKIM** in Resend dashboard

3. **Warm up sending** (start with 50 emails/day, increase gradually)

---

## 🚀 Production Deployment

### 1. Environment Variables

Add to production environment:
```bash
EMAIL_AUTOMATION_SECRET=<generate-strong-secret>
RESEND_API_KEY=<production-key>
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 2. Set Up Cron Job

**Vercel:**
Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/emails/automation?secret=YOUR_SECRET&type=all",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**AWS Lambda / CloudWatch:**
```bash
# Create CloudWatch Events rule
aws events put-rule --name daily-email-automation \
  --schedule-expression "cron(0 9 * * ? *)"
```

### 3. Monitor Performance

Set up alerts for:
- Email send failures
- High unsubscribe rates
- Low open rates
- Automation errors

---

## 📝 Best Practices

### ✅ Do's:
- ✅ Test emails before sending to all users
- ✅ Monitor open/click rates
- ✅ A/B test subject lines
- ✅ Respect unsubscribe requests immediately
- ✅ Personalize with user's name and data
- ✅ Keep emails mobile-responsive
- ✅ Include clear CTAs
- ✅ Add social proof

### ❌ Don'ts:
- ❌ Send same email twice in 7 days
- ❌ Send to unsubscribed users
- ❌ Use spammy subject lines
- ❌ Make unsubscribe hard to find
- ❌ Send emails without testing first
- ❌ Ignore bounce/complaint rates
- ❌ Over-send (causes fatigue)

---

## 📊 Expected Results

Based on industry benchmarks:

### Credit Warning Email:
- **Open Rate**: 35-45% (high urgency)
- **Click Rate**: 8-12%
- **Conversion Rate**: 3-7% → **$$$** 💰

### Re-engagement Email:
- **Open Rate**: 20-30%
- **Click Rate**: 5-8%
- **Reactivation Rate**: 10-15%

### Performance Summary:
- **Open Rate**: 30-40%
- **Click Rate**: 6-10%
- **Engagement Boost**: 20-30%

---

## 🎉 You're All Set!

Your conversion email system is now **fully operational** and ready to:

1. **💰 Increase revenue** through upgrade prompts
2. **🔄 Reduce churn** by re-engaging inactive users
3. **📈 Boost engagement** with performance summaries
4. **🚀 Drive growth** through viral sharing

### Next Steps:

1. ✅ Run database migration
2. ✅ Set environment variables
3. ✅ Send test emails
4. ✅ Set up cron job
5. ✅ Monitor metrics in Resend

**Questions or need help?** Check the troubleshooting section or review the code comments in:
- `src/lib/resend.ts` (email templates)
- `src/lib/email-automation.ts` (automation logic)
- `src/app/api/emails/` (API endpoints)

---

**Made with 💜 by your AI assistant. Happy converting! 🚀**


