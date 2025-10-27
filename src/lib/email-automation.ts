/**
 * Email Automation System
 * Automatically triggers conversion-optimized emails based on user behavior
 */

import { 
  createCreditWarningUpgradeEmail,
  createReengagementEmail,
  createPerformanceSummaryEmail,
  sendEmail 
} from './resend';
import { pool } from './database';

// Check and send credit warning emails
export async function checkCreditWarnings() {
  const client = await pool.connect();
  
  try {
    // Find users with low credits (< 3 remaining) who haven't received a warning in the last 7 days
    const query = `
      SELECT 
        u.id,
        u.email,
        u.name,
        u.credits as remaining_credits,
        u.monthly_credit_limit,
        u.plan_type
      FROM users u
      LEFT JOIN email_automation_log e ON u.id = e.user_id 
        AND e.email_type = 'credit_warning' 
        AND e.sent_at > NOW() - INTERVAL '7 days'
      WHERE u.credits <= 2
        AND u.credits >= 0
        AND u.email IS NOT NULL
        AND e.id IS NULL
      ORDER BY u.credits ASC
      LIMIT 100
    `;
    
    const result = await client.query(query);
    const sentEmails = [];

    for (const user of result.rows) {
      try {
        const emailData = createCreditWarningUpgradeEmail(
          user.name || 'there',
          user.email,
          user.remaining_credits,
          user.monthly_credit_limit,
          user.plan_type
        );

        const emailResult = await sendEmail(emailData);

        if (emailResult.success) {
          // Log the sent email
          await client.query(
            `INSERT INTO email_automation_log (user_id, email_type, sent_at, email_id, status)
             VALUES ($1, $2, NOW(), $3, $4)`,
            [user.id, 'credit_warning', emailResult.emailId, 'sent']
          );

          sentEmails.push({
            userId: user.id,
            email: user.email,
            emailId: emailResult.emailId
          });

          console.log(`✅ Credit warning sent to ${user.email}`);
        }
      } catch (error) {
        console.error(`❌ Failed to send credit warning to ${user.email}:`, error);
      }
    }

    return {
      success: true,
      count: sentEmails.length,
      emails: sentEmails
    };
  } finally {
    client.release();
  }
}

// Check and send re-engagement emails to inactive users
export async function checkInactiveUsers() {
  const client = await pool.connect();
  
  try {
    // Find users who haven't logged in for 14, 30, or 60 days
    const query = `
      SELECT 
        u.id,
        u.email,
        u.name,
        EXTRACT(DAY FROM NOW() - u.last_login) as days_inactive,
        COALESCE(post_count.count, 0) as total_posts
      FROM users u
      LEFT JOIN (
        SELECT user_id, COUNT(*) as count
        FROM post_history
        GROUP BY user_id
      ) post_count ON u.id = post_count.user_id
      LEFT JOIN email_automation_log e ON u.id = e.user_id 
        AND e.email_type = 'reengagement' 
        AND e.sent_at > NOW() - INTERVAL '7 days'
      WHERE (
        EXTRACT(DAY FROM NOW() - u.last_login) >= 14
        OR EXTRACT(DAY FROM NOW() - u.last_login) >= 30
        OR EXTRACT(DAY FROM NOW() - u.last_login) >= 60
      )
        AND u.email IS NOT NULL
        AND e.id IS NULL
      ORDER BY u.last_login ASC
      LIMIT 100
    `;
    
    const result = await client.query(query);
    const sentEmails = [];

    for (const user of result.rows) {
      try {
        const daysSinceLastLogin = Math.floor(user.days_inactive);
        
        // Only send at specific intervals (14, 30, 60 days)
        if (![14, 30, 60].some(days => Math.abs(daysSinceLastLogin - days) < 1)) {
          continue;
        }

        const emailData = createReengagementEmail(
          user.name || 'there',
          user.email,
          daysSinceLastLogin,
          user.total_posts
        );

        const emailResult = await sendEmail(emailData);

        if (emailResult.success) {
          // Log the sent email
          await client.query(
            `INSERT INTO email_automation_log (user_id, email_type, sent_at, email_id, status, metadata)
             VALUES ($1, $2, NOW(), $3, $4, $5)`,
            [user.id, 'reengagement', emailResult.emailId, 'sent', JSON.stringify({ days_inactive: daysSinceLastLogin })]
          );

          sentEmails.push({
            userId: user.id,
            email: user.email,
            daysInactive: daysSinceLastLogin,
            emailId: emailResult.emailId
          });

          console.log(`✅ Re-engagement email sent to ${user.email} (${daysSinceLastLogin} days inactive)`);
        }
      } catch (error) {
        console.error(`❌ Failed to send re-engagement email to ${user.email}:`, error);
      }
    }

    return {
      success: true,
      count: sentEmails.length,
      emails: sentEmails
    };
  } finally {
    client.release();
  }
}

