import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserPlan, deductCredits } from '@/lib/feature-gate';
import { pool } from '@/lib/database';

export const runtime = 'edge';

const TRAINING_CREDIT_COST = 5;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      name,
      description,
      sampleContent
    } = await request.json();

    if (!name || !sampleContent) {
      return NextResponse.json(
        { error: 'Name and sample content are required' },
        { status: 400 }
      );
    }

    // Get user plan and check tier access
    const plan = await getUserPlan(session.user.id);
    
    // 🔒 TIER 3+ FEATURE - Check access
    if (plan?.plan_type === 'ltd') {
      const userTier = plan.ltd_tier || 1;
      
      if (userTier < 3) {
        return NextResponse.json({
          error: 'Tier 3+ Required',
          message: '"Talk Like Me" Style Training is a Tier 3+ feature. Upgrade to create your personalized writing style.',
          code: 'TIER_RESTRICTED',
          currentTier: userTier,
          requiredTier: 3,
          upgradeUrl: '/redeem'
        }, { status: 403 });
      }

      // Check profile limits based on tier
      const profileLimits = {
        3: 1,  // Tier 3: 1 profile
        4: 3   // Tier 4: 3 profiles
      };

      const maxProfiles = profileLimits[userTier as keyof typeof profileLimits] || 1;

      // Check current profile count
      const countResult = await pool.query(
        'SELECT COUNT(*) as count FROM writing_style_profiles WHERE user_id = $1 AND is_active = true',
        [session.user.id]
      );

      const currentCount = parseInt(countResult.rows[0].count);

      if (currentCount >= maxProfiles) {
        return NextResponse.json({
          error: 'Profile Limit Reached',
          message: `You've reached your limit of ${maxProfiles} style profile(s) for Tier ${userTier}. ${userTier === 3 ? 'Upgrade to Tier 4 for 3 profiles.' : 'Delete an existing profile to create a new one.'}`,
          code: 'LIMIT_EXCEEDED',
          current: currentCount,
          limit: maxProfiles,
          tier: userTier
        }, { status: 429 });
      }
    }

    // Check and deduct credits
    const creditResult = await deductCredits(
      session.user.id,
      TRAINING_CREDIT_COST,
      'style_training',
      { name, sampleLength: sampleContent.length }
    );

    if (!creditResult.success) {
      return NextResponse.json({
        error: creditResult.error || 'Insufficient credits',
        code: 'INSUFFICIENT_CREDITS',
        remaining: creditResult.remaining,
        required: TRAINING_CREDIT_COST
      }, { status: 402 });
    }

    console.log(`✅ Deducted ${TRAINING_CREDIT_COST} credits for style training`);

    // Analyze the writing style
    const styleAnalysis = await analyzeWritingStyle(sampleContent);

    // Create the style profile
    const result = await pool.query(
      `INSERT INTO writing_style_profiles (
        user_id, name, description, sample_content, word_count,
        tone, vocabulary_level, sentence_structure, paragraph_length,
        use_of_emojis, use_of_hashtags, use_of_questions,
        storytelling_approach, style_fingerprint, common_phrases,
        unique_patterns, training_status, trained_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())
      RETURNING *`,
      [
        session.user.id,
        name,
        description || null,
        sampleContent,
        styleAnalysis.wordCount,
        styleAnalysis.tone,
        styleAnalysis.vocabularyLevel,
        styleAnalysis.sentenceStructure,
        styleAnalysis.paragraphLength,
        styleAnalysis.useOfEmojis,
        styleAnalysis.useOfHashtags,
        styleAnalysis.useOfQuestions,
        styleAnalysis.storytellingApproach,
        JSON.stringify(styleAnalysis.fingerprint),
        styleAnalysis.commonPhrases,
        styleAnalysis.uniquePatterns,
        'completed'
      ]
    );

    // Update user's profile count
    await pool.query(
      'UPDATE users SET style_profiles_count = style_profiles_count + 1 WHERE id = $1',
      [session.user.id]
    );

    return NextResponse.json({
      success: true,
      profile: result.rows[0],
      creditsRemaining: creditResult.remaining,
      creditsUsed: TRAINING_CREDIT_COST
    });

  } catch (error: any) {
    console.error('Error creating style profile:', error);
    return NextResponse.json(
      { error: 'Failed to create style profile', details: error.message },
      { status: 500 }
    );
  }
}

