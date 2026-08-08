// TypeScript types for the frontend

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

export interface InterviewFeedback {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
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

export interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: Date;
  topic?: string;
  curriculumDay?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  relatedConcepts?: string[];
  hallucinationFlags?: HallucinationFlag[];
  architectureCritique?: string;
}

export interface InterviewState {
  sessionId: string;
  candidate: Candidate | null;
  messages: ChatMessage[];
  questionCount: number;
  topicsCovered: string[];
  curriculumDaysCovered: number[];
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'idle' | 'starting' | 'active' | 'evaluating' | 'complete';
  feedback: InterviewFeedback | null;
  isAIThinking: boolean;
  persona?: string;
  recruiterVerdict?: RecruiterVerdict | null;
}

export interface APIInterviewResponse {
  reply: string;
  done: boolean;
  feedback?: InterviewFeedback;
  relatedConcepts?: string[];
  hallucinationFlags?: HallucinationFlag[];
  architectureCritique?: string;
  recruiterVerdict?: RecruiterVerdict;
}

export type DayStatus = 'completed' | 'skipped' | 'failed' | 'not-started';
