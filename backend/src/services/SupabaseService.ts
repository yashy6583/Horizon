import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Candidate, InterviewSession, RecruiterVerdict } from '../types';
import { getAllCandidatesDB, getCandidateByIdDB, saveCandidateDB, saveSessionDB, saveRecruiterVerdictDB } from '../db/database';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (url && key && url !== 'YOUR_SUPABASE_URL') {
    try {
      supabaseClient = createClient(url, key);
      console.log(`[Supabase] Connected to Supabase Cloud Database at ${url}`);
    } catch (err) {
      console.error('[Supabase] Failed to initialize Supabase client:', err);
    }
  }

  return supabaseClient;
}

export function isSupabaseConnected(): boolean {
  return getSupabaseClient() !== null;
}

// ── Candidates ─────────────────────────────────────────────────────

export async function fetchCandidatesSupabase(): Promise<Candidate[]> {
  const client = getSupabaseClient();
  if (!client) return getAllCandidatesDB();

  try {
    const { data: candidateRows, error: cErr } = await client.from('candidates').select('*').order('created_at', { ascending: false });
    if (cErr || !candidateRows) {
      console.error('[Supabase] Error loading candidates:', cErr);
      return getAllCandidatesDB();
    }

    const { data: missionRows } = await client.from('missions').select('*');
    const { data: signalRows } = await client.from('learning_signals').select('*');

    return candidateRows.map(row => {
      const cMissions = (missionRows || [])
        .filter(m => m.candidate_id === row.id)
        .map(m => ({
          day: m.day,
          title: m.title,
          passed: Boolean(m.passed),
          skipped: Boolean(m.skipped),
          attempts: m.attempts
        }));

      const cSignalsRow = (signalRows || []).find(s => s.candidate_id === row.id) || {
        commit_days: 0,
        missions_completed: 0,
        missions_first_try: 0,
        avg_daily_hours: 0
      };

      return {
        member: {
          id: row.id,
          name: row.name,
          email: row.email || undefined,
          jobRole: row.job_role,
          yearsExperience: row.years_experience,
          education: row.education,
          status: row.status
        },
        missions: cMissions,
        signals: {
          commitDays: cSignalsRow.commit_days,
          missionsCompleted: cSignalsRow.missions_completed,
          missionsFirstTry: cSignalsRow.missions_first_try,
          avgDailyHours: Number(cSignalsRow.avg_daily_hours) || 2.0
        }
      };
    });
  } catch (err) {
    console.error('[Supabase] Fallback to SQLite due to query error:', err);
    return getAllCandidatesDB();
  }
}

export async function fetchCandidateByIdSupabase(id: string): Promise<Candidate | undefined> {
  const client = getSupabaseClient();
  if (!client) return getCandidateByIdDB(id);

  try {
    const { data: row } = await client.from('candidates').select('*').eq('id', id).single();
    if (!row) return getCandidateByIdDB(id);

    const { data: missions } = await client.from('missions').select('*').eq('candidate_id', id);
    const { data: signals } = await client.from('learning_signals').select('*').eq('candidate_id', id).single();

    return {
      member: {
        id: row.id,
        name: row.name,
        email: row.email || undefined,
        jobRole: row.job_role,
        yearsExperience: row.years_experience,
        education: row.education,
        status: row.status
      },
      missions: (missions || []).map(m => ({
        day: m.day,
        title: m.title,
        passed: Boolean(m.passed),
        skipped: Boolean(m.skipped),
        attempts: m.attempts
      })),
      signals: {
        commitDays: signals?.commit_days || 0,
        missionsCompleted: signals?.missions_completed || 0,
        missionsFirstTry: signals?.missions_first_try || 0,
        avgDailyHours: Number(signals?.avg_daily_hours) || 2.0
      }
    };
  } catch (err) {
    return getCandidateByIdDB(id);
  }
}

export async function saveCandidateSupabase(candidate: Candidate): Promise<void> {
  // Always save to local SQLite for instant reliability
  saveCandidateDB(candidate);

  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('candidates').insert({
      id: candidate.member.id,
      name: candidate.member.name,
      email: candidate.member.email || null,
      job_role: candidate.member.jobRole,
      years_experience: candidate.member.yearsExperience,
      education: candidate.member.education
    });

    const missionPayloads = candidate.missions.map(m => ({
      candidate_id: candidate.member.id,
      day: m.day,
      title: m.title,
      passed: m.passed ? true : false,
      skipped: m.skipped ? true : false,
      attempts: m.attempts || 1
    }));

    if (missionPayloads.length > 0) {
      await client.from('missions').insert(missionPayloads);
    }

    await client.from('learning_signals').insert({
      candidate_id: candidate.member.id,
      commit_days: candidate.signals.commitDays,
      missions_completed: candidate.signals.missionsCompleted,
      missions_first_try: candidate.signals.missionsFirstTry,
      avg_daily_hours: candidate.signals.avgDailyHours || 2.0
    });

    console.log(`[Supabase] Candidate ${candidate.member.name} (${candidate.member.id}) saved to cloud!`);
  } catch (err) {
    console.error('[Supabase] Failed to insert candidate to Supabase cloud:', err);
  }
}

export async function saveSessionSupabase(session: InterviewSession): Promise<void> {
  saveSessionDB(session);

  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('interview_sessions').upsert({
      session_id: session.sessionId,
      candidate_id: session.candidateId,
      persona: session.persona || 'engineer',
      status: session.status,
      question_count: session.questionCount,
      difficulty: session.difficulty
    });
  } catch (err) {
    console.error('[Supabase] Failed to save session:', err);
  }
}

export async function saveRecruiterVerdictSupabase(sessionId: string, verdict: RecruiterVerdict): Promise<void> {
  saveRecruiterVerdictDB(sessionId, verdict);

  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('recruiter_verdicts').upsert({
      session_id: sessionId,
      verdict: verdict.verdict,
      confidence: verdict.confidence,
      recruiter_notes: verdict.recruiterNotes,
      evidence_for_json: verdict.evidenceFor,
      evidence_against_json: verdict.evidenceAgainst
    });
  } catch (err) {
    console.error('[Supabase] Failed to save recruiter verdict:', err);
  }
}
