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
  SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME || 'Reporposely',
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
  const subject = `🎉 Welcome to RepurposeAI - Transform Your Content Today!`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to RepurposeAI</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f7; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: white; padding: 50px 40px; text-align: center; border-radius: 16px 16px 0 0; }
        .content { background: #ffffff; padding: 45px 40px; }
        .hero-title { margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px; }
        .hero-subtitle { margin: 12px 0 0 0; color: rgba(255,255,255,0.95); font-size: 18px; }
        .greeting { color: #1a1a1a; font-size: 24px; margin: 0 0 16px 0; font-weight: 600; }
        .intro { color: #4b5563; font-size: 16px; margin: 0 0 24px 0; }
        .cta-button { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3); margin: 35px 0; }
        .features-box { background: linear-gradient(135deg, #F3E8FF 0%, #FCE7F3 100%); border-radius: 12px; padding: 30px; margin: 35px 0; }
        .section-title { color: #1a1a1a; font-size: 20px; margin: 0 0 20px 0; font-weight: 600; }
        .feature-item { padding: 10px 0; color: #374151; font-size: 15px; }
        .feature-icon { color: #8B5CF6; font-size: 20px; margin-right: 12px; }
        .benefit-grid { margin-bottom: 30px; }
        .benefit-box { background: #F9FAFB; border-left: 4px solid #8B5CF6; padding: 20px; border-radius: 8px; margin-bottom: 15px; }
        .benefit-title { margin: 0; color: #1a1a1a; font-weight: 600; font-size: 15px; }
        .benefit-desc { margin: 8px 0 0 0; color: #6b7280; font-size: 14px; }
        .pricing-box { padding: 20px; border-radius: 12px; margin-bottom: 12px; }
        .pricing-free { background: #F9FAFB; }
        .pricing-pro { background: linear-gradient(135deg, #F3E8FF 0%, #FCE7F3 100%); border: 2px solid #8B5CF6; }
        .pricing-ltd { background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border: 2px solid #F59E0B; }
        .pricing-name { margin: 0; color: #1a1a1a; font-weight: 700; font-size: 18px; }
        .pricing-badge { background: #8B5CF6; color: white; font-size: 11px; padding: 3px 8px; border-radius: 4px; margin-left: 6px; }
        .pricing-price { margin: 0; font-weight: 700; font-size: 22px; }
        .pricing-features { margin: 15px 0 0 0; padding-top: 15px; color: #374151; font-size: 14px; line-height: 1.7; }
        .quick-start { background: #F0FDF4; border-left: 4px solid #10B981; padding: 25px; border-radius: 8px; margin: 35px 0; }
        .footer { background: linear-gradient(135deg, #1F2937 0%, #111827 100%); padding: 35px 40px; text-align: center; border-radius: 0 0 16px 16px; color: #9CA3AF; }
        .footer-title { color: #F3F4F6; margin: 0 0 15px 0; }
        .footer-text { color: #6B7280; font-size: 13px; margin: 0 0 20px 0; }
        .footer-copyright { color: #4B5563; font-size: 12px; margin: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="hero-title">🎉 Welcome to RepurposeAI!</h1>
          <p class="hero-subtitle">AI-Powered Content Creation at Your Fingertips</p>
        </div>
        <div class="content">
          <h2 class="greeting">Hi ${userName || 'there'}! 👋</h2>
          
          <p class="intro">
            Welcome aboard! Your account (<strong>${userEmail}</strong>) is now active. We're thrilled to have you join thousands of creators who are transforming their content workflow with AI.
          </p>
          
          <div style="text-align: center;">
            <a href="${EMAIL_CONFIG.SITE_URL}/dashboard" class="cta-button">Start Creating Now →</a>
          </div>
          
          <div class="features-box">
            <h3 class="section-title">✨ What You Can Do with RepurposeAI</h3>
            <div class="feature-item">
              <span class="feature-icon">🔄</span><strong>Content Repurposing:</strong> Transform one piece of content into multiple platform-optimized posts
            </div>
            <div class="feature-item">
              <span class="feature-icon">🎯</span><strong>Viral Hook Generator:</strong> Create scroll-stopping hooks with 50+ proven patterns
            </div>
            <div class="feature-item">
              <span class="feature-icon">📈</span><strong>Trending Topics:</strong> Discover what's trending on YouTube, Reddit & News
            </div>
            <div class="feature-item">
              <span class="feature-icon">📅</span><strong>Smart Scheduling:</strong> Schedule posts across all your platforms in one place
            </div>
            <div class="feature-item">
              <span class="feature-icon">🤖</span><strong>AI Chat Assistant:</strong> Get instant help with content strategy & creation
            </div>
            <div class="feature-item">
              <span class="feature-icon">✍️</span><strong>Style Training:</strong> Train AI to write in your unique voice
            </div>
          </div>
          
          <h3 class="section-title">🚀 Why Creators Love Us</h3>
          <div class="benefit-grid">
            <div class="benefit-box">
              <p class="benefit-title">⏱️ Save 10+ Hours/Week</p>
              <p class="benefit-desc">Automate content creation & repurposing</p>
            </div>
            <div class="benefit-box" style="border-color: #EC4899;">
              <p class="benefit-title">📊 Boost Engagement</p>
              <p class="benefit-desc">AI-optimized for each platform</p>
            </div>
            <div class="benefit-box" style="border-color: #10B981;">
              <p class="benefit-title">🎨 Stay Consistent</p>
              <p class="benefit-desc">Post regularly across all platforms</p>
            </div>
            <div class="benefit-box" style="border-color: #F59E0B;">
              <p class="benefit-title">💡 Never Run Out</p>
              <p class="benefit-desc">Endless content ideas & trends</p>
            </div>
          </div>
          
          <h3 class="section-title">💎 Choose Your Plan</h3>
          
          <!-- Free Tier -->
          <div class="pricing-box pricing-free">
            <p class="pricing-name">Free Trial</p>
            <p style="margin: 6px 0 0 0; color: #6b7280; font-size: 14px;">Perfect to get started</p>
            <p class="pricing-price" style="color: #8B5CF6; margin-top: 10px;">$0 <span style="font-size: 13px; color: #9ca3af; font-weight: normal;">Your current plan</span></p>
            <div class="pricing-features" style="border-top: 1px solid #e5e7eb;">
              ✓ 10 monthly credits<br>
              ✓ Content repurposing (4 platforms)<br>
              ✓ Basic templates<br>
              ✓ Trending topics
            </div>
          </div>
          
          <!-- Pro Tier -->
          <div class="pricing-box pricing-pro">
            <p class="pricing-name">Pro Plan <span class="pricing-badge">POPULAR</span></p>
            <p style="margin: 6px 0 0 0; color: #6b7280; font-size: 14px;">For serious creators</p>
            <p class="pricing-price" style="color: #8B5CF6; margin-top: 10px;">$49 <span style="font-size: 13px; color: #6b7280; font-weight: normal;">per month</span></p>
            <div class="pricing-features" style="border-top: 1px solid #E9D5FF;">
              ✓ <strong>500 monthly credits</strong><br>
              ✓ All Free features<br>
              ✓ Viral Hook Generator<br>
              ✓ Content Scheduling (100 posts/month)<br>
              ✓ Competitor Analysis<br>
              ✓ Priority support
            </div>
            <div style="text-align: center; margin-top: 20px;">
              <a href="${EMAIL_CONFIG.SITE_URL}/pricing" class="cta-button" style="padding: 12px 28px; font-size: 14px; margin: 0;">Upgrade to Pro →</a>
            </div>
          </div>
          
          <!-- LTD Tier -->
          <div class="pricing-box pricing-ltd">
            <p class="pricing-name">Lifetime Deal <span class="pricing-badge" style="background: #F59E0B;">BEST VALUE</span></p>
            <p style="margin: 6px 0 0 0; color: #78350F; font-size: 14px;">Pay once, use forever</p>
            <p class="pricing-price" style="color: #F59E0B; margin-top: 10px;">$59+ <span style="font-size: 13px; color: #78350F; font-weight: normal;">one-time</span></p>
            <div class="pricing-features" style="border-top: 1px solid #FCD34D;">
              ✓ <strong>200-2000+ credits/month</strong> (based on tier)<br>
              ✓ All Pro features<br>
              ✓ AI Chat Assistant (200 msgs/month)<br>
              ✓ Style Training ("Talk Like Me")<br>
              ✓ Team Collaboration (higher tiers)<br>
              ✓ <strong>Lifetime updates & support</strong><br>
              ✓ No recurring fees, ever!
            </div>
            <div style="text-align: center; margin-top: 20px;">
              <a href="${EMAIL_CONFIG.SITE_URL}/ltd-pricing" class="cta-button" style="padding: 12px 28px; font-size: 14px; margin: 0; background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%);">View Lifetime Deals →</a>
            </div>
          </div>
          
          <div class="quick-start">
            <h3 class="section-title" style="margin-bottom: 15px;">🎯 Quick Start Guide</h3>
            <ol style="color: #374151; font-size: 15px; margin: 0; padding-left: 20px;">
              <li><strong>Connect your accounts</strong> - Link your social media platforms</li>
              <li><strong>Create your first post</strong> - Use the Content Repurposing tool</li>
              <li><strong>Explore trending topics</strong> - Find what's hot in your niche</li>
              <li><strong>Schedule ahead</strong> - Plan your content calendar</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin-top: 35px;">
            <p style="color: #6b7280; font-size: 15px; margin: 0 0 15px 0;">Need help getting started?</p>
            <a href="${EMAIL_CONFIG.SITE_URL}/docs" style="color: #8B5CF6; text-decoration: none; font-weight: 600; margin: 0 15px;">📚 Documentation</a>
            <span style="color: #d1d5db;">|</span>
            <a href="${EMAIL_CONFIG.SITE_URL}/contact" style="color: #8B5CF6; text-decoration: none; font-weight: 600; margin: 0 15px;">💬 Contact Support</a>
          </div>
        </div>
        
        <div class="footer">
          <p class="footer-title"><strong>RepurposeAI</strong> - Transform Your Content with AI</p>
          <p class="footer-text">
            You're receiving this email because you created an account at RepurposeAI.<br>
            Have questions? Just hit reply - we'd love to hear from you!
          </p>
          <p class="footer-copyright">© 2025 RepurposeAI. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { 
    to: userEmail, 
    subject, 
    html,
    tags: [
      { name: 'category', value: 'welcome' },
      { name: 'email_type', value: 'new_user_welcome' }
    ]
  };
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
        <p style=\"color:#6b7280;\">Covered by our <strong>60‑Day Money‑Back Guarantee</strong>. See our <a href=\"${EMAIL_CONFIG.SITE_URL}/refund-policy\">Refund Policy</a>.</p>
        
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

// LTD activation email
export function createLTDActivationEmail(userName: string, userEmail: string, tier: number, monthly: number) {
  const subject = `🎉 Your RepurposeAI LTD (Tier ${tier}) is Active!`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>LTD Activated</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #111827; max-width: 680px; margin: 0 auto; padding: 0; background: #f8fafc; }
        .wrap { padding: 24px; }
        .card { background: #fff; border-radius: 14px; box-shadow: 0 6px 24px rgba(2,6,23,0.06); overflow: hidden; }
        .header { background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: #fff; padding: 32px; text-align: center; }
        .title { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.3px; }
        .content { padding: 28px 32px; }
        .hi { font-size: 18px; font-weight: 700; margin: 0 0 8px 0; }
        .p { margin: 10px 0; color: #374151; }
        .badge { display: inline-block; background: #F59E0B; color: #111827; font-weight: 700; font-size: 12px; padding: 6px 10px; border-radius: 999px; margin: 8px 0; }
        .box { background: #F9FAFB; border-left: 4px solid #8B5CF6; padding: 16px; border-radius: 10px; margin: 18px 0; }
        .btn { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: #fff !important; font-weight: 700; text-decoration: none; border-radius: 12px; }
        .muted { color: #6b7280; font-size: 13px; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 16px; }
        ul { margin: 8px 0 0 18px; color: #374151; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="card">
          <div class="header">
            <h1 class="title">Your Lifetime Deal is Live 🎉</h1>
            <div class="badge">Tier ${tier} • ${monthly} credits/month</div>
          </div>
          <div class="content">
            <p class="hi">Hi ${userName || 'there'},</p>
            <p class="p">Thanks for supporting RepurposeAI! Your Lifetime Deal (Tier ${tier}) is now active. You’ll receive <strong>${monthly} credits every month</strong>, forever.</p>

            <div class="box">
              <strong>What you can do now</strong>
              <ul>
                <li>Create and repurpose content across platforms</li>
                <li>Use the Viral Hook Generator to craft scroll-stoppers</li>
                <li>Find trends (YouTube, Reddit, News) to plug into your niche</li>
                <li>Schedule posts and plan your calendar</li>
                <li>Train the AI to match your writing style</li>
              </ul>
            </div>

            <p class="p"><a href="${EMAIL_CONFIG.SITE_URL}/dashboard" class="btn">Open Dashboard</a></p>

            <p class=\"p muted\">You can review your plan anytime at <a href=\"${EMAIL_CONFIG.SITE_URL}/dashboard/my-ltd\">My LTD</a>. Need help? Reply to this email or contact <a href=\"mailto:${EMAIL_CONFIG.SUPPORT_EMAIL}\">${EMAIL_CONFIG.SUPPORT_EMAIL}</a>.<br/>Covered by our <strong>60‑Day Money‑Back Guarantee</strong>. See our <a href=\"${EMAIL_CONFIG.SITE_URL}/refund-policy\">Refund Policy</a>.</p>
          </div>
        </div>
        <p class="footer">© ${new Date().getFullYear()} ${EMAIL_CONFIG.SITE_NAME}. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

  return { 
    to: userEmail, 
    subject, 
    html,
    tags: [
      { name: 'category', value: 'ltd_activation' },
      { name: 'tier', value: String(tier) }
    ]
  };
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

// Credit low warning email template (for LTD users)
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

// 1. CREDIT WARNING & UPGRADE EMAIL (High Conversion)
export function createCreditWarningUpgradeEmail(
  userName: string, 
  userEmail: string, 
  remainingCredits: number, 
  monthlyLimit: number,
  planType: string = 'free'
) {
  const percentage = Math.round((remainingCredits / monthlyLimit) * 100);
  const isOutOfCredits = remainingCredits === 0;
  
  const subject = isOutOfCredits 
    ? `⚠️ You're out of credits - Upgrade to keep creating!`
    : `🔥 Only ${remainingCredits} credits left - Don't lose momentum!`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Credit Warning</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f7; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%); color: white; padding: 50px 40px; text-align: center; border-radius: 16px 16px 0 0; }
        .content { background: #ffffff; padding: 45px 40px; }
        .warning-icon { font-size: 64px; margin-bottom: 20px; }
        .progress-bar-container { background: #E5E7EB; border-radius: 12px; height: 32px; margin: 25px 0; overflow: hidden; position: relative; }
        .progress-bar { background: linear-gradient(90deg, #10B981 0%, #F59E0B 50%, #EF4444 100%); height: 100%; transition: width 0.3s ease; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px; }
        .stats-grid { display: table; width: 100%; margin: 30px 0; }
        .stat-box { display: table-cell; padding: 20px; text-align: center; background: #F9FAFB; border-radius: 12px; }
        .stat-value { font-size: 32px; font-weight: 700; color: #EF4444; margin: 0; }
        .stat-label { font-size: 14px; color: #6B7280; margin: 8px 0 0 0; }
        .urgency-banner { background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border-left: 4px solid #F59E0B; padding: 20px; border-radius: 8px; margin: 25px 0; }
        .comparison-table { width: 100%; margin: 30px 0; border-collapse: collapse; }
        .comparison-table th { background: #F3F4F6; padding: 15px; text-align: left; font-weight: 600; }
        .comparison-table td { padding: 15px; border-bottom: 1px solid #E5E7EB; }
        .check { color: #10B981; font-weight: bold; }
        .cross { color: #EF4444; }
        .cta-button { display: inline-block; padding: 18px 48px; background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 18px; box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4); margin: 25px 0; }
        .discount-badge { background: #EF4444; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 700; font-size: 14px; display: inline-block; margin: 15px 0; }
        .testimonial { background: #F0FDF4; border-left: 4px solid #10B981; padding: 20px; border-radius: 8px; margin: 25px 0; font-style: italic; }
        .footer { background: linear-gradient(135deg, #1F2937 0%, #111827 100%); padding: 35px 40px; text-align: center; border-radius: 0 0 16px 16px; color: #9CA3AF; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="warning-icon">⚠️</div>
          <h1 style="margin: 0; font-size: 32px; font-weight: 700;">${isOutOfCredits ? 'You\'re Out of Credits!' : 'Credits Running Low!'}</h1>
          <p style="margin: 12px 0 0 0; font-size: 18px; color: rgba(255,255,255,0.95);">Don't let your creative momentum stop here</p>
        </div>
        
        <div class="content">
          <h2 style="color: #1a1a1a; font-size: 24px; margin: 0 0 16px 0;">Hi ${userName || 'there'}! 👋</h2>
          
          <p style="color: #4b5563; font-size: 16px; margin: 0 0 24px 0;">
            ${isOutOfCredits 
              ? 'You\'ve used all your monthly credits and can\'t create more content right now. But don\'t worry - upgrading takes just seconds!' 
              : `You're almost out of credits! You have only <strong>${remainingCredits} credits</strong> remaining out of your ${monthlyLimit} monthly limit.`}
          </p>
          
          <!-- Progress Bar -->
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${percentage}%;">${percentage}% Used</div>
          </div>
          
          <!-- Stats Grid -->
          <div class="stats-grid">
            <div class="stat-box" style="margin-right: 10px;">
              <p class="stat-value">${remainingCredits}</p>
              <p class="stat-label">Credits Left</p>
            </div>
            <div class="stat-box" style="margin-left: 10px;">
              <p class="stat-value">${monthlyLimit}</p>
              <p class="stat-label">Monthly Limit</p>
            </div>
          </div>
          
          <!-- Urgency Banner -->
          <div class="urgency-banner">
            <p style="margin: 0; font-weight: 600; color: #92400E; font-size: 16px;">🔥 Limited Time Offer - 20% OFF!</p>
            <p style="margin: 8px 0 0 0; color: #78350F; font-size: 14px;">Upgrade to Pro in the next 48 hours and get <strong>20% off your first month</strong>. Use code: <strong>KEEPGOING20</strong></p>
          </div>
          
          <h3 style="color: #1a1a1a; font-size: 20px; margin: 35px 0 20px 0;">💎 Upgrade to Pro and Get:</h3>
          
          <!-- Comparison Table -->
          <table class="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th style="text-align: center;">Your Plan</th>
                <th style="text-align: center; color: #8B5CF6;">Pro Plan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Monthly Credits</strong></td>
                <td style="text-align: center;">${monthlyLimit}</td>
                <td style="text-align: center; color: #8B5CF6; font-weight: 700;">500</td>
              </tr>
              <tr>
                <td>Viral Hook Generator</td>
                <td style="text-align: center;" class="cross">✗</td>
                <td style="text-align: center;" class="check">✓</td>
              </tr>
              <tr>
                <td>Content Scheduling</td>
                <td style="text-align: center;" class="cross">✗</td>
                <td style="text-align: center;" class="check">✓ 100 posts/month</td>
              </tr>
              <tr>
                <td>Competitor Analysis</td>
                <td style="text-align: center;" class="cross">✗</td>
                <td style="text-align: center;" class="check">✓</td>
              </tr>
              <tr>
                <td>AI Chat Assistant</td>
                <td style="text-align: center;" class="cross">✗</td>
                <td style="text-align: center;" class="check">✓</td>
              </tr>
              <tr>
                <td>Priority Support</td>
                <td style="text-align: center;" class="cross">✗</td>
                <td style="text-align: center;" class="check">✓ 24/7</td>
              </tr>
            </tbody>
          </table>
          
          <!-- Social Proof -->
          <div class="testimonial">
            <p style="margin: 0; color: #065F46; font-size: 15px;">"Upgrading to Pro was the best decision for my content strategy. I now create 10x more content in half the time!"</p>
            <p style="margin: 12px 0 0 0; color: #047857; font-size: 14px; font-weight: 600;">— Sarah Chen, Content Creator</p>
          </div>
          
          <div style="text-align: center; margin: 35px 0;">
            <div class="discount-badge">💰 SAVE 20% - Limited Time Only!</div>
            <br>
            <a href="${EMAIL_CONFIG.SITE_URL}/pricing?discount=KEEPGOING20" class="cta-button">
              Upgrade to Pro Now →
            </a>
            <p style="color: #6B7280; font-size: 14px; margin: 15px 0 0 0;">
              ✓ Instant access • ✓ Cancel anytime • ✓ 30-day money-back guarantee
            </p>
          </div>
          
          <!-- Alternative Options -->
          <div style="background: #F9FAFB; padding: 25px; border-radius: 12px; margin: 35px 0;">
            <h4 style="margin: 0 0 15px 0; color: #1a1a1a;">Not ready to upgrade?</h4>
            <ul style="color: #4B5563; font-size: 15px; margin: 0; padding-left: 20px;">
              <li>Your credits will reset next month</li>
              <li>Check out our <a href="${EMAIL_CONFIG.SITE_URL}/ltd-pricing" style="color: #8B5CF6;">Lifetime Deals</a> (pay once, use forever)</li>
              <li>Refer friends and earn bonus credits</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 35px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">Questions about upgrading?</p>
            <p style="color: #6b7280; font-size: 14px; margin: 8px 0 0 0;">
              <a href="${EMAIL_CONFIG.SITE_URL}/contact" style="color: #8B5CF6; text-decoration: none; font-weight: 600;">Contact our team</a> - We're here to help!
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p style="color: #F3F4F6; font-weight: 600; margin: 0 0 15px 0;">RepurposeAI</p>
          <p style="color: #6B7280; font-size: 13px; margin: 0;">
            © 2025 RepurposeAI. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    to: userEmail,
    subject,
    html,
    tags: [
      { name: 'category', value: 'credit_warning' },
      { name: 'email_type', value: 'upgrade_prompt' },
      { name: 'credits_remaining', value: remainingCredits.toString() }
    ]
  };
}

// 2. RE-ENGAGEMENT EMAIL (Win-back Inactive Users)
export function createReengagementEmail(
  userName: string,
  userEmail: string,
  daysSinceLastLogin: number,
  totalPostsCreated: number = 0
) {
  const subject = daysSinceLastLogin >= 60 
    ? `We miss you! 🎁 Here's 50 bonus credits to come back`
    : daysSinceLastLogin >= 30
    ? `Your content strategy is waiting for you... 💜`
    : `We miss you! Here's what's new at RepurposeAI ✨`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>We Miss You</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f7; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: white; padding: 50px 40px; text-align: center; border-radius: 16px 16px 0 0; }
        .content { background: #ffffff; padding: 45px 40px; }
        .emoji-large { font-size: 80px; margin: 20px 0; }
        .stats-box { background: linear-gradient(135deg, #F3E8FF 0%, #FCE7F3 100%); border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; }
        .bonus-badge { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 20px 30px; border-radius: 12px; font-size: 24px; font-weight: 700; display: inline-block; margin: 20px 0; box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4); }
        .feature-grid { margin: 30px 0; }
        .feature-card { background: #F9FAFB; border-left: 4px solid #8B5CF6; padding: 20px; border-radius: 8px; margin-bottom: 15px; }
        .feature-title { font-weight: 600; color: #1a1a1a; font-size: 16px; margin: 0 0 8px 0; }
        .feature-desc { color: #6B7280; font-size: 14px; margin: 0; }
        .cta-button { display: inline-block; padding: 18px 48px; background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 18px; box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4); margin: 25px 0; }
        .success-stories { background: #F0FDF4; padding: 25px; border-radius: 12px; margin: 25px 0; }
        .trending-box { background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); padding: 25px; border-radius: 12px; margin: 25px 0; }
        .footer { background: linear-gradient(135deg, #1F2937 0%, #111827 100%); padding: 35px 40px; text-align: center; border-radius: 0 0 16px 16px; color: #9CA3AF; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="emoji-large">💜</div>
          <h1 style="margin: 0; font-size: 32px; font-weight: 700;">We Miss You!</h1>
          <p style="margin: 12px 0 0 0; font-size: 18px; color: rgba(255,255,255,0.95);">Your creative community is waiting</p>
        </div>
        
        <div class="content">
          <h2 style="color: #1a1a1a; font-size: 24px; margin: 0 0 16px 0;">Hi ${userName || 'there'}! 👋</h2>
          
          <p style="color: #4b5563; font-size: 16px; margin: 0 0 24px 0;">
            It's been ${daysSinceLastLogin} days since we last saw you, and we've been thinking about you! 
            ${totalPostsCreated > 0 ? `You created <strong>${totalPostsCreated} amazing posts</strong> with us, and we'd love to see you create more.` : 'We hope you\'re doing well!'}
          </p>
          
          ${daysSinceLastLogin >= 60 ? `
          <!-- Bonus Credits Offer -->
          <div style="text-align: center; margin: 35px 0;">
            <p style="color: #1a1a1a; font-size: 20px; font-weight: 600; margin: 0 0 20px 0;">🎁 Welcome Back Gift!</p>
            <div class="bonus-badge">
              50 BONUS CREDITS
            </div>
            <p style="color: #6B7280; font-size: 14px; margin: 15px 0 0 0;">
              Just for coming back! No strings attached. ✨
            </p>
          </div>
          ` : ''}
          
          <div class="stats-box">
            <p style="font-size: 18px; font-weight: 600; color: #1a1a1a; margin: 0 0 15px 0;">🚀 What You're Missing</p>
            <p style="color: #4B5563; font-size: 15px; margin: 0;">
              Since you've been away, <strong>12,458 creators</strong> have generated <strong>1.2M+ pieces of content</strong> using RepurposeAI. Don't let your competitors get ahead!
            </p>
          </div>
          
          <h3 style="color: #1a1a1a; font-size: 20px; margin: 35px 0 20px 0;">✨ What's New Since You Left</h3>
          
          <div class="feature-grid">
            <div class="feature-card">
              <p class="feature-title">🎯 Enhanced Viral Hook Generator</p>
              <p class="feature-desc">Now with 65+ proven hook patterns and A/B testing suggestions</p>
            </div>
            
            <div class="feature-card" style="border-color: #EC4899;">
              <p class="feature-title">🤖 AI Chat Assistant Upgrade</p>
              <p class="feature-desc">Get personalized content strategy advice in real-time</p>
            </div>
            
            <div class="feature-card" style="border-color: #10B981;">
              <p class="feature-title">📊 Performance Analytics</p>
              <p class="feature-desc">See predicted engagement scores before you post</p>
            </div>
            
            <div class="feature-card" style="border-color: #F59E0B;">
              <p class="feature-title">⚡ 3x Faster Generation</p>
              <p class="feature-desc">We've supercharged our AI models for lightning-fast results</p>
            </div>
          </div>
          
          <!-- Trending Topics -->
          <div class="trending-box">
            <p style="font-size: 18px; font-weight: 600; color: #92400E; margin: 0 0 15px 0;">🔥 Trending in Your Niche Right Now</p>
            <ul style="color: #78350F; font-size: 15px; margin: 0; padding-left: 20px;">
              <li>AI automation workflows (145% engagement increase)</li>
              <li>Content repurposing strategies (viral potential: high)</li>
              <li>LinkedIn thought leadership posts (2.3x more reach)</li>
            </ul>
            <p style="color: #92400E; font-size: 14px; margin: 15px 0 0 0; font-style: italic;">
              💡 These topics are hot right now - perfect timing to create content!
            </p>
          </div>
          
          <!-- Success Stories -->
          <div class="success-stories">
            <p style="font-size: 18px; font-weight: 600; color: #065F46; margin: 0 0 15px 0;">🏆 Recent Success Stories</p>
            <p style="color: #047857; font-size: 15px; margin: 0 0 12px 0;">
              "I came back after 2 months and RepurposeAI helped me get back on track. Created 50 posts in one week!"
              <br><span style="font-size: 13px; font-style: italic;">— Mike Rodriguez, Marketing Consultant</span>
            </p>
            <p style="color: #047857; font-size: 15px; margin: 0;">
              "The new AI features are incredible. My engagement doubled in just 2 weeks."
              <br><span style="font-size: 13px; font-style: italic;">— Jennifer Wu, Content Creator</span>
            </p>
          </div>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${EMAIL_CONFIG.SITE_URL}/dashboard" class="cta-button">
              ${daysSinceLastLogin >= 60 ? 'Claim My 50 Bonus Credits →' : 'Jump Back In →'}
            </a>
            <p style="color: #6B7280; font-size: 14px; margin: 15px 0 0 0;">
              ✓ All your data is still here • ✓ No credit card needed • ✓ Start in 30 seconds
            </p>
          </div>
          
          <!-- Account Options -->
          <div style="background: #F9FAFB; padding: 25px; border-radius: 12px; margin: 35px 0; text-align: center;">
            <p style="color: #4B5563; font-size: 15px; margin: 0 0 15px 0;">Not ready to create content yet?</p>
            <p style="color: #6B7280; font-size: 14px; margin: 0;">
              <a href="${EMAIL_CONFIG.SITE_URL}/settings/preferences" style="color: #8B5CF6; text-decoration: none;">Adjust email preferences</a> 
              <span style="color: #D1D5DB; margin: 0 8px;">•</span>
              <a href="${EMAIL_CONFIG.SITE_URL}/contact" style="color: #8B5CF6; text-decoration: none;">Talk to our team</a>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 35px; padding-top: 35px; border-top: 1px solid #E5E7EB;">
            <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">We're here whenever you're ready!</p>
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Your creative journey doesn't have to end. Let's make amazing content together. 💜
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p style="color: #F3F4F6; font-weight: 600; margin: 0 0 15px 0;">RepurposeAI</p>
          <p style="color: #6B7280; font-size: 13px; margin: 0;">
            © 2025 RepurposeAI. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    to: userEmail,
    subject,
    html,
    tags: [
      { name: 'category', value: 'reengagement' },
      { name: 'email_type', value: 'winback' },
      { name: 'days_inactive', value: daysSinceLastLogin.toString() }
    ]
  };
}

// 3. PERFORMANCE SUMMARY EMAIL (Weekly/Monthly)
export function createPerformanceSummaryEmail(
  userName: string,
  userEmail: string,
  stats: {
    postsCreated: number;
    creditsUsed: number;
    creditsRemaining: number;
    monthlyLimit: number;
    topPlatform: string;
    timeSaved: number; // in hours
    weekNumber?: number;
    comparedToLastWeek?: number; // percentage change
  }
) {
  const percentage = Math.round((stats.creditsUsed / stats.monthlyLimit) * 100);
  const isGrowth = (stats.comparedToLastWeek || 0) > 0;
  const weekOrMonth = stats.weekNumber ? `Week ${stats.weekNumber}` : 'This Month';
  
  const subject = `📊 You created ${stats.postsCreated} posts ${stats.weekNumber ? 'this week' : 'this month'} - See your stats!`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Performance Summary</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f7; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 50px 40px; text-align: center; border-radius: 16px 16px 0 0; }
        .content { background: #ffffff; padding: 45px 40px; }
        .trophy-icon { font-size: 80px; margin: 20px 0; }
        .stats-grid { display: table; width: 100%; margin: 30px 0; }
        .stat-card { background: linear-gradient(135deg, #F3E8FF 0%, #FCE7F3 100%); border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 15px; }
        .stat-large { font-size: 48px; font-weight: 700; color: #8B5CF6; margin: 10px 0; }
        .stat-label { font-size: 16px; color: #6B7280; font-weight: 600; }
        .comparison-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: 700; font-size: 14px; margin: 10px 0; }
        .badge-positive { background: #D1FAE5; color: #065F46; }
        .badge-negative { background: #FEE2E2; color: #991B1B; }
        .progress-section { margin: 30px 0; }
        .progress-bar-container { background: #E5E7EB; border-radius: 12px; height: 24px; margin: 15px 0; overflow: hidden; position: relative; }
        .progress-bar { background: linear-gradient(90deg, #10B981 0%, #059669 100%); height: 100%; display: flex; align-items: center; padding-left: 15px; color: white; font-weight: 700; font-size: 13px; }
        .achievement-box { background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border-left: 4px solid #F59E0B; padding: 25px; border-radius: 12px; margin: 25px 0; }
        .milestone-grid { margin: 25px 0; }
        .milestone-item { background: #F9FAFB; padding: 20px; border-radius: 12px; margin-bottom: 12px; display: flex; align-items: center; }
        .milestone-icon { font-size: 32px; margin-right: 15px; }
        .insight-box { background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 25px; border-radius: 12px; margin: 25px 0; }
        .cta-button { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4); margin: 20px 0; }
        .footer { background: linear-gradient(135deg, #1F2937 0%, #111827 100%); padding: 35px 40px; text-align: center; border-radius: 0 0 16px 16px; color: #9CA3AF; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="trophy-icon">🏆</div>
          <h1 style="margin: 0; font-size: 32px; font-weight: 700;">Amazing Work, ${userName}!</h1>
          <p style="margin: 12px 0 0 0; font-size: 18px; color: rgba(255,255,255,0.95);">Your ${weekOrMonth} Performance Summary</p>
        </div>
        
        <div class="content">
          <h2 style="color: #1a1a1a; font-size: 24px; margin: 0 0 16px 0;">Hi ${userName}! 👋</h2>
          
          <p style="color: #4b5563; font-size: 16px; margin: 0 0 24px 0;">
            You've been crushing it! Here's a breakdown of your content creation journey ${weekOrMonth.toLowerCase()}. 🚀
          </p>
          
          <!-- Main Stats -->
          <div class="stat-card">
            <p class="stat-label">Posts Created ${weekOrMonth}</p>
            <p class="stat-large">${stats.postsCreated}</p>
            ${stats.comparedToLastWeek !== undefined ? `
            <span class="comparison-badge ${isGrowth ? 'badge-positive' : 'badge-negative'}">
              ${isGrowth ? '↑' : '↓'} ${Math.abs(stats.comparedToLastWeek)}% vs last ${stats.weekNumber ? 'week' : 'month'}
            </span>
            ` : ''}
          </div>
          
          <div class="stats-grid">
            <div style="display: table-row;">
              <div style="display: table-cell; width: 50%; padding-right: 8px;">
                <div style="background: #F0FDF4; border-radius: 12px; padding: 20px; text-align: center;">
                  <p style="font-size: 32px; font-weight: 700; color: #10B981; margin: 0;">⏱️ ${stats.timeSaved}h</p>
                  <p style="font-size: 14px; color: #065F46; margin: 8px 0 0 0; font-weight: 600;">Time Saved</p>
                </div>
              </div>
              <div style="display: table-cell; width: 50%; padding-left: 8px;">
                <div style="background: #EFF6FF; border-radius: 12px; padding: 20px; text-align: center;">
                  <p style="font-size: 32px; font-weight: 700; color: #3B82F6; margin: 0;">📱 ${stats.topPlatform}</p>
                  <p style="font-size: 14px; color: #1E40AF; margin: 8px 0 0 0; font-weight: 600;">Top Platform</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Credit Usage -->
          <div class="progress-section">
            <h3 style="color: #1a1a1a; font-size: 20px; margin: 0 0 15px 0;">📊 Credit Usage</h3>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #4B5563; font-size: 15px; font-weight: 600;">
                ${stats.creditsUsed} / ${stats.monthlyLimit} credits used
              </span>
              <span style="color: #8B5CF6; font-size: 15px; font-weight: 700;">${percentage}%</span>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar" style="width: ${percentage}%;">${percentage}%</div>
            </div>
            <p style="color: #6B7280; font-size: 14px; margin: 10px 0 0 0;">
              ${stats.creditsRemaining} credits remaining this month
            </p>
          </div>
          
          <!-- Achievements -->
          ${stats.postsCreated >= 10 ? `
          <div class="achievement-box">
            <p style="font-size: 24px; margin: 0 0 10px 0;">🎉 Achievement Unlocked!</p>
            <p style="color: #92400E; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">Content Machine</p>
            <p style="color: #78350F; font-size: 14px; margin: 0;">
              You've created ${stats.postsCreated}+ posts! You're in the top 15% of RepurposeAI creators. 🌟
            </p>
          </div>
          ` : ''}
          
          <!-- Milestones -->
          <h3 style="color: #1a1a1a; font-size: 20px; margin: 35px 0 20px 0;">🎯 Your Milestones</h3>
          <div class="milestone-grid">
            <div class="milestone-item">
              <div class="milestone-icon">${stats.postsCreated >= 1 ? '✅' : '⭕'}</div>
              <div>
                <p style="margin: 0; font-weight: 600; color: #1a1a1a; font-size: 15px;">First Post Created</p>
                <p style="margin: 4px 0 0 0; color: #6B7280; font-size: 13px;">Start your content journey</p>
              </div>
            </div>
            
            <div class="milestone-item">
              <div class="milestone-icon">${stats.postsCreated >= 10 ? '✅' : '⭕'}</div>
              <div>
                <p style="margin: 0; font-weight: 600; color: #1a1a1a; font-size: 15px;">10 Posts Created</p>
                <p style="margin: 4px 0 0 0; color: #6B7280; font-size: 13px;">${stats.postsCreated >= 10 ? 'Achievement unlocked!' : `${10 - stats.postsCreated} more to go!`}</p>
              </div>
            </div>
            
            <div class="milestone-item">
              <div class="milestone-icon">${stats.postsCreated >= 50 ? '✅' : '⭕'}</div>
              <div>
                <p style="margin: 0; font-weight: 600; color: #1a1a1a; font-size: 15px;">50 Posts Created</p>
                <p style="margin: 4px 0 0 0; color: #6B7280; font-size: 13px;">${stats.postsCreated >= 50 ? 'Power user status!' : `${50 - stats.postsCreated} more to go!`}</p>
              </div>
            </div>
            
            <div class="milestone-item">
              <div class="milestone-icon">${stats.postsCreated >= 100 ? '✅' : '⭕'}</div>
              <div>
                <p style="margin: 0; font-weight: 600; color: #1a1a1a; font-size: 15px;">100 Posts Created</p>
                <p style="margin: 4px 0 0 0; color: #6B7280; font-size: 13px;">${stats.postsCreated >= 100 ? 'Content legend!' : `${100 - stats.postsCreated} more to go!`}</p>
              </div>
            </div>
          </div>
          
          <!-- Insights -->
          <div class="insight-box">
            <p style="font-size: 18px; font-weight: 600; color: #1E40AF; margin: 0 0 15px 0;">💡 Personalized Insights</p>
            ${stats.creditsRemaining < 5 ? `
              <p style="color: #1E3A8A; font-size: 15px; margin: 0 0 10px 0;">
                ⚠️ You're running low on credits! Upgrade to Pro for 500 credits/month and never run out.
              </p>
            ` : ''}
            <p style="color: #1E3A8A; font-size: 15px; margin: 0;">
              📈 Your top performing platform is <strong>${stats.topPlatform}</strong>. Keep creating content for maximum reach!
            </p>
          </div>
          
          <!-- Next Challenge -->
          <div style="background: linear-gradient(135deg, #F3E8FF 0%, #FCE7F3 100%); padding: 30px; border-radius: 12px; margin: 35px 0; text-align: center;">
            <p style="font-size: 22px; font-weight: 700; color: #1a1a1a; margin: 0 0 15px 0;">🚀 Next Challenge</p>
            <p style="color: #4B5563; font-size: 16px; margin: 0 0 20px 0;">
              ${stats.postsCreated < 10 
                ? `Create ${10 - stats.postsCreated} more posts to unlock the "Content Machine" badge!`
                : stats.postsCreated < 50
                ? `Create ${50 - stats.postsCreated} more posts to reach Power User status!`
                : `You're on fire! Create ${100 - stats.postsCreated} more posts to become a Content Legend!`
              }
            </p>
            <a href="${EMAIL_CONFIG.SITE_URL}/dashboard" class="cta-button">
              Create More Content →
            </a>
          </div>
          
          <!-- Share -->
          <div style="text-align: center; margin: 35px 0; padding-top: 35px; border-top: 1px solid #E5E7EB;">
            <p style="color: #4B5563; font-size: 15px; margin: 0 0 15px 0;">Proud of your progress? Share it!</p>
            <div style="display: inline-block; background: #F9FAFB; padding: 15px 25px; border-radius: 8px;">
              <p style="margin: 0; color: #1a1a1a; font-weight: 600; font-size: 16px;">
                "I created ${stats.postsCreated} posts ${stats.weekNumber ? 'this week' : 'this month'} with @RepurposeAI 🚀"
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 35px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Keep up the amazing work! We can't wait to see what you create next week. 💪
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p style="color: #F3F4F6; font-weight: 600; margin: 0 0 15px 0;">RepurposeAI</p>
          <p style="color: #6B7280; font-size: 13px; margin: 0 0 15px 0;">
            © 2025 RepurposeAI. All rights reserved.
          </p>
          <p style="color: #6B7280; font-size: 12px; margin: 0;">
            <a href="${EMAIL_CONFIG.SITE_URL}/settings/preferences" style="color: #9CA3AF; text-decoration: none;">Email Preferences</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    to: userEmail,
    subject,
    html,
    tags: [
      { name: 'category', value: 'performance' },
      { name: 'email_type', value: 'summary' },
      { name: 'posts_created', value: stats.postsCreated.toString() }
    ]
  };
}