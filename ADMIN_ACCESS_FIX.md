# Admin Access Fix

## Problem
You're being redirected from `/admin/ltd` to the dashboard because your user account doesn't have the `admin` role in the database.

## Root Cause
The `checkAdminAccess()` function checks TWO things:
1. ✅ Your email is in the whitelist (`src/lib/admin-auth.ts`)
2. ❌ Your database role must be set to `'admin'`

You likely have #1 (email whitelisted) but not #2 (database role).

## ✅ Quick Fix

### Step 1: Run SQL to Set Admin Role

**Option A: Using Neon Console (Easiest)**
1. Go to your Neon dashboard: https://console.neon.tech/
2. Select your project
3. Click "SQL Editor"
4. Copy and paste this SQL:
```sql
UPDATE users 
SET role = 'admin' 
WHERE email IN (
  'saasmamu@gmail.com',
  'zulaihaaliyu440@gmail.com'
);

-- Verify the update
SELECT id, email, name, role, created_at 
FROM users 
WHERE email IN (
  'saasmamu@gmail.com',
  'zulaihaaliyu440@gmail.com'
);
```
5. Click "Run"
6. You should see your user(s) with `role = 'admin'`

**Option B: Using SQL File**
The SQL has been saved to `sql-queries/20-set-admin-role.sql`

### Step 2: Test Access
1. Refresh your browser or restart the dev server
2. Try accessing `/admin/ltd` again
3. You should now have access! 🎉

## What I Fixed

### 1. Fixed Admin Layout (`src/app/admin/layout.tsx`)
Changed from:
```typescript
const adminUser = await requireAdminAccess();
return <AdminClient adminUser={adminUser}>{children}</AdminClient>;
```

To:
```typescript
const adminUser = await checkAdminAccess();
if (!adminUser) {
  redirect('/dashboard');
}
return <AdminClient adminUser={adminUser}>{children}</AdminClient>;
```

**Why:** The `requireAdminAccess()` function returns a response object with `success` field, but we needed the actual admin user object. Now using `checkAdminAccess()` which returns the user or null.

## Verify Admin Emails

Check `src/lib/admin-auth.ts` lines 10-14:
```typescript
const ADMIN_EMAILS = [
  'saasmamu@gmail.com',
  'zulaihaaliyu440@gmail.com',
  // Add more admin emails here
];
```

Make sure YOUR email is in this list!

## Testing

After running the SQL:
1. ✅ Navigate to `/admin` - should work
2. ✅ Navigate to `/admin/ltd` - should work
3. ✅ Navigate to `/admin/ltd/overview` - should work
4. ✅ Navigate to `/admin/ltd/codes` - should work

## Troubleshooting

### Still Getting Redirected?
1. **Check your email:** Sign in and verify you're using the correct Google account
2. **Check database:** Run this to see your current role:
```sql
SELECT id, email, role FROM users WHERE email = 'your-email@gmail.com';
```
3. **Check server logs:** Look for error messages in the console
4. **Clear session:** Sign out and sign back in

### Error: "column 'role' does not exist"?
Run this to add the role column:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
```

### Need to Add More Admin Emails?
Edit `src/lib/admin-auth.ts` and add emails to the `ADMIN_EMAILS` array.

## Files Modified
- ✅ `src/app/admin/layout.tsx` - Fixed admin access check
- ✅ `sql-queries/20-set-admin-role.sql` - SQL to set admin role
- ✅ This guide created

## Next Steps
Once you've set your admin role:
1. Access all admin pages: `/admin`, `/admin/ltd`, etc.
2. Manage LTD codes and users
3. View analytics and reports



