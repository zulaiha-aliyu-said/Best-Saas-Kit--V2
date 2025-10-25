/**
 * Cron Job: Low Credit Warnings
 * GET /api/cron/check-low-credits
 * 
 * Sends warning emails to users with less than 20% credits remaining
 * Call this endpoint daily via a cron service
 */

import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/database';
import { sendEmail, creditLowWarningEmail } from '@/lib/resend';
import { trackEmailSent } from '@/lib/email-tracking';

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

    console.log('⚠️ Checking for low credit users...');

    const client = await pool.connect();
    
    try {
      // Find LTD users with less than 20% credits remaining
      // AND who haven't been warned in the last 7 days
      const lowCreditUsers = await client.query(
        `SELECT 
          u.id, 
          u.email, 
          u.name, 
          u.credits, 
          u.monthly_credit_limit, 
          u.credit_reset_date,
          u.ltd_tier
         FROM users u
         WHERE u.plan_type = 'ltd'
         AND u.monthly_credit_limit > 0
         AND (u.credits::float / u.monthly_credit_limit::float) < 0.20
         AND (
           u.last_low_credit_warning IS NULL 
           OR u.last_low_credit_warning < CURRENT_DATE - INTERVAL '7 days'
         )
         ORDER BY (u.credits::float / u.monthly_credit_limit::float) ASC`
      );

      console.log(`📊 Found ${lowCreditUsers.rows.length} users with low credits`);

      if (lowCreditUsers.rows.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No users need low credit warnings',
          sent: 0,
        });
      }

      const emailResults = {
        sent: 0,
        failed: 0,
        errors: [] as string[],
      };

      for (const user of lowCreditUsers.rows) {
        try {
          const percentage = ((user.credits / user.monthly_credit_limit) * 100).toFixed(0);
          const resetDate = new Date(user.credit_reset_date);

          console.log(`📧 Sending low credit warning to ${user.email} (${percentage}% remaining)`);

          // Send warning email
          const emailResult = await sendEmail({
            to: user.email,
            subject: `⚠️ Low Credit Alert - ${percentage}% Remaining`,
            html: creditLowWarningEmail(
              user.name || 'there',
              user.credits,
              user.monthly_credit_limit,
              resetDate
            ),
            emailType: 'warning',
            tags: [
              { name: 'tier', value: String(user.ltd_tier) },
              { name: 'credits_remaining', value: String(user.credits) },
              { name: 'percentage', value: percentage },
            ],
          });

          if (emailResult.success) {
            // Track email
            if (emailResult.emailId) {
              await trackEmailSent({
                emailId: emailResult.emailId,
                userId: user.id,
                recipientEmail: user.email,
                subject: `⚠️ Low Credit Alert - ${percentage}% Remaining`,
                emailType: 'warning',
                tags: [{ name: 'credits_remaining', value: String(user.credits) }],
              });
            }

            // Update last warning date
            await client.query(
              `UPDATE users 
               SET last_low_credit_warning = CURRENT_TIMESTAMP 
               WHERE id = $1`,
              [user.id]
            );

            emailResults.sent++;
            console.log(`✅ Warning sent to ${user.email}`);
          } else {
            const errorMsg = (emailResult.error as any)?.message || 'Email failed';
            throw new Error(errorMsg);
          }

        } catch (error: any) {
          console.error(`❌ Failed to warn ${user.email}:`, error.message);
          emailResults.failed++;
          emailResults.errors.push(`${user.email}: ${error.message}`);
        }
      }

      console.log(`🎉 Low credit warnings complete: ${emailResults.sent} sent, ${emailResults.failed} failed`);

      return NextResponse.json({
        success: true,
        message: `Sent ${emailResults.sent} low credit warnings`,
        sent: emailResults.sent,
        failed: emailResults.failed,
        errors: emailResults.errors.length > 0 ? emailResults.errors : undefined,
      });

    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error('❌ Low credit check error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to check low credits'
      },
      { status: 500 }
    );
  }
}

// Allow GET requests
export const dynamic = 'force-dynamic';

