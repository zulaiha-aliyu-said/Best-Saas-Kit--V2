// Use Resend HTTP API directly for Edge compatibility

// Lazy initialization to avoid build-time errors when env vars are not available
function getResendApiKey(): string {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured');
  return apiKey;
}

// Email configuration
export const EMAIL_CONFIG = {
  FROM_EMAIL: process.env.FROM_EMAIL || 'onboarding@bestsaaskit.com',
  SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || 'support@bestsaaskit.com',
  SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME || 'Best SAAS Kit V2',
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
} as const;

// Email types
export interface EmailData {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  emailType?: 'welcome' | 'stacked' | 'campaign' | 'warning' | 'notification';
  tags?: { name: string; value: string }[];
}

// Send email function with error handling
export async function sendEmail(data: EmailData) {
  try {
    const apiKey = getResendApiKey();
    
    // Build email payload
    const emailPayload: any = {
      from: data.from || EMAIL_CONFIG.FROM_EMAIL,
      to: data.to,
      subject: data.subject,
      html: data.html,
    };
    
    // Add tags if provided
    if (data.tags && data.tags.length > 0) {
      emailPayload.tags = data.tags;
    }
    
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Resend send failed: ${res.status} ${text}`);
    }
    const result = await res.json();

    console.log('Email sent successfully:', result);
    return { success: true, data: result, emailId: result.id };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Welcome email template
export function createWelcomeEmail(userName: string, userEmail: string) {
  const subject = `Welcome to ${EMAIL_CONFIG.SITE_NAME}!`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to ${EMAIL_CONFIG.SITE_NAME}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Welcome to ${EMAIL_CONFIG.SITE_NAME}!</h1>
        <p>Your AI-powered SAAS journey starts here</p>
      </div>
      <div class="content">
        <h2>Hi ${userName}!</h2>
        <p>Thank you for joining ${EMAIL_CONFIG.SITE_NAME}. We're excited to have you on board!</p>
        
        <p>Here's what you can do next:</p>
        <ul>
          <li>🤖 Try our AI chat interface</li>
          <li>📊 Explore your dashboard</li>
          <li>⚡ Upgrade to Pro for unlimited features</li>
          <li>📖 Check out our documentation</li>
        </ul>
        
        <a href="${EMAIL_CONFIG.SITE_URL}/dashboard" class="button">Go to Dashboard</a>
        
        <p>If you have any questions, feel free to reach out to our support team at <a href="mailto:${EMAIL_CONFIG.SUPPORT_EMAIL}">${EMAIL_CONFIG.SUPPORT_EMAIL}</a>.</p>
        
        <p>Best regards,<br>The ${EMAIL_CONFIG.SITE_NAME} Team</p>
      </div>
      <div class="footer">
        <p>© 2024 ${EMAIL_CONFIG.SITE_NAME}. All rights reserved.</p>
        <p><a href="${EMAIL_CONFIG.SITE_URL}">Visit our website</a> | <a href="${EMAIL_CONFIG.SITE_URL}/docs">Documentation</a></p>
      </div>
    </body>
    </html>
  `;

  return { to: userEmail, subject, html };
}

// Subscription confirmation email template
export function createSubscriptionConfirmationEmail(userName: string, userEmail: string, planName: string = 'Pro') {
  const subject = `Welcome to ${EMAIL_CONFIG.SITE_NAME} ${planName}!`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Subscription Confirmed</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="success-icon">🎉</div>
        <h1>Subscription Confirmed!</h1>
        <p>Welcome to ${EMAIL_CONFIG.SITE_NAME} ${planName}</p>
      </div>
      <div class="content">
        <h2>Hi ${userName}!</h2>
        <p>Congratulations! Your ${planName} subscription has been successfully activated.</p>
        
        <p>You now have access to:</p>
        <ul>
          <li>🚀 Unlimited AI chat interactions</li>
          <li>📊 Advanced analytics and insights</li>
          <li>⚡ Priority support</li>
          <li>🔧 Advanced customization options</li>
        </ul>
        
        <a href="${EMAIL_CONFIG.SITE_URL}/dashboard" class="button">Access Your Dashboard</a>
        
        <p>Your subscription will automatically renew. You can manage your subscription anytime from your billing dashboard.</p>
        
        <p>Thank you for choosing ${EMAIL_CONFIG.SITE_NAME}!</p>
        
        <p>Best regards,<br>The ${EMAIL_CONFIG.SITE_NAME} Team</p>
      </div>
      <div class="footer">
        <p>© 2024 ${EMAIL_CONFIG.SITE_NAME}. All rights reserved.</p>
        <p><a href="${EMAIL_CONFIG.SITE_URL}/dashboard/billing">Manage Subscription</a> | <a href="mailto:${EMAIL_CONFIG.SUPPORT_EMAIL}">Support</a></p>
      </div>
    </body>
    </html>
  `;

  return { to: userEmail, subject, html };
}

// Password reset email template (for future use)
export function createPasswordResetEmail(userName: string, userEmail: string, resetToken: string) {
  const resetUrl = `${EMAIL_CONFIG.SITE_URL}/auth/reset-password?token=${resetToken}`;
  const subject = `Reset your ${EMAIL_CONFIG.SITE_NAME} password`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Password</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Password Reset Request</h1>
        <p>Reset your ${EMAIL_CONFIG.SITE_NAME} password</p>
      </div>
      <div class="content">
        <h2>Hi ${userName}!</h2>
        <p>We received a request to reset your password for your ${EMAIL_CONFIG.SITE_NAME} account.</p>
        
        <a href="${resetUrl}" class="button">Reset Password</a>
        
        <div class="warning">
          <strong>⚠️ Security Notice:</strong>
          <p>This link will expire in 1 hour for security reasons. If you didn't request this password reset, please ignore this email.</p>
        </div>
        
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        
        <p>If you need help, contact our support team at <a href="mailto:${EMAIL_CONFIG.SUPPORT_EMAIL}">${EMAIL_CONFIG.SUPPORT_EMAIL}</a>.</p>
        
        <p>Best regards,<br>The ${EMAIL_CONFIG.SITE_NAME} Team</p>
      </div>
      <div class="footer">
        <p>© 2024 ${EMAIL_CONFIG.SITE_NAME}. All rights reserved.</p>
        <p><a href="${EMAIL_CONFIG.SITE_URL}">Visit our website</a> | <a href="mailto:${EMAIL_CONFIG.SUPPORT_EMAIL}">Support</a></p>
      </div>
    </body>
    </html>
  `;

  return { to: userEmail, subject, html };
}

// Contact form email template
export function createContactFormEmail(name: string, email: string, message: string) {
  const subject = `New contact form submission from ${name}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Contact Form Submission</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #374151; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .field { margin: 15px 0; padding: 15px; background: white; border-radius: 5px; border-left: 4px solid #667eea; }
        .label { font-weight: bold; color: #374151; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>New Contact Form Submission</h1>
        <p>From ${EMAIL_CONFIG.SITE_NAME} website</p>
      </div>
      <div class="content">
        <div class="field">
          <div class="label">Name:</div>
          <div>${name}</div>
        </div>
        
        <div class="field">
          <div class="label">Email:</div>
          <div><a href="mailto:${email}">${email}</a></div>
        </div>
        
        <div class="field">
          <div class="label">Message:</div>
          <div>${message}</div>
        </div>
        
        <p><strong>Reply to this inquiry by responding to ${email}</strong></p>
      </div>
    </body>
    </html>
  `;

  return { to: EMAIL_CONFIG.SUPPORT_EMAIL, subject, html };
}

// Welcome email template for LTD users
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
            <h1>🎉 Welcome to RepurposeAI LTD!</h1>
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
            
            <a href="${EMAIL_CONFIG.SITE_URL}/dashboard" class="cta-button">
              Start Creating Content →
            </a>
            
            <div class="footer">
              <p>Questions? Reply to this email or visit our <a href="${EMAIL_CONFIG.SITE_URL}/help">Help Center</a></p>
              <p style="margin-top: 20px;">© 2025 RepurposeAI. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Code stacked email template
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
            
            <a href="${EMAIL_CONFIG.SITE_URL}/dashboard/my-ltd" class="cta-button">
              View My LTD Plan →
            </a>
            
            <div class="footer">
              <p>Questions? Reply to this email or visit our <a href="${EMAIL_CONFIG.SITE_URL}/help">Help Center</a></p>
              <p style="margin-top: 20px;">© 2025 RepurposeAI. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Credit low warning email template
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
            
            <a href="${EMAIL_CONFIG.SITE_URL}/dashboard/my-ltd" class="cta-button">
              View My Usage →
            </a>
            
            <div class="footer">
              <p>Questions? Reply to this email or visit our <a href="${EMAIL_CONFIG.SITE_URL}/help">Help Center</a></p>
              <p style="margin-top: 20px;">© 2025 RepurposeAI. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}