-- =============================================
-- Chat System Tables
-- Created: 2024
-- Description: Tables for AI chat conversations, message history, and context
-- =============================================

-- Chat Conversations Table
-- Stores individual chat sessions for users
CREATE TABLE IF NOT EXISTS chat_conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL DEFAULT 'New Conversation',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  total_tokens_used INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT false
);

-- Chat Messages Table
-- Stores all messages in conversations
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  model VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_last_message ON chat_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- =============================================
-- Helper Functions
-- =============================================

-- Function to update conversation metadata after new message
CREATE OR REPLACE FUNCTION update_conversation_metadata()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_conversations
  SET
    message_count = message_count + 1,
    total_tokens_used = total_tokens_used + COALESCE(NEW.tokens_used, 0),
    last_message_at = NEW.created_at,
    updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update conversation metadata
DROP TRIGGER IF EXISTS trigger_update_conversation_metadata ON chat_messages;
CREATE TRIGGER trigger_update_conversation_metadata
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_metadata();

-- Function to auto-generate conversation title from first message
CREATE OR REPLACE FUNCTION auto_generate_conversation_title()
RETURNS TRIGGER AS $$
DECLARE
  first_message TEXT;
  generated_title TEXT;
BEGIN
  -- Only generate title if it's still the default "New Conversation"
  IF (SELECT title FROM chat_conversations WHERE id = NEW.conversation_id) = 'New Conversation' AND NEW.role = 'user' THEN
    -- Get first 50 characters of the user's message
    first_message := LEFT(NEW.content, 50);

    -- Clean up and create title
    generated_title := CASE
      WHEN LENGTH(NEW.content) > 50 THEN first_message || '...'
      ELSE first_message
    END;

    -- Update conversation title
    UPDATE chat_conversations
    SET title = generated_title
    WHERE id = NEW.conversation_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate title
DROP TRIGGER IF EXISTS trigger_auto_generate_title ON chat_messages;
CREATE TRIGGER trigger_auto_generate_title
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_conversation_title();

-- =============================================
-- Useful Queries for Conversation Management
-- =============================================

-- Get user's conversations with last message preview
CREATE OR REPLACE VIEW conversation_list AS
SELECT
  c.id,
  c.user_id,
  c.title,
  c.message_count,
  c.total_tokens_used,
  c.last_message_at,
  c.created_at,
  c.is_archived,
  (
    SELECT content
    FROM chat_messages
    WHERE conversation_id = c.id
    ORDER BY created_at DESC
    LIMIT 1
  ) as last_message_preview
FROM chat_conversations c
ORDER BY c.last_message_at DESC;

-- =============================================
-- Sample Data Functions
-- =============================================

-- Function to get conversation with all messages
CREATE OR REPLACE FUNCTION get_conversation_with_messages(
  p_conversation_id INTEGER
)
RETURNS TABLE (
  conversation_id INTEGER,
  conversation_title VARCHAR(255),
  message_id INTEGER,
  message_role VARCHAR(20),
  message_content TEXT,
  message_created_at TIMESTAMP WITH TIME ZONE,
  tokens_used INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id as conversation_id,
    c.title as conversation_title,
    m.id as message_id,
    m.role as message_role,
    m.content as message_content,
    m.created_at as message_created_at,
    m.tokens_used
  FROM chat_conversations c
  LEFT JOIN chat_messages m ON c.id = m.conversation_id
  WHERE c.id = p_conversation_id
  ORDER BY m.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's recent activity for context
CREATE OR REPLACE FUNCTION get_user_chat_context(
  p_user_id INTEGER
)
RETURNS JSON AS $$
DECLARE
  context_json JSON;
BEGIN
  SELECT json_build_object(
    'recent_hooks', (
      SELECT json_agg(json_build_object(
        'hook', hook,
        'category', category,
        'created_at', created_at
      ))
      FROM (
        SELECT hook, category, created_at
        FROM viral_hooks
        WHERE user_id = p_user_id
        ORDER BY created_at DESC
        LIMIT 5
      ) recent_hooks
    ),
    'recent_repurposed', (
      SELECT json_agg(json_build_object(
        'platform', platform,
        'created_at', created_at
      ))
      FROM (
        SELECT DISTINCT platform, created_at
        FROM repurposed_content
        WHERE user_id = p_user_id
        ORDER BY created_at DESC
        LIMIT 5
      ) recent_repurposed
    ),
    'writing_style', (
      SELECT json_build_object(
        'tone', writing_style->>'tone',
        'enabled', style_enabled
      )
      FROM users
      WHERE id = p_user_id
    ),
    'competitor_count', (
      SELECT COUNT(*)
      FROM competitors
      WHERE user_id = p_user_id AND is_active = true
    )
  ) INTO context_json;

  RETURN context_json;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Analytics Functions
-- =============================================

-- Function to get chat usage statistics
CREATE OR REPLACE FUNCTION get_chat_statistics(
  p_user_id INTEGER,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_conversations INTEGER,
  total_messages INTEGER,
  total_tokens_used BIGINT,
  avg_messages_per_conversation NUMERIC,
  active_days INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT c.id)::INTEGER as total_conversations,
    COUNT(m.id)::INTEGER as total_messages,
    SUM(m.tokens_used)::BIGINT as total_tokens_used,
    ROUND(COUNT(m.id)::NUMERIC / NULLIF(COUNT(DISTINCT c.id), 0), 2) as avg_messages_per_conversation,
    COUNT(DISTINCT DATE(m.created_at))::INTEGER as active_days
  FROM chat_conversations c
  LEFT JOIN chat_messages m ON c.id = m.conversation_id
  WHERE c.user_id = p_user_id
    AND c.created_at > NOW() - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Cleanup Functions
-- =============================================

-- Function to archive old conversations
CREATE OR REPLACE FUNCTION archive_old_conversations(
  p_days_inactive INTEGER DEFAULT 90
)
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  UPDATE chat_conversations
  SET is_archived = true
  WHERE last_message_at < NOW() - (p_days_inactive || ' days')::INTERVAL
    AND is_archived = false;

  GET DIAGNOSTICS archived_count = ROW_COUNT;
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Comments
-- =============================================

COMMENT ON TABLE chat_conversations IS 'Stores AI chat conversation sessions for users';
COMMENT ON TABLE chat_messages IS 'Stores individual messages in chat conversations';
COMMENT ON COLUMN chat_conversations.title IS 'Auto-generated from first user message or manually set';
COMMENT ON COLUMN chat_conversations.total_tokens_used IS 'Total tokens consumed in this conversation for billing';
COMMENT ON COLUMN chat_messages.role IS 'Message sender: user, assistant, or system';
COMMENT ON COLUMN chat_messages.model IS 'AI model used for assistant responses (e.g., gpt-4, claude-3)';

-- =============================================
-- Permissions (if using row-level security)
-- =============================================

-- Enable RLS if needed
-- ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Sample RLS policies (uncomment if using RLS)
-- CREATE POLICY chat_conversations_user_policy ON chat_conversations
--   FOR ALL TO authenticated
--   USING (user_id = current_user_id());

-- CREATE POLICY chat_messages_user_policy ON chat_messages
--   FOR ALL TO authenticated
--   USING (conversation_id IN (
--     SELECT id FROM chat_conversations WHERE user_id = current_user_id()
--   ));

-- =============================================
-- End of Chat Tables Schema
-- =============================================
