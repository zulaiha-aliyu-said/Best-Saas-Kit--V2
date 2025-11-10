
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/admin-auth';
import { getLTDCodes, CodeFilters } from '@/lib/ltd-admin';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAccess();
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { searchParams } = new URL(request.url);

    const filters: CodeFilters = {
      tier: searchParams.get('tier') ? parseInt(searchParams.get('tier')!) as any : undefined,
      status: searchParams.get('status') as any,
      batchId: searchParams.get('batchId') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const { codes } = await getLTDCodes(filters);

    const csvData = codes.map(code => `${code.code},${code.tier}`).join('\n');
    const csv = `Code,Tier\n${csvData}`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="codes.csv"',
      },
    });
  } catch (error) {
    console.error('Error exporting LTD codes:', error);
    return NextResponse.json(
      { error: 'Failed to export codes' },
      { status: 500 }
    );
  }
}
