// Mock data and types for competitor analysis feature

export interface CompetitorStats {
  postsPerWeek: number;
  avgEngagement: number;
  engagementRate: number;
  followerCount: number;
  topPostingDay: string;
  topPostingTime: string;
  growthRate: number;
}

export interface ContentTopic {
  topic: string;
  percentage: number;
  postCount: number;
  avgEngagement: number;
}

export interface PostingDay {
  day: string;
  count: number;
  avgEngagement: number;
}

export interface PostingTime {
  time: string;
  activity: string;
  engagement: number;
}

export interface FormatPerformance {
  format: string;
  percentage: number;
  avgEngagement: number;
  count: number;
}

export interface TopPost {
  id: string;
  preview: string;
  fullText?: string;
  engagement: number;
  breakdown: {
    likes: number;
    comments: number;
    shares: number;
  };
  type: string;
  date: string;
  whyItWorked: string[];
}

export interface ContentGap {
  id: string;
  type: 'topic' | 'format' | 'timing' | 'angle';
  title: string;
  description: string;
  potential: 'high' | 'medium' | 'low';
  data: {
    searchVolume?: number;
    competition?: string;
    trend?: string;
    competitorCoverage?: string;
    competitorUsage?: string;
    yourUsage?: string;
    engagementBoost?: string;
    difficulty?: string;
    competitorActivity?: string;
    engagementPotential?: string;
    bestDays?: string[];
    currentTiming?: string;
  };
  insights: string[];
  contentIdeas?: string[];
}

export interface TrendingTopic {
  tag: string;
  growth: number;
  trend: 'exploding' | 'growing' | 'steady';
  posts: number;
}

export interface Competitor {
  id: string;
  name: string;
  platform: 'twitter' | 'linkedin' | 'instagram';
  username: string;
  industry: string;
  notes?: string;
  addedDate: number;
  lastAnalyzed: number;
  stats: CompetitorStats;
  contentBreakdown: ContentTopic[];
  postingPattern: {
    byDay: PostingDay[];
    byTime: PostingTime[];
  };
  formatPerformance: FormatPerformance[];
  topPosts: TopPost[];
  contentGaps: ContentGap[];
  trendingTopics: TrendingTopic[];
  aiInsights: string[];
}

