/**
 * API Route: Generate LTD Codes
 * POST /api/admin/ltd/codes/generate
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/admin-auth';
import { logAdminAction } from '@/lib/ltd-admin';
import { generateLTDCodes, exportCodesToCSV } from '@/lib/ltd-admin';
import { LTDTier } from '@/lib/ltd-tiers';

export async function POST(request: NextRequest) {
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
    const body = await request.json();

    const {
      tier,
      quantity,
      prefix,
      maxRedemptions = 1,
      expiresAt,
      notes,
      exportCsv = false,
    } = body;

    // Validate required fields
    if (!tier || !quantity) {
      return NextResponse.json(
        { error: 'Tier and quantity are required' },
        { status: 400 }
      );
    }

    // Validate tier
    if (![1, 2, 3, 4].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be 1, 2, 3, or 4' },
        { status: 400 }
      );
    }

    // Validate quantity
    if (quantity < 1 || quantity > 1000) {
      return NextResponse.json(
        { error: 'Quantity must be between 1 and 1000' },
        { status: 400 }
      );
    }

    // Generate codes
    const codes = await generateLTDCodes({
      tier: tier as LTDTier,
      quantity,
      prefix,
      maxRedemptions,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      notes,
      adminUserId: admin.id,
    });

    // Log admin action
    await logAdminAction(
      admin.id,
      'codes_generated',
      codes[0]?.batch_id || undefined,
      {
        tier,
        quantity,
        prefix,
        batchId: codes[0]?.batch_id,
      }
    );

    // Export to CSV if requested
    let csv: string | undefined;
    if (exportCsv) {
      csv = exportCodesToCSV(codes);
    }

    return NextResponse.json({
      success: true,
      codes,
      count: codes.length,
      batchId: codes[0]?.batch_id,
      csv: csv || undefined,
    });
  } catch (error) {
    console.error('Error generating LTD codes:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate codes'
      },
      { status: 500 }
    );
  }
}





