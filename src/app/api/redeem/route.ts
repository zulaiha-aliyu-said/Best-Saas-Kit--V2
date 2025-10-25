/**
 * API Route: Code Redemption
 * POST /api/redeem - Redeem an LTD code
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { pool, upsertUser } from '@/lib/database';
import { LTD_TIERS, getSubscriptionStatusFromTier, type LTDTier } from '@/lib/ltd-tiers';
import { sendEmail, welcomeEmailTemplate, codeStackedEmailTemplate } from '@/lib/resend';
import { trackEmailSent } from '@/lib/email-tracking';

export async function POST(request: NextRequest) {
  console.log('🎫 === CODE REDEMPTION REQUEST ===');
  
  try {
    const session = await auth();
    console.log('👤 User session:', session?.user?.email);
    
    if (!session?.user?.id || !session?.user?.email) {
      console.log('❌ No session found');
      return NextResponse.json(
        { error: 'You must be logged in to redeem a code' },
        { status: 401 }
      );
    }

    const { code } = await request.json();
    console.log('🔍 Attempting to redeem code:', code);

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Valid code is required' },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const userEmail = session.user.email!;
    const userName = session.user.name;

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Ensure user exists in database (inside transaction)
      console.log('🔍 Ensuring user exists in database...');
      const upsertResult = await client.query(
        `INSERT INTO users (id, google_id, email, name, image_url, last_login)
         VALUES ($1, $1, $2, $3, $4, CURRENT_TIMESTAMP)
         ON CONFLICT (google_id)
         DO UPDATE SET
           email = EXCLUDED.email,
           name = EXCLUDED.name,
           image_url = EXCLUDED.image_url,
           last_login = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [
          session.user.id,
          session.user.email,
          session.user.name || null,
          session.user.image || null
        ]
      );
      // Use the returned user from upsert
      const user = upsertResult.rows[0];
      console.log('✅ User record ensured:', user.email, '| ID:', user.id);

      // 1. Check if code exists and get its details
      console.log('🔍 Looking up code in database...');
      const codeResult = await client.query(
        `SELECT * FROM ltd_codes WHERE UPPER(code) = UPPER($1)`,
        [code.trim()]
      );

      if (codeResult.rows.length === 0) {
        console.log('❌ Code not found in database');
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: 'Invalid code. Please check and try again.' },
          { status: 404 }
        );
      }

      const ltdCode = codeResult.rows[0];
      console.log('✅ Code found:', {
        code: ltdCode.code,
        tier: ltdCode.tier,
        is_active: ltdCode.is_active,
        current_redemptions: ltdCode.current_redemptions,
        max_redemptions: ltdCode.max_redemptions
      });

      // 2. Validate code status
      if (!ltdCode.is_active) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: 'This code has been deactivated' },
          { status: 400 }
        );
      }

      if (ltdCode.current_redemptions >= ltdCode.max_redemptions) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: 'This code has already been fully redeemed' },
          { status: 400 }
        );
      }

      if (ltdCode.expires_at && new Date(ltdCode.expires_at) <= new Date()) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: 'This code has expired' },
          { status: 400 }
        );
      }

      // 3. Check if user has already redeemed this specific code
      const existingRedemption = await client.query(
        `SELECT * FROM ltd_redemptions WHERE user_id = $1 AND code_id = $2`,
        [user.id, ltdCode.id]
      );

      if (existingRedemption.rows.length > 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: 'You have already redeemed this code' },
          { status: 400 }
        );
      }

      // 4. Use user data from upsert (no need to query again)
      console.log('✅ User plan:', user.plan_type || 'none', '| Current tier:', user.ltd_tier || 'none');
      const isFirstRedemption = user.plan_type !== 'ltd';
      const currentTier = user.ltd_tier || 0;
      const newTier = Math.max(currentTier, ltdCode.tier);

      // 5. Get tier configuration
      const tierConfig = LTD_TIERS.find(t => t.tier === newTier);
      if (!tierConfig) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: 'Invalid tier configuration' },
          { status: 500 }
        );
      }

      // 6. Calculate new credit limit (stacking)
      const currentLimit = user.monthly_credit_limit || 0;
      const codeLimit = LTD_TIERS.find(t => t.tier === ltdCode.tier)?.features.monthly_credits || 0;
      const newMonthlyLimit = currentLimit + codeLimit;
      
      // Calculate new credits (add code credits to current balance)
      const newCredits = user.credits + codeLimit;

      // 7. Update user account
      await client.query(
        `UPDATE users 
         SET 
           plan_type = 'ltd',
           ltd_tier = $1,
           monthly_credit_limit = $2,
           credits = $3,
           subscription_status = $4,
           stacked_codes = stacked_codes + 1,
           credit_reset_date = COALESCE(credit_reset_date, CURRENT_TIMESTAMP + INTERVAL '1 month'),
           updated_at = CURRENT_TIMESTAMP
         WHERE id = $5`,
        [
          newTier,
          newMonthlyLimit,
          newCredits,
          getSubscriptionStatusFromTier(newTier as LTDTier),
          user.id
        ]
      );

      // 8. Record redemption
      await client.query(
        `INSERT INTO ltd_redemptions (user_id, code_id, tier, credits_added, previous_tier, redeemed_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
        [user.id, ltdCode.id, ltdCode.tier, codeLimit, user.ltd_tier || 0]
      );

      // 9. Update code redemption count
      await client.query(
        `UPDATE ltd_codes 
         SET current_redemptions = current_redemptions + 1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [ltdCode.id]
      );

      await client.query('COMMIT');
      console.log('✅ Transaction committed successfully');

      // 10. Send email notification
      console.log('📧 Sending email notification...');
      try {
        const emailType = isFirstRedemption ? 'welcome' : 'stacked';
        const subject = isFirstRedemption 
          ? `🎉 Welcome to RepurposeAI LTD - Tier ${newTier}!`
          : `🎊 LTD Code Stacked Successfully!`;
        const html = isFirstRedemption
          ? welcomeEmailTemplate(userName || 'there', newTier, newMonthlyLimit, code)
          : codeStackedEmailTemplate(userName || 'there', newTier, newMonthlyLimit, user.stacked_codes + 1);
        
        const emailResult = await sendEmail({
          to: userEmail,
          subject,
          html,
          emailType,
          tags: [
            { name: 'tier', value: String(newTier) },
            { name: 'is_first', value: String(isFirstRedemption) },
            { name: 'code', value: code },
          ],
        });
        
        // Track email send
        if (emailResult.success && emailResult.emailId) {
          await trackEmailSent({
            emailId: emailResult.emailId,
            userId: user.id,
            recipientEmail: userEmail,
            subject,
            emailType,
            tags: [
              { name: 'tier', value: String(newTier) },
              { name: 'is_first', value: String(isFirstRedemption) },
            ],
          });
        }
        
        console.log('✅ Email sent and tracked successfully');
      } catch (emailError) {
        console.error('⚠️ Failed to send email, but redemption successful:', emailError);
        // Don't fail the redemption if email fails
      }

      const response = {
        success: true,
        message: isFirstRedemption 
          ? 'Code redeemed successfully! Welcome to LTD!' 
          : 'Code stacked successfully!',
        isFirstRedemption,
        tier: newTier,
        monthlyCredits: newMonthlyLimit,
        currentCredits: newCredits,
        stackedCodes: user.stacked_codes + 1,
      };

      console.log('🎉 Redemption successful:', response);
      return NextResponse.json(response);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error('❌ Error redeeming code:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to redeem code. Please try again.',
        details: error.message,
        ...(process.env.NODE_ENV === 'development' && { 
          debug: error.stack,
          errorCode: error.code,
          errorDetail: error.detail,
        })
      },
      { status: 500 }
    );
  }
}

