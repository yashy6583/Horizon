import { InterviewSession } from '../types';

const sessions = new Map<string, InterviewSession>();

export function getSession(sessionId: string): InterviewSession | undefined {
  return sessions.get(sessionId);
}

export function setSession(session: InterviewSession): void {
  sessions.set(session.sessionId, session);
}

export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId);
}

export function hasSession(sessionId: string): boolean {
  return sessions.has(sessionId);
}
