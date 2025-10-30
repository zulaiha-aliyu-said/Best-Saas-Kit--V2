import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserPlan, deductCredits } from '@/lib/feature-gate';
import { calculateCreditCost } from '@/lib/ltd-tiers';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      topics, // Array of topics to generate content for
      platforms,
      tone,
      length
    } = await request.json();

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json(
        { error: 'Topics array is required' },
        { status: 400 }
      );
    }

    if (topics.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 topics allowed per bulk generation' },
        { status: 400 }
      );
    }

    // Get user plan and check tier access
    const plan = await getUserPlan(session.user.id);
    
    // 🔒 TIER 3+ FEATURE - Check access
    if (plan?.plan_type === 'ltd') {
      if (!plan.ltd_tier || plan.ltd_tier < 3) {
        return NextResponse.json({
          error: 'Tier 3+ Required',
          message: 'Bulk Generation is a Tier 3+ feature. Upgrade to generate 5 pieces of content at once.',
          code: 'TIER_RESTRICTED',
          currentTier: plan.ltd_tier || 1,
          requiredTier: 3,
          upgradeUrl: '/redeem'
        }, { status: 403 });
      }
    }

    // Calculate credit cost for bulk generation
    // Tier 3+: 0.9 credits per piece (10% discount vs regular 1 credit)
    const creditPerPiece = 0.9;
    const totalCredits = topics.length * platforms.length * creditPerPiece;

    console.log(`💳 Bulk Generation: ${topics.length} topics × ${platforms.length} platforms = ${totalCredits} credits`);

    // Check and deduct credits
    const creditResult = await deductCredits(
      session.user.id,
      totalCredits,
      'bulk_generation',
      {
        topicCount: topics.length,
        platformCount: platforms.length,
        tone,
        length
      }
    );

    if (!creditResult.success) {
      return NextResponse.json({
        error: creditResult.error || 'Insufficient credits',
        code: 'INSUFFICIENT_CREDITS',
        remaining: creditResult.remaining,
        required: totalCredits
      }, { status: 402 });
    }

    // Generate content for all topics and platforms
    const results = [];

    for (const topic of topics) {
      const topicResults = {
        topic,
        content: {} as Record<string, any>
      };

      for (const platform of platforms) {
        // Generate platform-specific content
        const content = await generatePlatformContent(topic, platform, tone, length);
        topicResults.content[platform] = content;
      }

      results.push(topicResults);
    }

    return NextResponse.json({
      success: true,
      results,
      metadata: {
        topicsProcessed: topics.length,
        platformsPerTopic: platforms.length,
        totalPieces: topics.length * platforms.length,
        creditsUsed: totalCredits,
        creditsRemaining: creditResult.remaining,
        discountApplied: '10% bulk discount'
      }
    });

  } catch (error) {
    console.error('Error in bulk generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate bulk content' },
      { status: 500 }
    );
  }
}

async function generatePlatformContent(
  topic: string,
  platform: string,
  tone: string,
  length: string
): Promise<any> {
  // Platform-specific content generation logic
  const platformSpecs = {
    twitter: {
      maxLength: 280,
      style: 'concise and punchy',
      features: ['hashtags', 'threads']
    },
    linkedin: {
      maxLength: 3000,
      style: 'professional and detailed',
      features: ['hashtags', 'mentions']
    },
    instagram: {
      maxLength: 2200,
      style: 'visual and engaging',
      features: ['hashtags', 'emojis']
    },
    email: {
      maxLength: 10000,
      style: 'conversational and value-driven',
      features: ['subject_line', 'cta']
    }
  };

  const spec = platformSpecs[platform as keyof typeof platformSpecs] || platformSpecs.twitter;

  // Generate content based on platform specs
  // In production, this would call an AI API
  const content = generateMockContent(topic, platform, tone, length, spec);

  return {
    platform,
    text: content.text,
    metadata: {
      wordCount: content.text.split(' ').length,
      characterCount: content.text.length,
      hashtags: content.hashtags || [],
      mentions: content.mentions || [],
      tone,
      length,
      generatedAt: new Date().toISOString()
    }
  };
}