async function analyzeWritingStyle(content: string) {
  // Analyze writing style characteristics
  const words = content.split(/\s+/);
  const sentences = content.split(/[.!?]+/).filter(s => s.trim());
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim());

  const wordCount = words.length;
  const avgWordsPerSentence = sentences.length > 0 ? wordCount / sentences.length : 0;
  const avgSentencesPerParagraph = paragraphs.length > 0 ? sentences.length / paragraphs.length : 0;

  // Detect characteristics
  const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]/u.test(content);
  const hasHashtags = /#\w+/.test(content);
  const hasQuestions = /\?/.test(content);

  // Determine tone
  const enthusiasticWords = /amazing|awesome|incredible|fantastic|love|great|wonderful/gi;
  const professionalWords = /furthermore|therefore|however|consequently|regarding/gi;
  const casualWords = /hey|yeah|kinda|gonna|wanna|btw/gi;

  let tone = 'professional';
  if ((content.match(enthusiasticWords) || []).length > 3) tone = 'enthusiastic';
  if ((content.match(casualWords) || []).length > 2) tone = 'casual';

  // Determine vocabulary level
  const complexWords = words.filter(w => w.length > 10).length;
  const vocabularyLevel = complexWords / wordCount > 0.15 ? 'advanced' : 
                          complexWords / wordCount > 0.08 ? 'intermediate' : 'simple';

  // Sentence structure
  const sentenceStructure = avgWordsPerSentence > 20 ? 'complex' :
                             avgWordsPerSentence > 12 ? 'moderate' : 'simple';

  // Paragraph length
  const paragraphLength = avgSentencesPerParagraph > 5 ? 'long' :
                          avgSentencesPerParagraph > 3 ? 'medium' : 'short';

  // Extract common phrases (2-3 word combinations)
  const commonPhrases = extractCommonPhrases(content);

  // Identify unique patterns
  const uniquePatterns = identifyPatterns(content);

  return {
    wordCount,
    tone,
    vocabularyLevel,
    sentenceStructure,
    paragraphLength,
    useOfEmojis: hasEmojis,
    useOfHashtags: hasHashtags,
    useOfQuestions: hasQuestions,
    storytellingApproach: hasQuestions ? 'conversational' : 'narrative',
    fingerprint: {
      avgWordsPerSentence: avgWordsPerSentence.toFixed(1),
      avgSentencesPerParagraph: avgSentencesPerParagraph.toFixed(1),
      exclamationUsage: (content.match(/!/g) || []).length,
      questionUsage: (content.match(/\?/g) || []).length,
      capitalizedWords: (content.match(/\b[A-Z]{2,}\b/g) || []).length
    },
    commonPhrases,
    uniquePatterns
  };
}

function extractCommonPhrases(content: string): string[] {
  const words = content.toLowerCase().split(/\s+/);
  const phrases: Record<string, number> = {};

  // Extract 2-3 word phrases
  for (let i = 0; i < words.length - 1; i++) {
    const twoWord = `${words[i]} ${words[i + 1]}`;
    phrases[twoWord] = (phrases[twoWord] || 0) + 1;

    if (i < words.length - 2) {
      const threeWord = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      phrases[threeWord] = (phrases[threeWord] || 0) + 1;
    }
  }

  // Return top 10 most common phrases (appearing at least twice)
  return Object.entries(phrases)
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([phrase, _]) => phrase);
}

function identifyPatterns(content: string): string[] {
  const patterns: string[] = [];

  if (/^\d+\./.test(content)) patterns.push('Numbered lists');
  if (/^[-•]/.test(content)) patterns.push('Bullet points');
  if (/\*\*.*\*\*/.test(content)) patterns.push('Bold emphasis');
  if (/_{1,2}.*_{1,2}/.test(content)) patterns.push('Italic emphasis');
  if (/>\s/.test(content)) patterns.push('Quotes/Blockquotes');
  if ((content.match(/\n\n/g) || []).length > 3) patterns.push('Short paragraphs');
  if (/^[A-Z\s]+:/.test(content)) patterns.push('Section headers');

  return patterns;
}
