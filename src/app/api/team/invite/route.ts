import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserPlan } from '@/lib/feature-gate';
import { pool } from '@/lib/database';

export const runtime = 'edge';

// Helper function to generate random hex string using Web Crypto API
function generateRandomHex(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
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

    const { email, role = 'member' } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get user plan and check tier access
    const plan = await getUserPlan(session.user.id);
    
    // 🔒 TIER 4+ FEATURE - Check access
    if (plan?.plan_type === 'ltd') {
      const userTier = plan.ltd_tier || 1;
      
      if (userTier < 4) {
        return NextResponse.json({
          error: 'Tier 4+ Required',
          message: 'Team Collaboration is a Tier 4+ feature. Upgrade to invite up to 3 team members.',
          code: 'TIER_RESTRICTED',
          currentTier: userTier,
          requiredTier: 4,
          upgradeUrl: '/redeem'
        }, { status: 403 });
      }

      // Check team member limit (3 for Tier 4)
      const countResult = await pool.query(
        'SELECT COUNT(*) as count FROM team_members WHERE owner_id = $1 AND status = $2',
        [session.user.id, 'active']
      );

      const currentCount = parseInt(countResult.rows[0].count);
      const maxMembers = 3;

      if (currentCount >= maxMembers) {
        return NextResponse.json({
          error: 'Team Member Limit Reached',
          message: `You've reached your limit of ${maxMembers} team members for Tier ${userTier}.`,
          code: 'LIMIT_EXCEEDED',
          current: currentCount,
          limit: maxMembers
        }, { status: 429 });
      }
    }

    // Generate invitation token
    const token = generateRandomHex(32);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create invitation
    await pool.query(
      `INSERT INTO team_invitations (owner_id, invitee_email, invitation_token, role, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (owner_id, invitee_email)
       DO UPDATE SET
         invitation_token = $3,
         status = 'pending',
         expires_at = $5,
         created_at = CURRENT_TIMESTAMP`,
      [session.user.id, email.toLowerCase(), token, role, expiresAt]
    );

    // In production, send invitation email here
    const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL}/team/accept/${token}`;

    return NextResponse.json({
      success: true,
      invitationLink,
      expiresAt: expiresAt.toISOString()
    });

  } catch (error: any) {
    console.error('Error inviting team member:', error);
    return NextResponse.json(
      { error: 'Failed to invite team member', details: error.message },
      { status: 500 }
    );
  }
}
