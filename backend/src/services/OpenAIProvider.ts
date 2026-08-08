import OpenAI from 'openai';
import { Candidate, InterviewSession, AIProviderResponse, ConversationMessage } from '../types';
import { buildSystemPrompt } from '../prompts/systemPrompt';

let _client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

export class OpenAIProvider {
  async getOpening(session: InterviewSession): Promise<AIProviderResponse> {
    const systemPrompt = buildSystemPrompt(session.candidate);
    const messages: ConversationMessage[] = [
      { role: 'system', content: systemPrompt },
    ];

    const response = await getClient().chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const raw = response.choices[0]?.message?.content || '{}';
    return this.parseResponse(raw);
  }

  async getNextResponse(session: InterviewSession, userMessage: string): Promise<AIProviderResponse> {
    const systemPrompt = buildSystemPrompt(session.candidate);
    const messages: ConversationMessage[] = [
      { role: 'system', content: systemPrompt },
      ...session.conversationHistory,
      { role: 'user', content: userMessage },
    ];

    const response = await getClient().chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const raw = response.choices[0]?.message?.content || '{}';
    return this.parseResponse(raw);
  }

  private parseResponse(raw: string): AIProviderResponse {
    try {
      const parsed = JSON.parse(raw);

      if (parsed.done === true) {
        return {
          reply: parsed.reply || 'Interview complete.',
          done: true,
          feedback: parsed.feedback,
        };
      }

      return {
        reply: parsed.question || parsed.reply || raw,
        done: false,
        topic: parsed.topic,
        curriculumDay: parsed.curriculumDay,
        difficulty: parsed.difficulty,
        evaluation: parsed.evaluation,
      };
    } catch {
      return {
        reply: raw,
        done: false,
      };
    }
  }
}
