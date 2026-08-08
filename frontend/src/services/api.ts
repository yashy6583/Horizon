import type { Candidate, APIInterviewResponse, Curriculum } from '../types';

const BASE = '/api';

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
  return request<APIInterviewResponse>(`${BASE}/interview`, {
    method: 'POST',
    body: JSON.stringify({ sessionId, candidate, persona }),
  });
}

export async function sendMessage(
  sessionId: string,
  message: string
): Promise<APIInterviewResponse> {
  return request<APIInterviewResponse>(`${BASE}/interview`, {
    method: 'POST',
    body: JSON.stringify({ sessionId, message }),
  });
}

// ── Candidates ─────────────────────────────────────────────────────
export async function fetchCandidates(): Promise<{ candidates: Candidate[] }> {
  return request<{ candidates: Candidate[] }>(`${BASE}/candidates`);
}

export async function createCandidate(data: {
  name: string;
  email: string;
  jobRole: string;
  yearsExperience: number;
  education: string;
  preset?: string;
}): Promise<Candidate> {
  return request<Candidate>(`${BASE}/candidates`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchCandidate(id: string): Promise<Candidate> {
  return request<Candidate>(`${BASE}/candidate/${id}`);
}

// ── Curriculum ─────────────────────────────────────────────────────
export async function fetchCurriculum(): Promise<Curriculum> {
  return request<Curriculum>(`${BASE}/curriculum`);
}

// ── Health ────────────────────────────────────────────────────────
export async function fetchHealth(): Promise<{ status: string; mode: string }> {
  return request<{ status: string; mode: string }>(`/health`);
}
