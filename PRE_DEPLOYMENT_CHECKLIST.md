# Pre-Deployment Checklist

Use this checklist to ensure your application is ready for Vercel deployment.

## ✅ Environment Setup

### Required Environment Variables
- [ ] `NEXTAUTH_URL` - Set to your production URL
- [ ] `NEXTAUTH_SECRET` - Generate at https://generate-secret.vercel.app/32
- [ ] `GOOGLE_CLIENT_ID` - From Google Cloud Console
- [ ] `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- [ ] `DATABASE_URL` - Neon PostgreSQL connection string
- [ ] `OPENROUTER_API_KEY` - From OpenRouter dashboard
- [ ] `NEXT_PUBLIC_SITE_URL` - Your production URL

### Optional Environment Variables
- [ ] `STRIPE_SECRET_KEY` - For payment processing
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - For Stripe checkout
- [ ] `STRIPE_WEBHOOK_SECRET` - For webhook verification
- [ ] `RESEND_API_KEY` - For email notifications
- [ ] `FROM_EMAIL` - Sender email address
- [ ] `SUPPORT_EMAIL` - Support email address
- [ ] `ADMIN_EMAILS` - Comma-separated admin emails
- [ ] `OPENROUTER_MODEL` - AI model (default: qwen/qwen3-235b-a22b-2507)

## 🗄️ Database Setup

- [ ] Neon PostgreSQL database created
- [ ] Database connection string obtained
- [ ] SSL mode enabled in connection string
- [ ] SQL scripts executed in order:
  - [ ] `01-create-users-table.sql`
  - [ ] `02-create-indexes.sql`
  - [ ] `03-create-functions.sql`
  - [ ] `07-create-discount-codes-table.sql`
- [ ] Database connection tested locally

## 🔐 OAuth Configuration

### Google OAuth
- [ ] Google Cloud project created
- [ ] OAuth 2.0 credentials created
- [ ] Authorized redirect URIs configured:
  - [ ] `http://localhost:3000/api/auth/callback/google` (dev)
  - [ ] `https://your-domain.vercel.app/api/auth/callback/google` (prod)
- [ ] Google+ API enabled

## 💳 Stripe Setup (if using payments)

- [ ] Stripe account created
- [ ] API keys obtained (test and live)
- [ ] Webhook endpoint configured
- [ ] Webhook events selected:
  - [ ] `checkout.session.completed`
  - [ ] `payment_intent.succeeded`
- [ ] Webhook secret obtained
- [ ] Test payment completed successfully

## 🤖 AI Configuration

- [ ] OpenRouter account created
- [ ] API key generated
- [ ] Credits added to account
- [ ] Model selected and tested
- [ ] Rate limits understood

## 📧 Email Setup (if using emails)

- [ ] Resend account created
- [ ] API key generated
- [ ] Domain verified (for production)
- [ ] Email templates tested

## 🔧 Code Preparation

- [ ] All dependencies installed (`npm install`)
- [ ] No TypeScript errors (`npm run lint`)
- [ ] Local build successful (`npm run build`)
- [ ] Local production server tested (`npm run start`)
- [ ] All features tested locally
- [ ] Environment variables in `.env.local` (not committed)

## 📁 Files Ready

- [ ] `vercel.json` - Vercel configuration
- [ ] `.vercelignore` - Files to ignore
- [ ] `next.config.ts` - Production settings
- [ ] `DEPLOYMENT.md` - Deployment guide
- [ ] `.gitignore` - Excludes sensitive files
- [ ] `README.md` - Updated with deployment info

## 🔒 Security

- [ ] `.env.local` not committed to Git
- [ ] Sensitive data removed from code
- [ ] API keys are environment variables
- [ ] CORS configured properly
- [ ] Rate limiting considered
- [ ] Input validation in place

## 🧪 Testing

- [ ] Homepage loads correctly
- [ ] Authentication flow works
- [ ] Dashboard accessible after login
- [ ] AI chat functional
- [ ] Payment flow tested (test mode)
- [ ] Admin panel accessible (if admin)
- [ ] Mobile responsive
- [ ] Cross-browser tested

## 📊 Monitoring & Analytics

- [ ] Error tracking setup (Sentry, etc.)
- [ ] Analytics configured (optional)
- [ ] Logging strategy in place
- [ ] Performance monitoring planned

## 🚀 Vercel Setup

- [ ] Vercel account created
- [ ] Repository connected to Vercel
- [ ] Project created in Vercel
- [ ] Environment variables added in Vercel
- [ ] Build settings configured
- [ ] Domain configured (if custom)

## 📝 Documentation

- [ ] README.md updated
- [ ] API documentation current
- [ ] Environment variables documented
- [ ] Deployment guide reviewed
- [ ] Troubleshooting section complete

## 🎯 Post-Deployment

- [ ] Production URL accessible
- [ ] SSL certificate active
- [ ] OAuth redirects working
- [ ] Stripe webhooks receiving events
- [ ] Database connections working
- [ ] AI features functional
- [ ] Admin panel accessible
- [ ] Error logs monitored
- [ ] Performance acceptable

## 🔄 Continuous Deployment

- [ ] Git repository clean
- [ ] Main branch protected
- [ ] Auto-deployment configured
- [ ] Preview deployments enabled
- [ ] Rollback strategy understood

## 📞 Support & Backup

- [ ] Backup strategy in place
- [ ] Support contacts documented
- [ ] Incident response plan ready
- [ ] Monitoring alerts configured

---

## Quick Commands

### Test Build Locally
```bash
npm run build
npm run start
```

### Deploy to Vercel (CLI)
```bash
npm i -g vercel
vercel login
vercel
```

### Check Environment Variables
```bash
vercel env ls
```

### Pull Production Env Variables
```bash
vercel env pull .env.local
```

---

**Status:** Ready for deployment when all items are checked! ✅
