/**
 * Cron Job: Expire Old Codes
 * GET /api/cron/expire-codes
 * 
 * Automatically disables LTD codes that have passed their expiration date
 * Call this endpoint daily via a cron service
 */

import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (optional security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('📅 Checking for expired LTD codes...');

    const client = await pool.connect();
    
    try {
      // Find and disable codes that have expired
      const result = await client.query(
        `UPDATE ltd_codes
         SET is_active = FALSE,
             updated_at = CURRENT_TIMESTAMP
         WHERE is_active = TRUE
         AND expires_at IS NOT NULL
         AND expires_at <= CURRENT_TIMESTAMP
         RETURNING id, code, tier, expires_at`
      );

      const expiredCodes = result.rows;

      console.log(`📊 Found and disabled ${expiredCodes.length} expired codes`);

      if (expiredCodes.length > 0) {
        console.log('Expired codes:', expiredCodes.map(c => c.code).join(', '));
      }

      return NextResponse.json({
        success: true,
        message: `Expired ${expiredCodes.length} codes`,
        expired: expiredCodes.length,
        codes: expiredCodes,
      });

    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error('❌ Code expiration error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to expire codes'
      },
      { status: 500 }
    );
  }
}

// Allow GET requests
export const dynamic = 'force-dynamic';

