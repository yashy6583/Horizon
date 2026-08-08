import path from 'path';
import fs from 'fs';
import { Candidate, InterviewSession, RecruiterVerdict } from '../types';

const DB_PATH = path.resolve(__dirname, '../../../data/interview_agent.db');
const DATA_DIR = path.resolve(__dirname, '../../../data');

let dbInstance: any = null;
let useSQLite = false;

try {
  const Database = require('better-sqlite3');
  if (!fs.existsSync(DATA_DIR)) {
    try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (_) {}
  }
  try {
    dbInstance = new Database(DB_PATH);
  } catch (_) {
    dbInstance = new Database(':memory:');
  }
  dbInstance.pragma('foreign_keys = ON');
  useSQLite = true;
} catch (err) {
  console.warn('[Database] SQLite native addon unavailable in serverless environment. Using high-speed in-memory store.');
}

export const db = dbInstance;

// In-Memory Fallback Store
const memoryCandidates: Map<string, Candidate> = new Map();
const memorySessions: Map<string, InterviewSession> = new Map();
const memoryVerdicts: Map<string, RecruiterVerdict> = new Map();

export function initDatabase() {
  if (useSQLite && dbInstance) {
    try {
      console.log(`[Database] Initializing SQLite database...`);
      dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS candidates (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT,
          job_role TEXT NOT NULL,
          years_experience INTEGER NOT NULL,
          education TEXT,
          status TEXT DEFAULT 'active',
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS missions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          candidate_id TEXT NOT NULL,
          day INTEGER NOT NULL,
          title TEXT NOT NULL,
          passed INTEGER DEFAULT 0,
          skipped INTEGER DEFAULT 0,
          attempts INTEGER DEFAULT 1,
          FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS learning_signals (
          candidate_id TEXT PRIMARY KEY,
          commit_days INTEGER DEFAULT 0,
          missions_completed INTEGER DEFAULT 0,
          missions_first_try INTEGER DEFAULT 0,
          avg_daily_hours REAL DEFAULT 0.0,
          FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS interview_sessions (
          session_id TEXT PRIMARY KEY,
          candidate_id TEXT NOT NULL,
          persona TEXT DEFAULT 'engineer',
          status TEXT DEFAULT 'active',
          question_count INTEGER DEFAULT 0,
          difficulty TEXT DEFAULT 'medium',
          started_at TEXT DEFAULT CURRENT_TIMESTAMP,
          completed_at TEXT,
          FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS conversation_messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id TEXT NOT NULL,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (session_id) REFERENCES interview_sessions(session_id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS recruiter_verdicts (
          session_id TEXT PRIMARY KEY,
          verdict TEXT NOT NULL,
          confidence INTEGER NOT NULL,
          recruiter_notes TEXT,
          evidence_for_json TEXT,
          evidence_against_json TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (session_id) REFERENCES interview_sessions(session_id) ON DELETE CASCADE
        );
      `);
      seedDatabaseIfEmpty();
      return;
    } catch (e) {
      console.warn('[Database] SQLite init error, switching to in-memory store:', e);
      useSQLite = false;
    }
  }

  // Seed In-Memory Store
  seedMemoryStore();
}

function seedMemoryStore() {
  if (memoryCandidates.size > 0) return;
  const jsonPath = path.join(DATA_DIR, 'candidates.json');
  if (!fs.existsSync(jsonPath)) return;
  try {
    const raw = fs.readFileSync(jsonPath, 'utf-8');
    const data = JSON.parse(raw) as { candidates: Candidate[] };
    for (const c of data.candidates) {
      memoryCandidates.set(c.member.id, c);
    }
    console.log(`[Database] In-memory store seeded with ${memoryCandidates.size} candidates.`);
  } catch (err) {
    console.error('[Database] Failed to seed memory store:', err);
  }
}

function seedDatabaseIfEmpty() {
  if (!useSQLite || !dbInstance) return;
  try {
    const countRow = dbInstance.prepare('SELECT COUNT(*) as count FROM candidates').get() as { count: number };
    if (countRow.count > 0) return;

    const jsonPath = path.join(DATA_DIR, 'candidates.json');
    if (!fs.existsSync(jsonPath)) return;

    const raw = fs.readFileSync(jsonPath, 'utf-8');
    const data = JSON.parse(raw) as { candidates: Candidate[] };

    const insertCandidate = dbInstance.prepare(`
      INSERT INTO candidates (id, name, email, job_role, years_experience, education)
      VALUES (@id, @name, @email, @jobRole, @yearsExperience, @education)
    `);

    const insertMission = dbInstance.prepare(`
      INSERT INTO missions (candidate_id, day, title, passed, skipped, attempts)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertSignals = dbInstance.prepare(`
      INSERT INTO learning_signals (candidate_id, commit_days, missions_completed, missions_first_try, avg_daily_hours)
      VALUES (?, ?, ?, ?, ?)
    `);

    const transaction = dbInstance.transaction((candidatesList: Candidate[]) => {
      for (const c of candidatesList) {
        insertCandidate.run({
          id: c.member.id,
          name: c.member.name,
          email: c.member.email || null,
          jobRole: c.member.jobRole,
          yearsExperience: c.member.yearsExperience,
          education: c.member.education,
        });

        for (const m of c.missions) {
          insertMission.run(c.member.id, m.day, m.title, m.passed ? 1 : 0, m.skipped ? 1 : 0, m.attempts || 1);
        }

        insertSignals.run(c.member.id, c.signals.commitDays, c.signals.missionsCompleted, c.signals.missionsFirstTry, c.signals.avgDailyHours || 2.0);
      }
    });

    transaction(data.candidates);
  } catch (err) {
    console.error('[Database] Seeding SQLite error:', err);
  }
}

// ── CRUD Helpers ──────────────────────────────────────────────────

export function getAllCandidatesDB(): Candidate[] {
  if (!useSQLite || !dbInstance) {
    if (memoryCandidates.size === 0) seedMemoryStore();
    return Array.from(memoryCandidates.values());
  }

  try {
    const candidateRows = dbInstance.prepare('SELECT * FROM candidates ORDER BY created_at DESC').all() as any[];
    const selectMissions = dbInstance.prepare('SELECT day, title, passed, skipped, attempts FROM missions WHERE candidate_id = ?');
    const selectSignals = dbInstance.prepare('SELECT commit_days, missions_completed, missions_first_try, avg_daily_hours FROM learning_signals WHERE candidate_id = ?');

    return candidateRows.map(row => {
      const missions = selectMissions.all(row.id).map((m: any) => ({
        day: m.day,
        title: m.title,
        passed: Boolean(m.passed),
        skipped: Boolean(m.skipped),
        attempts: m.attempts,
      }));

      const signalsRow = selectSignals.get(row.id) as any || {
        commit_days: 0,
        missions_completed: 0,
        missions_first_try: 0,
        avg_daily_hours: 0,
      };

      return {
        member: {
          id: row.id,
          name: row.name,
          email: row.email || undefined,
          jobRole: row.job_role,
          yearsExperience: row.years_experience,
          education: row.education,
          status: row.status,
        },
        missions,
        signals: {
          commitDays: signalsRow.commit_days,
          missionsCompleted: signalsRow.missions_completed,
          missionsFirstTry: signalsRow.missions_first_try,
          avgDailyHours: signalsRow.avg_daily_hours,
        },
      };
    });
  } catch (err) {
    if (memoryCandidates.size === 0) seedMemoryStore();
    return Array.from(memoryCandidates.values());
  }
}

export function getCandidateByIdDB(id: string): Candidate | undefined {
  if (!useSQLite || !dbInstance) {
    if (memoryCandidates.size === 0) seedMemoryStore();
    return memoryCandidates.get(id);
  }

  try {
    const row = dbInstance.prepare('SELECT * FROM candidates WHERE id = ?').get(id) as any;
    if (!row) return memoryCandidates.get(id);

    const selectMissions = dbInstance.prepare('SELECT day, title, passed, skipped, attempts FROM missions WHERE candidate_id = ?');
    const selectSignals = dbInstance.prepare('SELECT commit_days, missions_completed, missions_first_try, avg_daily_hours FROM learning_signals WHERE candidate_id = ?');

    const missions = selectMissions.all(id).map((m: any) => ({
      day: m.day,
      title: m.title,
      passed: Boolean(m.passed),
      skipped: Boolean(m.skipped),
      attempts: m.attempts,
    }));

    const signalsRow = selectSignals.get(id) as any || {
      commit_days: 0,
      missions_completed: 0,
      missions_first_try: 0,
      avg_daily_hours: 0,
    };

    return {
      member: {
        id: row.id,
        name: row.name,
        email: row.email || undefined,
        jobRole: row.job_role,
        yearsExperience: row.years_experience,
        education: row.education,
        status: row.status,
      },
      missions,
      signals: {
        commitDays: signalsRow.commit_days,
        missionsCompleted: signalsRow.missions_completed,
        missionsFirstTry: signalsRow.missions_first_try,
        avgDailyHours: signalsRow.avg_daily_hours,
      },
    };
  } catch (err) {
    return memoryCandidates.get(id);
  }
}

export function saveCandidateDB(candidate: Candidate): void {
  memoryCandidates.set(candidate.member.id, candidate);
  if (!useSQLite || !dbInstance) return;

  try {
    const insertCandidate = dbInstance.prepare(`
      INSERT INTO candidates (id, name, email, job_role, years_experience, education)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertMission = dbInstance.prepare(`
      INSERT INTO missions (candidate_id, day, title, passed, skipped, attempts)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertSignals = dbInstance.prepare(`
      INSERT INTO learning_signals (candidate_id, commit_days, missions_completed, missions_first_try, avg_daily_hours)
      VALUES (?, ?, ?, ?, ?)
    `);

    const transaction = dbInstance.transaction(() => {
      insertCandidate.run(
        candidate.member.id,
        candidate.member.name,
        candidate.member.email || null,
        candidate.member.jobRole,
        candidate.member.yearsExperience,
        candidate.member.education
      );

      for (const m of candidate.missions) {
        insertMission.run(candidate.member.id, m.day, m.title, m.passed ? 1 : 0, m.skipped ? 1 : 0, m.attempts || 1);
      }

      insertSignals.run(candidate.member.id, candidate.signals.commitDays, candidate.signals.missionsCompleted, candidate.signals.missionsFirstTry, candidate.signals.avgDailyHours || 2.0);
    });

    transaction();
  } catch (err) {
    console.error('[Database] Error saving candidate to SQLite:', err);
  }
}

export function saveSessionDB(session: InterviewSession): void {
  memorySessions.set(session.sessionId, session);
  if (!useSQLite || !dbInstance) return;

  try {
    const insertOrReplaceSession = dbInstance.prepare(`
      INSERT OR REPLACE INTO interview_sessions (session_id, candidate_id, persona, status, question_count, difficulty)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertOrReplaceSession.run(session.sessionId, session.candidateId, session.persona || 'engineer', session.status, session.questionCount, session.difficulty);
  } catch (err) {
    console.error('[Database] Error saving session to SQLite:', err);
  }
}

export function saveRecruiterVerdictDB(sessionId: string, verdict: RecruiterVerdict): void {
  memoryVerdicts.set(sessionId, verdict);
  if (!useSQLite || !dbInstance) return;

  try {
    const insertOrReplace = dbInstance.prepare(`
      INSERT OR REPLACE INTO recruiter_verdicts (session_id, verdict, confidence, recruiter_notes, evidence_for_json, evidence_against_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertOrReplace.run(sessionId, verdict.verdict, verdict.confidence, verdict.recruiterNotes, JSON.stringify(verdict.evidenceFor), JSON.stringify(verdict.evidenceAgainst));
  } catch (err) {
    console.error('[Database] Error saving verdict to SQLite:', err);
  }
}
