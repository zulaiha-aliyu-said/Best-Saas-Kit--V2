# Viral Hook Generator - Complete Implementation Guide

## Overview

The Viral Hook Generator is a powerful new feature for RepurposeAI that helps users create high-performing viral hooks for their social media content across multiple platforms. It includes 500+ proven hook patterns, intelligent placeholder replacement, and comprehensive analytics.

## Features

### 🎯 Core Functionality

1. **500+ Viral Hook Patterns**
   - Organized by platform: Twitter, LinkedIn, Instagram, Email
   - Multiple niches per platform
   - Category-tagged: High Performing, Proven, Experimental
   - Engagement scores: 65-95 range

2. **Smart Placeholder Replacement**
   - `{topic}` - User's input topic
   - `{amount}` - Random values: $10K, $50K, $100K, $250K, $500K, $1M
   - `{number}` - Random values: 3, 5, 7, 10, 12, 15
   - `{timeframe}` - Random values: 6 months, 1 year, 2 years, 3 years, 5 years
   - `{percentage}` - Random values: 25, 40, 67, 75, 85, 92, 95

3. **Real-time Generation**
   - Generate 10 hooks instantly
   - Sorted by engagement score (highest first)
   - One-click copy to clipboard
   - Copy tracking analytics

4. **User Analytics**
   - Total hooks generated
   - Hooks copied (copy rate)
   - Average engagement score
   - Platform and niche distribution
   - Category performance
   - Top performing hooks
   - Recent history

5. **Admin Analytics**
   - System-wide statistics
   - Platform performance metrics
   - Niche performance breakdown
   - Category analysis
   - Daily trend visualization
   - Top performing hooks across all users
   - Most active users
   - Pattern usage statistics
   - Timeframe filtering (7, 30, 90, 365 days)

## File Structure

```
sql-queries/
├── 11-create-viral-hooks-schema.sql      # Database schema
└── 12-insert-hook-patterns.sql           # 500+ hook patterns

src/app/
├── api/
│   ├── hooks/
│   │   ├── generate/route.ts             # Hook generation endpoint
│   │   ├── copy/route.ts                 # Track copy actions
│   │   ├── analytics/route.ts            # User analytics endpoint
│   │   └── history/route.ts              # User history endpoint
│   └── admin/
│       └── hooks-analytics/route.ts      # Admin analytics endpoint
├── dashboard/
│   └── hooks/
│       ├── page.tsx                      # Main hook generator page
│       └── analytics/page.tsx            # User analytics page
└── admin/
    └── hooks-analytics/page.tsx          # Admin analytics page

src/components/
├── hooks/
│   ├── viral-hook-generator.tsx          # Main generator component
│   └── hook-analytics.tsx                # User analytics component
└── admin/
    └── admin-hooks-analytics.tsx         # Admin analytics component
```

## Database Schema

### Tables

1. **hook_patterns**
   - Stores all 500+ viral hook patterns
   - Fields: platform, niche, pattern, category, base_engagement_score, description

2. **generated_hooks**
   - User's generated hooks history
   - Fields: user_id, pattern_id, platform, niche, topic, generated_hook, engagement_score, category, viral_potential, copied

3. **hook_analytics**
   - Aggregated daily analytics per user
   - Auto-updated via triggers
   - Fields: user_id, platform, niche, total_generated, total_copied, avg_engagement_score

### Views

1. **admin_hook_analytics**
   - System-wide analytics aggregation
   - Platform, niche, date grouping

2. **user_hook_stats**
   - Per-user statistics across all time
   - Platform and niche breakdown

### Functions

1. **update_hook_analytics()**
   - Automatically updates analytics on hook generation
   - Triggered by INSERT on generated_hooks

2. **track_hook_copy(hook_id)**
   - Updates copy status and analytics
   - Called when user copies a hook

## Platform & Niche Structure

### Twitter
- **Business**: Business strategies, growth, revenue
- **Tech**: Development, coding, tools, architecture
- **Marketing**: Campaigns, funnels, conversions
- **Personal**: Habits, mindset, transformation

### LinkedIn
- **Business**: Company strategy, ROI, scaling
- **Career**: Progression, skills, networking
- **Leadership**: Team building, decision-making, culture

### Instagram
- **Lifestyle**: Daily habits, routines, aesthetics
- **Education**: Learning, tutorials, explanations
- **Motivation**: Inspiration, encouragement, mindset

### Email
- **Newsletter**: Insights, trends, resources
- **Sales**: Offers, testimonials, urgency

## API Endpoints

### User Endpoints

#### POST `/api/hooks/generate`
Generate 10 viral hooks based on topic, platform, and niche.

**Request Body:**
```json
{
  "topic": "content marketing",
  "platform": "twitter",
  "niche": "business"
}
```

**Response:**
```json
{
  "hooks": [
    {
      "id": "uuid",
      "hook": "I spent $100K learning content marketing. Here's what nobody tells you:",
      "engagementScore": 92,
      "category": "high_performing",
      "viralPotential": "Very High",
      "description": "Creates curiosity through investment + exclusivity",
      "platform": "twitter",
      "niche": "business"
    }
    // ... 9 more hooks
  ]
}
```

#### POST `/api/hooks/copy`
Track when a user copies a hook.

**Request Body:**
```json
{
  "hookId": "uuid"
}
```

#### GET `/api/hooks/analytics`
Get user's hook analytics and statistics.

**Response:**
```json
{
  "stats": [...],
  "recentHooks": [...],
  "topHooks": [...],
  "platformDistribution": [...],
  "categoryPerformance": [...],
  "totals": {
    "total_hooks": 150,
    "total_copied": 95,
    "avg_engagement_score": 87.5,
    "max_score": 95
  }
}
```

