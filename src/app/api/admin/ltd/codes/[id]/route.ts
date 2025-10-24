/**
 * API Route: Single LTD Code Management
 * PATCH /api/admin/ltd/codes/[id] - Update code
 * DELETE /api/admin/ltd/codes/[id] - Delete code
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/admin-auth';
import {
  getLTDCodeById,
  updateLTDCode,
  deleteLTDCode,
  logAdminAction,
} from '@/lib/ltd-admin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin access
    const authResult = await requireAdminAccess();
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const admin = authResult.admin!;
    const codeId = parseInt(params.id);

    if (isNaN(codeId)) {
      return NextResponse.json(
        { error: 'Invalid code ID' },
        { status: 400 }
      );
    }

    // Check if code exists
    const existingCode = await getLTDCodeById(codeId);
    if (!existingCode) {
      return NextResponse.json(
        { error: 'Code not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { maxRedemptions, expiresAt, isActive, notes } = body;

    const updates: any = {};
    if (maxRedemptions !== undefined) updates.max_redemptions = maxRedemptions;
    if (expiresAt !== undefined) updates.expires_at = expiresAt ? new Date(expiresAt) : null;
    if (isActive !== undefined) updates.is_active = isActive;
    if (notes !== undefined) updates.notes = notes;

    // Update code
    const updatedCode = await updateLTDCode(codeId, updates);

    // Log admin action
    await logAdminAction(
      admin.id,
      'code_updated',
      codeId.toString(),
      {
        code: existingCode.code,
        updates,
      }
    );

    return NextResponse.json({
      success: true,
      code: updatedCode,
    });
  } catch (error) {
    console.error('Error updating LTD code:', error);
    return NextResponse.json(
      { error: 'Failed to update code' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Check admin access
    const authResult = await requireAdminAccess();
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const admin = authResult.admin!;
    const codeId = parseInt(context.params.id);

    if (isNaN(codeId)) {
      return NextResponse.json(
        { error: 'Invalid code ID' },
        { status: 400 }
      );
    }

    // Check if code exists
    const existingCode = await getLTDCodeById(codeId);
    if (!existingCode) {
      return NextResponse.json(
        { error: 'Code not found' },
        { status: 404 }
      );
    }

    // Check if code has been redeemed
    if (existingCode.current_redemptions > 0) {
      return NextResponse.json(
        { error: 'Cannot delete a code that has been redeemed. Consider deactivating it instead.' },
        { status: 400 }
      );
    }

    // Delete code
    await deleteLTDCode(codeId);

    // Log admin action
    await logAdminAction(
      admin.id,
      'code_deleted',
      codeId.toString(),
      {
        code: existingCode.code,
        tier: existingCode.tier,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Code deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting LTD code:', error);
    return NextResponse.json(
      { error: 'Failed to delete code' },
      { status: 500 }
    );
  }
}





