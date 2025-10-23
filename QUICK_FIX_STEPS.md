# 🚀 Quick Fix - Competitor Error (3 Steps)

## ⚡ TL;DR - Run These Commands

```bash
# Step 1: Create .env.local file
copy env.example .env.local

# Step 2: Edit .env.local and add your DATABASE_URL
# (Use your text editor to edit the file)

# Step 3: Setup database tables
node setup-competitor-tables.js

# Step 4: Restart dev server
npm run dev
```

---

## 📋 Detailed Instructions

### Step 1: Create Environment File

**Run this command:**
```bash
copy env.example .env.local
```

### Step 2: Add Your Database Credentials

Open `.env.local` in your text editor and **update these lines**:

```env
DATABASE_URL="your-actual-database-url-here"
NEXTAUTH_SECRET="generate-random-string-here"
GOOGLE_CLIENT_ID="your-google-client-id-here"
GOOGLE_CLIENT_SECRET="your-google-client-secret-here"
```

**Don't have these yet?** Here's where to get them:

#### 🗄️ DATABASE_URL
- If using **Neon**: Get it from https://console.neon.tech
  - Go to your project → Connection Details → Copy connection string
  - Format: `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`

- If using **Supabase**: Get it from https://app.supabase.com
  - Go to Project Settings → Database → Connection string → URI

#### 🔐 NEXTAUTH_SECRET
Generate a random secret:
```bash
# On Windows PowerShell:
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})

# Or use any random 32+ character string
```

#### 🔑 Google OAuth (GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET)
1. Go to https://console.cloud.google.com
2. Create a new project (or select existing)
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Application type: Web application
6. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
7. Copy the Client ID and Client Secret

### Step 3: Run Database Setup

```bash
node setup-competitor-tables.js
```

**Expected output:**
```
✅ Tables created successfully!
✅ All tables verified:
   ✓ competitors
   ✓ competitor_posts
   ✓ competitor_stats
   ✓ content_gaps
🎉 Setup completed successfully!
```

### Step 4: Restart Development Server

```bash
npm run dev
```

### Step 5: Test It!

1. Open http://localhost:3000
2. Navigate to Competitor Analysis page
3. Try adding a competitor
4. ✅ Error should be gone!

---

## ❌ Getting Errors?

### "DATABASE_URL not found"
- Make sure `.env.local` file exists in project root
- Check the file contains `DATABASE_URL=...`
- Restart your terminal/dev server

### "Cannot connect to database"
- Verify DATABASE_URL is correct
- Test connection: Open Neon/Supabase dashboard and check if database is running
- Check firewall/network settings

### "Permission denied"
- Your database user needs CREATE TABLE permissions
- For Neon: The default user should have these permissions
- Try reconnecting to database

### Still not working?
Read the full guide: `FIX_COMPETITOR_ERROR.md`

---

## ✅ Checklist

- [ ] `.env.local` file created
- [ ] DATABASE_URL added to `.env.local`
- [ ] NEXTAUTH_SECRET added
- [ ] Google OAuth credentials added
- [ ] Ran `node setup-competitor-tables.js` successfully
- [ ] Dev server restarted
- [ ] Competitor page loads without error

---

**Need the full detailed guide?** See: `FIX_COMPETITOR_ERROR.md`




