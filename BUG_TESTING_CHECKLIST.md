# 🐛 Bug Testing Checklist - Polish Phase

Use this checklist to track bugs as you test each feature.

---

## ✅ FIXED BUGS

### 1. ✅ Viral Hooks Analytics - Schema Mismatch - FIXED
**Issue:** Failed to fetch analytics  
**Root Cause:** Database schema mismatch (UUID vs VARCHAR)  
**Fixed:** `28-fix-viral-hooks-user-id.sql` migration  
**Tested:** ✅ Fixed  
**Doc:** `VIRAL_HOOKS_FIX_COMPLETE.md`

### 2. ✅ Viral Hooks Analytics - Null Values - FIXED
**Issue:** `TypeError: Cannot read properties of null (reading 'toLocaleString')`  
**Root Cause:** SQL aggregate functions return null when no data exists  
**Fixed:** 
- API: Added COALESCE to SQL queries
- Frontend: Added safe number formatters
**Tested:** ⏳ Pending user testing  
**Doc:** `VIRAL_HOOKS_NULL_FIX.md`

### 3. ✅ Competitor Analysis - Null/NaN Values - FIXED
**Issue:** `Internal server error` when adding Instagram competitors  
**Database Error:** `null value in column "name" violates not-null constraint`  
**Root Cause:** 
- Instagram API returns null for `full_name`
- Division by zero when posts.length = 0
**Fixed:** 
- Added name fallback chain (full_name → username → 'Unknown')
- Added default values for all numeric fields
- Added division by zero protection
- Added NaN/Infinity validation for engagement rate
**Tested:** ⏳ Pending user testing  
**Doc:** `COMPETITOR_ANALYSIS_NULL_FIX.md`

### 4. ✅ Twitter Competitor - API Limitation Handled (UX Improvement)
**Issue:** Users had to know numeric Twitter User IDs  
**User Feedback:** "it's hard to know competitor IDs to analyze"  
**Root Cause:** API subscription doesn't include username-to-ID conversion endpoint  
**Solution:** 
- Improved UI with clear "Twitter User ID" label
- Added prominent instruction box with 4-step guide
- Enhanced error messages with helpful guidance and examples
- Shows how to find ID: Profile → View Source → Search "rest_id"
**Result:** Users now have clear guidance on what's needed and how to find it  
**Tested:** ⏳ Pending user testing  
**Doc:** `TWITTER_USERNAME_API_LIMITATION.md`

---

## 🧪 FEATURES TO TEST

### Core Features
- [ ] **Content Repurposing** (`/dashboard/repurpose`)
  - [ ] Text input
  - [ ] URL input
  - [ ] YouTube input
  - [ ] File upload
  - [ ] Generate for all platforms
  - [ ] Copy to clipboard
  - [ ] Save to history

- [ ] **Trending Topics** (`/dashboard/trends`)
  - [ ] Load trending topics
  - [ ] Filter by platform
  - [ ] Search topics
  - [ ] Generate from trend
  - [ ] YouTube trending videos

- [ ] **Templates** (`/dashboard/templates`)
  - [ ] Load templates
  - [ ] Tier 1: See 15 templates
  - [ ] Tier 2: See 40 templates
  - [ ] Tier 3+: See 60+ templates
  - [ ] Use template
  - [ ] Create custom template (Tier 2+)

- [ ] **Content History** (`/dashboard/history`)
  - [ ] View all generated content
  - [ ] Filter by platform
  - [ ] Filter by date
  - [ ] Export data
  - [ ] Delete items

### Tier 2+ Features
- [x] **Viral Hook Generator** (`/dashboard/hooks`)
  - [x] Generate hooks
  - [x] Copy hooks
  - [x] Different niches
  - [x] Different platforms
  - [x] Analytics page - **FIXED** ✅

- [ ] **Content Scheduling** (`/dashboard/schedule`)
  - [ ] Create scheduled post
  - [ ] View calendar
  - [ ] Edit scheduled post
  - [ ] Delete scheduled post
  - [ ] Auto-posting (if Ayrshare configured)

### Tier 3+ Features
- [ ] **AI Performance Predictions** (Modal in repurpose page)
  - [ ] Predict performance
  - [ ] See optimization tips
  - [ ] Different platforms
  - [ ] Upgrade prompt for Tier 1-2

- [ ] **AI Chat Assistant** (`/dashboard/chat`)
  - [ ] Send messages
  - [ ] Stream responses
  - [ ] Context awareness
  - [ ] Credit deduction
  - [ ] Upgrade prompt for Tier 1-2

- [ ] **Style Training** (`/dashboard/style-training`)
  - [ ] Create style profile
  - [ ] Train with content
  - [ ] Test style
  - [ ] Use in generation
  - [ ] Hidden for Tier 1-2 ✅
  - [ ] Upgrade prompt shows

- [ ] **Bulk Generation** (`/dashboard/bulk-generate`)
  - [ ] Generate 5+ pieces at once
  - [ ] Export all
  - [ ] Credit calculation
  - [ ] Upgrade prompt for Tier 1-2

### Tier 4+ Features
- [ ] **Team Collaboration** (`/dashboard/team`)
  - [ ] Invite team members
  - [ ] View team
  - [ ] Remove members
  - [ ] Shared templates
  - [ ] Upgrade prompt for Tier 1-3

