import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { InterviewState, Candidate, ChatMessage } from '../types';
import { startInterview, sendMessage } from '../services/api';

const initialState: InterviewState = {
  sessionId: '',
  candidate: null,
  messages: [],
  questionCount: 0,
  topicsCovered: [],
  curriculumDaysCovered: [],
  difficulty: 'medium',
  status: 'idle',
  feedback: null,
  isAIThinking: false,
};

export function useInterview() {
  const [state, setState] = useState<InterviewState>(initialState);
  const sessionRef = useRef<string>('');

  const updateState = useCallback((updates: Partial<InterviewState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);



  const begin = useCallback(async (candidate: Candidate, persona?: string) => {
    const sessionId = uuidv4();
    sessionRef.current = sessionId;

    updateState({
      sessionId,
      candidate,
      messages: [],
      questionCount: 0,
      topicsCovered: [],
      curriculumDaysCovered: [],
      difficulty: 'medium',
      status: 'starting',
      feedback: null,
      isAIThinking: true,
      persona: persona || 'engineer',
      recruiterVerdict: null
    });

    try {
      const response = await startInterview(sessionId, candidate, persona);

      const aiMsg: ChatMessage = {
        id: uuidv4(),
        role: 'ai',
        content: response.reply,
        timestamp: new Date(),
        difficulty: 'medium',
        relatedConcepts: response.relatedConcepts
      };

      setState(prev => ({
        ...prev,
        messages: [aiMsg],
        questionCount: 1,
        status: 'active',
        isAIThinking: false,
        topicsCovered: response.relatedConcepts || []
      }));

      if (response.done && response.feedback) {
        updateState({ status: 'complete', feedback: response.feedback, recruiterVerdict: response.recruiterVerdict });
      }
    } catch (err) {
      console.error('[useInterview] Failed to start interview:', err);
      updateState({
        status: 'idle',
        isAIThinking: false,
      });
      throw err;
    }
  }, [updateState]);

  const respond = useCallback(async (message: string) => {
    if (!sessionRef.current || state.status !== 'active') return;

    // Add user message immediately
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, {
        id: uuidv4(),
        role: 'user',
        content: message,
        timestamp: new Date(),
      }],
      isAIThinking: true,
      status: 'evaluating',
    }));

    try {
      const response = await sendMessage(sessionRef.current, message);

      setState(prev => {
        const aiMsg: ChatMessage = {
          id: uuidv4(),
          role: 'ai',
          content: response.reply,
          timestamp: new Date(),
          relatedConcepts: response.relatedConcepts,
          hallucinationFlags: response.hallucinationFlags,
          architectureCritique: response.architectureCritique
        };

        const topics = prev.topicsCovered;
        if (response.relatedConcepts) {
          response.relatedConcepts.forEach(c => {
            if (!topics.includes(c)) topics.push(c);
          });
        }

        const newState: InterviewState = {
          ...prev,
          messages: [...prev.messages, aiMsg],
          questionCount: prev.questionCount + 1,
          isAIThinking: false,
          status: response.done ? 'complete' : 'active',
          feedback: response.done && response.feedback ? response.feedback : prev.feedback,
          recruiterVerdict: response.done && response.recruiterVerdict ? response.recruiterVerdict : prev.recruiterVerdict,
          topicsCovered: topics
        };

        return newState;
      });
    } catch (err) {
      console.error('[useInterview] Failed to send message:', err);
      updateState({ isAIThinking: false, status: 'active' });
      throw err;
    }
  }, [state.status, updateState]);

  const reset = useCallback(() => {
    sessionRef.current = '';
    setState(initialState);
  }, []);

  return {
    state,
    begin,
    respond,
    reset,
  };
}
