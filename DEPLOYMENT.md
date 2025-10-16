# Vercel Deployment Guide - Best SAAS Kit V2

This guide will walk you through deploying your Best SAAS Kit V2 application to Vercel.

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- ✅ A Vercel account ([sign up here](https://vercel.com/signup))
- ✅ Your GitHub repository pushed and up to date
- ✅ All required environment variables ready
- ✅ Database setup completed on Neon
- ✅ Google OAuth credentials configured
- ✅ Stripe account setup (if using payments)
- ✅ OpenRouter API key (for AI features)

## 🚀 Deployment Steps

### Step 1: Connect Your Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your Git repository (GitHub, GitLab, or Bitbucket)
4. Select the repository: `Best-Saas-Kit--V2`
5. Vercel will automatically detect it's a Next.js project

### Step 2: Configure Project Settings

**Framework Preset:** Next.js (auto-detected)

**Build Settings:**
- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install` (default)
- **Development Command:** `npm run dev` (default)

**Root Directory:** `.` (leave as root)

### Step 3: Configure Environment Variables

Add the following environment variables in Vercel:

#### 🔐 Required Variables

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NEXT_PUBLIC_SITE_NAME=Your App Name

# NextAuth Configuration
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-generated-secret-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# OpenRouter AI
OPENROUTER_API_KEY=sk-or-v1-your-api-key
OPENROUTER_MODEL=qwen/qwen3-235b-a22b-2507
```

#### 💳 Payment Variables (if using Stripe)

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-key
STRIPE_SECRET_KEY=sk_live_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

#### 📧 Email Variables (if using Resend)

```bash
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=noreply@yourdomain.com
SUPPORT_EMAIL=support@yourdomain.com
```

#### 👑 Admin Configuration

```bash
ADMIN_EMAILS=admin@yourdomain.com,admin2@yourdomain.com
```

### Step 4: Update OAuth Redirect URIs

After deployment, update your OAuth settings:

#### Google OAuth Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **Credentials**
4. Edit your OAuth 2.0 Client ID
5. Add to **Authorized redirect URIs:**
   ```
   https://your-domain.vercel.app/api/auth/callback/google
   ```

### Step 5: Configure Stripe Webhooks (if using payments)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers → Webhooks**
3. Click **Add endpoint**
4. Set endpoint URL:
   ```
   https://your-domain.vercel.app/api/stripe/webhook
   ```
5. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
6. Copy the **Webhook signing secret**
7. Add it to Vercel as `STRIPE_WEBHOOK_SECRET`

### Step 6: Deploy

1. Click **"Deploy"** in Vercel
2. Wait for the build to complete (usually 2-5 minutes)
3. Once deployed, you'll get a production URL

## 🔍 Post-Deployment Verification

### Test Core Functionality

1. **Homepage:** Visit your production URL
2. **Authentication:** Test Google sign-in
3. **Dashboard:** Verify dashboard loads after login
4. **AI Chat:** Test AI chat functionality (requires credits)
5. **Billing:** Test checkout flow (use Stripe test mode)
6. **Admin Panel:** Verify admin access (if configured)

### Check Logs

Monitor your deployment:
1. Go to Vercel Dashboard → Your Project
2. Click on **"Deployments"**
3. Select your latest deployment
4. View **"Functions"** logs for any errors

### Common Issues & Solutions

#### Issue: "Database connection failed"
- ✅ Verify `DATABASE_URL` is correct
- ✅ Ensure SSL is enabled: `?sslmode=require`
- ✅ Check Neon database is running

#### Issue: "OAuth redirect URI mismatch"
- ✅ Update Google OAuth redirect URIs
- ✅ Ensure `NEXTAUTH_URL` matches your domain
- ✅ Clear browser cache and try again

#### Issue: "Stripe webhook signature verification failed"
- ✅ Verify `STRIPE_WEBHOOK_SECRET` is correct
- ✅ Ensure webhook endpoint URL is correct
- ✅ Check webhook is active in Stripe dashboard

#### Issue: "AI chat not working"
- ✅ Verify `OPENROUTER_API_KEY` is valid
- ✅ Check you have credits in OpenRouter account
- ✅ Ensure user has credits in database

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to your main branch:

1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```
3. Vercel automatically builds and deploys
4. Preview deployments for pull requests

## 🌐 Custom Domain Setup

### Add Custom Domain

1. Go to Vercel Dashboard → Your Project
2. Click **"Settings"** → **"Domains"**
3. Click **"Add"**
4. Enter your domain (e.g., `yourdomain.com`)
5. Follow DNS configuration instructions

### Update Environment Variables

After adding custom domain:
```bash
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXTAUTH_URL=https://yourdomain.com
```

### Update OAuth & Webhooks

Update redirect URIs in:
- Google OAuth Console
- Stripe Webhook endpoints

## 📊 Monitoring & Analytics

### Vercel Analytics

Enable Vercel Analytics:
1. Go to **Analytics** tab in your project
2. Click **"Enable Analytics"**
3. View real-time performance metrics

### Error Tracking

Consider adding error tracking:
- **Sentry:** For error monitoring
- **LogRocket:** For session replay
- **Datadog:** For comprehensive monitoring

## 🔒 Security Best Practices

1. **Environment Variables:** Never commit `.env.local` to Git
2. **API Keys:** Use production keys for production deployment
3. **Database:** Use separate databases for dev/staging/prod
4. **Webhooks:** Verify webhook signatures
5. **HTTPS:** Always use HTTPS in production (Vercel provides this)
6. **Rate Limiting:** Consider adding rate limiting for API routes

## 🚦 Deployment Environments

### Production
- Branch: `main`
- URL: `your-domain.vercel.app` or custom domain
- Environment: Production variables

### Preview (Staging)
- Branch: Any branch except `main`
- URL: Auto-generated preview URL
- Environment: Preview variables (optional)

### Development
- Local: `http://localhost:3000`
- Environment: `.env.local`

## 📝 Environment Variable Management

### Using Vercel CLI

Install Vercel CLI:
```bash
npm i -g vercel
```

Pull environment variables:
```bash
vercel env pull .env.local
```

Add environment variable:
```bash
vercel env add VARIABLE_NAME
```

### Environment Variable Scopes

- **Production:** Used for production deployments
- **Preview:** Used for preview deployments
- **Development:** Used for local development

## 🔧 Advanced Configuration

### Custom Build Settings

Edit `vercel.json` for advanced configuration:
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

### Edge Functions

Some API routes can be deployed as Edge Functions for better performance:
```typescript
export const runtime = 'edge';
```

### Caching Strategy

Configure caching in `next.config.ts`:
```typescript
const nextConfig = {
  headers: async () => [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Cache-Control', value: 'no-store' }
      ]
    }
  ]
}
```

## 📞 Support & Resources

- **Vercel Documentation:** [vercel.com/docs](https://vercel.com/docs)
- **Next.js Deployment:** [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **Vercel Support:** [vercel.com/support](https://vercel.com/support)
- **Community Discord:** [vercel.com/discord](https://vercel.com/discord)

## ✅ Deployment Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Database migrations run
- [ ] OAuth redirect URIs updated
- [ ] Stripe webhooks configured
- [ ] Custom domain added (optional)
- [ ] SSL certificate active
- [ ] Test all core features
- [ ] Monitor logs for errors
- [ ] Set up error tracking
- [ ] Configure analytics
- [ ] Backup strategy in place
- [ ] Documentation updated

---

**🎉 Congratulations!** Your Best SAAS Kit V2 is now deployed on Vercel!

For issues or questions, check the logs in Vercel Dashboard or review the troubleshooting section above.
