# 🔧 Quick Fix: User ID Type Mismatch

## 🐛 The Problem

The `competitors` and `content_gaps` tables were created with `user_id UUID`, but your Google OAuth provides user IDs like `"113549674961098167485"` (not UUID format).

**Error:**
```
invalid input syntax for type uuid: "113549674961098167485"
```

---

## ✅ The Solution (2 minutes)

### **Option 1: Using Neon Console (Recommended)**

1. **Go to Neon Console**: https://console.neon.tech
2. **Select your project**: "repurpose ai"
3. **Open SQL Editor**
4. **Copy and paste this SQL**:

```sql
-- Fix user_id column type
ALTER TABLE competitors 
  ALTER COLUMN user_id TYPE VARCHAR(255);

ALTER TABLE content_gaps 
  ALTER COLUMN user_id TYPE VARCHAR(255);

-- Verify it worked
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('competitors', 'content_gaps')
  AND column_name = 'user_id';
```

5. **Click "Run"**
6. **Done!** ✅

---

### **Option 2: Using SQL File**

If you have a direct database connection:

```bash
psql $DATABASE_URL -f sql-queries/15-fix-user-id-type.sql
```

---

## 🧪 **Test After Fix**

1. **Restart your Next.js dev server**:
   ```bash
   npm run dev
   ```

2. **Go to**: `http://localhost:3000/dashboard/competitors`

3. **Add a competitor**:
   - Platform: Twitter
   - User ID: `44196397`
   - Click "Analyze Competitor"

4. **Expected Result**: ✅ Success! Competitor added.

---

## 📊 **What This Does**

Changes the column type from:
```sql
user_id UUID  -- ❌ Only accepts format: 123e4567-e89b-12d3-a456-426614174000
```

To:
```sql
user_id VARCHAR(255)  -- ✅ Accepts any string: "113549674961098167485"
```

This matches your existing `users` table which uses `google_id VARCHAR(255)`.

---

## 🎯 **Quick Summary**

1. Open Neon SQL Editor
2. Run the ALTER TABLE commands above
3. Restart your dev server
4. Test adding a competitor
5. Celebrate! 🎉

---

**That's it!** The Twitter API is working perfectly. This is just a quick database schema fix.

