// Groq AI client for chat completions
import { ChatMessage } from './openrouter';

export interface GroqCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

export interface GroqCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface GroqError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

class GroqClient {
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
    this.baseURL = 'https://api.groq.com/openai/v1';
  }

  async createChatCompletion(request: GroqCompletionRequest): Promise<GroqCompletionResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('Groq API key is required');
      }
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData: GroqError = await response.json();
        throw new Error(
          `Groq API error: ${errorData.error.message} (${response.status})`
        );
      }

      const data: GroqCompletionResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred while calling Groq API');
    }
  }

  async getModels(): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred while fetching models');
    }
  }
}

// Export a singleton instance
export const groqClient = new GroqClient();

// Helper function to create a simple chat completion with Groq
export async function createGroqChatCompletion(
  messages: ChatMessage[],
  options: Partial<GroqCompletionRequest> = {}
): Promise<GroqCompletionResponse> {
  const defaultModel = 'llama-3.1-8b-instant';
  
  return groqClient.createChatCompletion({
    model: defaultModel,
    messages,
    temperature: 0.7,
    max_tokens: 1000,
    ...options,
  });
}

// Helper function to create Groq completion with OpenAI SDK compatibility
export async function createGroqCompletionWithSDK(
  messages: ChatMessage[],
  options: Partial<GroqCompletionRequest> = {}
): Promise<GroqCompletionResponse> {
  try {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ 
      apiKey: process.env.GROQ_API_KEY, 
      baseURL: "https://api.groq.com/openai/v1" 
    });
    
    const completion = await client.chat.completions.create({
      model: options.model || 'llama-3.1-8b-instant',
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1000,
      messages: messages
    });
    
    return {
      id: completion.id,
      object: completion.object,
      created: completion.created,
      model: completion.model,
      choices: completion.choices.map(choice => ({
        index: choice.index,
        message: {
          ...choice.message,
          content: choice.message.content || ''
        },
        finish_reason: choice.finish_reason || 'stop'
      })),
      usage: completion.usage || {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      }
    };
  } catch (error) {
    throw new Error(`Groq SDK completion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}







