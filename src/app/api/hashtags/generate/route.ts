import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createChatCompletion, type ChatMessage } from '@/lib/openrouter';

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

    const { keyword, platform, count = 20 } = await request.json();

    if (!keyword) {
      return NextResponse.json(
        { error: 'Keyword is required' },
        { status: 400 }
      );
    }

    try {
      // Use OpenRouter AI to generate intelligent hashtags
      const systemPrompt = `You are a social media hashtag expert. Generate relevant, trending hashtags for the given keyword and platform.

Platform Guidelines:
- Instagram: Visual content, lifestyle, fashion, food, travel, business, motivation
- X (Twitter): News, tech, business, politics, trending topics, conversations
- LinkedIn: Professional, career, business, industry-specific, networking
- Facebook: Community, family, local events, general interest, shareable content
- TikTok: Viral trends, challenges, entertainment, music, dance, comedy

Instructions:
1. Generate ${count} relevant hashtags for "${keyword}" on ${platform}
2. Include a mix of popular and niche hashtags
3. Consider trending topics and seasonal relevance
4. Make hashtags platform-appropriate
5. Include some broad and some specific hashtags
6. Return as a JSON array with this format: [{"text": "#hashtag", "posts": estimated_posts, "relevance": relevance_score}]
7. Relevance score should be 0-100 (100 = most relevant)
8. Posts should be realistic estimates based on hashtag popularity

Return only the JSON array, no other text.`;

      const userPrompt = `Generate ${count} hashtags for "${keyword}" on ${platform}. Focus on relevance and platform appropriateness.`;

      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];

      let completion;
      let responseText = '[]';
      let model = 'unknown';
      let usage = null;

      // Try OpenRouter first
      try {
        completion = await createChatCompletion(messages, {
          temperature: 0.7,
          max_tokens: 1000,
        });
        responseText = completion.choices[0]?.message?.content?.trim() || '[]';
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
              max_tokens: 1000,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
              ]
            });
            
            responseText = groqCompletion.choices[0]?.message?.content?.trim() || '[]';
            model = 'llama-3.1-8b-instant (Groq)';
            usage = groqCompletion.usage;
          } catch (groqError) {
            console.error('Groq also failed:', groqError);
            throw new Error('Both OpenRouter and Groq failed');
          }
        } else {
          throw new Error('OpenRouter failed and no Groq API key available');
        }
      }
      
      // Parse the AI response
      let hashtags;
      try {
        // Clean up the response if it has markdown formatting
        const cleanedResponse = responseText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        
        hashtags = JSON.parse(cleanedResponse);
        
        // Ensure it's an array
        if (!Array.isArray(hashtags)) {
          throw new Error('Response is not an array');
        }
        
        // Validate and clean up hashtag objects
        hashtags = hashtags.map((hashtag: any) => ({
          text: hashtag.text?.startsWith('#') ? hashtag.text : `#${hashtag.text || hashtag}`,
          posts: typeof hashtag.posts === 'number' ? hashtag.posts : Math.floor(Math.random() * 100000) + 1000,
          relevance: typeof hashtag.relevance === 'number' ? Math.min(100, Math.max(0, hashtag.relevance)) : Math.floor(Math.random() * 40) + 60,
          platform: platform || 'all'
        })).slice(0, count);

      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        throw new Error('Failed to parse AI response');
      }

      return NextResponse.json({
        success: true,
        hashtags,
        keyword,
        platform,
        count: hashtags.length,
        model,
        usage
      });

    } catch (aiError) {
      console.error('AI hashtag generation failed, using fallback:', aiError);
      
      // Fallback to mock hashtag generation
      const generateMockHashtags = (keyword: string, platform: string, count: number) => {
        const baseHashtags = [
          keyword.toLowerCase(),
          `${keyword.toLowerCase()}tips`,
          `${keyword.toLowerCase()}2024`,
          `${keyword.toLowerCase()}business`,
          `${keyword.toLowerCase()}marketing`,
          `${keyword.toLowerCase()}success`,
          `${keyword.toLowerCase()}growth`,
          `${keyword.toLowerCase()}strategy`,
          `${keyword.toLowerCase()}innovation`,
          `${keyword.toLowerCase()}digital`,
          `${keyword.toLowerCase()}tech`,
          `${keyword.toLowerCase()}startup`,
          `${keyword.toLowerCase()}entrepreneur`,
          `${keyword.toLowerCase()}leadership`,
          `${keyword.toLowerCase()}productivity`,
          `${keyword.toLowerCase()}motivation`,
          `${keyword.toLowerCase()}inspiration`,
          `${keyword.toLowerCase()}community`,
          `${keyword.toLowerCase()}networking`,
          `${keyword.toLowerCase()}career`
        ];

        // Platform-specific hashtags
        const platformHashtags = {
          instagram: ['#instagood', '#photooftheday', '#instadaily', '#instalike', '#instafollow'],
          x: ['#twitter', '#tweet', '#socialmedia', '#trending', '#viral'],
          linkedin: ['#linkedin', '#professional', '#career', '#networking', '#business'],
          facebook: ['#facebook', '#social', '#community', '#engagement', '#share'],
          tiktok: ['#tiktok', '#fyp', '#viral', '#trending', '#foryou']
        };

        const allHashtags = [
          ...baseHashtags,
          ...(platformHashtags[platform as keyof typeof platformHashtags] || [])
        ];

        // Remove duplicates and limit count
        const uniqueHashtags = [...new Set(allHashtags)].slice(0, count);

        return uniqueHashtags.map(hashtag => ({
          text: hashtag.startsWith('#') ? hashtag : `#${hashtag}`,
          posts: Math.floor(Math.random() * 1000000) + 1000,
          relevance: Math.floor(Math.random() * 40) + 60,
          platform: platform || 'all'
        }));
      };

      const hashtags = generateMockHashtags(keyword, platform, count);

      return NextResponse.json({
        success: true,
        hashtags,
        keyword,
        platform,
        count: hashtags.length,
        fallback: true
      });
    }

  } catch (error) {
    console.error('Error generating hashtags:', error);
    return NextResponse.json(
      { error: 'Failed to generate hashtags' },
      { status: 500 }
    );
  }
}