#### GET `/api/hooks/history`
Get paginated hook history with optional filters.

**Query Parameters:**
- `platform` (optional): Filter by platform
- `niche` (optional): Filter by niche
- `limit` (default: 50): Results per page
- `offset` (default: 0): Pagination offset

### Admin Endpoints

#### GET `/api/admin/hooks-analytics?timeframe=30`
Get system-wide analytics for admin dashboard.

**Query Parameters:**
- `timeframe`: 7, 30, 90, or 365 (days)

**Response:**
```json
{
  "overallStats": {
    "total_users": 1250,
    "total_hooks_generated": 15000,
    "total_hooks_copied": 9500,
    "avg_engagement_score": 86.3,
    "overall_copy_rate": 63.3
  },
  "platformStats": [...],
  "nicheStats": [...],
  "categoryStats": [...],
  "dailyTrend": [...],
  "topHooks": [...],
  "activeUsers": [...],
  "patternUsage": [...]
}
```

## Usage Guide

### For Users

1. **Generate Hooks:**
   - Navigate to Dashboard → Viral Hooks
   - Enter your topic (e.g., "AI automation")
   - Select platform and niche
   - Click "Generate 10 Hooks"

2. **View Results:**
   - Hooks sorted by engagement score
   - See viral potential (Very High, High, Medium)
   - View category badge (High Performing, Proven, Experimental)
   - Click to expand "Why This Works" section

3. **Copy & Use:**
   - Click copy button on any hook
   - Hook is automatically tracked
   - Use in your content creation

4. **Track Performance:**
   - Navigate to Dashboard → Viral Hooks → Analytics
   - View total hooks generated
   - See copy rate and engagement metrics
   - Analyze platform and category performance

### For Admins

1. **Monitor System:**
   - Navigate to Admin → Hooks Analytics
   - View total users, hooks, and copy rates
   - Select timeframe (7, 30, 90, 365 days)

2. **Analyze Performance:**
   - Platform performance breakdown
   - Category effectiveness
   - Top performing niches
   - Daily trend analysis

3. **Track Users:**
   - Most active users
   - User engagement patterns
   - Pattern usage statistics

## Database Setup

### Installation

1. **Create Schema:**
```bash
psql -U your_user -d your_database -f sql-queries/11-create-viral-hooks-schema.sql
```

2. **Insert Hook Patterns:**
```bash
psql -U your_user -d your_database -f sql-queries/12-insert-hook-patterns.sql
```

3. **Verify Setup:**
```sql
-- Check patterns count
SELECT platform, niche, COUNT(*) 
FROM hook_patterns 
GROUP BY platform, niche 
ORDER BY platform, niche;

-- Should show 500+ total patterns across all platforms/niches
```

## Navigation

### User Dashboard
New menu item: **Viral Hooks** (Sparkles icon)
- Main Generator: `/dashboard/hooks`
- Analytics: `/dashboard/hooks/analytics`

### Admin Panel
New menu item: **Hooks Analytics** (Sparkles icon)
- Admin Analytics: `/admin/hooks-analytics`

## Styling & Theme

The feature uses a consistent purple/pink gradient theme:

- **Primary Gradient**: `from-purple-600 to-pink-600`
- **Background**: `from-purple-50 via-pink-50 to-purple-50`
- **Score Colors**:
  - 85+: Green (Very High viral potential)
  - 75-84: Blue (High viral potential)
  - <75: Purple (Medium viral potential)

## Performance Optimizations

1. **Database Indexing:**
   - Composite index on (platform, niche, category)
   - User ID index on generated_hooks
   - Date indexes for analytics

2. **Query Optimization:**
   - Materialized views for admin analytics
   - Automatic aggregation via triggers
   - Limited result sets with LIMIT clauses

3. **Frontend:**
   - Client-side state management
   - Optimistic UI updates
   - Lazy loading for analytics

## Future Enhancements

Potential additions to consider:

1. **A/B Testing:** Compare hook performance
2. **Custom Patterns:** Allow users to create custom hooks
3. **Favorite Hooks:** Save and organize favorite hooks
4. **Export Function:** Export hooks to CSV/PDF
5. **Integration:** Direct posting to social platforms
6. **AI Enhancement:** Generate topic variations
7. **Trending Hooks:** Show currently trending patterns
8. **Collaboration:** Share hooks with team members

## Troubleshooting

### Common Issues

1. **No hooks generated:**
   - Ensure database patterns are loaded
   - Check platform/niche combination exists
   - Verify user authentication

2. **Analytics not updating:**
   - Check database triggers are active
   - Verify function permissions
   - Review error logs

3. **Copy tracking not working:**
   - Ensure JavaScript is enabled
   - Check network requests in browser console
   - Verify hook ID is valid

### Database Checks

```sql
-- Check if patterns exist
SELECT COUNT(*) FROM hook_patterns;

-- Check if triggers are active
SELECT * FROM pg_trigger WHERE tgname LIKE '%hook%';

-- View recent analytics
SELECT * FROM hook_analytics 
ORDER BY updated_at DESC 
LIMIT 10;
```

## Security Considerations

1. **Authentication:** All endpoints require valid session
2. **Admin Access:** Admin endpoints check `isAdmin()` function
3. **SQL Injection:** Parameterized queries throughout
4. **Rate Limiting:** Consider adding for production
5. **Data Privacy:** User data isolated by user_id

## Support

For issues or questions:
- Check logs: `console.log` in browser, server logs for API
- Database queries: Use provided verification scripts
- Component debugging: React DevTools

## Credits

Built with ❤️ for RepurposeAI
- 500+ curated viral hook patterns
- Real-time analytics and tracking
- Beautiful UI with Tailwind CSS
- PostgreSQL database with optimized queries

---

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Author:** Zulaiha Aliyu







