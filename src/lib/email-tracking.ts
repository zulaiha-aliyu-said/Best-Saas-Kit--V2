/**
 * Email Tracking Functions
 * Track email sends, opens, clicks, and campaign stats
 */

import { pool } from './database';

export interface EmailTrackingData {
  emailId?: string;
  userId: string;
  recipientEmail: string;
  subject: string;
  emailType: 'welcome' | 'stacked' | 'campaign' | 'warning' | 'notification';
  campaignId?: number;
  tags?: { name: string; value: string }[];
}

/**
 * Track an email send
 */
export async function trackEmailSent(data: EmailTrackingData): Promise<number | null> {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO email_tracking (
          email_id, user_id, recipient_email, subject, email_type, 
          campaign_id, tags, status, sent_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'sent', CURRENT_TIMESTAMP)
        RETURNING id`,
        [
          data.emailId || null,
          data.userId,
          data.recipientEmail,
          data.subject,
          data.emailType,
          data.campaignId || null,
          JSON.stringify(data.tags || []),
        ]
      );
      
      return result.rows[0].id;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Error tracking email:', error);
    return null;
  }
}

/**
 * Update email delivery status
 */
export async function updateEmailStatus(
  emailId: string,
  status: 'delivered' | 'bounced' | 'failed'
): Promise<void> {
  try {
    const client = await pool.connect();
    try {
      await client.query(
        `UPDATE email_tracking 
         SET status = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE email_id = $2`,
        [status, emailId]
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Error updating email status:', error);
  }
}

/**
 * Track email open
 */
export async function trackEmailOpen(emailId: string): Promise<void> {
  try {
    const client = await pool.connect();
    try {
      await client.query(
        `UPDATE email_tracking 
         SET opened = TRUE, 
             opened_at = COALESCE(opened_at, CURRENT_TIMESTAMP),
             updated_at = CURRENT_TIMESTAMP 
         WHERE email_id = $1`,
        [emailId]
      );
      
      // Update campaign stats if applicable
      await client.query(
        `UPDATE email_campaigns ec
         SET opened_count = (
           SELECT COUNT(*) 
           FROM email_tracking 
           WHERE campaign_id = ec.id AND opened = TRUE
         )
         WHERE id = (
           SELECT campaign_id 
           FROM email_tracking 
           WHERE email_id = $1 AND campaign_id IS NOT NULL
         )`,
        [emailId]
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Error tracking email open:', error);
  }
}

/**
 * Track email click
 */
export async function trackEmailClick(emailId: string): Promise<void> {
  try {
    const client = await pool.connect();
    try {
      await client.query(
        `UPDATE email_tracking 
         SET clicked = TRUE, 
             clicked_at = COALESCE(clicked_at, CURRENT_TIMESTAMP),
             updated_at = CURRENT_TIMESTAMP 
         WHERE email_id = $1`,
        [emailId]
      );
      
      // Update campaign stats
      await client.query(
        `UPDATE email_campaigns ec
         SET clicked_count = (
           SELECT COUNT(*) 
           FROM email_tracking 
           WHERE campaign_id = ec.id AND clicked = TRUE
         )
         WHERE id = (
           SELECT campaign_id 
           FROM email_tracking 
           WHERE email_id = $1 AND campaign_id IS NOT NULL
         )`,
        [emailId]
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Error tracking email click:', error);
  }
}

/**
 * Create email campaign record
 */
export async function createEmailCampaign(params: {
  name?: string;
  subject: string;
  message: string;
  targetTiers?: number[];
  includeStackers?: boolean;
  minCredits?: number;
  maxCredits?: number;
  adminUserId: string;
}): Promise<number> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO email_campaigns (
        name, subject, message, target_tiers, include_stackers, 
        min_credits, max_credits, created_by_admin_id, sent_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      RETURNING id`,
      [
        params.name || `Campaign - ${new Date().toISOString()}`,
        params.subject,
        params.message,
        params.targetTiers || [],
        params.includeStackers,
        params.minCredits,
        params.maxCredits,
        params.adminUserId,
      ]
    );
    
    return result.rows[0].id;
  } finally {
    client.release();
  }
}

/**
 * Update campaign stats
 */
export async function updateCampaignStats(
  campaignId: number,
  stats: {
    targeted?: number;
    sent?: number;
    failed?: number;
  }
): Promise<void> {
  try {
    const client = await pool.connect();
    try {
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      if (stats.targeted !== undefined) {
        updates.push(`targeted_count = $${paramIndex++}`);
        values.push(stats.targeted);
      }
      if (stats.sent !== undefined) {
        updates.push(`sent_count = $${paramIndex++}`);
        values.push(stats.sent);
      }
      if (stats.failed !== undefined) {
        updates.push(`failed_count = $${paramIndex++}`);
        values.push(stats.failed);
      }
      
      if (updates.length > 0) {
        values.push(campaignId);
        await client.query(
          `UPDATE email_campaigns 
           SET ${updates.join(', ')} 
           WHERE id = $${paramIndex}`,
          values
        );
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Error updating campaign stats:', error);
  }
}

/**
 * Get email analytics for a campaign
 */
export async function getCampaignAnalytics(campaignId: number) {
  const client = await pool.connect();
  try {
    const campaign = await client.query(
      `SELECT * FROM email_campaigns WHERE id = $1`,
      [campaignId]
    );
    
    const emails = await client.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE opened = TRUE) as opened,
        COUNT(*) FILTER (WHERE clicked = TRUE) as clicked,
        COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
        COUNT(*) FILTER (WHERE status = 'bounced') as bounced,
        COUNT(*) FILTER (WHERE status = 'failed') as failed
       FROM email_tracking
       WHERE campaign_id = $1`,
      [campaignId]
    );
    
    return {
      campaign: campaign.rows[0],
      stats: emails.rows[0],
    };
  } finally {
    client.release();
  }
}

/**
 * Get all email campaigns with stats
 */
export async function getAllCampaigns(adminUserId?: string) {
  const client = await pool.connect();
  try {
    const query = adminUserId
      ? 'SELECT * FROM email_campaigns WHERE created_by_admin_id = $1 ORDER BY created_at DESC'
      : 'SELECT * FROM email_campaigns ORDER BY created_at DESC';
    
    const params = adminUserId ? [adminUserId] : [];
    const result = await client.query(query, params);
    
    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Get user email history
 */
export async function getUserEmailHistory(userId: string, limit = 50) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT 
        id, subject, email_type, status, 
        opened, opened_at, clicked, clicked_at, sent_at
       FROM email_tracking
       WHERE user_id = $1
       ORDER BY sent_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    
    return result.rows;
  } finally {
    client.release();
  }
}

