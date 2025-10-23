# ✅ LTD Admin Dashboard - All Migrations Complete

## 🎉 Database Setup Complete!

All necessary database changes have been applied to support the admin dashboard.

---

## 📊 Migrations Applied

### **Migration 1: Admin Schema** ✅
**File:** `sql-queries/18-create-ltd-admin-schema.sql`

**Changes:**
- ✅ Added `role` column to `users` table (VARCHAR(50), default: 'user')
- ✅ Set `saasmamu@gmail.com` as admin
- ✅ Added `created_by_admin_id` to `ltd_codes` (VARCHAR(255))
- ✅ Added `notes` to `ltd_codes` (TEXT)
- ✅ Added `batch_id` to `ltd_codes` (VARCHAR(100))
- ✅ Added `is_active` to `ltd_codes` (BOOLEAN, default: true)
- ✅ Created `admin_ltd_actions` audit log table
- ✅ Added performance indexes

---

### **Migration 2: Redemption Tracking** ✅
**File:** `sql-queries/19-add-max-redemptions-to-ltd-codes.sql`

**Changes:**
- ✅ Added `max_redemptions` column (INTEGER, default: 1)
  - Allows codes to be used multiple times
  - Default is 1 for single-use codes
  
- ✅ Added `current_redemptions` column (INTEGER, default: 0)
  - Tracks how many times a code has been redeemed
  
- ✅ Updated existing codes
  - If `is_redeemed = TRUE`, set `current_redemptions = 1`
  
- ✅ Added check constraint
  - Ensures `current_redemptions <= max_redemptions`
  
- ✅ Added index for performance

**Why This Matters:**
- Supports flexible code redemption (e.g., team codes that can be used 5 times)
- Better tracking of code usage
- Backwards compatible with existing single-use codes

---

### **Migration 3: Updated Timestamp** ✅

**Changes:**
- ✅ Added `updated_at` column to `ltd_codes` (TIMESTAMP WITH TIME ZONE)
  - Tracks when codes are modified
  - Auto-updates on changes

---

## 📋 Current Database Schema

### **`users` table** (LTD columns)
```sql
- id VARCHAR(255) PRIMARY KEY
- email VARCHAR(255) UNIQUE
- name VARCHAR(255)
- role VARCHAR(50) DEFAULT 'user'        -- NEW
- plan_type VARCHAR(50) DEFAULT 'subscription'
- ltd_tier INTEGER (1-4)
- credits INTEGER DEFAULT 25
- monthly_credit_limit INTEGER DEFAULT 25
- credit_reset_date TIMESTAMP
- rollover_credits INTEGER DEFAULT 0
- stacked_codes INTEGER DEFAULT 1
- created_at TIMESTAMP
- updated_at TIMESTAMP
```

### **`ltd_codes` table** (Complete)
```sql
- id SERIAL PRIMARY KEY
- code VARCHAR(100) UNIQUE              -- Redemption code
- tier INTEGER (1-4)                    -- LTD tier level
- is_redeemed BOOLEAN DEFAULT FALSE     -- Legacy boolean flag
- redeemed_by INTEGER                   -- Legacy foreign key
- redeemed_at TIMESTAMP                 -- When first redeemed
- created_at TIMESTAMP                  -- When code was created
- expires_at TIMESTAMP                  -- Optional expiry
- batch_id VARCHAR(100)                 -- Batch identifier
- max_redemptions INTEGER DEFAULT 1     -- NEW: Max uses
- current_redemptions INTEGER DEFAULT 0 -- NEW: Current uses
- is_active BOOLEAN DEFAULT TRUE        -- NEW: Can be disabled
- created_by_admin_id VARCHAR(255)      -- NEW: Admin who created
- notes TEXT                            -- NEW: Admin notes
- updated_at TIMESTAMP                  -- NEW: Last modified
```

### **`admin_ltd_actions` table** (New)
```sql
- id SERIAL PRIMARY KEY
- admin_user_id VARCHAR(255) NOT NULL   -- Admin who performed action
- action_type VARCHAR(100) NOT NULL     -- Type of action
- target_id VARCHAR(255)                -- Code ID or User ID
- details JSONB                         -- Action metadata
- created_at TIMESTAMP                  -- When action occurred
```

