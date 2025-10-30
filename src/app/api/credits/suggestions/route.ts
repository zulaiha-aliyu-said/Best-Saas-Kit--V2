import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import pool from '@/lib/db';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user data
    const userResult = await pool.query(
      `SELECT id, tier, credits, next_credit_refresh FROM users WHERE email = $1`,
      [session.user.email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];
    const tier = user.tier || 1;
    const credits = user.credits || 0;

    // Monthly credit limits by tier
    const creditLimits: Record<number, number> = {
      1: 100,
      2: 300,
      3: 750,
      4: 2000,
    };

    const monthlyCredits = creditLimits[tier] || 100;
    const usagePercent = ((monthlyCredits - credits) / monthlyCredits) * 100;

    // Get usage patterns (last 30 days)
    const usageResult = await pool.query(
      `SELECT 
        feature_type,
        COUNT(*) as usage_count,
        SUM(credits_used) as total_credits
       FROM credit_usage
       WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 days'
       GROUP BY feature_type`,
      [user.id]
    );

    const usageByFeature = usageResult.rows.reduce((acc: any, row: any) => {
      acc[row.feature_type] = {
        count: parseInt(row.usage_count),
        credits: parseInt(row.total_credits)
      };
      return acc;
    }, {});

    // Calculate days until refresh
    const nextRefresh = user.next_credit_refresh ? new Date(user.next_credit_refresh) : null;
    const daysUntilRefresh = nextRefresh 
      ? Math.ceil((nextRefresh.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 30;

    // Generate suggestions
    const suggestions: any[] = [];

    // Low credits warning
    if (credits < monthlyCredits * 0.2) {
      suggestions.push({
        type: "warning",
        icon: "AlertCircle",
        title: "Low on credits!",
        description: `You have ${credits} credits left. Your credits refresh in ${daysUntilRefresh} days.`,
        actionText: tier < 4 ? "Upgrade tier" : undefined,
        actionUrl: tier < 4 ? "/dashboard/ltd-pricing" : undefined,
      });
    }

    // Good pacing
    if (usagePercent > 40 && usagePercent < 80) {
      suggestions.push({
        type: "success",
        icon: "CheckCircle2",
        title: "Great pacing!",
        description: `You're using credits efficiently. ${credits} credits remaining with ${daysUntilRefresh} days to go.`,
      });
    }

    // Heavy repurposing usage
    const repurposeCredits = usageByFeature['repurpose']?.credits || 0;
    const totalCreditsUsed = monthlyCredits - credits;
    if (repurposeCredits > totalCreditsUsed * 0.7 && tier >= 2) {
      suggestions.push({
        type: "tip",
        icon: "Target",
        title: "Optimize with templates",
        description: "You're using 70%+ credits on repurposing. Try templates to save 30% in credits!",
        actionText: "Browse templates",
        actionUrl: "/dashboard/templates",
      });
    }

    // Tier upgrade suggestion
    if (credits < 20 && tier < 4 && daysUntilRefresh > 7) {
      const nextTierCredits = creditLimits[tier + 1];
      suggestions.push({
        type: "info",
        icon: "TrendingUp",
        title: "Consider upgrading",
        description: `Upgrade to Tier ${tier + 1} for ${nextTierCredits} credits/month and unlock more features!`,
        actionText: "View pricing",
        actionUrl: "/dashboard/ltd-pricing",
      });
    }

    // Approaching refresh
    if (daysUntilRefresh <= 5 && credits > monthlyCredits * 0.3) {
      suggestions.push({
        type: "success",
        icon: "Clock",
        title: "Credits refreshing soon!",
        description: `Your credits will refresh in ${daysUntilRefresh} days. You're pacing well!`,
      });
    }

    // Bulk generation tip for Tier 3+
    if (tier >= 3 && repurposeCredits > 0) {
      suggestions.push({
        type: "tip",
        icon: "Sparkles",
        title: "Try bulk generation",
        description: "Tier 3+ users can generate 5 pieces at once for 0.8 credits each. Save 20%!",
        actionText: "Learn more",
        actionUrl: "/dashboard/bulk-generate",
      });
    }

    return NextResponse.json({
      success: true,
      suggestions: suggestions.map(s => ({
        ...s,
        icon: s.icon, // Keep as string, component will map it
      })),
      usageData: {
        tier,
        credits,
        monthlyCredits,
        usagePercent,
        daysUntilRefresh,
        usageByFeature,
      },
    });
  } catch (error: any) {
    console.error('Error generating credit suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}


