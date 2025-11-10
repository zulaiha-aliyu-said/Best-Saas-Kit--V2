
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/admin-auth';
import { bulkDeleteLTDCodes, CodeFilters } from '@/lib/ltd-admin';

export const runtime = 'edge';

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAdminAccess();
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(request.url);

    const filters: Omit<CodeFilters, 'page' | 'limit'> = {
      tier: searchParams.get('tier') ? parseInt(searchParams.get('tier')!) as any : undefined,
      status: searchParams.get('status') as any,
      batchId: searchParams.get('batchId') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const { deletedCount, skippedCount } = await bulkDeleteLTDCodes(filters);

    return NextResponse.json({
      success: true,
      deletedCount,
      skippedCount,
    });
  } catch (error) {
    console.error('Error bulk deleting LTD codes:', error);
    return NextResponse.json({ error: 'Failed to bulk delete codes' }, { status: 500 });
  }
}