**Action Types:**
- `codes_generated` - Batch code generation
- `code_updated` - Code edited
- `code_deleted` - Code deleted
- `user_plan_updated` - User plan changed (Phase 2)
- `credits_adjusted` - Manual credit adjustment (Phase 2)

---

## 🚀 What You Can Do Now

### **1. Generate Codes**
URL: `/admin/ltd/codes/generate`

**Features:**
- Create 1-1000 codes per batch
- Custom prefixes (e.g., `APPSUMO-T3-`)
- Set max redemptions per code (1 = single use, 5 = team code)
- Optional expiry dates
- Add notes for tracking
- Download as CSV

**Example:**
```javascript
// Generate 100 single-use Tier 3 codes
Tier: 3
Quantity: 100
Prefix: APPSUMO-T3-
Max Uses: 1
Expires: 2025-12-31
Notes: "AppSumo Launch Batch #1"

// Result: APPSUMO-T3-A1B2C3D4, APPSUMO-T3-E5F6G7H8, etc.
```

---

### **2. Manage Codes**
URL: `/admin/ltd/codes`

**Features:**
- View all codes with pagination
- Search by code or notes
- Filter by tier (1-4)
- Filter by status:
  - **Active** - Ready to redeem
  - **Partial** - Partially redeemed (multi-use codes)
  - **Redeemed** - Fully redeemed
  - **Expired** - Past expiry date
  - **Disabled** - Manually deactivated
- Toggle active/inactive status
- Delete unredeemed codes
- Export to CSV

**Code Status Logic:**
```
Active    = is_active=true AND not expired AND current < max
Partial   = current > 0 AND current < max
Redeemed  = current >= max
Expired   = expires_at <= NOW()
Disabled  = is_active=false
```

---

### **3. View Dashboard**
URL: `/admin/ltd/overview`

**Metrics:**
- Total revenue (calculated from codes)
- Active codes count
- Redeemed codes count
- Redemption rate
- Tier distribution chart
- Status summary

---

## 🔐 Admin Access

### **Current Admins:**
- ✅ saasmamu@gmail.com

### **Add More Admins:**
Edit `src/lib/admin-auth.ts`:
```typescript
const ADMIN_EMAILS = [
  'saasmamu@gmail.com',
  'admin2@example.com',  // Add more here
];
```

Or update database directly:
```sql
UPDATE users SET role = 'admin' WHERE email = 'newadmin@example.com';
```

---

## 📊 Audit Trail

All admin actions are logged in `admin_ltd_actions`:

```sql
-- View recent admin actions
SELECT 
  a.action_type,
  a.target_id,
  a.details,
  a.created_at,
  u.email as admin_email
FROM admin_ltd_actions a
JOIN users u ON u.id = a.admin_user_id
ORDER BY a.created_at DESC
LIMIT 50;

-- View code generation history
SELECT 
  details->>'tier' as tier,
  details->>'quantity' as quantity,
  details->>'batchId' as batch_id,
  created_at
FROM admin_ltd_actions
WHERE action_type = 'codes_generated'
ORDER BY created_at DESC;
```

---

## 🎯 Usage Examples

### **Example 1: AppSumo Launch**
```
1. Generate 500 Tier 3 codes
2. Prefix: APPSUMO-T3-
3. Max Uses: 1
4. Expires: 2025-12-31
5. Notes: "AppSumo Launch - December 2025"
6. Download CSV
7. Upload to AppSumo dashboard
```

### **Example 2: Team Codes**
```
1. Generate 10 Tier 4 codes
2. Prefix: TEAM-T4-
3. Max Uses: 5 (can be redeemed 5 times)
4. No expiry
5. Notes: "Agency team codes - 5 seats each"
```

### **Example 3: Emergency Code**
```
1. Generate 1 code
2. Tier 2
3. Prefix: SUPPORT-T2-
4. Max Uses: 1
5. Notes: "Support ticket #1234 - Customer issue"
6. Send code directly to customer
```

---

## 🔧 Advanced Features

