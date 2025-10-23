# 🔒 Tier-Based Feature Gating Implementation

## Summary of Features & Tier Requirements

Based on `APPSUMO_LTD_PRICING.md`:

### ✅ **TIER 1 ($59) - 100 credits/month**
- Content Repurposing (4 platforms, 1 credit per platform)
- 15 Premium Templates
- Trending Topics (basic hashtags)
- 30-day Analytics
- 90-day Content History

### ✅ **TIER 2 ($139) - 300 credits/month**
Everything in Tier 1, PLUS:
- **Viral Hook Generator** (50+ patterns, 2 credits) ✅ DONE
- **Content Scheduling** (30 posts/month, 0.5 credits)
- **YouTube Trending Videos** with thumbnails
- 40+ Premium Templates + 5 custom
- 6-month Analytics & History
- 2x Faster Processing

### ✅ **TIER 3 ($249) - 750 credits/month**
Everything in Tier 2, PLUS:
- **AI Performance Predictions** (1 credit)
- **AI Chat Assistant** (200 messages/month, 0.5 credits per 10 msgs)
- **"Talk Like Me" Style Training** (1 profile, 5 credits)
- **Extended Scheduling** (100 posts/month)
- **Bulk Generation** (5 pieces at once)
- 60+ Templates + unlimited custom
- Unlimited Analytics History
- 3x Faster Processing
- No Watermarks

### ✅ **TIER 4 ($449) - 2000 credits/month**
Everything in Tier 3, PLUS:
- **Team Collaboration** (3 members)
- **Unlimited AI Chat** (Premium models: GPT-4o, Claude)
- **Advanced Style Training** (3 profiles)
- **Unlimited Scheduling**
- **API Access** (2,500 calls/month)
- **White-label Options** (remove branding)
- 5x Faster Processing
- Dedicated Account Manager

---

## Implementation Plan

### ✅ **Phase 1: Viral Hooks** (COMPLETED)
- ✅ Added Tier 2+ gating to `/api/hooks/generate`
- ✅ Frontend shows upgrade prompt for Tier 1 users

### 🔨 **Phase 2: Content Scheduling** (IN PROGRESS)
**Files to update:**
- `src/app/api/schedule/route.ts` - Add tier gating
- `src/app/api/schedule/post/route.ts` - Add post count limits
- `src/app/dashboard/schedule/page.tsx` - Show tier-based limits

**Logic:**
- Tier 1: ❌ Not available
- Tier 2: ✅ 30 posts/month (0.5 credits each)
- Tier 3: ✅ 100 posts/month (0.5 credits each)
- Tier 4: ✅ Unlimited posts (0.5 credits each)

### 🔨 **Phase 3: AI Chat** (IN PROGRESS)
**Files to update:**
- `src/app/api/chat/route.ts` - Add tier gating + message limits
- `src/app/api/chat/stream/route.ts` - Add tier gating
- `src/components/chat/chat-interface.tsx` - Show message count

**Logic:**
- Tier 1-2: ❌ Not available
- Tier 3: ✅ 200 messages/month (0.5 credits per 10 msgs)
- Tier 4: ✅ Unlimited messages (0.5 credits per 10 msgs) + Premium models

### 🔨 **Phase 4: Predictive Performance** (IN PROGRESS)
**Files to update:**
- `src/app/api/ai/predict-performance/route.ts` - Add tier gating
- `src/components/ai/predictive-performance-modal.tsx` - Show upgrade prompt

**Logic:**
- Tier 1-2: ❌ Not available
- Tier 3+: ✅ Available (1 credit per prediction)

### 🔨 **Phase 5: Templates** (IN PROGRESS)
**Files to update:**
- `src/app/api/captions/templates/route.ts` - Add tier-based template limits
- `src/app/dashboard/templates/page.tsx` - Show tier-based template count

**Logic:**
- Tier 1: ✅ 15 premium templates
- Tier 2: ✅ 40 premium templates + 5 custom
- Tier 3: ✅ 60 premium templates + unlimited custom
- Tier 4: ✅ Same as Tier 3

### 📋 **Phase 6: Style Training** (NEEDS UI)
**Logic:**
- Tier 1-2: ❌ Not available
- Tier 3: ✅ 1 writing style profile (5 credits per training)
- Tier 4: ✅ 3 writing style profiles (5 credits per training)

