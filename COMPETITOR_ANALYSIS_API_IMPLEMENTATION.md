# 🔧 Competitor Analysis - API Implementation Guide

## Overview

This guide outlines how to make the Competitor Analysis feature fully functional with real data from social media platforms.

## 🎯 Current Status

✅ **What Works (Mock Data)**
- Complete UI/UX
- All components and charts
- State management
- LocalStorage persistence
- Navigation and integration

❌ **What's Missing (Real Data)**
- Social media API integration
- Backend analysis processing
- Database storage
- Rate limiting
- Caching layer
- Real-time updates

---

## 📋 Implementation Roadmap

### Phase 1: Backend Setup (Week 1-2)

#### 1.1 Database Schema

```sql
-- Create competitors table
CREATE TABLE competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'instagram')),
  username VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  notes TEXT,
  added_date TIMESTAMP DEFAULT NOW(),
  last_analyzed TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create competitor_stats table
CREATE TABLE competitor_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  posts_per_week INTEGER,
  avg_engagement INTEGER,
  engagement_rate DECIMAL(5,2),
  follower_count INTEGER,
  top_posting_day VARCHAR(20),
  top_posting_time VARCHAR(20),
  growth_rate DECIMAL(5,2),
  analyzed_at TIMESTAMP DEFAULT NOW()
);

-- Create competitor_posts table
CREATE TABLE competitor_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  post_id VARCHAR(255) NOT NULL, -- Platform-specific post ID
  content TEXT,
  post_type VARCHAR(50),
  engagement_count INTEGER,
  likes_count INTEGER,
  comments_count INTEGER,
  shares_count INTEGER,
  posted_at TIMESTAMP,
  fetched_at TIMESTAMP DEFAULT NOW()
);

-- Create content_gaps table
CREATE TABLE content_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  gap_type VARCHAR(50) CHECK (gap_type IN ('topic', 'format', 'timing', 'angle')),
  title VARCHAR(255),
  description TEXT,
  potential VARCHAR(20) CHECK (potential IN ('high', 'medium', 'low')),
  insights JSONB,
  content_ideas JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_competitors_user_id ON competitors(user_id);
CREATE INDEX idx_competitors_platform ON competitors(platform);
CREATE INDEX idx_competitor_posts_competitor_id ON competitor_posts(competitor_id);
CREATE INDEX idx_competitor_posts_posted_at ON competitor_posts(posted_at);
CREATE INDEX idx_content_gaps_competitor_id ON content_gaps(competitor_id);
```

#### 1.2 Environment Variables

```bash
# .env.local

# Twitter/X API
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_BEARER_TOKEN=your_bearer_token

# LinkedIn API
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret

# Instagram API (via Facebook)
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
INSTAGRAM_GRAPH_API_TOKEN=your_token

# Alternative: Third-party services
APIFY_API_TOKEN=your_apify_token
SCRAPERAPI_KEY=your_scraper_key

# Rate limiting
REDIS_URL=your_redis_url

# OpenAI for analysis
OPENAI_API_KEY=your_existing_key # You already have this
```

---

### Phase 2: API Routes (Week 2-3)

#### 2.1 Add Competitor Endpoint

