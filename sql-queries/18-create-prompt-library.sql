-- =============================================
-- Prompt Library System
-- Created: 2024
-- Description: Tables for saving and managing user prompts
-- =============================================

-- Prompt Library Table
-- Stores user's saved prompts for quick reuse
CREATE TABLE IF NOT EXISTS prompt_library (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  prompt TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'general', -- 'content_ideas', 'research', 'writing', 'strategy', 'hooks', 'general'
  is_favorite BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Prompt Templates Table
-- Pre-built prompts available to all users
CREATE TABLE IF NOT EXISTS prompt_templates (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  prompt TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  tags TEXT[], -- Array of tags for searching
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_prompt_library_user_id ON prompt_library(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_library_category ON prompt_library(category);
CREATE INDEX IF NOT EXISTS idx_prompt_library_favorite ON prompt_library(is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_prompt_templates_category ON prompt_templates(category);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_tags ON prompt_templates USING GIN(tags);

-- =============================================
-- Helper Functions
-- =============================================

-- Function to update prompt metadata on use
CREATE OR REPLACE FUNCTION increment_prompt_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE prompt_library
  SET
    usage_count = usage_count + 1,
    last_used_at = NOW(),
    updated_at = NOW()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update template usage
CREATE OR REPLACE FUNCTION increment_template_usage(template_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE prompt_templates
  SET
    usage_count = usage_count + 1,
    updated_at = NOW()
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Useful Queries
-- =============================================

-- Get user's prompts with category breakdown
CREATE OR REPLACE VIEW user_prompt_summary AS
SELECT
  user_id,
  COUNT(*) as total_prompts,
  COUNT(*) FILTER (WHERE is_favorite = true) as favorite_count,
  SUM(usage_count) as total_uses,
  jsonb_object_agg(
    category,
    COUNT(*)
  ) as prompts_by_category
FROM prompt_library
GROUP BY user_id;

-- =============================================
-- Database Functions for API
-- =============================================

-- Get user's prompts with optional filtering
CREATE OR REPLACE FUNCTION get_user_prompts(
  p_user_id INTEGER,
  p_category VARCHAR DEFAULT NULL,
  p_favorites_only BOOLEAN DEFAULT false,
  p_search VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  id INTEGER,
  title VARCHAR(255),
  prompt TEXT,
  category VARCHAR(100),
  is_favorite BOOLEAN,
  usage_count INTEGER,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pl.id,
    pl.title,
    pl.prompt,
    pl.category,
    pl.is_favorite,
    pl.usage_count,
    pl.last_used_at,
    pl.created_at
  FROM prompt_library pl
  WHERE pl.user_id = p_user_id
    AND (p_category IS NULL OR pl.category = p_category)
    AND (p_favorites_only = false OR pl.is_favorite = true)
    AND (p_search IS NULL OR
         pl.title ILIKE '%' || p_search || '%' OR
         pl.prompt ILIKE '%' || p_search || '%')
  ORDER BY
    pl.is_favorite DESC,
    pl.last_used_at DESC NULLS LAST,
    pl.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Get prompt statistics for user
CREATE OR REPLACE FUNCTION get_prompt_statistics(p_user_id INTEGER)
RETURNS JSON AS $$
DECLARE
  stats_json JSON;
BEGIN
  SELECT json_build_object(
    'total_prompts', COUNT(*),
    'favorite_prompts', COUNT(*) FILTER (WHERE is_favorite = true),
    'total_uses', COALESCE(SUM(usage_count), 0),
    'most_used_category', (
      SELECT category
      FROM prompt_library
      WHERE user_id = p_user_id
      GROUP BY category
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ),
    'recent_activity', (
      SELECT COUNT(*)
      FROM prompt_library
      WHERE user_id = p_user_id
        AND last_used_at > NOW() - INTERVAL '7 days'
    )
  ) INTO stats_json
  FROM prompt_library
  WHERE user_id = p_user_id;

  RETURN stats_json;
END;
$$ LANGUAGE plpgsql;

-- Get popular templates by category
CREATE OR REPLACE FUNCTION get_popular_templates(
  p_category VARCHAR DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id INTEGER,
  title VARCHAR(255),
  prompt TEXT,
  category VARCHAR(100),
  description TEXT,
  tags TEXT[],
  usage_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pt.id,
    pt.title,
    pt.prompt,
    pt.category,
    pt.description,
    pt.tags,
    pt.usage_count
  FROM prompt_templates pt
  WHERE pt.is_active = true
    AND (p_category IS NULL OR pt.category = p_category)
  ORDER BY pt.usage_count DESC, pt.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Insert System Prompt Templates
-- =============================================

-- Clear existing templates (optional, for fresh start)
-- TRUNCATE TABLE prompt_templates RESTART IDENTITY CASCADE;

-- Insert pre-built prompt templates
INSERT INTO prompt_templates (title, prompt, category, description, tags) VALUES
-- Content Ideas Category
('Brainstorm 10 Ideas', 'Give me 10 unique and engaging content ideas about [TOPIC] for [PLATFORM]. Make them actionable and specific to my audience.', 'content_ideas', 'Generate content ideas for any topic and platform', ARRAY['brainstorm', 'ideas', 'content']),
('Weekly Content Calendar', 'Create a 7-day content calendar for [NICHE] on [PLATFORM]. Include post ideas, best posting times, and relevant hashtags for each day.', 'content_ideas', 'Plan a week of content in advance', ARRAY['calendar', 'planning', 'schedule']),
('Trend-Based Ideas', 'Based on current trends in [INDUSTRY], give me 5 timely content ideas that will resonate with my audience on [PLATFORM].', 'content_ideas', 'Generate ideas based on current trends', ARRAY['trends', 'timely', 'relevant']),

-- Research Category
('Topic Deep Dive', 'Research [TOPIC] and provide: 1) Key trends and insights, 2) Expert opinions, 3) Relevant statistics, 4) Content angles I can use.', 'research', 'Comprehensive topic research', ARRAY['research', 'analysis', 'insights']),
('Competitor Analysis', 'Analyze this competitor content and tell me: 1) What works well, 2) Content gaps they''re missing, 3) Opportunities for me:\n\n[PASTE CONTENT]', 'research', 'Analyze competitor content strategy', ARRAY['competitor', 'analysis', 'strategy']),
('Audience Research', 'Help me understand the [TARGET AUDIENCE] demographic. Include: pain points, interests, content preferences, and platform behavior.', 'research', 'Deep dive into target audience', ARRAY['audience', 'demographics', 'targeting']),

-- Writing Category
('Improve My Draft', 'Improve this draft. Make it more engaging, fix grammar, enhance clarity, and optimize for [PLATFORM]:\n\n[PASTE DRAFT]', 'writing', 'Polish and improve content drafts', ARRAY['editing', 'improvement', 'polish']),
('Write Hook', 'Write 5 compelling hooks for this topic: [TOPIC]. Make them attention-grabbing and suitable for [PLATFORM].', 'writing', 'Create attention-grabbing hooks', ARRAY['hooks', 'headlines', 'attention']),
('Expand Idea', 'Take this idea and expand it into a full, detailed post for [PLATFORM]: [SHORT IDEA]', 'writing', 'Expand brief ideas into full posts', ARRAY['expand', 'develop', 'elaborate']),
('Simplify Complex Topic', 'Explain [COMPLEX TOPIC] in simple terms that my [TARGET AUDIENCE] will understand. Use analogies and examples.', 'writing', 'Make complex topics accessible', ARRAY['simplify', 'explain', 'accessible']),

-- Strategy Category
('Content Strategy', 'Create a 30-day content strategy for [NICHE] focused on [GOAL]. Include content themes, posting frequency, and growth tactics.', 'strategy', 'Comprehensive content strategy', ARRAY['strategy', 'planning', 'growth']),
('Engagement Strategy', 'Give me a strategy to boost engagement on [PLATFORM]. Include specific tactics, timing recommendations, and content types to focus on.', 'strategy', 'Increase audience engagement', ARRAY['engagement', 'growth', 'tactics']),
('Cross-Platform Strategy', 'How should I adapt this content across Twitter, LinkedIn, and Instagram? Provide platform-specific recommendations: [CONTENT]', 'strategy', 'Multi-platform content adaptation', ARRAY['cross-platform', 'adaptation', 'distribution']),

-- Hooks Category
('Viral Hook Generator', 'Generate 10 viral hook variations for this topic: [TOPIC]. Use proven patterns like questions, statistics, controversies, and stories.', 'hooks', 'Create viral hooks using proven patterns', ARRAY['viral', 'hooks', 'patterns']),
('Problem-Solution Hooks', 'Create 5 problem-solution hooks about [TOPIC] that will resonate with [TARGET AUDIENCE].', 'hooks', 'Hooks that address pain points', ARRAY['problem', 'solution', 'pain-points']),
('Curiosity Gap Hooks', 'Write 5 curiosity-inducing hooks about [TOPIC] that make people want to click and read more.', 'hooks', 'Hooks that create curiosity', ARRAY['curiosity', 'clickable', 'engaging']),

-- General Category
('Quick Summary', 'Summarize this content in 3 bullet points: [PASTE CONTENT]', 'general', 'Quick content summarization', ARRAY['summary', 'quick', 'bullets']),
('Add CTAs', 'Add compelling call-to-actions to this content: [PASTE CONTENT]', 'general', 'Add strong CTAs to content', ARRAY['cta', 'conversion', 'action']),
('Optimize for SEO', 'Optimize this content for SEO. Add relevant keywords, improve structure, and suggest a meta description: [PASTE CONTENT]', 'general', 'SEO optimization for content', ARRAY['seo', 'keywords', 'optimize'])

ON CONFLICT DO NOTHING;

-- =============================================
-- Admin Analytics
-- =============================================

-- View for admin: most used templates
CREATE OR REPLACE VIEW popular_templates_analytics AS
SELECT
  id,
  title,
  category,
  usage_count,
  created_at
FROM prompt_templates
WHERE is_active = true
ORDER BY usage_count DESC
LIMIT 20;

-- View for admin: user prompt activity
CREATE OR REPLACE VIEW user_prompt_activity AS
SELECT
  u.id as user_id,
  u.email,
  COUNT(pl.id) as total_prompts,
  SUM(pl.usage_count) as total_uses,
  MAX(pl.last_used_at) as last_activity
FROM users u
LEFT JOIN prompt_library pl ON u.id = pl.user_id
GROUP BY u.id, u.email
HAVING COUNT(pl.id) > 0
ORDER BY total_uses DESC;

-- =============================================
-- Comments
-- =============================================

COMMENT ON TABLE prompt_library IS 'User-saved prompts for quick reuse in chat';
COMMENT ON TABLE prompt_templates IS 'System-provided prompt templates available to all users';
COMMENT ON COLUMN prompt_library.usage_count IS 'Number of times this prompt has been used';
COMMENT ON COLUMN prompt_library.is_favorite IS 'User-marked favorite prompts appear at top';
COMMENT ON COLUMN prompt_templates.tags IS 'Array of searchable tags for filtering';

-- =============================================
-- End of Prompt Library Schema
-- =============================================
