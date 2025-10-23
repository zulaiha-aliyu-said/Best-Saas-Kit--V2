-- Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  owner_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  member_email VARCHAR(255) NOT NULL,
  member_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'member', -- owner, admin, member, viewer
  status VARCHAR(50) DEFAULT 'pending', -- pending, active, suspended
  
  -- Permissions
  can_generate_content BOOLEAN DEFAULT true,
  can_schedule_posts BOOLEAN DEFAULT true,
  can_view_analytics BOOLEAN DEFAULT true,
  can_manage_templates BOOLEAN DEFAULT false,
  can_invite_members BOOLEAN DEFAULT false,
  
  -- Metadata
  invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  joined_at TIMESTAMP,
  last_active_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(owner_id, member_email)
);

-- Team Activity Log
CREATE TABLE IF NOT EXISTS team_activity_log (
  id SERIAL PRIMARY KEY,
  team_owner_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  member_id INT REFERENCES team_members(id) ON DELETE SET NULL,
  member_email VARCHAR(255) NOT NULL,
  
  action_type VARCHAR(100) NOT NULL, -- content_generated, post_scheduled, template_created, etc.
  action_details JSONB,
  credits_used DECIMAL(10, 2) DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shared Resources
CREATE TABLE IF NOT EXISTS team_shared_templates (
  id SERIAL PRIMARY KEY,
  owner_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id INT NOT NULL,
  shared_with_team BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team Invitations
CREATE TABLE IF NOT EXISTS team_invitations (
  id SERIAL PRIMARY KEY,
  owner_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invitee_email VARCHAR(255) NOT NULL,
  invitation_token VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'member',
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, declined, expired
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(owner_id, invitee_email)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_team_members_owner ON team_members(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(member_email);
CREATE INDEX IF NOT EXISTS idx_team_activity_owner ON team_activity_log(team_owner_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_owner ON team_invitations(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(invitation_token);

-- Add team member count to users table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'team_members_count'
  ) THEN
    ALTER TABLE users ADD COLUMN team_members_count INT DEFAULT 0;
  END IF;
END $$;

COMMENT ON TABLE team_members IS 'Team collaboration members for Tier 4+ users';
COMMENT ON TABLE team_activity_log IS 'Activity log for team members actions';

