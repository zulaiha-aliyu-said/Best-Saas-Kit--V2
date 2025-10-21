-- ============================================================================
-- TALK LIKE ME FEATURE - WRITING STYLE SCHEMA
-- ============================================================================
-- This file creates the database schema for the "Talk Like Me" feature
-- Execute this file after the main database setup and user preferences schema

-- Add writing style fields to user_preferences table
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS writing_style_profile JSONB,
ADD COLUMN IF NOT EXISTS style_training_samples JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS style_confidence_score DECIMAL(5,2) DEFAULT 0 CHECK (style_confidence_score >= 0 AND style_confidence_score <= 100),
ADD COLUMN IF NOT EXISTS style_enabled BOOLEAN DEFAULT false;

-- Add index for style_enabled for faster queries
CREATE INDEX IF NOT EXISTS idx_user_preferences_style_enabled ON user_preferences(style_enabled);

-- Add index for style_confidence_score for analytics
CREATE INDEX IF NOT EXISTS idx_user_preferences_style_confidence ON user_preferences(style_confidence_score);

-- Add comment to document the new columns
COMMENT ON COLUMN user_preferences.writing_style_profile IS 'JSONB object containing analyzed writing style characteristics (tone, vocabulary, sentence structure, etc.)';
COMMENT ON COLUMN user_preferences.style_training_samples IS 'JSONB array of training content samples used for style analysis';
COMMENT ON COLUMN user_preferences.style_confidence_score IS 'Confidence score (0-100) indicating quality of style training';
COMMENT ON COLUMN user_preferences.style_enabled IS 'Boolean flag to enable/disable style application in content generation';







