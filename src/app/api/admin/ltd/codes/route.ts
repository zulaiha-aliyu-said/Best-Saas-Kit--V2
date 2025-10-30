/**
 * API Route: Admin LTD Code Management
 * GET /api/admin/ltd/codes - List all codes with filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/admin-auth';
import { getLTDCodes, CodeFilters } from '@/lib/ltd-admin';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // Check admin access
    const authResult = await requireAdminAccess();
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Parse filters from query params
    const { searchParams } = new URL(request.url);
    
    const filters: CodeFilters = {
      tier: searchParams.get('tier') ? parseInt(searchParams.get('tier')!) as any : undefined,
      status: searchParams.get('status') as any,
      batchId: searchParams.get('batchId') || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
    };

    // Get codes with filters
    const result = await getLTDCodes(filters);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error fetching LTD codes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch codes' },
      { status: 500 }
    );
  }
}




