/**
 * Email Service using Resend
 */

import { sendEmail as sendViaResend } from '@/lib/resend';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  tags?: { name: string; value: string }[];
  emailType?: 'welcome' | 'stacked' | 'campaign' | 'warning' | 'notification';
}

export async function sendEmail({ to, subject, html, tags = [], emailType }: SendEmailParams) {
  try {
    // Auto-tag by email type
    const emailTags = [...tags];
    if (emailType) {
      emailTags.push({ name: 'type', value: emailType });
    }

    const result = await sendViaResend({
      to,
      subject,
      html,
    });
    if (!result.success) {
      console.error('Error sending email:', result.error);
      return { success: false, error: result.error } as any;
    }
    console.log('✅ Email sent successfully:', result.data);
    console.log('📊 Email ID for tracking:', (result as any).data?.id);
    return { success: true, data: (result as any).data, emailId: (result as any).data?.id } as any;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return { success: false, error };
  }
}

// Email Templates

export function welcomeEmailTemplate(name: string, tier: number, credits: number, code: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .tier-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin: 10px 0; }
          .credits-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .feature-list { list-style: none; padding: 0; }
          .feature-list li { padding: 8px 0; }
          .feature-list li:before { content: "✓ "; color: #10b981; font-weight: bold; }
          .cta-button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to repurposely LTD!</h1>
          </div>
          <div class="content">
            <p>Hi ${name || 'there'},</p>
            
            <p>Congratulations! Your LTD code <strong>${code}</strong> has been successfully activated!</p>
            
            <div class="tier-badge">
              🏆 LTD Tier ${tier} - Lifetime Access
            </div>
            
            <div class="credits-box">
              <h3>Your Monthly Credits</h3>
              <p style="font-size: 32px; font-weight: bold; color: #667eea; margin: 10px 0;">${credits} Credits</p>
              <p style="color: #6b7280;">Refreshes every month, forever!</p>
            </div>
            
            <h3>What's Included:</h3>
            <ul class="feature-list">
              ${tier >= 1 ? '<li>Content Repurposing (4 platforms)</li>' : ''}
              ${tier >= 1 ? '<li>15+ Premium Templates</li>' : ''}
              ${tier >= 1 ? '<li>Trending Topics with Hashtags</li>' : ''}
              ${tier >= 2 ? '<li>🔥 Viral Hook Generator (50+ patterns)</li>' : ''}
              ${tier >= 2 ? '<li>📅 Content Scheduling (30 posts/month)</li>' : ''}
              ${tier >= 2 ? '<li>⚡ 2x Faster Processing</li>' : ''}
              ${tier >= 3 ? '<li>🎯 AI Performance Predictions</li>' : ''}
              ${tier >= 3 ? '<li>💬 AI Chat Assistant (200 msgs/month)</li>' : ''}
              ${tier >= 3 ? '<li>✍️ "Talk Like Me" Style Training</li>' : ''}
              ${tier >= 4 ? '<li>👥 Team Collaboration (3 members)</li>' : ''}
              ${tier >= 4 ? '<li>🚀 API Access (2,500 calls/month)</li>' : ''}
              ${tier >= 4 ? '<li>⚡ 5x Faster Processing</li>' : ''}
            </ul>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="cta-button">
              Start Creating Content →
            </a>
            
            <div class="footer">
              <p>Questions? Reply to this email or visit our <a href="${process.env.NEXT_PUBLIC_APP_URL}/help">Help Center</a></p>
              <p style="margin-top: 20px;">© 2025 repurposely. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function codeStackedEmailTemplate(name: string, newTier: number, totalCredits: number, stackedCount: number) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .stats-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
          .cta-button { background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎊 Code Stacked Successfully!</h1>
          </div>
          <div class="content">
            <p>Hi ${name || 'there'},</p>
            
            <p>Great news! You've successfully stacked another LTD code to your account!</p>
            
            <div class="stats-box">
              <h3>📊 Your Updated Plan:</h3>
              <p><strong>Tier:</strong> ${newTier} (features from highest tier)</p>
              <p><strong>Monthly Credits:</strong> <span style="font-size: 24px; color: #10b981; font-weight: bold;">${totalCredits}</span></p>
              <p><strong>Stacked Codes:</strong> ${stackedCount}</p>
            </div>
            
            <p>Your monthly credit limit has increased, giving you even more power to create amazing content!</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/my-ltd" class="cta-button">
              View My LTD Plan →
            </a>
            
            <div class="footer">
              <p>Questions? Reply to this email or visit our <a href="${process.env.NEXT_PUBLIC_APP_URL}/help">Help Center</a></p>
              <p style="margin-top: 20px;">© 2025 repurposely. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function creditLowWarningEmail(name: string, remainingCredits: number, monthlyLimit: number, resetDate: Date) {
  const percentage = ((remainingCredits / monthlyLimit) * 100).toFixed(0);
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .warning-box { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          .cta-button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Credit Balance Low</h1>
          </div>
          <div class="content">
            <p>Hi ${name || 'there'},</p>
            
            <p>Just a friendly reminder that your credit balance is running low.</p>
            
            <div class="warning-box">
              <h3>📊 Current Balance:</h3>
              <p style="font-size: 32px; font-weight: bold; color: #f59e0b; margin: 10px 0;">${remainingCredits} / ${monthlyLimit} Credits</p>
              <p style="color: #92400e;">${percentage}% remaining</p>
              <p style="margin-top: 15px;"><strong>Resets on:</strong> ${resetDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
            
            <p>Don't worry! Your credits will automatically refresh on your reset date. In the meantime, consider:</p>
            <ul>
              <li>Planning your remaining content carefully</li>
              <li>Stacking another LTD code for more monthly credits</li>
              <li>Waiting for your monthly refresh</li>
            </ul>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/my-ltd" class="cta-button">
              View My Usage →
            </a>
            
            <div class="footer">
              <p>Questions? Reply to this email or visit our <a href="${process.env.NEXT_PUBLIC_APP_URL}/help">Help Center</a></p>
              <p style="margin-top: 20px;">© 2025 repurposely. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}





