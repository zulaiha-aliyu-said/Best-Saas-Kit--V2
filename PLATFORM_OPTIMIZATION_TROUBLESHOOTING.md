# 🔧 Platform Optimization - Troubleshooting Guide

## Issues Fixed

### ✅ Issue 1: Toggle Resets After Page Refresh
**Problem**: When you toggle platform optimization ON and refresh the page, it toggles OFF automatically.

**Root Cause**: The `platformOptimizationEnabled` field wasn't being saved to or loaded from the database properly. The API route was missing the proper field name conversion between camelCase (frontend) and snake_case (database).

**Fix Applied**:
- Updated `/api/users/preferences` GET endpoint to convert `platform_optimization_enabled` → `platformOptimizationEnabled`
- Updated `/api/users/preferences` POST endpoint to convert `platformOptimizationEnabled` → `platform_optimization_enabled`
- Added the field to default values

### ✅ Issue 2: Optimization Not Being Applied
**Problem**: Even when toggle is ON, the optimization doesn't seem to work.

**Root Cause**: Same as Issue 1 - the setting wasn't being persisted or loaded correctly.

**Fix Applied**:
- Fixed the API route to properly save and load the setting
- Added console logging to track when optimization is applied

## Verification Steps

### Step 1: Clear Browser Cache
First, make sure you're not using cached data:
```
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Clear site data"
4. Refresh the page
```

### Step 2: Verify Database Column Exists
Run this SQL query to check if the column exists:
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'user_preferences' 
  AND column_name = 'platform_optimization_enabled';
```

**Expected Result**: Should return one row showing the column exists with type `boolean` and default `false`.

If it doesn't exist, run:
```bash
psql -d your_database -f sql-queries/13-create-platform-optimization-schema.sql
```

### Step 3: Test Settings Save/Load

1. **Open Settings Page**:
   - Go to Dashboard → Settings → Content tab
   - Open DevTools Console (F12)

2. **Toggle Platform Optimization ON**:
   - Watch the console for network requests
   - Click "Save Changes"
   
3. **Check Network Tab**:
   - You should see a POST request to `/api/users/preferences`
   - Response should include `"platformOptimizationEnabled": true`

4. **Refresh the Page**:
   - You should see a GET request to `/api/users/preferences`
   - Response should include `"platformOptimizationEnabled": true`
   - Toggle should remain ON after page loads

### Step 4: Verify Optimization is Applied

1. **Enable Platform Optimization**:
   - Dashboard → Settings → Content
   - Toggle ON
   - Save changes

2. **Generate Content**:
   - Go to Dashboard → Repurpose
   - Enter some long text (>280 characters)
   - Select "Twitter/X" as platform
   - Click Generate

3. **Check Server Console**:
   You should see these logs:
   ```
   🎯 Platform Optimization Enabled: true
   ✨ Applying platform optimization...
   ✅ Platform optimization applied. Processing time: XX ms
   📊 Optimizations: ['x']
   ```

4. **Check Generated Content**:
   - If content was >280 chars, it should be split into a thread
   - You should see numbered tweets (1/3, 2/3, 3/3)
   - First tweet should have 🧵 emoji

### Step 5: Verify Analytics Tracking

1. **Generate some content** with optimization enabled
2. **Check database**:
```sql
SELECT COUNT(*) as optimization_count
FROM platform_optimization_analytics
WHERE user_id = YOUR_USER_ID;
```

**Expected**: Should show count > 0

## Common Issues & Solutions

### Issue: "Column platform_optimization_enabled does not exist"

**Solution**: Run the database migration:
```bash
psql -d your_database -f sql-queries/13-create-platform-optimization-schema.sql
```

### Issue: Toggle saves but doesn't persist after refresh

**Symptoms**: 
- POST request succeeds
- GET request returns `platformOptimizationEnabled: false`

**Solution**: Check if the database update actually worked:
```sql
-- Replace with your user ID
SELECT platform_optimization_enabled 
FROM user_preferences 
WHERE user_id = YOUR_USER_ID;
```

If it's NULL or false when it should be true, the issue is in the database update function.

### Issue: Optimization not applying even though toggle is ON

**Debug Steps**:

1. **Check console logs** when generating content:
   ```
   Expected: 🎯 Platform Optimization Enabled: true
   If you see: 🎯 Platform Optimization Enabled: false
   → The setting isn't being loaded correctly
   ```

2. **Verify user preferences are being fetched**:
   Add this to your code temporarily:
   ```typescript
   const userPrefs = await getUserPreferences(user.id);
   console.log('Full user preferences:', userPrefs);
   ```

3. **Check if optimization function is being called**:
   Look for this log:
   ```
   ✨ Applying platform optimization...
   ```
   
   If missing → `platformOptimizationEnabled` is false

### Issue: API Route Returns Wrong Field Names

**Symptoms**: 
- Settings page shows undefined values
- Console errors about missing properties

**Solution**: 
Ensure the API route properly converts between snake_case and camelCase. The updated route should have:

```typescript
// GET - Convert database (snake_case) to frontend (camelCase)
const frontendPreferences = {
  platformOptimizationEnabled: preferences.platform_optimization_enabled,
  // ... other fields
};

