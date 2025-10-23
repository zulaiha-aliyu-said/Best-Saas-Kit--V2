-- Writing Style Profiles Table
CREATE TABLE IF NOT EXISTS writing_style_profiles (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Training data
  sample_content TEXT NOT NULL,
  word_count INT NOT NULL,
  
  -- Analyzed style characteristics
  tone VARCHAR(100),
  vocabulary_level VARCHAR(50),
  sentence_structure VARCHAR(50),
  paragraph_length VARCHAR(50),
  use_of_emojis BOOLEAN DEFAULT false,
  use_of_hashtags BOOLEAN DEFAULT false,
  use_of_questions BOOLEAN DEFAULT false,
  storytelling_approach VARCHAR(100),
  
  -- AI model analysis
  style_fingerprint JSONB, -- Stores detailed AI analysis
  common_phrases TEXT[],
  unique_patterns TEXT[],
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  training_status VARCHAR(50) DEFAULT 'pending', -- pending, training, completed, failed
  trained_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, name)
);

-- Content generated with style profiles
CREATE TABLE IF NOT EXISTS style_generated_content (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  style_profile_id INT NOT NULL REFERENCES writing_style_profiles(id) ON DELETE CASCADE,
  
  original_topic TEXT NOT NULL,
  generated_content TEXT NOT NULL,
  platform VARCHAR(50),
  
  -- Quality metrics
  style_match_score DECIMAL(5, 2), -- How well it matches the style (0-100)
  user_rating INT, -- 1-5 stars
  user_feedback TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_style_profiles_user ON writing_style_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_style_profiles_active ON writing_style_profiles(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_style_content_user ON style_generated_content(user_id);
CREATE INDEX IF NOT EXISTS idx_style_content_profile ON style_generated_content(style_profile_id);

-- Add column to users table for tracking style profile limits
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'style_profiles_count'
  ) THEN
    ALTER TABLE users ADD COLUMN style_profiles_count INT DEFAULT 0;
  END IF;
END $$;

COMMENT ON TABLE writing_style_profiles IS 'Stores user writing style profiles trained from their content';
COMMENT ON TABLE style_generated_content IS 'Content generated using trained writing styles';

