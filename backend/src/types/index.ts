// TypeScript types for the AI Interview Agent

export interface CurriculumDay {
  day: number;
  title: string;
  type: string;
  tools: string[];
  objectives: string[];
}

export interface CurriculumModule {
  n: number;
  title: string;
  days: number[];
}

export interface Curriculum {
  cohort: string;
  modules: CurriculumModule[];
  days: CurriculumDay[];
}

export interface Mission {
  day: number;
  title: string;
  passed?: boolean;
  skipped?: boolean;
  attempts?: number;
}

export interface LearningSignals {
  commitDays: number;
  missionsCompleted: number;
  missionsFirstTry: number;
  avgDailyHours?: number;
}

export interface CandidateMember {
  id: string;
  name: string;
  email?: string;
  jobRole: string;
  yearsExperience: number;
  education: string;
  status?: string;
}

export interface Candidate {
  member: CandidateMember;
  missions: Mission[];
  signals: LearningSignals;
}

export interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface InterviewSession {
  sessionId: string;
  candidateId: string;
  candidate: Candidate;
  conversationHistory: ConversationMessage[];
  questionCount: number;
  topicsCovered: string[];
  curriculumDaysCovered: number[];
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'active' | 'complete';
  startedAt: Date;
  scores: {
    correctness: number[];
    depth: number[];
    reasoning: number[];
  };
  persona?: string;
  evidenceLog: EvidenceEntry[];
}

export type VerdictLevel = 'STRONG_HIRE' | 'HIRE' | 'BORDERLINE' | 'NO_HIRE';

export interface HallucinationFlag {
  claim: string;
  correction: string;
  severity: 'warning' | 'critical';
}

export interface EvidenceEntry {
  turn: number;
  quote: string;
  topic: string;
  day: number;
  score: number;
  type: 'positive' | 'negative';
}

export interface RecruiterVerdict {
  verdict: VerdictLevel;
  confidence: number;
  evidenceFor: EvidenceEntry[];
  evidenceAgainst: EvidenceEntry[];
  recruiterNotes: string;
}

export interface AIProviderResponse {
  reply: string;
  done: boolean;
  topic?: string;
  curriculumDay?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  evaluation?: {
    correctness: number;
    depth: number;
    reasoning: number;
  };
  feedback?: InterviewFeedback;
  relatedConcepts?: string[];
  hallucinationFlags?: HallucinationFlag[];
  architectureCritique?: string;
  recruiterVerdict?: RecruiterVerdict;
}

export interface InterviewFeedback {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
}

export interface InterviewRequest {
  sessionId: string;
  candidate?: Candidate;
  message?: string;
  persona?: string;
}

export interface InterviewResponse {
  reply: string;
  done: boolean;
  feedback?: InterviewFeedback;
  relatedConcepts?: string[];
  hallucinationFlags?: HallucinationFlag[];
  architectureCritique?: string;
  recruiterVerdict?: RecruiterVerdict;
}