// Mock competitor data
export const mockCompetitorData: Competitor = {
  id: "comp_1",
  name: "HubSpot",
  platform: "linkedin",
  username: "@hubspot",
  industry: "marketing",
  addedDate: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
  lastAnalyzed: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
  
  stats: {
    postsPerWeek: 7,
    avgEngagement: 245,
    engagementRate: 5.2,
    followerCount: 50000,
    topPostingDay: "Tuesday",
    topPostingTime: "3 PM",
    growthRate: 12
  },
  
  contentBreakdown: [
    { topic: "AI Tools", percentage: 35, postCount: 18, avgEngagement: 280 },
    { topic: "Productivity", percentage: 28, postCount: 14, avgEngagement: 220 },
    { topic: "Marketing", percentage: 22, postCount: 11, avgEngagement: 250 },
    { topic: "SaaS Tips", percentage: 10, postCount: 5, avgEngagement: 200 },
    { topic: "Other", percentage: 5, postCount: 2, avgEngagement: 180 }
  ],
  
  postingPattern: {
    byDay: [
      { day: "Monday", count: 2, avgEngagement: 200 },
      { day: "Tuesday", count: 3, avgEngagement: 300 },
      { day: "Wednesday", count: 1, avgEngagement: 180 },
      { day: "Thursday", count: 2, avgEngagement: 220 },
      { day: "Friday", count: 2, avgEngagement: 210 },
      { day: "Saturday", count: 0, avgEngagement: 0 },
      { day: "Sunday", count: 1, avgEngagement: 150 }
    ],
    byTime: [
      { time: "9-11 AM", activity: "high", engagement: 250 },
      { time: "12-2 PM", activity: "medium", engagement: 180 },
      { time: "3-4 PM", activity: "highest", engagement: 320 },
      { time: "6-8 PM", activity: "medium", engagement: 200 }
    ]
  },
  
  formatPerformance: [
    { format: "Twitter Threads", percentage: 45, avgEngagement: 380, count: 23 },
    { format: "Single Posts", percentage: 30, avgEngagement: 180, count: 15 },
    { format: "Images", percentage: 15, avgEngagement: 220, count: 8 },
    { format: "Videos", percentage: 10, avgEngagement: 450, count: 5 }
  ],
  
  topPosts: [
    {
      id: "post_1",
      preview: "The future of AI is here. Here's what 99% of people are missing about ChatGPT...",
      fullText: "The future of AI is here. Here's what 99% of people are missing about ChatGPT and how it will change your workflow forever.",
      engagement: 1250,
      breakdown: { likes: 800, comments: 320, shares: 130 },
      type: "Thread",
      date: "2 days ago",
      whyItWorked: [
        "Strong curiosity hook",
        "Trending topic (#AI)",
        "Posted at optimal time (Tuesday 3 PM)",
        "Clear thread format"
      ]
    },
    {
      id: "post_2",
      preview: "I spent $10K on marketing tools last year. Here are the only 5 I still use...",
      engagement: 890,
      breakdown: { likes: 600, comments: 180, shares: 110 },
      type: "Image",
      date: "5 days ago",
      whyItWorked: [
        "Personal investment hook",
        "Specific number (5 tools)",
        "Visual format",
        "Valuable recommendations"
      ]
    },
    {
      id: "post_3",
      preview: "Stop doing these 3 things in your content strategy. They're killing your reach...",
      engagement: 720,
      breakdown: { likes: 480, comments: 150, shares: 90 },
      type: "Single Post",
      date: "1 week ago",
      whyItWorked: [
        "Negative hook (Stop doing)",
        "Specific number (3 things)",
        "Pain point focused",
        "Promises solution"
      ]
    },
    {
      id: "post_4",
      preview: "We analyzed 10,000 LinkedIn posts. Here's what the top 1% do differently...",
      engagement: 650,
      breakdown: { likes: 420, comments: 140, shares: 90 },
      type: "Thread",
      date: "2 weeks ago",
      whyItWorked: [
        "Data-driven hook",
        "Large sample size credibility",
        "Promise of exclusive insights",
        "List format"
      ]
    },
    {
      id: "post_5",
      preview: "The #1 mistake I see marketers make (and how to fix it)...",
      engagement: 580,
      breakdown: { likes: 380, comments: 120, shares: 80 },
      type: "Single Post",
      date: "3 weeks ago",
      whyItWorked: [
        "Superlative hook (#1)",
        "Personal authority",
        "Problem + solution",
        "Relatable pain point"
      ]
    }
  ],
  
  contentGaps: [
    {
      id: "gap_1",
      type: "topic",
      title: "AI for Healthcare",
      description: "No competitor is covering AI applications in healthcare industry",
      potential: "high",
      data: {
        searchVolume: 2400,
        competition: "low",
        trend: "growing",
        competitorCoverage: "0%"
      },
      insights: [
        "Competitor A hasn't covered this",
        "Competitor B posted once 6 months ago",
        "500+ searches/month for this topic",
        "Related trend: #HealthTech (↑180%)"
      ],
      contentIdeas: [
        "5 AI tools revolutionizing healthcare in 2025",
        "How AI is helping doctors diagnose faster",
        "The future of AI in patient care"
      ]
    },
    {
      id: "gap_2",
      type: "format",
      title: "Video Content",
      description: "Competitors using videos get 5x more engagement, you're not",
      potential: "high",
      data: {
        competitorUsage: "25%",
        yourUsage: "0%",
        engagementBoost: "5x",
        difficulty: "medium"
      },
      insights: [
        "Video posts get 450 avg engagement vs your 90",
        "Short-form videos (30-60 sec) perform best",
        "Tutorial/How-to videos get highest engagement",
        "Can repurpose existing content into video"
      ]
    },
    {
      id: "gap_3",
      type: "timing",
      title: "Tuesday 3 PM Posting Window",
      description: "Low competition time slot with 2x better reach",
      potential: "medium",
      data: {
        competitorActivity: "low",
        engagementPotential: "2x",
        bestDays: ["Tuesday", "Thursday"],
        currentTiming: "9 AM (high competition)"
      },
      insights: [
        "Only 1 competitor posts at this time",
        "Your audience is most active 2-4 PM",
        "Less noise = more visibility",
        "Easy to implement - just reschedule"
      ]
    }
  ],
  
  trendingTopics: [
    { tag: "#AIRevolution", growth: 245, trend: "exploding", posts: 12500 },
    { tag: "#ProductivityHacks", growth: 120, trend: "growing", posts: 8900 },
    { tag: "#SaaSGrowth", growth: 89, trend: "growing", posts: 5600 },
    { tag: "#AutomationTools", growth: 67, trend: "steady", posts: 4200 }
  ],
  
  aiInsights: [
    "Questions in posts boost comments by 150%",
    "Their threads outperform single posts 3:1",
    "9 AM slot has less competition",
    "Optimal hashtag count: 3-5",
    "'Mistake' framing gets 2x engagement vs 'tips'"
  ]
};

// Additional mock competitors for variety
export const additionalMockCompetitors: Partial<Competitor>[] = [
  {
    id: "comp_2",
    name: "Buffer",
    platform: "twitter",
    username: "@buffer",
    industry: "saas",
    addedDate: Date.now() - 14 * 24 * 60 * 60 * 1000,
    lastAnalyzed: Date.now() - 5 * 60 * 60 * 1000,
    stats: {
      postsPerWeek: 12,
      avgEngagement: 180,
      engagementRate: 4.1,
      followerCount: 450000,
      topPostingDay: "Wednesday",
      topPostingTime: "11 AM",
      growthRate: 8
    }
  },
  {
    id: "comp_3",
    name: "Canva",
    platform: "instagram",
    username: "@canva",
    industry: "design",
    addedDate: Date.now() - 21 * 24 * 60 * 60 * 1000,
    lastAnalyzed: Date.now() - 1 * 60 * 60 * 1000,
    stats: {
      postsPerWeek: 5,
      avgEngagement: 1250,
      engagementRate: 6.8,
      followerCount: 8000000,
      topPostingDay: "Monday",
      topPostingTime: "2 PM",
      growthRate: 15
    }
  }
];


















