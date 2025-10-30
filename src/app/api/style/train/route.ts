import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createChatCompletion, type ChatMessage } from '@/lib/openrouter';
import { createGroqCompletionWithSDK } from '@/lib/groq';
import { getUserByGoogleId, updateUserWritingStyle, analyzeStyleSamples, type StyleTrainingSample, type WritingStyleProfile } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { samples } = await request.json();

    if (!samples || !Array.isArray(samples) || samples.length < 3) {
      return NextResponse.json(
        { error: 'At least 3 training samples are required' },
        { status: 400 }
      );
    }

    if (samples.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 training samples allowed' },
        { status: 400 }
      );
    }

    // Validate samples
    for (const sample of samples) {
      if (!sample.content || typeof sample.content !== 'string' || sample.content.trim().length < 50) {
        return NextResponse.json(
          { error: 'Each sample must contain at least 50 characters' },
          { status: 400 }
        );
      }
      if (!sample.platform || !sample.content_type) {
        return NextResponse.json(
          { error: 'Each sample must specify platform and content_type' },
          { status: 400 }
        );
      }
    }

    // Get user from database
    const user = await getUserByGoogleId(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Process samples
    const processedSamples: StyleTrainingSample[] = samples.map((sample, index) => ({
      id: `sample_${Date.now()}_${index}`,
      content: sample.content.trim(),
      platform: sample.platform,
      content_type: sample.content_type,
      word_count: sample.content.trim().split(/\s+/).length,
      character_count: sample.content.trim().length,
      uploaded_at: new Date(),
    }));

    // Create AI prompt for style analysis
    const systemPrompt = `You are an expert writing style analyst. Your task is to analyze multiple writing samples and extract the author's unique writing style characteristics.

Analyze the provided writing samples and return ONLY a valid JSON object with this exact structure:

{
  "tone": "professional|casual|friendly|authoritative|conversational|humorous|educational|inspirational",
  "personality_traits": ["trait1", "trait2", "trait3"],
  "vocabulary_patterns": {
    "common_words": ["word1", "word2", "word3"],
    "sentence_starters": ["starter1", "starter2"],
    "transition_words": ["transition1", "transition2"],
    "power_words": ["power1", "power2"]
  },
  "sentence_structure": {
    "avg_sentence_length": 15,
    "complexity_level": "simple|moderate|complex",
    "question_frequency": 0.1,
    "exclamation_frequency": 0.05
  },
  "emoji_usage": {
    "frequency": "none|rare|moderate|frequent",
    "preferred_emojis": ["emoji1", "emoji2"],
    "placement_pattern": "beginning|middle|end|throughout"
  },
  "brand_elements": {
    "opening_styles": ["style1", "style2"],
    "closing_styles": ["style1", "style2"],
    "call_to_action_patterns": ["pattern1", "pattern2"],
    "signature_phrases": ["phrase1", "phrase2"]
  },
  "platform_preferences": {
    "x": {
      "tone_adjustment": "concise and punchy",
      "length_preference": "short",
      "emoji_usage": "moderate"
    },
    "linkedin": {
      "tone_adjustment": "professional and authoritative",
      "length_preference": "medium",
      "emoji_usage": "rare"
    },
    "instagram": {
      "tone_adjustment": "visual and engaging",
      "length_preference": "medium",
      "emoji_usage": "frequent"
    }
  }
}

Focus on identifying:
- Consistent tone and voice across samples
- Common vocabulary and phrases
- Sentence structure patterns
- Emoji usage habits
- Opening and closing patterns
- Platform-specific adaptations`;

    const userPrompt = `Please analyze these ${processedSamples.length} writing samples to extract the author's unique writing style:

${processedSamples.map((sample, index) => `
Sample ${index + 1} (${sample.platform} - ${sample.content_type}):
"${sample.content}"
`).join('\n')}

Analyze these samples and provide a comprehensive style profile that captures the author's unique voice, tone, and writing patterns.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    // Call AI for style analysis
    console.log('Calling AI for style analysis...');
    let completion;
    let model = 'unknown';
    let usage = null;
    
    try {
      completion = await createChatCompletion(messages, {
        temperature: 0.3, // Lower temperature for more consistent analysis
        max_tokens: 2000,
      });
      console.log('AI response received:', completion);
      model = completion.model;
      usage = completion.usage;
    } catch (aiError) {
      console.error('OpenRouter analysis failed:', aiError);
      
      // Try Groq as fallback
      if (process.env.GROQ_API_KEY) {
        try {
          console.log('Trying Groq as fallback...');
          const groqCompletion = await createGroqCompletionWithSDK(messages, {
            temperature: 0.3,
            max_tokens: 2000,
          });
          
          console.log('Groq response received:', groqCompletion);
          completion = {
            choices: groqCompletion.choices,
            model: 'llama-3.1-8b-instant (Groq)',
            usage: groqCompletion.usage
          };
          model = 'llama-3.1-8b-instant (Groq)';
          usage = groqCompletion.usage;
        } catch (groqError) {
          console.error('Groq also failed:', groqError);
          return NextResponse.json(
            { error: 'Both OpenRouter and Groq AI failed. Please check your API keys and try again.' },
            { status: 500 }
          );
        }
      } else {
        console.error('No Groq API key available');
        return NextResponse.json(
          { error: 'AI analysis failed. Please check your OpenRouter API key and try again.' },
          { status: 500 }
        );
      }
    }

    const rawResponse = completion.choices[0]?.message?.content?.trim() || '{}';
    
    // Clean up the response (remove markdown code blocks if present)
    let cleanedResponse = rawResponse;
    if (cleanedResponse.includes('```')) {
      cleanedResponse = cleanedResponse.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    }
    
    let styleProfile: WritingStyleProfile;
    try {
      styleProfile = JSON.parse(cleanedResponse);
      console.log('Successfully parsed AI response:', styleProfile);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response:', rawResponse);
      console.error('Cleaned response:', cleanedResponse);
      
      // Fallback to basic analysis
      console.log('Using fallback analysis...');
      const basicAnalysis = await analyzeStyleSamples(processedSamples);
      styleProfile = basicAnalysis.profile;
    }

    // Calculate confidence score
    let confidenceScore = Math.min(90, processedSamples.length * 12); // 12 points per sample, max 90
    
    // Adjust confidence based on sample diversity
    const platforms = new Set(processedSamples.map(s => s.platform));
    const contentTypes = new Set(processedSamples.map(s => s.content_type));
    
    if (platforms.size > 1) confidenceScore += 3;
    if (contentTypes.size > 1) confidenceScore += 3;
    
    // Ensure confidence is within valid range (0-100)
    confidenceScore = Math.min(100, Math.max(0, confidenceScore));
    
    // Ensure minimum confidence for activation
    if (confidenceScore < 60) {
      confidenceScore = 60;
    }

    console.log(`Calculated confidence score: ${confidenceScore}% (${processedSamples.length} samples, ${platforms.size} platforms, ${contentTypes.size} content types)`);

    // Save the style profile and samples
    console.log('Updating user writing style in database...');
    try {
      const userId = user.id; // Keep as string to avoid precision loss
      await updateUserWritingStyle(userId, styleProfile, processedSamples, confidenceScore);
      console.log('Successfully updated user writing style');
    } catch (dbError) {
      console.error('Database update failed:', dbError);
      return NextResponse.json(
        { error: 'Failed to save writing style profile. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: styleProfile,
      confidence_score: confidenceScore,
      sample_count: processedSamples.length,
      model_used: model,
      usage: usage,
      analysis_summary: {
        strengths: [
          `Analyzed ${processedSamples.length} writing samples`,
          `Detected ${styleProfile.tone} tone`,
          `Identified ${styleProfile.personality_traits.length} personality traits`,
          `Found ${styleProfile.vocabulary_patterns.common_words.length} common words`
        ],
        areas_for_improvement: confidenceScore < 80 ? [
          'Add more diverse samples for better accuracy',
          'Include samples from different platforms',
          'Provide longer content samples'
        ] : [],
        consistency_score: confidenceScore
      }
    });

  } catch (error) {
    console.error('Style training error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze writing style. Please try again.' },
      { status: 500 }
    );
  }
}
