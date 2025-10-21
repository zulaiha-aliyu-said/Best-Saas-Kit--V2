# 🔧 Database Connection Error Fix

## ❌ **Error:**
```
Error: getaddrinfo ENOTFOUND ep-steep-glade-ad73tcpx-pooler.c-2.us-east-1.aws.neon.tech
```

## 🎯 **Root Cause:**
Your Neon PostgreSQL database connection string is either:
1. Missing from `.env.local`
2. Invalid or expired
3. Database is unreachable/deleted

## ✅ **Quick Fix Options**

### **Option 1: Use Existing Neon Database (Recommended)**

#### **Step 1: Get Your Database URL**
1. Go to [Neon Console](https://console.neon.tech/)
2. Sign in to your account
3. Select your project (or create a new one)
4. Click "Connection Details"
5. Copy the connection string

#### **Step 2: Update Environment Variable**
Add to your `.env.local` file:
```bash
DATABASE_URL="postgresql://username:password@your-neon-host.neon.tech/database_name?sslmode=require"
```

#### **Step 3: Restart Server**
```bash
npm run dev
```

### **Option 2: Create New Neon Database (If Old One Doesn't Exist)**

#### **Step 1: Create Neon Account**
1. Go to [Neon](https://neon.tech/)
2. Sign up for free account
3. Create a new project

#### **Step 2: Get Connection String**
1. In Neon dashboard, click "Connection Details"
2. Copy the "Pooled connection" string
3. It should look like:
   ```
   postgresql://username:password@hostname.neon.tech/dbname?sslmode=require
   ```

#### **Step 3: Add to .env.local**
```bash
DATABASE_URL="your-connection-string-here"
```

#### **Step 4: Run Database Setup**
```bash
# Install dependencies if needed
npm install

# Restart development server
npm run dev
```

### **Option 3: Use Local PostgreSQL (For Development)**

#### **Step 1: Install PostgreSQL**
- Windows: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- Mac: `brew install postgresql`
- Linux: `sudo apt-get install postgresql`

#### **Step 2: Create Database**
```bash
# Start PostgreSQL
# Windows: Use pgAdmin or Services
# Mac/Linux:
brew services start postgresql

# Create database
createdb your_database_name
```

#### **Step 3: Update .env.local**
```bash
DATABASE_URL="postgresql://localhost:5432/your_database_name"
```

## 🚀 **Temporary Workaround (Skip Database)**

If you just want to test the Ayrshare scheduling without database:

### **Step 1: Make Database Optional**

Update `src/app/dashboard/layout.tsx`:

```typescript
// Find this code and wrap it in try-catch
try {
  const user = await getUserByGoogleId(session.user.id);
  if (!user) {
    await saveUserToDatabase({
      google_id: session.user.id,
      email: session.user.email!,
      name: session.user.name,
      image_url: session.user.image,
    });
  }
} catch (error) {
  console.warn('Database not available, continuing without it');
  // Continue anyway
}
```

### **Step 2: Restart Server**
```bash
npm run dev
```

## 🔍 **Check Database Connection**

### **Test Connection:**
```bash
# Create a test file
node -e "
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'YOUR_DATABASE_URL_HERE',
  ssl: { rejectUnauthorized: false }
});
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('Error:', err);
  else console.log('Connected! Time:', res.rows[0]);
  pool.end();
});
"
```

## 📋 **Common Issues & Solutions**

### **Issue 1: Database Deleted**
**Solution**: Create a new Neon database and update `DATABASE_URL`

### **Issue 2: Free Tier Expired**
**Solution**: 
- Neon free tier has limits
- Upgrade to paid plan or create new account
- Use local PostgreSQL instead

### **Issue 3: Network/Firewall**
**Solution**:
- Check your internet connection
- Disable VPN temporarily
- Check firewall settings

### **Issue 4: SSL Certificate Issues**
**Solution**: Add `?sslmode=require` to connection string

## ✅ **Recommended Solution**

For your Best SaaS Kit V2 project, I recommend:

### **For Development:**
**Use Neon Free Tier**
- ✅ Free PostgreSQL hosting
- ✅ No local setup needed
- ✅ Easy to use
- ✅ Good for development

1. Go to [Neon Console](https://console.neon.tech/)
2. Create/select project
3. Copy connection string
4. Add to `.env.local`
5. Restart server

### **For Production:**
**Options:**
- **Neon Pro** ($19/month) - Recommended
- **Supabase** (Free tier available)
- **Railway** (Easy deployment)
- **Vercel Postgres** (If using Vercel)

## 🎯 **Next Steps**

1. **Fix Database Connection** (choose one option above)
2. **Test Connection** (use test script)
3. **Restart Development Server** (`npm run dev`)
4. **Verify Login Works** (try accessing `/dashboard`)
5. **Continue with Ayrshare Scheduling** (local scheduling works without database)

## 💡 **Important Note**

**Local Scheduling works WITHOUT database!**
- Posts are saved to localStorage
- No database needed for basic functionality
- Database is only for user authentication and credits

If you just want to test the scheduling feature, you can continue using it with local storage even if the database is not connected!

---

**Quick Fix**: Get a new Neon database URL and add it to `.env.local`, then restart your server.