function generateMockContent(
  topic: string,
  platform: string,
  tone: string,
  length: string,
  spec: any
): any {
  // Mock content generation
  const toneVariations = {
    professional: {
      prefix: 'In today\'s business landscape,',
      style: 'formal and authoritative'
    },
    casual: {
      prefix: 'Hey there!',
      style: 'friendly and approachable'
    },
    friendly: {
      prefix: 'Let\'s talk about',
      style: 'warm and conversational'
    },
    motivational: {
      prefix: 'Are you ready to',
      style: 'inspiring and energetic'
    }
  };

  const variation = toneVariations[tone as keyof typeof toneVariations] || toneVariations.professional;

  let text = '';
  let hashtags: string[] = [];

  if (platform === 'twitter') {
    text = `${variation.prefix} ${topic} is transforming how we work. Here's what you need to know: 

1️⃣ The fundamentals are changing fast
2️⃣ Early adopters are seeing massive results
3️⃣ The opportunity window is closing

Don't get left behind. Start implementing ${topic} strategies today!

#${topic.replace(/\s+/g, '')} #Business #Growth`;
    hashtags = [topic.replace(/\s+/g, ''), 'Business', 'Growth'];
  } else if (platform === 'linkedin') {
    text = `${variation.prefix} ${topic} is becoming essential for modern businesses.

After working with dozens of companies implementing ${topic}, I've identified 5 critical success factors:

1. Strategic Planning - You need a clear roadmap before starting
2. Team Alignment - Everyone needs to understand the "why"
3. Proper Tools - Invest in the right technology stack
4. Continuous Learning - Stay updated with latest trends
5. Measurement - Track KPIs and iterate based on data

The companies that excel at ${topic} share these characteristics. Which ones are you focusing on?

#${topic.replace(/\s+/g, '')} #BusinessStrategy #Leadership`;
    hashtags = [topic.replace(/\s+/g, ''), 'BusinessStrategy', 'Leadership'];
  } else if (platform === 'instagram') {
    text = `✨ ${topic.toUpperCase()} MASTERCLASS ✨

Swipe to learn the 3 secrets that transformed how I approach ${topic} 👇

🎯 Secret #1: Start with clarity
Most people jump in without a plan. Big mistake! Take time to define your goals first.

💡 Secret #2: Focus on fundamentals
Fancy tactics don't matter if you don't have the basics down. Master the foundation.

🚀 Secret #3: Stay consistent
Results come from daily action, not occasional effort. Show up every single day.

Ready to level up your ${topic} game? Drop a 🔥 in the comments!

#${topic.replace(/\s+/g, '')} #Success #GrowthMindset #Hustle`;
    hashtags = [topic.replace(/\s+/g, ''), 'Success', 'GrowthMindset', 'Hustle'];
  } else if (platform === 'email') {
    text = `Subject: The ${topic} Strategy That Changed Everything

Hi there,

I wanted to share something that's been transforming how successful businesses approach ${topic}.

Most people get it wrong. They focus on tactics instead of strategy. They chase quick wins instead of building sustainable systems.

But here's what actually works:

THE FRAMEWORK:

Step 1: Define Your Vision
Before diving into ${topic}, you need absolute clarity on where you're heading. What does success look like 6 months from now?

Step 2: Build Your Foundation
Most skip this part and wonder why they struggle. You need the right tools, team, and processes in place.

Step 3: Execute Consistently
This is where magic happens. Daily, focused action compounds into extraordinary results.

I've seen this framework help dozens of businesses achieve breakthrough results with ${topic}.

Want to dive deeper? Reply to this email and let me know your biggest challenge with ${topic}.

To your success,
[Your Name]

P.S. I'm hosting a free workshop on ${topic} next week. Hit reply if you'd like details!`;
  }

  return {
    text,
    hashtags,
    mentions: []
  };
}