```typescript
// src/app/api/competitors/add/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const AddCompetitorSchema = z.object({
  name: z.string().min(1),
  platform: z.enum(['twitter', 'linkedin', 'instagram']),
  username: z.string().min(1),
  industry: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = AddCompetitorSchema.parse(body);

    // 1. Validate username exists on platform
    const isValid = await validateUsername(data.platform, data.username);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Username not found or account is private' },
        { status: 400 }
      );
    }

    // 2. Check if user already tracking this competitor
    const existing = await checkExistingCompetitor(session.user.id, data.username, data.platform);
    if (existing) {
      return NextResponse.json(
        { error: 'You are already tracking this competitor' },
        { status: 400 }
      );
    }

    // 3. Check user's tier limits
    const competitorCount = await getCompetitorCount(session.user.id);
    const limit = await getUserTierLimit(session.user.id); // e.g., 10 for free, unlimited for pro
    if (competitorCount >= limit) {
      return NextResponse.json(
        { error: `You've reached the limit (${limit} competitors). Upgrade to track more.` },
        { status: 403 }
      );
    }

    // 4. Insert competitor to database
    const competitor = await insertCompetitor({
      userId: session.user.id,
      ...data,
    });

    // 5. Queue analysis job (async)
    await queueCompetitorAnalysis(competitor.id);

    return NextResponse.json({
      success: true,
      competitor: {
        id: competitor.id,
        ...data,
        status: 'analyzing',
      },
    });
  } catch (error) {
    console.error('Add competitor error:', error);
    return NextResponse.json(
      { error: 'Failed to add competitor' },
      { status: 500 }
    );
  }
}
```

#### 2.2 Analyze Competitor Endpoint

```typescript
// src/app/api/competitors/analyze/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { analyzeTwitterCompetitor } from '@/lib/competitors/twitter-analyzer';
import { analyzeLinkedInCompetitor } from '@/lib/competitors/linkedin-analyzer';
import { analyzeInstagramCompetitor } from '@/lib/competitors/instagram-analyzer';

export async function POST(req: NextRequest) {
  try {
    const { competitorId } = await req.json();

    // 1. Fetch competitor details
    const competitor = await getCompetitor(competitorId);
    if (!competitor) {
      return NextResponse.json({ error: 'Competitor not found' }, { status: 404 });
    }

    // 2. Fetch posts from platform
    let posts;
    switch (competitor.platform) {
      case 'twitter':
        posts = await analyzeTwitterCompetitor(competitor.username);
        break;
      case 'linkedin':
        posts = await analyzeLinkedInCompetitor(competitor.username);
        break;
      case 'instagram':
        posts = await analyzeInstagramCompetitor(competitor.username);
        break;
    }

    // 3. Analyze with AI (OpenAI)
    const analysis = await analyzeWithAI(posts, competitor);

    // 4. Calculate statistics
    const stats = calculateStatistics(posts);

    // 5. Identify content gaps
    const gaps = await identifyContentGaps(posts, competitor.industry);

    // 6. Store in database
    await saveAnalysis(competitorId, { stats, posts, gaps, analysis });

    // 7. Update last_analyzed timestamp
    await updateLastAnalyzed(competitorId);

    return NextResponse.json({
      success: true,
      analysis: {
        stats,
        topPosts: posts.slice(0, 5),
        contentGaps: gaps,
        insights: analysis.insights,
      },
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze competitor' },
      { status: 500 }
    );
  }
}
```

#### 2.3 Get Competitors Endpoint

```typescript
// src/app/api/competitors/route.ts

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const competitors = await fetchCompetitors(session.user.id);

    return NextResponse.json({
      success: true,
      competitors,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch competitors' },
      { status: 500 }
    );
  }
}
```

---

### Phase 3: Platform Integrations (Week 3-4)

#### 3.1 Twitter/X Integration

```typescript
// src/lib/competitors/twitter-analyzer.ts

import { TwitterApi } from 'twitter-api-v2';

const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN!);

export async function analyzeTwitterCompetitor(username: string) {
  try {
    // 1. Get user info
    const user = await twitterClient.v2.userByUsername(username.replace('@', ''), {
      'user.fields': ['public_metrics', 'created_at'],
    });

    if (!user.data) {
      throw new Error('User not found');
    }

    // 2. Get last 50 tweets
    const tweets = await twitterClient.v2.userTimeline(user.data.id, {
      max_results: 50,
      'tweet.fields': ['created_at', 'public_metrics', 'entities'],
      exclude: ['retweets', 'replies'],
    });

    // 3. Calculate engagement
    const posts = tweets.data.data.map(tweet => ({
      id: tweet.id,
      content: tweet.text,
      type: detectTweetType(tweet),
      engagement: calculateEngagement(tweet.public_metrics!),
      likes: tweet.public_metrics!.like_count,
      comments: tweet.public_metrics!.reply_count,
      shares: tweet.public_metrics!.retweet_count,
      postedAt: new Date(tweet.created_at!),
    }));

    return {
      followerCount: user.data.public_metrics!.followers_count,
      posts,
    };
  } catch (error) {
    console.error('Twitter analysis error:', error);
    throw error;
  }
}

