/**
 * Cron Job: Monthly Credit Refresh
 * GET /api/cron/credit-refresh
 * 
 * Refreshes credits for all LTD users whose reset date has passed
 * Call this endpoint daily via a cron service (Vercel Cron, GitHub Actions, etc.)
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

    console.log('🔄 Starting monthly credit refresh...');

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Find all LTD users whose credit_reset_date has passed
      const usersToRefresh = await client.query(
        `SELECT id, email, name, monthly_credit_limit, credits, credit_reset_date, ltd_tier
         FROM users
         WHERE plan_type = 'ltd'
         AND credit_reset_date <= CURRENT_TIMESTAMP
         ORDER BY id`
      );

      console.log(`📊 Found ${usersToRefresh.rows.length} users to refresh`);

      if (usersToRefresh.rows.length === 0) {
        await client.query('COMMIT');
        return NextResponse.json({
          success: true,
          message: 'No users need credit refresh',
          refreshed: 0,
        });
      }

      const refreshed: any[] = [];
      const errors: string[] = [];

      for (const user of usersToRefresh.rows) {
        try {
          const oldCredits = user.credits;
          const creditLimit = user.monthly_credit_limit;
          
          // Calculate rollover credits (up to 12 months worth)
          const maxRollover = creditLimit * 12; // 12 months max
          const currentRollover = user.credits; // Unused credits become rollover
          const newRollover = Math.min(currentRollover, maxRollover);
          
          // Reset credits to monthly limit
          const newCredits = creditLimit;
          
          // Update user
          const updateResult = await client.query(
            `UPDATE users
             SET credits = $1,
                 rollover_credits = $2,
                 credit_reset_date = credit_reset_date + INTERVAL '1 month',
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $3
             RETURNING id, email, credits, credit_reset_date`,
            [newCredits, newRollover, user.id]
          );

          const updated = updateResult.rows[0];

          // Log the refresh
          await client.query(
            `INSERT INTO credit_usage (user_id, action_type, credits_used, metadata, created_at)
             VALUES ($1, 'credit_refresh', $2, $3, CURRENT_TIMESTAMP)`,
            [
              user.id,
              0, // No credits "used", this is a refresh
              JSON.stringify({
                old_credits: oldCredits,
                new_credits: newCredits,
                rollover: newRollover,
                monthly_limit: creditLimit,
                next_reset: updated.credit_reset_date,
              })
            ]
          );

          refreshed.push({
            user_id: user.id,
            email: user.email,
            old_credits: oldCredits,
            new_credits: newCredits,
            rollover: newRollover,
            next_reset: updated.credit_reset_date,
          });

          console.log(`✅ Refreshed: ${user.email} (${oldCredits} → ${newCredits} + ${newRollover} rollover)`);

        } catch (userError: any) {
          console.error(`❌ Error refreshing user ${user.email}:`, userError.message);
          errors.push(`${user.email}: ${userError.message}`);
        }
      }

      await client.query('COMMIT');

      console.log(`🎉 Credit refresh complete: ${refreshed.length} users refreshed`);

      return NextResponse.json({
        success: true,
        message: `Refreshed ${refreshed.length} users`,
        refreshed: refreshed.length,
        users: refreshed,
        errors: errors.length > 0 ? errors : undefined,
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error('❌ Credit refresh error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to refresh credits'
      },
      { status: 500 }
    );
  }
}

// Allow GET requests
export const dynamic = 'force-dynamic';

