/**
 * API Route: Credit Management
 * GET  /api/ltd/credits - Get credit info
 * POST /api/ltd/credits - Deduct credits
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { 
  getUserPlan, 
  deductCredits, 
  addCredits,
  getCreditUsageAnalytics,
  checkAndResetCredits 
} from '@/lib/feature-gate';
import { calculateCreditCost } from '@/lib/ltd-tiers';

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
    const { searchParams } = new URL(request.url);
    const analytics = searchParams.get('analytics') === 'true';
    const days = parseInt(searchParams.get('days') || '30');
    
    // Check if credits need reset
    await checkAndResetCredits(userId);
    
    // Get user plan
    const plan = await getUserPlan(userId);
    
    if (!plan) {
      return NextResponse.json(
        { error: 'User plan not found' },
        { status: 404 }
      );
    }
    
    const response: any = {
      credits: plan.credits,
      monthly_limit: plan.monthly_credit_limit,
      rollover: plan.rollover_credits,
      reset_date: plan.credit_reset_date,
      percentage_used: Math.round(
        ((plan.monthly_credit_limit - plan.credits) / plan.monthly_credit_limit) * 100
      ),
    };
    
    // Include analytics if requested
    if (analytics) {
      const usageAnalytics = await getCreditUsageAnalytics(userId, days);
      response.analytics = usageAnalytics;
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error getting credits:', error);
    return NextResponse.json(
      { error: 'Failed to get credits' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const body = await request.json();
    const { action, amount, metadata } = body;
    
    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }
    
    // Get user plan to calculate tier-specific cost
    const plan = await getUserPlan(userId);
    const creditCost = amount ?? calculateCreditCost(action, plan?.ltd_tier ?? undefined);
    
    // Deduct credits
    const result = await deductCredits(userId, creditCost, action, metadata);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error || 'Failed to deduct credits',
          remaining: result.remaining 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      credits_used: creditCost,
      remaining: result.remaining,
    });
  } catch (error) {
    console.error('Error deducting credits:', error);
    return NextResponse.json(
      { error: 'Failed to deduct credits' },
      { status: 500 }
    );
  }
}

