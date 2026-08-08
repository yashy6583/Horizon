import { MockAIProvider } from './MockAIProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { InterviewSession, AIProviderResponse } from '../types';

interface AIProvider {
  getOpening(session: InterviewSession): Promise<AIProviderResponse>;
  getNextResponse(session: InterviewSession, userMessage: string): Promise<AIProviderResponse>;
}

// Singleton instances
let _mockProvider: MockAIProvider | null = null;
let _openAIProvider: OpenAIProvider | null = null;

function getProvider(): AIProvider {
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey && apiKey.length > 10 && apiKey !== 'your-openai-api-key-here') {
    if (!_openAIProvider) _openAIProvider = new OpenAIProvider();
    console.log('[AIService] Using OpenAI provider');
    return _openAIProvider;
  }
  if (!_mockProvider) _mockProvider = new MockAIProvider();
  console.log('[AIService] Using Mock AI provider (Demo Mode)');
  return _mockProvider;
}

export const AIService = {
  async getOpening(session: InterviewSession): Promise<AIProviderResponse> {
    return getProvider().getOpening(session);
  },

  async getNextResponse(session: InterviewSession, userMessage: string): Promise<AIProviderResponse> {
    return getProvider().getNextResponse(session, userMessage);
  },
};
