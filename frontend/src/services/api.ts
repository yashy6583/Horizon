import type { Candidate, APIInterviewResponse, Curriculum } from '../types';

const BASE = '/api';

const FALLBACK_CANDIDATES: Candidate[] = [
  {
    member: { id: 'cand_01', name: 'Jordan Rivera', email: 'jordan.rivera@example.com', jobRole: 'Senior AI Systems Engineer', yearsExperience: 4, education: 'MS Computer Science, MIT' },
    missions: [
      { day: 7, title: 'Text Embeddings & Semantic Similarity', passed: true, attempts: 3 },
      { day: 8, title: 'Vector Databases', passed: true, attempts: 1 },
      { day: 10, title: 'Retrieval Engine & Hybrid Search', passed: true, attempts: 1 },
      { day: 11, title: 'Retrieval-Augmented Generation (RAG)', passed: true, attempts: 1 },
      { day: 12, title: 'Prompt Engineering', passed: true, attempts: 2 },
      { day: 13, title: 'LLM Function Calling & Structured Outputs', passed: true, attempts: 1 }
    ],
    signals: { missionsCompleted: 24, missionsFirstTry: 14, commitDays: 27, avgDailyHours: 2.8 }
  },
  {
    member: { id: 'cand_02', name: 'Sagar Kumar', email: 'sagar@example.com', jobRole: 'Senior AI Engineer', yearsExperience: 3, education: 'BS Computer Science' },
    missions: [
      { day: 7, title: 'Text Embeddings & Semantic Similarity', passed: true, attempts: 1 },
      { day: 8, title: 'Vector Databases', passed: true, attempts: 1 },
      { day: 10, title: 'Retrieval Engine & Hybrid Search', passed: true, attempts: 1 },
      { day: 12, title: 'Prompt Engineering', passed: true, attempts: 1 }
    ],
    signals: { missionsCompleted: 15, missionsFirstTry: 12, commitDays: 18, avgDailyHours: 2.5 }
  }
];

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Interview ──────────────────────────────────────────────────────
export async function startInterview(
  sessionId: string,
  candidate: Candidate,
  persona?: string
): Promise<APIInterviewResponse> {
  try {
    return await request<APIInterviewResponse>(`${BASE}/interview`, {
      method: 'POST',
      body: JSON.stringify({ sessionId, candidate, persona }),
    });
  } catch (err) {
    return {
      reply: `Let's assess your understanding of the AI systems you've built. Tell me about your experience with ${candidate.member.jobRole}.`,
      done: false,
      relatedConcepts: ['System Architecture', 'RAG Engine']
    };
  }
}

export async function sendMessage(
  sessionId: string,
  message: string
): Promise<APIInterviewResponse> {
  try {
    return await request<APIInterviewResponse>(`${BASE}/interview`, {
      method: 'POST',
      body: JSON.stringify({ sessionId, message }),
    });
  } catch (err) {
    return {
      reply: `Great explanation on "${message.slice(0, 40)}...". How would you scale this pipeline for high-throughput production workloads?`,
      done: false,
      relatedConcepts: ['Scalability', 'Concurrency']
    };
  }
}

// ── Candidates ─────────────────────────────────────────────────────
export async function fetchCandidates(): Promise<{ candidates: Candidate[] }> {
  try {
    return await request<{ candidates: Candidate[] }>(`${BASE}/candidates`);
  } catch (err) {
    console.warn('[API] Remote call failed, using candidate fallback:', err);
    return { candidates: FALLBACK_CANDIDATES };
  }
}

export async function createCandidate(data: {
  name: string;
  email: string;
  jobRole: string;
  yearsExperience: number;
  education: string;
  preset?: string;
}): Promise<Candidate> {
  try {
    return await request<Candidate>(`${BASE}/candidates`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (err) {
    const newCand: Candidate = {
      member: {
        id: `cand_${Date.now()}`,
        name: data.name,
        email: data.email,
        jobRole: data.jobRole,
        yearsExperience: data.yearsExperience,
        education: data.education,
      },
      missions: [],
      signals: { missionsCompleted: 0, missionsFirstTry: 0, commitDays: 1, avgDailyHours: 2.0 }
    };
    FALLBACK_CANDIDATES.unshift(newCand);
    return newCand;
  }
}

export async function fetchCandidate(id: string): Promise<Candidate> {
  try {
    return await request<Candidate>(`${BASE}/candidate/${id}`);
  } catch (err) {
    const found = FALLBACK_CANDIDATES.find(c => c.member.id === id);
    return found || FALLBACK_CANDIDATES[0];
  }
}

// ── Curriculum ─────────────────────────────────────────────────────
export async function fetchCurriculum(): Promise<Curriculum> {
  try {
    return await request<Curriculum>(`${BASE}/curriculum`);
  } catch (err) {
    return {
      cohort: 'ABTalks AI Cohort',
      modules: [
        { n: 1, title: 'AI Engineering & Vector Search', days: [7, 8, 9, 10, 11] },
        { n: 2, title: 'LLM Agents & Tool Use', days: [12, 13, 21, 22, 23] }
      ],
      days: [
        { day: 7, title: 'Embeddings Explained', type: 'Core', tools: ['Python', 'OpenAI'], objectives: ['Understand embedding vectors'] },
        { day: 8, title: 'Vector Databases', type: 'Core', tools: ['Pinecone', 'ChromaDB'], objectives: ['Index and query vector indices'] }
      ]
    };
  }
}

// ── Health ────────────────────────────────────────────────────────
export async function fetchHealth(): Promise<{ status: string; mode: string }> {
  try {
    return await request<{ status: string; mode: string }>(`/health`);
  } catch (err) {
    return { status: 'ok', mode: 'demo' };
  }
}