### 📋 **Phase 7: Bulk Generation** (NEEDS IMPLEMENTATION)
**Logic:**
- Tier 1-2: ❌ Not available (1 piece only)
- Tier 3+: ✅ Generate up to 5 pieces at once

### 📋 **Phase 8: Team Collaboration** (NEEDS IMPLEMENTATION)
**Logic:**
- Tier 1-3: ❌ Not available
- Tier 4: ✅ Up to 3 team members

### 📋 **Phase 9: API Access** (NEEDS IMPLEMENTATION)
**Logic:**
- Tier 1-3: ❌ Not available
- Tier 4: ✅ 2,500 calls/month

### 📋 **Phase 10: White-label** (NEEDS IMPLEMENTATION)
**Logic:**
- Tier 1-3: ❌ Has watermark
- Tier 4: ✅ Remove branding

---

## Credit Costs by Tier

| Feature | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---------|--------|--------|--------|--------|
| Content Repurposing | 1/platform | 1/platform | 1/platform | 1/platform |
| Viral Hooks | ❌ | 2 | 2 | 2 |
| Scheduling | ❌ | 0.5 | 0.5 | 0.5 |
| AI Chat (per 10 msgs) | ❌ | ❌ | 0.5 | 0.5 |
| Performance Prediction | ❌ | ❌ | 1 | 1 |
| Style Training | ❌ | ❌ | 5 | 5 |
| Bulk Generation | ❌ | ❌ | 0.8-0.9 | 0.8-0.9 |

---

## Database Tracking

### New Tables Needed:
```sql
-- Track scheduled posts count per user per month
CREATE TABLE IF NOT EXISTS user_monthly_scheduling_usage (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id),
  month_year VARCHAR(7) NOT NULL, -- e.g. '2025-10'
  scheduled_count INTEGER DEFAULT 0,
  UNIQUE(user_id, month_year)
);

-- Track AI chat messages per user per month
CREATE TABLE IF NOT EXISTS user_monthly_chat_usage (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id),
  month_year VARCHAR(7) NOT NULL,
  message_count INTEGER DEFAULT 0,
  UNIQUE(user_id, month_year)
);

-- Track team members (Tier 4)
CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  owner_user_id VARCHAR(255) NOT NULL REFERENCES users(id),
  member_email VARCHAR(255) NOT NULL,
  member_user_id VARCHAR(255) REFERENCES users(id),
  role VARCHAR(50) DEFAULT 'member',
  status VARCHAR(50) DEFAULT 'invited',
  invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  accepted_at TIMESTAMP
);

-- Track API usage (Tier 4)
CREATE TABLE IF NOT EXISTS api_usage (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id),
  month_year VARCHAR(7) NOT NULL,
  api_calls INTEGER DEFAULT 0,
  UNIQUE(user_id, month_year)
);
```

---

## Helper Functions

### Check Monthly Usage:
```typescript
async function getMonthlySchedulingUsage(userId: string): Promise<number> {
  const monthYear = new Date().toISOString().slice(0, 7); // '2025-10'
  const result = await pool.query(
    `SELECT scheduled_count FROM user_monthly_scheduling_usage 
     WHERE user_id = $1 AND month_year = $2`,
    [userId, monthYear]
  );
  return result.rows[0]?.scheduled_count || 0;
}

async function getMonthlyC

hatUsage(userId: string): Promise<number> {
  const monthYear = new Date().toISOString().slice(0, 7);
  const result = await pool.query(
    `SELECT message_count FROM user_monthly_chat_usage 
     WHERE user_id = $1 AND month_year = $2`,
    [userId, monthYear]
  );
  return result.rows[0]?.message_count || 0;
}
```

---

## Next Steps

1. ✅ Complete viral hooks tier gating
2. 🔨 Add scheduling tier gating + monthly limits
3. 🔨 Add AI chat tier gating + message limits
4. 🔨 Add predictive performance tier gating
5. 🔨 Add template tier-based limits
6. 📋 Build style training UI
7. 📋 Build bulk generation feature
8. 📋 Build team collaboration
9. 📋 Build API access
10. 📋 Build white-label options


