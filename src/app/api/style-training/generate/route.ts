import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { deductCredits } from '@/lib/feature-gate';
import { pool } from '@/lib/database';

export const runtime = 'edge';

const GENERATION_CREDIT_COST = 1;

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
      styleProfileId,
      topic,
      platform
    } = await request.json();

    if (!styleProfileId || !topic) {
      return NextResponse.json(
        { error: 'Style profile ID and topic are required' },
        { status: 400 }
      );
    }

    // Get the style profile
    const profileResult = await pool.query(
      'SELECT * FROM writing_style_profiles WHERE id = $1 AND user_id = $2 AND is_active = true',
      [styleProfileId, session.user.id]
    );

    if (profileResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Style profile not found' },
        { status: 404 }
      );
    }

    const profile = profileResult.rows[0];

    // Check and deduct credits
    const creditResult = await deductCredits(
      session.user.id,
      GENERATION_CREDIT_COST,
      'style_generation',
      { styleProfileId, topic, platform }
    );

    if (!creditResult.success) {
      return NextResponse.json({
        error: creditResult.error || 'Insufficient credits',
        code: 'INSUFFICIENT_CREDITS',
        remaining: creditResult.remaining,
        required: GENERATION_CREDIT_COST
      }, { status: 402 });
    }

    // Generate content using the style profile
    const generatedContent = await generateStyledContent(profile, topic, platform);

    // Calculate style match score
    const styleMatchScore = calculateStyleMatchScore(generatedContent, profile);

    // Save the generated content
    await pool.query(
      `INSERT INTO style_generated_content (
        user_id, style_profile_id, original_topic, generated_content,
        platform, style_match_score
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        session.user.id,
        styleProfileId,
        topic,
        generatedContent,
        platform || 'general',
        styleMatchScore
      ]
    );

    return NextResponse.json({
      success: true,
      content: generatedContent,
      styleMatchScore,
      styleProfile: {
        name: profile.name,
        tone: profile.tone
      },
      creditsRemaining: creditResult.remaining,
      creditsUsed: GENERATION_CREDIT_COST
    });

  } catch (error: any) {
    console.error('Error generating styled content:', error);
    return NextResponse.json(
      { error: 'Failed to generate content', details: error.message },
      { status: 500 }
    );
  }
}

async function generateStyledContent(
  profile: any,
  topic: string,
  platform: string
): Promise<string> {
  // In production, this would use an AI model trained on the user's style
  // For now, we'll create a template that mimics the style characteristics

  const styleElements = {
    tone: profile.tone,
    emojis: profile.use_of_emojis,
    hashtags: profile.use_of_hashtags,
    questions: profile.use_of_questions,
    sentenceStructure: profile.sentence_structure,
    paragraphLength: profile.paragraph_length
  };

  let content = '';

  // Apply tone
  if (styleElements.tone === 'enthusiastic') {
    content = `Wow! Let's dive into ${topic} because this is going to be amazing!\n\n`;
  } else if (styleElements.tone === 'casual') {
    content = `Hey! So I've been thinking about ${topic} lately and wanted to share some thoughts.\n\n`;
  } else {
    content = `In today's landscape, ${topic} has become increasingly important for professionals to understand.\n\n`;
  }

  // Add main content based on sentence structure
  if (styleElements.sentenceStructure === 'complex') {
    content += `When we consider the broader implications of ${topic}, particularly in the context of modern business practices and the evolving digital landscape, it becomes evident that there are several key factors that warrant our attention and careful consideration.\n\n`;
    content += `Furthermore, the intersection of ${topic} with emerging technologies and methodologies presents both opportunities and challenges that require strategic thinking and thoughtful implementation across various organizational levels.\n\n`;
  } else if (styleElements.sentenceStructure === 'moderate') {
    content += `${topic} is changing the way we work and think. There are three main aspects to consider when approaching this subject effectively.\n\n`;
    content += `First, understanding the fundamentals is crucial. Second, practical application makes all the difference. Third, continuous improvement ensures long-term success.\n\n`;
  } else {
    content += `${topic} is simple. Here's what matters.\n\n`;
    content += `Start small. Learn fast. Improve daily.\n\n`;
    content += `That's it. No complexity needed.\n\n`;
  }

  // Add questions if the style uses them
  if (styleElements.questions) {
    content += `What does this mean for you? How can you apply ${topic} to your situation? `;
  }

  // Add closing
  if (styleElements.tone === 'enthusiastic') {
    content += `\n\nThis is just the beginning of your ${topic} journey, and I can't wait to see where it takes you!`;
  } else if (styleElements.tone === 'casual') {
    content += `\n\nHope this helps! Let me know if you have any questions about ${topic}.`;
  } else {
    content += `\n\nIn conclusion, ${topic} represents a significant opportunity for those willing to invest the time and resources necessary for successful implementation.`;
  }

  // Add emojis if the style uses them
  if (styleElements.emojis) {
    content += ` 🚀✨`;
  }

  // Add hashtags if the style uses them
  if (styleElements.hashtags && platform !== 'email') {
    const hashtag = topic.replace(/\s+/g, '');
    content += `\n\n#${hashtag} #Growth #Success`;
  }

  return content;
}

function calculateStyleMatchScore(content: string, profile: any): number {
  let score = 0;
  const maxScore = 100;

  // Check tone indicators
  if (profile.tone === 'enthusiastic' && /amazing|awesome|incredible/i.test(content)) {
    score += 20;
  } else if (profile.tone === 'professional' && /furthermore|therefore|consider/i.test(content)) {
    score += 20;
  } else if (profile.tone === 'casual' && /hey|you|let me know/i.test(content)) {
    score += 20;
  }

  // Check emoji usage
  const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]/u.test(content);
  if (hasEmojis === profile.use_of_emojis) score += 15;

  // Check hashtag usage
  const hasHashtags = /#\w+/.test(content);
  if (hasHashtags === profile.use_of_hashtags) score += 15;

  // Check question usage
  const hasQuestions = /\?/.test(content);
  if (hasQuestions === profile.use_of_questions) score += 15;

  // Check sentence structure
  const sentences = content.split(/[.!?]+/).filter(s => s.trim());
  const words = content.split(/\s+/);
  const avgWordsPerSentence = words.length / sentences.length;

  if (profile.sentence_structure === 'complex' && avgWordsPerSentence > 20) {
    score += 20;
  } else if (profile.sentence_structure === 'moderate' && avgWordsPerSentence >= 12 && avgWordsPerSentence <= 20) {
    score += 20;
  } else if (profile.sentence_structure === 'simple' && avgWordsPerSentence < 12) {
    score += 20;
  }

  // Check common phrases
  if (profile.common_phrases && Array.isArray(profile.common_phrases)) {
    const matchedPhrases = profile.common_phrases.filter((phrase: string) =>
      content.toLowerCase().includes(phrase)
    );
    score += Math.min(15, matchedPhrases.length * 3);
  }

  return Math.min(maxScore, score);
}
