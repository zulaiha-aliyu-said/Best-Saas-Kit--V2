/**
 * API Route: Bulk Email Campaigns
 * POST /api/admin/ltd/campaigns - Send bulk email to LTD users
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAccess, logAdminAction } from '@/lib/admin-auth';
import { pool } from '@/lib/database';
import { sendEmail } from '@/lib/email';
import { createEmailCampaign, updateCampaignStats, trackEmailSent } from '@/lib/email-tracking';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminAccess();
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { 
      subject, 
      message, 
      targetTiers, 
      targetUsers, 
      includeStackers, 
      minCredits, 
      maxCredits 
    } = await request.json();

    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Build query to get target users
      let query = `
        SELECT u.id, u.email, u.name, u.ltd_tier, u.credits
        FROM users u
        WHERE u.plan_type = 'ltd'
      `;

      const params: any[] = [];
      let paramIndex = 1;

      // Filter by tiers
      if (targetTiers && targetTiers.length > 0) {
        query += ` AND u.ltd_tier = ANY($${paramIndex})`;
        params.push(targetTiers);
        paramIndex++;
      }

      // Filter by specific user IDs
      if (targetUsers && targetUsers.length > 0) {
        query += ` AND u.id = ANY($${paramIndex})`;
        params.push(targetUsers);
        paramIndex++;
      }

      // Filter by stacked codes
      if (includeStackers !== undefined) {
        if (includeStackers) {
          query += ` AND u.stacked_codes > 1`;
        } else {
          query += ` AND u.stacked_codes = 1`;
        }
      }

      // Filter by credit range
      if (minCredits !== undefined) {
        query += ` AND u.credits >= $${paramIndex}`;
        params.push(minCredits);
        paramIndex++;
      }

      if (maxCredits !== undefined) {
        query += ` AND u.credits <= $${paramIndex}`;
        params.push(maxCredits);
        paramIndex++;
      }

      // Execute query
      const result = await client.query(query, params);
      const users = result.rows;

      console.log(`📧 Campaign targeting ${users.length} users`);

      // Create campaign record
      const campaignId = await createEmailCampaign({
        subject,
        message,
        targetTiers,
        includeStackers,
        minCredits,
        maxCredits,
        adminUserId: authResult.admin!.id,
      });

      // Send emails
      const emailResults = {
        success: 0,
        failed: 0,
        errors: [] as string[]
      };

      for (const user of users) {
        try {
          const emailResult = await sendEmail({
            to: user.email,
            subject,
            html: renderCampaignEmail(message, user),
            emailType: 'campaign',
            tags: [
              { name: 'campaign_id', value: String(campaignId) },
              { name: 'user_tier', value: String(user.ltd_tier) },
            ],
          });
          
          // Track email send
          if (emailResult.success && emailResult.emailId) {
            await trackEmailSent({
              emailId: emailResult.emailId,
              userId: user.id,
              recipientEmail: user.email,
              subject,
              emailType: 'campaign',
              campaignId,
              tags: [
                { name: 'tier', value: String(user.ltd_tier) },
              ],
            });
          }
          
          emailResults.success++;
        } catch (error: any) {
          console.error(`Failed to send email to ${user.email}:`, error.message);
          emailResults.failed++;
          emailResults.errors.push(`${user.email}: ${error.message}`);
        }
      }

      // Update campaign stats
      await updateCampaignStats(campaignId, {
        targeted: users.length,
        sent: emailResults.success,
        failed: emailResults.failed,
      });

      // Log admin action
      if (authResult.admin?.id) {
        await logAdminAction(
          authResult.admin.id,
          'bulk_email',
          null,
          {
            subject,
            targetCount: users.length,
            successCount: emailResults.success,
            failedCount: emailResults.failed,
            filters: {
              targetTiers,
              includeStackers,
              minCredits,
              maxCredits
            }
          }
        );
      }

      return NextResponse.json({
        success: true,
        targeted: users.length,
        sent: emailResults.success,
        failed: emailResults.failed,
        errors: emailResults.errors.length > 0 ? emailResults.errors : undefined
      });

    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error('Campaign error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send campaign' },
      { status: 500 }
    );
  }
}

function renderCampaignEmail(message: string, user: any): string {
  // Replace placeholders
  let html = message
    .replace(/{{name}}/g, user.name || 'there')
    .replace(/{{email}}/g, user.email)
    .replace(/{{tier}}/g, user.ltd_tier?.toString() || 'N/A')
    .replace(/{{credits}}/g, user.credits?.toString() || '0')
    .replace(/\n/g, '<br>');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">RepurposeAI</h1>
        </div>
        <div class="content">
          ${html}
        </div>
        <div class="footer">
          <p>You're receiving this because you're a valued LTD customer.</p>
          <p>© 2025 RepurposeAI. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}