### Customer Experience Features
- [ ] **Onboarding** (First-time users)
  - [ ] Welcome modal appears
  - [ ] Skip onboarding
  - [ ] Complete onboarding
  - [ ] Doesn't show again

- [ ] **Notifications** (Bell icon in header)
  - [ ] Load notifications
  - [ ] Mark as read
  - [ ] Clear all
  - [ ] No "relation not exist" error ✅

- [ ] **User Feedback** (Floating button)
  - [ ] Submit feedback
  - [ ] Rating 1-5
  - [ ] Category selection
  - [ ] Message input
  - [ ] Success confirmation ✅

- [ ] **Pro Tips** (Dashboard)
  - [ ] Tip banner shows
  - [ ] Dismiss tip
  - [ ] Rotating tips widget

- [ ] **Credit Optimization** (Dashboard)
  - [ ] Shows suggestions
  - [ ] Actionable tips
  - [ ] Platform-specific advice

- [ ] **Tutorials** (Interactive tooltips)
  - [ ] Tooltips appear
  - [ ] Skip tutorial
  - [ ] Complete tutorial
  - [ ] Doesn't show again

### Admin Features
- [ ] **Admin Dashboard** (`/admin`)
  - [ ] Stats overview
  - [ ] Quick actions
  - [ ] Feedback card visible ✅

- [ ] **User Management** (`/admin/users`)
  - [ ] View all users
  - [ ] Filter users
  - [ ] View user details
  - [ ] Adjust credits
  - [ ] Upgrade users

- [ ] **LTD Management** (`/admin/ltd`)
  - [ ] Generate codes
  - [ ] View codes
  - [ ] Redemption stats
  - [ ] User history

- [ ] **Feedback Management** (`/admin/feedback`)
  - [ ] View feedback ✅
  - [ ] Filter by status
  - [ ] Filter by rating
  - [ ] Respond to feedback
  - [ ] Update status

- [ ] **Analytics** (`/admin/analytics`)
  - [ ] Platform analytics
  - [ ] Hook analytics
  - [ ] Prediction analytics
  - [ ] Revenue analytics

- [ ] **Discounts** (`/admin/discounts`)
  - [ ] Create discount
  - [ ] View discounts
  - [ ] Edit discount
  - [ ] Delete discount
  - [ ] Usage tracking

---

## 🔍 COMMON ISSUES TO CHECK

### Database Errors
- [ ] No "relation does not exist" errors
- [ ] No UUID/VARCHAR type mismatches
- [ ] All migrations run successfully

### Tier Gating
- [ ] Tier 1 sees correct features
- [ ] Tier 2 sees correct features
- [ ] Tier 3 sees correct features
- [ ] Tier 4 sees correct features
- [ ] Upgrade prompts are beautiful (not error messages)
- [ ] Upgrade CTAs are clear

### Credit System
- [ ] Credits deduct correctly
- [ ] Credit balance updates
- [ ] Insufficient credits shows proper message
- [ ] Credit costs match tier
- [ ] Credit history tracks usage

### Performance
- [ ] Pages load quickly (< 3 seconds)
- [ ] No console errors
- [ ] No webpack warnings
- [ ] Images load properly
- [ ] Animations smooth

### UI/UX
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Responsive on desktop
- [ ] Colors consistent
- [ ] Fonts readable
- [ ] Buttons work
- [ ] Forms validate
- [ ] Loading states show

### API Errors
- [ ] 401 Unauthorized handled gracefully
- [ ] 403 Forbidden shows upgrade prompt
- [ ] 404 Not Found shows proper message
- [ ] 500 Server Error shows user-friendly message
- [ ] Network errors handled

---

## 📝 BUG REPORT TEMPLATE

When you find a bug, use this format:

```
### Bug: [Short Description]
**Page:** /dashboard/[page]
**User Tier:** Tier X
**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Result:**
What should happen

**Actual Result:**
What actually happens

**Error Message:**
[Copy exact error from console or UI]

**Screenshot:**
[Attach if helpful]

**Priority:** High / Medium / Low
```

---

## 🎯 Testing Strategy

1. **Test as different tiers:**
   - Test with Tier 1 account
   - Test with Tier 2 account
   - Test with Tier 3 account
   - Test with Tier 4 account

2. **Test edge cases:**
   - Empty inputs
   - Very long inputs
   - Special characters
   - Invalid URLs
   - Expired sessions

3. **Test error handling:**
   - No internet connection
   - Database timeout
   - API rate limits
   - Insufficient credits
   - Unauthorized access

4. **Test performance:**
   - Large content inputs
   - Multiple simultaneous requests
   - Browser back/forward
   - Refresh page
   - Multiple tabs open

---

## ✅ When Feature is Tested

Mark with:
- ✅ **PASS** - Works perfectly
- ⚠️ **WARNING** - Works but has minor issues
- ❌ **FAIL** - Broken, needs fixing
- ⏳ **PENDING** - Not tested yet

---

## 🚀 Next Steps After Testing

1. **Document all bugs** in this file
2. **Prioritize fixes:**
   - P0: Breaks core functionality (fix immediately)
   - P1: Major feature broken (fix soon)
   - P2: Minor issue (fix before launch)
   - P3: Nice to have (fix later)

3. **Fix bugs one by one**
4. **Retest after each fix**
5. **Update this checklist**
6. **Move to deployment when all P0/P1 fixed**

---

**Last Updated:** [Date/Time]  
**Tester:** [Your Name]  
**Environment:** Development / Staging / Production