// Send weekly performance summary emails
export async function sendWeeklyPerformanceSummaries() {
  const client = await pool.connect();
  
  try {
    // Find active users who have created content in the last week
    const query = `
      SELECT 
        u.id,
        u.email,
        u.name,
        u.credits as remaining_credits,
        u.monthly_credit_limit,
        u.monthly_credit_limit - u.credits as credits_used,
        week_stats.posts_created as posts_this_week,
        week_stats.top_platform,
        last_week_stats.posts_created as posts_last_week
      FROM users u
      LEFT JOIN (
        SELECT 
          user_id,
          COUNT(*) as posts_created,
          MODE() WITHIN GROUP (ORDER BY platform) as top_platform
        FROM post_history
        WHERE created_at > NOW() - INTERVAL '7 days'
        GROUP BY user_id
      ) week_stats ON u.id = week_stats.user_id
      LEFT JOIN (
        SELECT 
          user_id,
          COUNT(*) as posts_created
        FROM post_history
        WHERE created_at BETWEEN NOW() - INTERVAL '14 days' AND NOW() - INTERVAL '7 days'
        GROUP BY user_id
      ) last_week_stats ON u.id = last_week_stats.user_id
      LEFT JOIN email_automation_log e ON u.id = e.user_id 
        AND e.email_type = 'performance_summary' 
        AND e.sent_at > NOW() - INTERVAL '7 days'
      WHERE week_stats.posts_created > 0
        AND u.email IS NOT NULL
        AND e.id IS NULL
      LIMIT 200
    `;
    
    const result = await client.query(query);
    const sentEmails = [];

    for (const user of result.rows) {
      try {
        const postsThisWeek = user.posts_this_week || 0;
        const postsLastWeek = user.posts_last_week || 0;
        
        const comparedToLastWeek = postsLastWeek > 0 
          ? Math.round(((postsThisWeek - postsLastWeek) / postsLastWeek) * 100)
          : undefined;

        const timeSaved = Math.round(postsThisWeek * 1.5); // Estimate 1.5 hours saved per post

        const emailData = createPerformanceSummaryEmail(
          user.name || 'there',
          user.email,
          {
            postsCreated: postsThisWeek,
            creditsUsed: user.credits_used,
            creditsRemaining: user.remaining_credits,
            monthlyLimit: user.monthly_credit_limit,
            topPlatform: user.top_platform || 'Twitter',
            timeSaved: timeSaved,
            weekNumber: Math.ceil((new Date().getDate()) / 7),
            comparedToLastWeek: comparedToLastWeek
          }
        );

        const emailResult = await sendEmail(emailData);

        if (emailResult.success) {
          // Log the sent email
          await client.query(
            `INSERT INTO email_automation_log (user_id, email_type, sent_at, email_id, status, metadata)
             VALUES ($1, $2, NOW(), $3, $4, $5)`,
            [user.id, 'performance_summary', emailResult.emailId, 'sent', JSON.stringify({ posts_created: postsThisWeek })]
          );

          sentEmails.push({
            userId: user.id,
            email: user.email,
            postsCreated: postsThisWeek,
            emailId: emailResult.emailId
          });

          console.log(`✅ Performance summary sent to ${user.email} (${postsThisWeek} posts)`);
        }
      } catch (error) {
        console.error(`❌ Failed to send performance summary to ${user.email}:`, error);
      }
    }

    return {
      success: true,
      count: sentEmails.length,
      emails: sentEmails
    };
  } finally {
    client.release();
  }
}

// Run all email automation checks
export async function runEmailAutomation() {
  console.log('🚀 Starting email automation checks...\n');

  try {
    // Check credit warnings
    console.log('1️⃣ Checking credit warnings...');
    const creditWarnings = await checkCreditWarnings();
    console.log(`   ✅ Sent ${creditWarnings.count} credit warning emails\n`);

    // Check inactive users
    console.log('2️⃣ Checking inactive users...');
    const reengagement = await checkInactiveUsers();
    console.log(`   ✅ Sent ${reengagement.count} re-engagement emails\n`);

    // Check weekly summaries (only on Mondays)
    const today = new Date().getDay();
    if (today === 1) { // Monday
      console.log('3️⃣ Sending weekly performance summaries...');
      const summaries = await sendWeeklyPerformanceSummaries();
      console.log(`   ✅ Sent ${summaries.count} performance summary emails\n`);
    } else {
      console.log('3️⃣ Skipping weekly summaries (not Monday)\n');
    }

    console.log('✨ Email automation completed successfully!');

    return {
      success: true,
      creditWarnings: creditWarnings.count,
      reengagement: reengagement.count,
      summaries: today === 1 ? (await sendWeeklyPerformanceSummaries()).count : 0
    };
  } catch (error) {
    console.error('❌ Email automation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}


