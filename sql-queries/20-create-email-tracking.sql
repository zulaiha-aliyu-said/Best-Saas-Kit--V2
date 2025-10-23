-- Email Tracking Table
-- Tracks all emails sent, delivery status, and engagement metrics

CREATE TABLE IF NOT EXISTS email_tracking (
  id SERIAL PRIMARY KEY,
  
  -- Email Details
  email_id VARCHAR(255), -- Resend email ID
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  recipient_email VARCHAR(255) NOT NULL,
  
  -- Email Content
  subject VARCHAR(500) NOT NULL,
  email_type VARCHAR(50) NOT NULL, -- 'welcome', 'stacked', 'campaign', 'warning', 'notification'
  
  -- Campaign Info (if applicable)
  campaign_id INTEGER,
  
  -- Tracking Metadata
  tags JSONB DEFAULT '[]',
  
  -- Status
  status VARCHAR(50) DEFAULT 'sent', -- 'sent', 'delivered', 'bounced', 'failed'
  
  -- Engagement Metrics
  opened BOOLEAN DEFAULT FALSE,
  opened_at TIMESTAMP,
  clicked BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMP,
  
  -- Timestamps
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_email_tracking_user_id ON email_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_email_tracking_email_type ON email_tracking(email_type);
CREATE INDEX IF NOT EXISTS idx_email_tracking_status ON email_tracking(status);
CREATE INDEX IF NOT EXISTS idx_email_tracking_sent_at ON email_tracking(sent_at);

-- Email Campaigns Table
CREATE TABLE IF NOT EXISTS email_campaigns (
  id SERIAL PRIMARY KEY,
  
  -- Campaign Details
  name VARCHAR(255),
  subject VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  
  -- Targeting
  target_tiers INTEGER[] DEFAULT '{}',
  include_stackers BOOLEAN,
  min_credits INTEGER,
  max_credits INTEGER,
  
  -- Stats
  targeted_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  
  -- Admin
  created_by_admin_id VARCHAR(255) REFERENCES users(id),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_by ON email_campaigns(created_by_admin_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_at ON email_campaigns(created_at);

-- Add campaign_id foreign key reference
ALTER TABLE email_tracking 
ADD CONSTRAINT fk_email_tracking_campaign 
FOREIGN KEY (campaign_id) REFERENCES email_campaigns(id) ON DELETE SET NULL;

COMMENT ON TABLE email_tracking IS 'Tracks all emails sent with delivery and engagement metrics';
COMMENT ON TABLE email_campaigns IS 'Stores email campaign details and aggregate statistics';