### **Multi-Use Codes**
Codes can now be used multiple times:
```sql
-- Create a code that can be used 10 times
INSERT INTO ltd_codes (code, tier, max_redemptions)
VALUES ('BULK-T3-ABCD1234', 3, 10);

-- As users redeem:
-- current_redemptions: 0 -> 1 -> 2 -> ... -> 10
-- Status changes from "Active" -> "Partial" -> "Redeemed"
```

### **Batch Tracking**
All codes in a batch share a `batch_id`:
```sql
-- Find all codes from a specific batch
SELECT * FROM ltd_codes 
WHERE batch_id = 'some-uuid-here'
ORDER BY code;

-- Get batch statistics
SELECT 
  batch_id,
  COUNT(*) as total_codes,
  SUM(CASE WHEN current_redemptions > 0 THEN 1 ELSE 0 END) as redeemed_count,
  AVG(current_redemptions::FLOAT / max_redemptions) * 100 as redemption_rate
FROM ltd_codes
WHERE batch_id IS NOT NULL
GROUP BY batch_id
ORDER BY created_at DESC;
```

### **Expiry Management**
```sql
-- Find codes expiring soon (next 30 days)
SELECT code, tier, expires_at 
FROM ltd_codes
WHERE expires_at BETWEEN NOW() AND NOW() + INTERVAL '30 days'
  AND current_redemptions < max_redemptions
ORDER BY expires_at;

-- Extend expiry for a batch
UPDATE ltd_codes
SET expires_at = '2026-12-31'
WHERE batch_id = 'some-uuid-here';
```

---

## 🐛 Troubleshooting

### **Issue: Can't access admin dashboard**
**Solution:**
1. Verify your email is in the admin whitelist
2. Check database: `SELECT role FROM users WHERE email = 'your@email.com'`
3. If role is not 'admin', run: `UPDATE users SET role = 'admin' WHERE email = 'your@email.com'`

### **Issue: Codes not generating**
**Solution:**
1. Check browser console for errors
2. Verify all columns exist: `\d ltd_codes` in psql
3. Ensure quantity is between 1-1000
4. Check API logs for specific error

### **Issue: CSV download not working**
**Solution:**
1. Check browser's download settings
2. Try "Generate Codes" first, then export
3. Verify batch_id was created

---

## 📈 Database Indexes

For optimal performance, these indexes are in place:

```sql
-- Original indexes
CREATE INDEX idx_ltd_codes_code ON ltd_codes(code);
CREATE INDEX idx_ltd_codes_is_redeemed ON ltd_codes(is_redeemed);
CREATE INDEX idx_ltd_codes_tier ON ltd_codes(tier);
CREATE INDEX idx_ltd_codes_batch_id ON ltd_codes(batch_id);

-- New admin indexes
CREATE INDEX idx_ltd_codes_is_active ON ltd_codes(is_active);
CREATE INDEX idx_ltd_codes_current_redemptions ON ltd_codes(current_redemptions);
CREATE INDEX idx_admin_actions_admin_id ON admin_ltd_actions(admin_user_id);
CREATE INDEX idx_admin_actions_created_at ON admin_ltd_actions(created_at DESC);
```

---

## ✅ Verification

Run these queries to verify everything is set up correctly:

```sql
-- Check admin user
SELECT email, role FROM users WHERE role = 'admin';

-- Check ltd_codes columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ltd_codes'
ORDER BY column_name;

-- Check admin actions table exists
SELECT COUNT(*) FROM admin_ltd_actions;

-- Verify indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('ltd_codes', 'admin_ltd_actions', 'users');
```

Expected results:
- ✅ At least 1 admin user (saasmamu@gmail.com)
- ✅ 14 columns in ltd_codes table
- ✅ admin_ltd_actions table exists
- ✅ 10+ indexes on related tables

---

## 🎉 You're All Set!

**Admin Dashboard:** `/admin/ltd/overview`

**Next Steps:**
1. ✅ Generate your first batch of codes
2. ✅ Test code redemption flow
3. ✅ Monitor usage in the dashboard
4. 🔜 Phase 2: User Management & Analytics

---

**Last Updated:** ${new Date().toISOString()}





