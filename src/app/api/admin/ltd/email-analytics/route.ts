/**
 * API Route: Email Analytics
 * GET /api/admin/ltd/email-analytics - Get email campaign analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/admin-auth';
import { pool } from '@/lib/database';

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

    const client = await pool.connect();
    
    try {
      // Get overall email stats
      const emailStatsResult = await client.query(`
        SELECT 
          COUNT(*) as total_sent,
          COUNT(*) FILTER (WHERE opened = TRUE) as total_opened,
          COUNT(*) FILTER (WHERE clicked = TRUE) as total_clicked,
          COUNT(*) FILTER (WHERE status = 'delivered') as total_delivered,
          COUNT(*) FILTER (WHERE status = 'bounced') as total_bounced,
          COUNT(*) FILTER (WHERE status = 'failed') as total_failed,
          COUNT(DISTINCT user_id) as unique_recipients
        FROM email_tracking
      `);
      
      const emailStats = emailStatsResult.rows[0];
      
      // Calculate rates
      const totalSent = parseInt(emailStats.total_sent) || 1; // Avoid division by zero
      emailStats.open_rate = ((parseInt(emailStats.total_opened) / totalSent) * 100).toFixed(2);
      emailStats.click_rate = ((parseInt(emailStats.total_clicked) / totalSent) * 100).toFixed(2);
      emailStats.delivery_rate = ((parseInt(emailStats.total_delivered) / totalSent) * 100).toFixed(2);
      emailStats.bounce_rate = ((parseInt(emailStats.total_bounced) / totalSent) * 100).toFixed(2);
      
      // Get stats by email type
      const typeStatsResult = await client.query(`
        SELECT 
          email_type,
          COUNT(*) as sent,
          COUNT(*) FILTER (WHERE opened = TRUE) as opened,
          COUNT(*) FILTER (WHERE clicked = TRUE) as clicked,
          ROUND(
            (COUNT(*) FILTER (WHERE opened = TRUE)::numeric / COUNT(*)::numeric * 100)::numeric, 2
          ) as open_rate
        FROM email_tracking
        GROUP BY email_type
        ORDER BY sent DESC
      `);
      
      // Get recent campaigns
      const campaignsResult = await client.query(`
        SELECT 
          c.*,
          u.email as admin_email,
          u.name as admin_name
        FROM email_campaigns c
        LEFT JOIN users u ON c.created_by_admin_id = u.id
        ORDER BY c.created_at DESC
        LIMIT 20
      `);
      
      // Get email volume over time (last 30 days)
      const volumeResult = await client.query(`
        SELECT 
          DATE(sent_at) as date,
          COUNT(*) as sent,
          COUNT(*) FILTER (WHERE opened = TRUE) as opened,
          COUNT(*) FILTER (WHERE clicked = TRUE) as clicked
        FROM email_tracking
        WHERE sent_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(sent_at)
        ORDER BY date DESC
      `);
      
      // Get top performing campaigns
      const topCampaignsResult = await client.query(`
        SELECT 
          c.id,
          c.name,
          c.subject,
          c.targeted_count,
          c.sent_count,
          c.opened_count,
          c.clicked_count,
          c.created_at,
          CASE 
            WHEN c.sent_count > 0 
            THEN ROUND((c.opened_count::numeric / c.sent_count::numeric * 100)::numeric, 2)
            ELSE 0
          END as open_rate,
          CASE 
            WHEN c.sent_count > 0 
            THEN ROUND((c.clicked_count::numeric / c.sent_count::numeric * 100)::numeric, 2)
            ELSE 0
          END as click_rate
        FROM email_campaigns c
        WHERE c.sent_count > 0
        ORDER BY open_rate DESC, click_rate DESC
        LIMIT 10
      `);
      
      return NextResponse.json({
        success: true,
        data: {
          overview: emailStats,
          byType: typeStatsResult.rows,
          campaigns: campaignsResult.rows,
          volumeOverTime: volumeResult.rows,
          topCampaigns: topCampaignsResult.rows,
        },
      });
      
    } finally {
      client.release();
    }
    
  } catch (error: any) {
    console.error('Email analytics error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch email analytics' },
      { status: 500 }
    );
  }
}
