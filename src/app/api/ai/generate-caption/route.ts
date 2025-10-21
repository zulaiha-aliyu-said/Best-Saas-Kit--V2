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

    const { content, platform, tone, includeHashtags, maxLength } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Create AI prompt for caption enhancement
    const systemPrompt = `You are an expert social media content creator and copywriter. Your task is to enhance social media captions to be more engaging, professional, and platform-appropriate.

Platform Guidelines:
- Instagram: Visual, engaging, use emojis strategically, encourage interaction
- X (Twitter): Concise, impactful, trending topics, clear call-to-action
- LinkedIn: Professional, informative, industry-focused, thought leadership
- Facebook: Friendly, community-focused, shareable content
- TikTok: Trendy, energetic, short and punchy, use trending sounds/hashtags

Tone Guidelines:
- Professional: Formal, authoritative, industry-specific language
- Casual: Conversational, friendly, approachable
- Motivational: Inspiring, uplifting, action-oriented
- Educational: Informative, helpful, value-driven

Instructions:
1. Enhance the provided content while maintaining its core message
2. Make it more engaging and platform-appropriate
3. Add relevant emojis (use sparingly and strategically)
4. Include a compelling call-to-action when appropriate
5. ${includeHashtags ? 'Add 3-5 relevant hashtags at the end' : 'Do not add hashtags'}
6. Keep the enhanced caption under ${maxLength || 280} characters
7. Maintain the original tone and intent

Return only the enhanced caption, no explanations or additional text.`;

    const userPrompt = `Please enhance this ${platform} caption with a ${tone} tone:

Original content: "${content}"

Requirements:
- Platform: ${platform}
- Tone: ${tone}
- Include hashtags: ${includeHashtags ? 'Yes' : 'No'}
- Max length: ${maxLength || 280} characters

Enhanced caption:`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    let completion;
    let aiCaption = content;
    let model = 'unknown';
    let usage = null;

    // Try OpenRouter first
    try {
      completion = await createChatCompletion(messages, {
        temperature: 0.7,
        max_tokens: 500,
      });
      aiCaption = completion.choices[0]?.message?.content?.trim() || content;
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
            max_tokens: 500,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ]
          });
          
          aiCaption = groqCompletion.choices[0]?.message?.content?.trim() || content;
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

    return NextResponse.json({
      success: true,
      caption: aiCaption,
      originalContent: content,
      platform,
      tone,
      length: aiCaption.length,
      model,
      usage
    });

  } catch (error) {
    console.error('Error generating AI caption:', error);
    
    // Fallback to mock generation if OpenRouter fails
    const generateMockCaption = (originalContent: string, platform: string, tone: string, includeHashtags: boolean, maxLength: number) => {
      const platformStyles = {
        instagram: {
          emojis: ['✨', '🚀', '💡', '🎯', '🔥', '💪', '🌟', '🎉'],
          style: 'engaging and visual'
        },
        x: {
          emojis: ['🚀', '💡', '🔥', '⚡', '🎯', '💪'],
          style: 'concise and impactful'
        },
        linkedin: {
          emojis: ['💼', '🚀', '💡', '🎯', '📈', '💪'],
          style: 'professional and informative'
        },
        facebook: {
          emojis: ['😊', '🎉', '💡', '🚀', '❤️', '👍'],
          style: 'friendly and engaging'
        },
        tiktok: {
          emojis: ['🔥', '💯', '✨', '🚀', '🎵', '👀'],
          style: 'trendy and energetic'
        }
      };

      const platformConfig = platformStyles[platform as keyof typeof platformStyles] || platformStyles.instagram;
      
      let enhancedContent = originalContent;
      
      // Add emojis based on platform
      if (Math.random() > 0.5) {
        const randomEmoji = platformConfig.emojis[Math.floor(Math.random() * platformConfig.emojis.length)];
        enhancedContent = `${randomEmoji} ${enhancedContent}`;
      }

      // Add call-to-action based on platform
      const ctas = {
        instagram: ['Double tap if you agree! 👆', 'What do you think? Comment below! 💬', 'Save this post for later! 🔖'],
        x: ['Retweet if you found this helpful! 🔄', 'What are your thoughts? Reply below! 💭'],
        linkedin: ['What\'s your experience with this? Share below! 💼', 'Agree? Let me know your thoughts! 💭'],
        facebook: ['What do you think? Share your thoughts! 💭', 'Like if you found this helpful! 👍'],
        tiktok: ['Follow for more! 👆', 'What do you think? Comment! 💬']
      };

      if (includeHashtags && Math.random() > 0.3) {
        const platformCtas = ctas[platform as keyof typeof ctas] || ctas.instagram;
        const randomCta = platformCtas[Math.floor(Math.random() * platformCtas.length)];
        enhancedContent += `\n\n${randomCta}`;
      }

      // Add relevant hashtags
      if (includeHashtags) {
        const hashtagSets = {
          instagram: ['#instagood', '#photooftheday', '#instadaily', '#motivation', '#inspiration'],
          x: ['#motivation', '#success', '#business', '#entrepreneur', '#growth'],
          linkedin: ['#professional', '#career', '#business', '#networking', '#leadership'],
          facebook: ['#motivation', '#community', '#engagement', '#social', '#inspiration'],
          tiktok: ['#fyp', '#viral', '#trending', '#motivation', '#success']
        };

        const platformHashtags = hashtagSets[platform as keyof typeof hashtagSets] || hashtagSets.instagram;
        const selectedHashtags = platformHashtags.slice(0, Math.floor(Math.random() * 3) + 2);
        enhancedContent += `\n\n${selectedHashtags.join(' ')}`;
      }

      // Ensure content doesn't exceed max length
      if (enhancedContent.length > maxLength) {
        enhancedContent = enhancedContent.substring(0, maxLength - 3) + '...';
      }

      return enhancedContent;
    };

    const aiCaption = generateMockCaption(content, platform, tone, includeHashtags, maxLength);

    return NextResponse.json({
      success: true,
      caption: aiCaption,
      originalContent: content,
      platform,
      tone,
      length: aiCaption.length,
      fallback: true
    });
  }
}