function detectTweetType(tweet: any): string {
  // Detect if it's a thread, image post, video, etc.
  if (tweet.entities?.urls?.length > 0) return 'Link Post';
  if (tweet.entities?.media?.[0]?.type === 'photo') return 'Image';
  if (tweet.entities?.media?.[0]?.type === 'video') return 'Video';
  return 'Single Post';
}

function calculateEngagement(metrics: any): number {
  return metrics.like_count + metrics.reply_count + metrics.retweet_count + metrics.quote_count;
}
```

#### 3.2 LinkedIn Integration

```typescript
// src/lib/competitors/linkedin-analyzer.ts

// Note: LinkedIn API is more restrictive
// May need to use unofficial scraping or third-party service

export async function analyzeLinkedInCompetitor(username: string) {
  // Option 1: Official LinkedIn API (limited)
  // Option 2: Use Apify LinkedIn scraper
  // Option 3: Use Bright Data
  
  // Example using Apify:
  const apify = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
  });

  const run = await apify.actor('apify/linkedin-profile-scraper').call({
    profileUrls: [`https://linkedin.com/in/${username.replace('@', '')}`],
  });

  const { items } = await apify.dataset(run.defaultDatasetId).listItems();
  
  // Process and return data
  return processLinkedInData(items[0]);
}
```

#### 3.3 Instagram Integration

```typescript
// src/lib/competitors/instagram-analyzer.ts