// POST - Convert frontend (camelCase) to database (snake_case)
const dbPreferences = {
  platform_optimization_enabled: Boolean(preferences.platformOptimizationEnabled),
  // ... other fields
};
```

## Testing Checklist

Use this checklist to verify everything is working:

- [ ] Database column exists (`platform_optimization_enabled`)
- [ ] Settings page loads without errors
- [ ] Toggle can be turned ON
- [ ] Clicking "Save Changes" shows success message
- [ ] Refreshing page keeps toggle ON
- [ ] Console shows "🎯 Platform Optimization Enabled: true"
- [ ] Content >280 chars creates Twitter thread
- [ ] LinkedIn content has optimized hook
- [ ] Instagram content has more hashtags
- [ ] Console shows "✅ Platform optimization applied"
- [ ] Analytics are being tracked in database

## Debug Console Commands

Open browser console on Settings page and run:

```javascript
// Check current preferences
fetch('/api/users/preferences')
  .then(r => r.json())
  .then(d => console.log('Current preferences:', d));

// Manually enable optimization
fetch('/api/users/preferences', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ platformOptimizationEnabled: true })
})
  .then(r => r.json())
  .then(d => console.log('Save result:', d));
```

## Database Queries for Debugging

```sql
-- Check if user has preferences
SELECT * FROM user_preferences WHERE user_id = YOUR_USER_ID;

-- Check if column exists
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'user_preferences';

-- Check optimization analytics
SELECT * FROM platform_optimization_analytics 
WHERE user_id = YOUR_USER_ID 
ORDER BY created_at DESC 
LIMIT 10;

-- Get platform breakdown
SELECT * FROM get_user_platform_breakdown(YOUR_USER_ID);
```

## Still Not Working?

1. **Restart the development server**:
   ```bash
   # Stop the server (Ctrl+C)
   # Clear Next.js cache
   rm -rf .next
   # Restart
   npm run dev
   ```

2. **Check all files were updated**:
   - `src/app/api/users/preferences/route.ts` - Should have the conversion logic
   - `src/lib/database.ts` - Should have `platform_optimization_enabled` field
   - `sql-queries/13-create-platform-optimization-schema.sql` - Should exist

3. **Verify imports**:
   ```typescript
   // In repurpose/route.ts
   import { getUserPreferences, insertOptimizationAnalytics } from "@/lib/database";
   import { optimizeForPlatform, Platform, countCharacters, countWords } from "@/lib/platform-optimizer";
   ```

4. **Check for TypeScript errors**:
   ```bash
   npm run build
   ```

## Expected Behavior After Fixes

### When Toggle is OFF:
- Content generates normally
- No optimization applied
- No threads created
- Console shows: "⏭️ Platform optimization is disabled"

### When Toggle is ON:
- Content is optimized per platform
- Twitter >280 chars → Thread created
- LinkedIn → First 140 chars optimized
- Instagram → 10-15 hashtags added
- Email → Subject line optimized
- Console shows: "✅ Platform optimization applied"
- Analytics tracked in database

## Success Indicators

✅ Toggle persists after page refresh
✅ Console shows optimization status
✅ Long tweets become threads
✅ Analytics database has entries
✅ Preview components show formatted content
✅ Character counter works
✅ Warnings display for rule violations

---

**Last Updated**: After fixing field name conversion issues
**Status**: All known issues resolved ✅






