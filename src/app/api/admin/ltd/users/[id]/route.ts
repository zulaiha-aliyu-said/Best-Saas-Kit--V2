/**
 * API Route: Admin Single User Management
 * GET /api/admin/ltd/users/[id] - Get user details
 * PATCH /api/admin/ltd/users/[id] - Update user
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/admin-auth';
import { getLTDUserById, updateUserLTDPlan } from '@/lib/ltd-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminAccess();
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { id } = await params;
    const user = await getLTDUserById(id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminAccess();
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { ltd_tier, credits, monthly_credit_limit } = body;

    const updatedUser = await updateUserLTDPlan(
      id,
      authResult.user!.id!,
      {
        ltd_tier,
        credits,
        monthly_credit_limit,
      }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}





