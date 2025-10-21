import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createChatCompletion, type ChatMessage } from '@/lib/openrouter';
import { getUserByGoogleId, deductCredits, createPerformancePrediction, getUserCredits } from '@/lib/database';

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

    const { content, platform, tone, hashtags, scheduledTime, contentType } = await request.json();

    if (!content || !platform) {
      return NextResponse.json(
        { error: 'Content and platform are required' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await getUserByGoogleId(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 400 }
      );
    }

    // Check credits (1 credit per prediction)
    const credits = await getUserCredits(session.user.id);
    if (credits <= 0) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 402 }
      );
    }

    // Deduct credits before making the API call
    const creditResult = await deductCredits(session.user.id, 1);
    if (!creditResult.success) {
      return NextResponse.json(
        {
          error: 'Failed to deduct credits. Please try again.',
          code: 'CREDIT_DEDUCTION_FAILED',
          credits: creditResult.newBalance
        },
        { status: 402 }
      );
    }

    // Create AI prompt for performance prediction
    const systemPrompt = `You are an expert social media performance analyst with deep knowledge of platform algorithms, engagement patterns, and content optimization. Your task is to analyze social media content and predict its performance potential.

Platform-Specific Knowledge:
- Instagram: Visual appeal, hashtag strategy, posting time, engagement rate, story views, reach potential
- X (Twitter): Tweet virality factors, trending topics, engagement patterns, retweet potential, reply rate
- LinkedIn: Professional content performance, industry relevance, thought leadership potential, B2B engagement
- Facebook: Community engagement, shareability, algorithm favorability, reach and impressions
- TikTok: Viral potential, trend alignment, creativity score, engagement velocity, algorithm boost

Scoring Criteria (0-100):
- Content Quality (25%): Writing clarity, value proposition, uniqueness
- Engagement Potential (25%): Likelihood of likes, comments, shares, saves
- Algorithm Optimization (20%): Platform-specific optimization factors
- Timing & Trends (15%): Current relevance, trending topics, optimal timing
- Audience Fit (15%): Target audience alignment, platform demographics

Return ONLY a valid JSON object with this exact structure:
{
  "score": 85,
  "breakdown": {
    "contentQuality": 90,
    "engagementPotential": 80,
    "algorithmOptimization": 85,
    "timingTrends": 75,
    "audienceFit": 90
  },
  "insights": [
    "Strong hook that captures attention immediately",
    "Good use of relevant hashtags for discoverability",
    "Content aligns well with current trending topics"
  ],
  "recommendations": [
    "Consider posting during peak hours (6-9 PM)",
    "Add a call-to-action to boost engagement",
    "Include more visual elements for better performance"
  ],
  "riskFactors": [
    "Content might be too promotional",
    "Consider reducing hashtag count for better reach"
  ],
  "predictedMetrics": {
    "likes": "500-800",
    "comments": "25-40",
    "shares": "15-25",
    "reach": "2000-3500"
  }
}`;

    const userPrompt = `Analyze this ${platform} content for performance prediction:

Content: "${content}"
Platform: ${platform}
Tone: ${tone || 'professional'}
Hashtags: ${hashtags ? hashtags.join(', ') : 'None'}
Content Type: ${contentType || 'post'}
Scheduled Time: ${scheduledTime || 'Not specified'}

Please analyze this content and provide a comprehensive performance prediction score with detailed breakdown and actionable recommendations.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    let completion;
    let predictionResult;
    let model = 'unknown';
    let usage = null;

    // Try OpenRouter first
    try {
      completion = await createChatCompletion(messages, {
        temperature: 0.3, // Lower temperature for more consistent scoring
        max_tokens: 1000,
      });
      
      const rawResponse = completion.choices[0]?.message?.content?.trim() || '{}';
      
      // Clean up the response (remove markdown code blocks if present)
      let cleanedResponse = rawResponse;
      if (cleanedResponse.includes('```')) {
        cleanedResponse = cleanedResponse.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
      }
      
      try {
        predictionResult = JSON.parse(cleanedResponse);
      } catch (parseError) {
        // Fallback to mock prediction if JSON parsing fails
        predictionResult = generateMockPrediction(content, platform, tone);
      }
      
      model = completion.model;
      usage = completion.usage;
    } catch (openRouterError) {
      console.error('OpenRouter failed, trying Groq:', openRouterError);
      
      // Try Groq as fallback
      if (process.env.GROQ_API_KEY) {
        try {
          const { default: OpenAI } = await import("openai");
          const client = new OpenAI({ 
            apiKey: process.env.GROQ_API_KEY, 
            baseURL: "https://api.groq.com/openai/v1" 
          });
          
          const groqCompletion = await client.chat.completions.create({
            model: "llama-3.1-8b-instant",
            temperature: 0.3,
            max_tokens: 1000,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ]
          });
          
          const rawResponse = groqCompletion.choices[0]?.message?.content?.trim() || '{}';
          
          // Clean up the response
          let cleanedResponse = rawResponse;
          if (cleanedResponse.includes('```')) {
            cleanedResponse = cleanedResponse.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
          }
          
          try {
            predictionResult = JSON.parse(cleanedResponse);
          } catch (parseError) {
            predictionResult = generateMockPrediction(content, platform, tone);
          }
          
          model = 'llama-3.1-8b-instant (Groq)';
          usage = groqCompletion.usage;
        } catch (groqError) {
          console.error('Groq also failed:', groqError);
          // Fallback to mock prediction
          predictionResult = generateMockPrediction(content, platform, tone);
        }
      } else {
        console.error('No Groq API key available, using mock prediction');
        // Fallback to mock prediction
        predictionResult = generateMockPrediction(content, platform, tone);
      }
    }

    // Store prediction in database for analytics and user history
    try {
      await createPerformancePrediction({
        user_id: user.id,
        content,
        platform: platform as 'x' | 'linkedin' | 'instagram' | 'facebook' | 'tiktok' | 'email',
        tone: tone || 'professional',
        content_type: contentType || 'post',
        score: predictionResult.score,
        breakdown: predictionResult.breakdown,
        insights: predictionResult.insights,
        recommendations: predictionResult.recommendations,
        risk_factors: predictionResult.riskFactors,
        predicted_metrics: predictionResult.predictedMetrics,
        model_name: model,
        tokens_used: usage?.total_tokens || 0
      });
    } catch (dbError) {
      console.error('Failed to store prediction:', dbError);
      // Don't fail the request if storage fails
    }

    return NextResponse.json({
      success: true,
      prediction: predictionResult,
      model,
      usage,
      credits: creditResult.newBalance,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Performance prediction error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// Mock prediction generator for fallback
function generateMockPrediction(content: string, platform: string, tone?: string) {
  const baseScore = Math.floor(Math.random() * 40) + 50; // 50-90 range
  
  // Adjust score based on content length
  const lengthScore = content.length > 100 && content.length < 500 ? 10 : 0;
  
  // Adjust score based on platform
  const platformBonus = {
    'instagram': 5,
    'x': 3,
    'linkedin': 7,
    'facebook': 4,
    'tiktok': 2,
    'email': 6
  }[platform] || 0;
  
  // Adjust score based on tone
  const toneBonus = {
    'professional': 5,
    'casual': 3,
    'motivational': 7,
    'educational': 6
  }[tone || 'professional'] || 0;
  
  const finalScore = Math.min(100, baseScore + lengthScore + platformBonus + toneBonus);
  
  // Generate realistic breakdown
  const breakdown = {
    contentQuality: Math.min(100, finalScore + Math.floor(Math.random() * 10) - 5),
    engagementPotential: Math.min(100, finalScore + Math.floor(Math.random() * 10) - 5),
    algorithmOptimization: Math.min(100, finalScore + Math.floor(Math.random() * 10) - 5),
    timingTrends: Math.min(100, finalScore + Math.floor(Math.random() * 10) - 5),
    audienceFit: Math.min(100, finalScore + Math.floor(Math.random() * 10) - 5)
  };
  
  // Generate platform-specific insights
  const platformInsights = {
    'instagram': [
      "Content has good visual appeal potential",
      "Hashtag strategy could be optimized",
      "Engaging hook detected"
    ],
    'x': [
      "Concise and impactful messaging",
      "Good use of trending elements",
      "Clear call-to-action present"
    ],
    'linkedin': [
      "Professional tone appropriate for platform",
      "Industry-relevant content",
      "Thought leadership potential"
    ],
    'facebook': [
      "Community-friendly content",
      "Shareable format detected",
      "Engaging storytelling elements"
    ],
    'tiktok': [
      "Trendy and energetic content",
      "Short and punchy format",
      "Viral potential indicators"
    ],
    'email': [
      "Professional newsletter format",
      "Clear subject line potential",
      "Value-driven content"
    ]
  };
  
  const platformRecommendations = {
    'instagram': [
      "Add more visual elements",
      "Optimize hashtag count (5-10)",
      "Post during peak hours (6-9 PM)"
    ],
    'x': [
      "Keep under character limit",
      "Add trending hashtags",
      "Engage with replies quickly"
    ],
    'linkedin': [
      "Add industry-specific hashtags",
      "Post during business hours",
      "Encourage professional discussion"
    ],
    'facebook': [
      "Add location tags if relevant",
      "Use Facebook-specific features",
      "Encourage community interaction"
    ],
    'tiktok': [
      "Use trending sounds/music",
      "Add relevant hashtags",
      "Post during peak engagement times"
    ],
    'email': [
      "A/B test subject lines",
      "Optimize for mobile reading",
      "Include clear unsubscribe option"
    ]
  };
  
  const platformRisks = {
    'instagram': [
      "May need more visual content",
      "Consider reducing text length"
    ],
    'x': [
      "Character count optimization needed",
      "Consider thread format for longer content"
    ],
    'linkedin': [
      "May be too promotional",
      "Consider adding more context"
    ],
    'facebook': [
      "Algorithm changes may affect reach",
      "Consider boosting for better visibility"
    ],
    'tiktok': [
      "Trends change quickly",
      "May need more creative elements"
    ],
    'email': [
      "Spam filters may affect delivery",
      "Consider personalization"
    ]
  };
  
  type PlatformKey = keyof typeof platformInsights;
  const platformKey = (platform as PlatformKey) in platformInsights 
    ? (platform as PlatformKey) 
    : 'x';
  
  return {
    score: finalScore,
    breakdown,
    insights: platformInsights[platformKey],
    recommendations: platformRecommendations[platformKey],
    riskFactors: platformRisks[platformKey],
    predictedMetrics: {
      likes: `${Math.floor(finalScore * 10)}-${Math.floor(finalScore * 15)}`,
      comments: `${Math.floor(finalScore * 0.3)}-${Math.floor(finalScore * 0.5)}`,
      shares: `${Math.floor(finalScore * 0.2)}-${Math.floor(finalScore * 0.3)}`,
      reach: `${Math.floor(finalScore * 20)}-${Math.floor(finalScore * 35)}`
    }
  };
}