export async function analyzeInstagramCompetitor(username: string) {
  // Instagram requires business account and Graph API
  const response = await fetch(
    `https://graph.instagram.com/${username}?fields=id,username,media_count,followers_count&access_token=${process.env.INSTAGRAM_GRAPH_API_TOKEN}`
  );

  const user = await response.json();

  // Get recent posts
  const mediaResponse = await fetch(
    `https://graph.instagram.com/${user.id}/media?fields=id,caption,media_type,like_count,comments_count,timestamp&access_token=${process.env.INSTAGRAM_GRAPH_API_TOKEN}`
  );

  const media = await mediaResponse.json();

  return processInstagramData(user, media.data);
}
```

---

### Phase 4: AI Analysis (Week 4-5)

#### 4.1 Content Gap Detection

```typescript
// src/lib/competitors/ai-analyzer.ts

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function identifyContentGaps(
  competitorPosts: any[],
  industry: string
) {
  const prompt = `
Analyze these social media posts from a competitor in the ${industry} industry:

${competitorPosts.map((p, i) => `${i + 1}. ${p.content}`).join('\n')}

Identify 3-5 content gaps or opportunities:
1. Topics they're NOT covering that are trending
2. Content formats they're underutilizing
3. Optimal posting times they're missing

Return as JSON:
{
  "gaps": [
    {
      "type": "topic|format|timing",
      "title": "Gap title",
      "description": "Why this is an opportunity",
      "potential": "high|medium|low",
      "insights": ["insight 1", "insight 2"],
      "contentIdeas": ["idea 1", "idea 2"]
    }
  ]
}
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0].message.content!);
  return result.gaps;
}

export async function analyzeTopPosts(posts: any[]) {
  const topPosts = posts.sort((a, b) => b.engagement - a.engagement).slice(0, 5);

  const analyses = await Promise.all(
    topPosts.map(async (post) => {
      const prompt = `
Analyze why this social media post performed well:

"${post.content}"

Engagement: ${post.engagement} (${post.likes} likes, ${post.comments} comments, ${post.shares} shares)

Provide 3-4 reasons why it worked. Return as JSON array of strings.
`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      return {
        ...post,
        whyItWorked: JSON.parse(response.choices[0].message.content!),
      };
    })
  );

  return analyses;
}
```

---

### Phase 5: Caching & Rate Limiting (Week 5)

#### 5.1 Redis Caching

```typescript
// src/lib/cache.ts (extend existing)

export async function cacheCompetitorAnalysis(
  competitorId: string,
  data: any,
  ttl: number = 7 * 24 * 60 * 60 // 7 days
) {
  const key = `competitor:${competitorId}:analysis`;
  await redis.setex(key, ttl, JSON.stringify(data));
}

export async function getCachedAnalysis(competitorId: string) {
  const key = `competitor:${competitorId}:analysis`;
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
}
```

#### 5.2 Rate Limiting

```typescript
// src/lib/competitors/rate-limiter.ts

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 d'), // 5 analyses per day
  analytics: true,
});

export async function checkRateLimit(userId: string): Promise<boolean> {
  const { success } = await ratelimit.limit(`competitor:${userId}`);
  return success;
}
```

---

### Phase 6: Background Jobs (Week 6)

#### 6.1 Queue System

```typescript
// Using Vercel Queue, BullMQ, or similar

import { Queue } from 'bullmq';

const competitorQueue = new Queue('competitor-analysis', {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

export async function queueCompetitorAnalysis(competitorId: string) {
  await competitorQueue.add('analyze', {
    competitorId,
    priority: 1,
  }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  });
}
```

---

## 💰 Cost Estimation

### Option 1: Official APIs (Recommended for Scale)
- **Twitter API**: $100-500/month (depending on volume)
- **LinkedIn API**: Free (limited) or custom pricing
- **Instagram API**: Free
- **OpenAI API**: $50-200/month (for analysis)
- **Redis/Caching**: $10-50/month
- **Total**: ~$200-800/month

### Option 2: Third-Party Scrapers
- **Apify**: $49-249/month
- **Bright Data**: $500+/month
- **ScraperAPI**: $49-249/month
- **OpenAI API**: $50-200/month
- **Total**: ~$150-700/month

### Option 3: Hybrid Approach (Best for Starting)
- Use official APIs where available
- Supplement with occasional scraping
- Heavy caching (7-day TTL)
- **Total**: ~$100-300/month

---

## 📦 Required Packages

```bash
npm install twitter-api-v2 @upstash/ratelimit @upstash/redis bullmq apify-client
```

---

## 🚀 Implementation Priority

### Must Have (MVP)
1. ✅ Database schema
2. ✅ Add competitor endpoint
3. ✅ At least ONE platform (Twitter recommended)
4. ✅ Basic AI analysis
5. ✅ Caching

### Should Have
- All three platforms
- Background job queue
- Rate limiting
- Advanced AI insights

### Nice to Have
- Historical tracking
- Real-time updates
- Email alerts
- Team sharing

---

## 📝 Implementation Checklist

### Week 1-2: Setup
- [ ] Set up database tables
- [ ] Get API credentials (Twitter, LinkedIn, Instagram)
- [ ] Set up Redis for caching
- [ ] Configure environment variables

### Week 3-4: Core APIs
- [ ] Create `/api/competitors/add` endpoint
- [ ] Create `/api/competitors/analyze` endpoint
- [ ] Create `/api/competitors` GET endpoint
- [ ] Implement Twitter integration
- [ ] Test with real data

### Week 5: Enhancement
- [ ] Add LinkedIn integration
- [ ] Add Instagram integration
- [ ] Implement AI analysis
- [ ] Add content gap detection

### Week 6: Polish
- [ ] Add rate limiting
- [ ] Implement background jobs
- [ ] Add error handling
- [ ] Performance optimization
- [ ] Security audit

---

## 🎯 Quick Start (Next Steps)

1. **Get Twitter API Access** (Easiest to start)
   - Go to https://developer.twitter.com
   - Create a developer account
   - Create a new app
   - Get Bearer Token

2. **Run Database Migration**
   - Execute the SQL schema above
   - Test with sample data

3. **Create First API Route**
   - Start with `/api/competitors/add`
   - Test with Postman/Thunder Client

4. **Update Frontend Hook**
   - Modify `useCompetitors.ts` to call real APIs
   - Remove mock data

Would you like me to start implementing any of these phases?


















