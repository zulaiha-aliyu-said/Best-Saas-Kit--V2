/**
 * API Route: Get User Tier
 * GET /api/user/tier - Returns user's LTD tier
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserPlan } from '@/lib/feature-gate';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const plan = await getUserPlan(session.user.id);
    
    return NextResponse.json({
      tier: plan?.ltd_tier || 1,
      planType: plan?.plan_type || 'free',
      credits: plan?.credits || 0,
      monthlyLimit: plan?.monthly_credit_limit || 0,
    });

  } catch (error: any) {
    console.error('Error fetching user tier:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user tier' },
      { status: 500 }
    );
  }
}
