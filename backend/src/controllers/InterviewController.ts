import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getSession, setSession, hasSession } from '../services/InterviewSessionStore';
import { saveSessionSupabase, saveRecruiterVerdictSupabase } from '../services/SupabaseService';
import { AIService } from '../services/AIService';
import { InterviewSession, InterviewRequest, Candidate } from '../types';

export async function handleInterview(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as InterviewRequest;
    const { sessionId, candidate, message, persona } = body;

    if (!sessionId) {
      res.status(400).json({ error: 'sessionId is required' });
      return;
    }

    // ── START: new session ─────────────────────────────────────────
    if (!hasSession(sessionId)) {
      if (!candidate) {
        res.status(400).json({ error: 'candidate is required to start a new interview' });
        return;
      }

      const session: InterviewSession = {
        sessionId,
        candidateId: candidate.member.id,
        candidate,
        conversationHistory: [],
        questionCount: 0,
        topicsCovered: [],
        curriculumDaysCovered: [],
        difficulty: 'medium',
        status: 'active',
        startedAt: new Date(),
        scores: { correctness: [], depth: [], reasoning: [] },
        persona: persona || 'engineer',
        evidenceLog: []
      };

      setSession(session);

      const aiResponse = await AIService.getOpening(session);

      // Update session with opening context
      if (aiResponse.topic) {
        session.topicsCovered = [aiResponse.topic];
      }
      if (aiResponse.curriculumDay) {
        session.curriculumDaysCovered = [aiResponse.curriculumDay];
      }
      session.questionCount = 1;
      if (aiResponse.difficulty) session.difficulty = aiResponse.difficulty;

      // Store AI's opening in conversation history
      session.conversationHistory.push({
        role: 'assistant',
        content: aiResponse.reply,
      });

      setSession(session);

      res.json({
        reply: aiResponse.reply,
        done: false,
        relatedConcepts: aiResponse.relatedConcepts
      });
      return;
    }

    // ── CONVERSATION TURN ──────────────────────────────────────────
    const session = getSession(sessionId)!;

    if (session.status === 'complete') {
      res.status(400).json({ error: 'Interview is already complete' });
      return;
    }

    if (!message || message.trim() === '') {
      res.status(400).json({ error: 'message is required for a conversation turn' });
      return;
    }

    // Add candidate's message to history
    session.conversationHistory.push({ role: 'user', content: message });

    // Get AI response
    const aiResponse = await AIService.getNextResponse(session, message);

    // Update session state
    if (aiResponse.evaluation) {
      session.scores.correctness.push(aiResponse.evaluation.correctness);
      session.scores.depth.push(aiResponse.evaluation.depth);
      session.scores.reasoning.push(aiResponse.evaluation.reasoning);
    }

    if (aiResponse.topic && !session.topicsCovered.includes(aiResponse.topic)) {
      session.topicsCovered.push(aiResponse.topic);
    }
    if (aiResponse.curriculumDay && !session.curriculumDaysCovered.includes(aiResponse.curriculumDay)) {
      session.curriculumDaysCovered.push(aiResponse.curriculumDay);
    }
    if (aiResponse.difficulty) session.difficulty = aiResponse.difficulty;
    session.questionCount += 1;

    // Add AI response to history
    session.conversationHistory.push({ role: 'assistant', content: aiResponse.reply });

    if (aiResponse.done) {
      session.status = 'complete';
      if (aiResponse.recruiterVerdict) {
        saveRecruiterVerdictSupabase(session.sessionId, aiResponse.recruiterVerdict);
      }
    }

    setSession(session);
    saveSessionSupabase(session);

    const responseBody: any = {
      reply: aiResponse.reply,
      done: aiResponse.done,
      relatedConcepts: aiResponse.relatedConcepts,
      hallucinationFlags: aiResponse.hallucinationFlags,
      architectureCritique: aiResponse.architectureCritique,
      recruiterVerdict: aiResponse.recruiterVerdict
    };
    if (aiResponse.done && aiResponse.feedback) {
      responseBody.feedback = aiResponse.feedback;
    }

    res.json(responseBody);
  } catch (err) {
    console.error('[InterviewController] Error:', err);
    res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
}
