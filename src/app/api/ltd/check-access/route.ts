/**
 * API Route: Check Feature Access
 * GET /api/ltd/check-access
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { checkFeatureAccess, checkCreditAccess, getUserPlan } from '@/lib/feature-gate';

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
    const feature = searchParams.get('feature');
    const action = searchParams.get('action');
    
    // Get user plan
    if (!feature && !action) {
      const plan = await getUserPlan(userId);
      return NextResponse.json({ plan });
    }
    
    // Check feature access
    if (feature) {
      const access = await checkFeatureAccess(userId, feature);
      return NextResponse.json({ feature, access });
    }
    
    // Check credit access for action
    if (action) {
      const access = await checkCreditAccess(userId, action);
      return NextResponse.json({ action, access });
    }
    
    return NextResponse.json(
      { error: 'Please specify feature or action parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error checking access:', error);
    return NextResponse.json(
      { error: 'Failed to check access' },
      { status: 500 }
    );
  }
}

