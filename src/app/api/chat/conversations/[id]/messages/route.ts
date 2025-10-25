import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserByGoogleId, getConversationById, addMessage, getUserChatContext } from '@/lib/database';
import { createChatCompletion, type ChatMessage as OpenRouterMessage } from '@/lib/openrouter';
import { createGroqCompletionWithSDK } from '@/lib/groq';

// POST /api/chat/conversations/[id]/messages - Add message and get AI response
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await getUserByGoogleId(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const conversationId = parseInt(params.id);
    if (isNaN(conversationId)) {
      return NextResponse.json(
        { error: 'Invalid conversation ID' },
        { status: 400 }
      );
    }

    // Verify conversation belongs to user
    const conversation = await getConversationById(conversationId, user.id as unknown as number);
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { message, includeContext } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Save user message
    const userMessage = await addMessage({
      conversation_id: conversationId,
      role: 'user',
      content: message,
      tokens_used: Math.ceil(message.length / 4) // Rough token estimate
    });

    // Get user context if requested
    let contextPrompt = '';
    if (includeContext !== false) {
      try {
        const context = await getUserChatContext(String(user.id));
        
        if (context && Object.keys(context).length > 0) {
          const parts: string[] = [];
          
          if (context.recent_hooks && context.recent_hooks.length > 0) {
            parts.push(`Recent hooks you've generated: ${context.recent_hooks.map((h: any) => h.hook).join(', ')}`);
          }
          
          if (context.recent_repurposed && context.recent_repurposed.length > 0) {
            const platforms = context.recent_repurposed.map((r: any) => r.platform).filter(Boolean);
            if (platforms.length > 0) {
              parts.push(`Platforms you've repurposed content for: ${[...new Set(platforms)].join(', ')}`);
            }
          }
          
          if (context.writing_style && context.writing_style.tone && context.writing_style.enabled) {
            parts.push(`Your writing style: ${context.writing_style.tone}`);
          }
          
          if (context.competitor_count > 0) {
            parts.push(`You're tracking ${context.competitor_count} competitors`);
          }
          
          if (parts.length > 0) {
            contextPrompt = `\n\nCONTEXT: ${parts.join('. ')}`;
          }
        }
      } catch (contextError) {
        console.error('Error fetching context:', contextError);
        // Continue without context if there's an error
      }
    }

    // Generate AI response with fallback
    let aiResponse = '';
    let tokensUsed = 0;
    let modelUsed = 'unknown';
    let usedGroqFallback = false;

    try {
      // Prepare messages
      const messages: OpenRouterMessage[] = [
        {
          role: 'system',
          content: `You are a helpful AI assistant for RepurposeAI, a content creation platform. You help users with content strategy, writing, repurposing content across platforms, and viral hook generation.${contextPrompt}`
        },
        {
          role: 'user',
          content: message
        }
      ];

      // Try OpenRouter first
      try {
        console.log('💬 [Chat] Attempting OpenRouter API...');
        const response = await createChatCompletion(messages);
        aiResponse = response.choices[0]?.message?.content || '';
        tokensUsed = response.usage?.total_tokens || Math.ceil(aiResponse.length / 4);
        modelUsed = response.model || 'openrouter';
        console.log('✅ [Chat] OpenRouter succeeded');
      } catch (openRouterError: any) {
        console.error('❌ [Chat] OpenRouter failed:', openRouterError.message);
        console.log('🔄 [Chat] Falling back to Groq...');
        
        // Fallback to Groq
        const groqMessages = messages.map(msg => ({
          role: msg.role as 'system' | 'user' | 'assistant',
          content: msg.content
        }));

        const groqResponse = await createGroqCompletionWithSDK(
          groqMessages,
          'llama-3.1-8b-instant'  // Fast Groq model for chat
        );

        aiResponse = groqResponse.choices[0]?.message?.content || '';
        tokensUsed = groqResponse.usage?.total_tokens || Math.ceil(aiResponse.length / 4);
        modelUsed = 'groq-llama-3.1-8b-instant';
        usedGroqFallback = true;
        console.log('✅ [Chat] Groq fallback succeeded');
      }

      // Validate response
      if (!aiResponse || aiResponse.trim().length === 0) {
        throw new Error('AI returned empty response');
      }

      // Save AI message
      const assistantMessage = await addMessage({
        conversation_id: conversationId,
        role: 'assistant',
        content: aiResponse,
        tokens_used: tokensUsed,
        model: modelUsed
      });

      return NextResponse.json({
        success: true,
        userMessage,
        assistantMessage,
        usage: {
          total_tokens: tokensUsed,
          model: modelUsed,
          fallback: usedGroqFallback
        }
      });
    } catch (aiError: any) {
      console.error('❌ [Chat] All AI providers failed:', aiError.message);
      
      // Save error message
      const errorMessage = await addMessage({
        conversation_id: conversationId,
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        tokens_used: 0,
        model: 'error'
      });

      return NextResponse.json({
        success: true,
        userMessage,
        assistantMessage: errorMessage,
        error: 'Failed to generate AI response'
      }, { status: 200 }); // Return 200 so the user message is still saved
    }
  } catch (error) {
    console.error('Error processing message:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

