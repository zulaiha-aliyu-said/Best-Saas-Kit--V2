-- Email Automation Log Table
-- Tracks all automated emails sent to users

CREATE TABLE IF NOT EXISTS email_automation_log (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  email_type VARCHAR(50) NOT NULL, -- credit_warning, reengagement, performance_summary
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  email_id VARCHAR(255), -- Resend email ID for tracking
  status VARCHAR(20) DEFAULT 'sent', -- sent, delivered, opened, clicked, bounced, failed
  metadata JSONB, -- Additional data (e.g., days_inactive, posts_created)
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_email_automation_user_id ON email_automation_log(user_id);
CREATE INDEX IF NOT EXISTS idx_email_automation_type ON email_automation_log(email_type);
CREATE INDEX IF NOT EXISTS idx_email_automation_sent_at ON email_automation_log(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_automation_status ON email_automation_log(status);

-- Create composite index for checking recent emails
CREATE INDEX IF NOT EXISTS idx_email_automation_user_type_sent 
  ON email_automation_log(user_id, email_type, sent_at);

COMMENT ON TABLE email_automation_log IS 'Tracks all automated conversion emails sent to users';
COMMENT ON COLUMN email_automation_log.email_type IS 'Type of email: credit_warning, reengagement, performance_summary';
COMMENT ON COLUMN email_automation_log.metadata IS 'Additional context data stored as JSON';


