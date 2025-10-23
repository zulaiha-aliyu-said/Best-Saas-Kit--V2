/**
 * API Route: Get User Features
 * GET /api/ltd/features
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserFeatures, getUserPlan } from '@/lib/feature-gate';
import { getLTDTierConfig } from '@/lib/ltd-tiers';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Get user plan
    const plan = await getUserPlan(userId);
    
    if (!plan) {
      return NextResponse.json(
        { error: 'User plan not found' },
        { status: 404 }
      );
    }
    
    // Get features
    const features = await getUserFeatures(userId);
    
    // Get tier config if LTD user
    let tierConfig = null;
    if (plan.plan_type === 'ltd' && plan.ltd_tier) {
      tierConfig = getLTDTierConfig(plan.ltd_tier);
    }
    
    return NextResponse.json({
      plan: {
        type: plan.plan_type,
        status: plan.subscription_status,
        tier: plan.ltd_tier,
        credits: plan.credits,
        monthly_limit: plan.monthly_credit_limit,
        rollover: plan.rollover_credits,
        reset_date: plan.credit_reset_date,
        stacked_codes: plan.stacked_codes,
      },
      features,
      tierConfig,
    });
  } catch (error) {
    console.error('Error getting features:', error);
    return NextResponse.json(
      { error: 'Failed to get features' },
      { status: 500 }
    );
  }
}

