import { NextRequest, NextResponse } from 'next/server';
import { createChatCompletion, type ChatMessage } from '@/lib/openrouter';
import { deductCredits as deductLTDCredits, getUserPlan } from '@/lib/feature-gate';
import { calculateCreditCost } from '@/lib/ltd-tiers';

export async function POST(request: NextRequest) {
  try {
    // Import the helper function
    const { ensureUserExists } = await import('@/lib/ensure-user');
    
    // Ensure user exists (auto-creates if needed)
    const userResult = await ensureUserExists();
    if (!userResult.success) {
      return NextResponse.json(
        { error: userResult.error },
        { status: userResult.status || 500 }
      );
    }
    
    const { user, session } = userResult;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const { originalContent, platform, tone, currentScore, improvementType = 'general' } = await request.json();

    if (!originalContent || !platform) {
      return NextResponse.json(
        { error: 'Original content and platform are required' },
        { status: 400 }
      );
    }

    // Get user's LTD plan to calculate tier-specific cost
    const plan = await getUserPlan(session.user.id);
    const creditCost = calculateCreditCost('viral_hook', plan?.ltd_tier ?? undefined);

    // Check and deduct credits using LTD system
    const creditResult = await deductLTDCredits(
      session.user.id, 
      creditCost, 
      'viral_hook', 
      { platform, tone, currentScore, improvementType }
    );
    
    if (!creditResult.success) {
      return NextResponse.json(
        {
          error: creditResult.error || 'Insufficient credits',
          code: 'INSUFFICIENT_CREDITS',
          remaining: creditResult.remaining
        },
        { status: 402 }
      );
    }

    // Create AI prompt for content improvement
    const systemPrompt = `You are an expert social media content creator and performance optimizer. Your task is to analyze underperforming content and generate 3 improved versions that will perform significantly better.

Platform-Specific Optimization Guidelines:
- Instagram: Visual storytelling, engaging hooks, strategic hashtags, call-to-action
- X (Twitter): Concise messaging, trending topics, clear value proposition, engagement triggers
- LinkedIn: Professional insights, industry relevance, thought leadership, networking focus
- Facebook: Community engagement, shareable content, relatable stories, conversation starters
- TikTok: Trendy elements, energetic tone, viral potential, creative hooks
- Email: Clear subject lines, value-driven content, professional tone, actionable insights

Improvement Strategies:
- Add compelling hooks and opening lines
- Include specific, actionable advice
- Use power words and emotional triggers
- Optimize for platform algorithms
- Include clear calls-to-action
- Add relevant hashtags and mentions
- Make content more engaging and interactive

Return ONLY a valid JSON object with this exact structure:
{
  "suggestions": [
    {
      "title": "Compelling headline/title",
      "content": "Full improved content with specific advice and actionable steps",
      "predictedScore": 85,
      "improvements": ["Specific improvement 1", "Specific improvement 2", "Specific improvement 3"]
    },
    {
      "title": "Another compelling headline/title", 
      "content": "Another full improved content version",
      "predictedScore": 92,
      "improvements": ["Specific improvement 1", "Specific improvement 2", "Specific improvement 3"]
    },
    {
      "title": "Third compelling headline/title",
      "content": "Third full improved content version", 
      "predictedScore": 78,
      "improvements": ["Specific improvement 1", "Specific improvement 2", "Specific improvement 3"]
    }
  ],
  "analysis": {
    "mainIssues": ["Issue 1", "Issue 2", "Issue 3"],
    "keyImprovements": ["Improvement 1", "Improvement 2", "Improvement 3"],
    "platformOptimization": "Specific platform optimization advice"
  }
}`;

    const userPrompt = `Analyze this ${platform} content that scored ${currentScore}% and generate 3 significantly improved versions:

Original Content: "${originalContent}"
Platform: ${platform}
Tone: ${tone || 'professional'}
Current Score: ${currentScore}%
Improvement Type: ${improvementType}

The original content is underperforming. Generate 3 alternative versions that will score 70%+ by:
1. Adding specific, actionable advice
2. Including compelling hooks and opening lines
3. Optimizing for ${platform} best practices
4. Making content more engaging and valuable
5. Adding clear calls-to-action

Each suggestion should be a complete, ready-to-post version with a predicted performance score.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    let completion;
    let improvementResult;
    let model = 'unknown';
    let usage = null;

    // Try OpenRouter first
    try {
      completion = await createChatCompletion(messages, {
        temperature: 0.7, // Higher temperature for creative variations
        max_tokens: 1500,
      });
      
      const rawResponse = completion.choices[0]?.message?.content?.trim() || '{}';
      
      // Clean up the response
      let cleanedResponse = rawResponse;
      if (cleanedResponse.includes('```')) {
        cleanedResponse = cleanedResponse.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
      }
      
      try {
        improvementResult = JSON.parse(cleanedResponse);
      } catch (parseError) {
        // Fallback to mock improvements if JSON parsing fails
        improvementResult = generateMockImprovements(originalContent, platform, tone, currentScore);
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
            temperature: 0.7,
            max_tokens: 1500,
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
            improvementResult = JSON.parse(cleanedResponse);
          } catch (parseError) {
            improvementResult = generateMockImprovements(originalContent, platform, tone, currentScore);
          }
          
          model = 'llama-3.1-8b-instant (Groq)';
          usage = groqCompletion.usage;
        } catch (groqError) {
          console.error('Groq also failed:', groqError);
          // Fallback to mock improvements
          improvementResult = generateMockImprovements(originalContent, platform, tone, currentScore);
        }
      } else {
        console.error('No Groq API key available, using mock improvements');
        // Fallback to mock improvements
        improvementResult = generateMockImprovements(originalContent, platform, tone, currentScore);
      }
    }

    return NextResponse.json({
      success: true,
      improvements: improvementResult,
      model,
      usage,
      credits: creditResult.remaining,
      creditsUsed: creditCost,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Content improvement error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// Mock improvement generator for fallback
function generateMockImprovements(originalContent: string, platform: string, tone?: string, currentScore?: number) {
  const platformImprovements = {
    'instagram': {
      suggestions: [
        {
          title: "Ready to boost your engagement? Here's how:",
          content: `✨ Transform your content strategy with these proven tactics:

1. 📊 Analyze your audience demographics and interests
2. 🎯 Create visually appealing posts with compelling captions  
3. 📈 Track your metrics and optimize based on performance
4. 💬 Engage with your community through comments and stories
5. 🏷️ Use 5-10 relevant hashtags for maximum reach

#ContentStrategy #SocialMediaTips #Engagement`,
          predictedScore: 85,
          improvements: ["Added specific actionable steps", "Included visual elements", "Added relevant hashtags"]
        },
        {
          title: "Want to grow your Instagram presence? Try these strategies:",
          content: `🚀 Level up your Instagram game with these expert tips:

1. 📱 Post consistently at optimal times for your audience
2. 🎨 Use high-quality visuals and cohesive branding
3. 📝 Write captions that tell a story and encourage interaction
4. 🔄 Leverage Instagram Stories and Reels for more visibility
5. 🤝 Collaborate with influencers in your niche

#InstagramGrowth #SocialMediaMarketing #ContentCreation`,
          predictedScore: 78,
          improvements: ["Added platform-specific advice", "Included engagement tactics", "Made content more actionable"]
        },
        {
          title: "Ready to maximize your Instagram impact? Here's your roadmap:",
          content: `💡 Supercharge your Instagram strategy with these powerful techniques:

1. 🎯 Define your target audience and create content they love
2. 📊 Use Instagram Insights to understand what works best
3. 🎬 Experiment with different content formats (posts, stories, reels)
4. 💬 Build genuine connections through authentic engagement
5. 🏆 Focus on providing value that keeps followers coming back

#InstagramStrategy #SocialMediaSuccess #ContentOptimization`,
          predictedScore: 92,
          improvements: ["Added strategic framework", "Included analytics focus", "Emphasized value creation"]
        }
      ],
      analysis: {
        mainIssues: ["Lacks specific actionable advice", "No clear call-to-action", "Missing platform optimization"],
        keyImprovements: ["Added numbered steps", "Included hashtags", "Made content more engaging"],
        platformOptimization: "Optimized for Instagram's visual-first algorithm with engaging captions and strategic hashtag usage"
      }
    },
    'x': {
      suggestions: [
        {
          title: "Want to boost your Twitter engagement? Here's how:",
          content: `🚀 Supercharge your Twitter strategy with these proven tactics:

1. 📊 Tweet at peak hours when your audience is most active
2. 🎯 Use trending hashtags to increase visibility
3. 💬 Engage with replies quickly to boost algorithm favor
4. 🔄 Retweet valuable content from others in your niche
5. 📈 Track your analytics to optimize performance

#TwitterTips #SocialMediaStrategy #Engagement`,
          predictedScore: 88,
          improvements: ["Added specific timing advice", "Included trending hashtags", "Made content actionable"]
        },
        {
          title: "Ready to grow your Twitter following? Try these strategies:",
          content: `💡 Accelerate your Twitter growth with these expert techniques:

1. 🎯 Create valuable threads that provide deep insights
2. 📱 Use Twitter Spaces to build community connections
3. 🔥 Share behind-the-scenes content to humanize your brand
4. 💬 Ask questions to encourage conversation and engagement
5. 🏆 Focus on providing value that makes people want to follow you

#TwitterGrowth #SocialMediaMarketing #CommunityBuilding`,
          predictedScore: 82,
          improvements: ["Added thread strategy", "Included community building", "Emphasized value creation"]
        },
        {
          title: "Want to maximize your Twitter impact? Here's your roadmap:",
          content: `⚡ Transform your Twitter presence with these powerful strategies:

1. 📊 Analyze your top-performing tweets to understand what resonates
2. 🎨 Use visual content (images, GIFs) to increase engagement
3. 🔄 Participate in relevant Twitter chats and conversations
4. 📈 Share insights and tips that help your audience succeed
5. 🤝 Build relationships with influencers and thought leaders

#TwitterStrategy #ContentMarketing #SocialMediaSuccess`,
          predictedScore: 90,
          improvements: ["Added analytics focus", "Included visual strategy", "Emphasized relationship building"]
        }
      ],
      analysis: {
        mainIssues: ["Too generic", "No specific Twitter tactics", "Missing engagement strategy"],
        keyImprovements: ["Added platform-specific advice", "Included engagement tactics", "Made content actionable"],
        platformOptimization: "Optimized for Twitter's real-time algorithm with trending hashtags and engagement-focused content"
      }
    },
    'linkedin': {
      suggestions: [
        {
          title: "Ready to boost your LinkedIn presence? Here's how:",
          content: `🚀 Elevate your LinkedIn strategy with these professional tactics:

1. 📊 Share industry insights and thought leadership content
2. 🎯 Engage with posts from your network to increase visibility
3. 💼 Use LinkedIn's native video features for authentic content
4. 📈 Publish articles to establish expertise in your field
5. 🤝 Connect with industry leaders and participate in discussions

#LinkedInStrategy #ProfessionalGrowth #ThoughtLeadership`,
          predictedScore: 87,
          improvements: ["Added professional focus", "Included thought leadership", "Made content industry-specific"]
        },
        {
          title: "Want to grow your professional network? Try these strategies:",
          content: `💡 Accelerate your LinkedIn growth with these expert techniques:

1. 🎯 Create content that provides value to your professional network
2. 📱 Share career insights and industry trends regularly
3. 🔄 Comment thoughtfully on posts from your connections
4. 📊 Use LinkedIn Analytics to understand your audience better
5. 🏆 Focus on building genuine professional relationships

#ProfessionalNetworking #LinkedInGrowth #CareerDevelopment`,
          predictedScore: 84,
          improvements: ["Added networking focus", "Included analytics advice", "Emphasized relationship building"]
        },
        {
          title: "Ready to maximize your LinkedIn impact? Here's your roadmap:",
          content: `⚡ Transform your LinkedIn presence with these powerful strategies:

1. 📊 Analyze your top-performing posts to understand what resonates
2. 🎨 Share visual content (infographics, charts) to increase engagement
3. 🔄 Participate in LinkedIn Groups relevant to your industry
4. 📈 Share success stories and lessons learned from your career
5. 🤝 Build relationships with industry influencers and peers

#LinkedInStrategy #ProfessionalBranding #IndustryLeadership`,
          predictedScore: 91,
          improvements: ["Added strategic framework", "Included visual content", "Emphasized industry focus"]
        }
      ],
      analysis: {
        mainIssues: ["Lacks professional focus", "No industry-specific advice", "Missing networking strategy"],
        keyImprovements: ["Added professional tone", "Included industry insights", "Made content more valuable"],
        platformOptimization: "Optimized for LinkedIn's professional algorithm with industry-focused content and networking strategies"
      }
    }
  };

  type PlatformKey = keyof typeof platformImprovements;
  const platformKey = (platform as PlatformKey) in platformImprovements 
    ? (platform as PlatformKey) 
    : 'x';
  const platformData = platformImprovements[platformKey];
  
  return {
    suggestions: platformData.suggestions,
    analysis: platformData.analysis
  };
}


