import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserPlan } from '@/lib/feature-gate';
import { checkSchedulingLimit, incrementSchedulingUsage } from '@/lib/tier-usage';
import { deductCredits } from '@/lib/credits';

const SCHEDULING_CREDIT_COST = 0.5;

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 🔒 TIER 2+ FEATURE - Check tier access
    const plan = await getUserPlan(session.user.id);
    
    if (plan?.plan_type === 'ltd') {
      const userTier = plan.ltd_tier || 1;
      
      // Check tier access (Tier 2+)
      if (userTier < 2) {
        return NextResponse.json({
          error: 'Tier 2+ Required',
          message: 'Content Scheduling is a Tier 2+ feature. Upgrade to unlock scheduling up to 30 posts/month.',
          code: 'TIER_RESTRICTED',
          currentTier: userTier,
          requiredTier: 2,
          upgradeUrl: '/redeem'
        }, { status: 403 });
      }

      // Check monthly scheduling limit
      const limitCheck = await checkSchedulingLimit(session.user.id, userTier);
      
      if (!limitCheck.allowed) {
        return NextResponse.json({
          error: 'Scheduling Limit Reached',
          message: limitCheck.reason,
          code: 'LIMIT_EXCEEDED',
          current: limitCheck.current,
          limit: limitCheck.limit,
          tier: userTier
        }, { status: 429 });
      }
      
      // Check and deduct credits (0.5 credits per scheduled post)
      const hasCredits = plan.credits >= SCHEDULING_CREDIT_COST;
      if (!hasCredits) {
        return NextResponse.json({
          error: 'Insufficient Credits',
          message: `You need ${SCHEDULING_CREDIT_COST} credits to schedule a post.`,
          code: 'INSUFFICIENT_CREDITS',
          required: SCHEDULING_CREDIT_COST,
          available: plan.credits
        }, { status: 402 });
      }
    }

    const { accountId, platform, content, scheduledTime, media, hashtags, options } = await request.json();

    if (!accountId || !platform || !content || !scheduledTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Mock scheduling logic - in a real app, this would save to a database
    const newPost = {
      id: `post_${Date.now()}`,
      accountId,
      platform,
      content,
      scheduledTime: new Date(scheduledTime).toISOString(),
      media: media || [],
      hashtags: hashtags || [],
      options: options || {},
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    };

    // In a real application, you would save this to a database
    // and potentially trigger a background job for actual posting.

    // Deduct credits and increment scheduling usage
    if (plan?.plan_type === 'ltd') {
      await deductCredits(session.user.id, SCHEDULING_CREDIT_COST, 'content_scheduling', {
        platform,
        scheduledTime: new Date(scheduledTime).toISOString(),
      });
      
      await incrementSchedulingUsage(session.user.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Post scheduled successfully',
      post: newPost,
      creditsUsed: SCHEDULING_CREDIT_COST,
      creditsRemaining: plan ? plan.credits - SCHEDULING_CREDIT_COST : undefined
    });

  } catch (error) {
    console.error('Error scheduling post:', error);
    return NextResponse.json(
      { error: 'Failed to schedule post' },
      { status: 500 }
    );
  }
}