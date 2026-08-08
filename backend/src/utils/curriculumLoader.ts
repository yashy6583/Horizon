import fs from 'fs';
import path from 'path';
import { Curriculum, CurriculumDay, Candidate } from '../types';

const DATA_DIR = path.resolve(__dirname, '../../../data');

let _curriculum: Curriculum | null = null;
let _candidates: Candidate[] | null = null;

export function loadCurriculum(): Curriculum {
  if (_curriculum) return _curriculum;
  const raw = fs.readFileSync(path.join(DATA_DIR, 'curriculum.json'), 'utf-8');
  _curriculum = JSON.parse(raw) as Curriculum;
  return _curriculum;
}

export function loadCandidates(): Candidate[] {
  if (_candidates) return _candidates;
  const raw = fs.readFileSync(path.join(DATA_DIR, 'candidates.json'), 'utf-8');
  const data = JSON.parse(raw) as { candidates: Candidate[] };
  _candidates = data.candidates;
  return _candidates;
}

export function getCandidateById(id: string): Candidate | undefined {
  return loadCandidates().find(c => c.member.id === id);
}

export function getDayInfo(day: number): CurriculumDay | undefined {
  return loadCurriculum().days.find(d => d.day === day);
}

export function getCompletedDays(candidate: Candidate): number[] {
  return candidate.missions
    .filter(m => m.passed === true)
    .map(m => m.day);
}

export function getSkippedDays(candidate: Candidate): number[] {
  return candidate.missions
    .filter(m => m.skipped === true)
    .map(m => m.day);
}

export function getWeakDays(candidate: Candidate): number[] {
  // Days where candidate passed but needed many attempts (>= 4)
  return candidate.missions
    .filter(m => m.passed === true && (m.attempts ?? 0) >= 4)
    .map(m => m.day);
}

export function getStrongDays(candidate: Candidate): number[] {
  // Days where candidate passed on first try
  return candidate.missions
    .filter(m => m.passed === true && m.attempts === 1)
    .map(m => m.day);
}

export function computeReadinessScore(candidate: Candidate): number {
  const { missionsCompleted, missionsFirstTry, commitDays } = candidate.signals;
  // Score out of 100
  const completionScore = Math.min((missionsCompleted / 31) * 50, 50);
  const efficiencyScore = Math.min((missionsFirstTry / Math.max(missionsCompleted, 1)) * 30, 30);
  const commitScore = Math.min((commitDays / 31) * 20, 20);
  return Math.round(completionScore + efficiencyScore + commitScore);
}

export function addCandidate(input: {
  name: string;
  email: string;
  jobRole: string;
  yearsExperience: number;
  education: string;
  preset?: string;
}): Candidate {
  const candidates = loadCandidates();
  const nextNum = candidates.length + 1;
  const id = `CAND-${nextNum.toString().padStart(3, '0')}`;

  const preset = input.preset || 'intermediate';
  let targetMissionsCount = 15;
  if (preset === 'beginner') targetMissionsCount = 8;
  if (preset === 'advanced') targetMissionsCount = 24;
  if (preset === 'complete') targetMissionsCount = 31;

  const curriculum = loadCurriculum();
  const days = curriculum.days.slice(0, targetMissionsCount);

  const missions = days.map((d) => {
    const isFirstTry = Math.random() > 0.3;
    const attempts = isFirstTry ? 1 : Math.floor(Math.random() * 3) + 2;
    return {
      day: d.day,
      title: d.title,
      passed: true,
      attempts,
    };
  });

  const firstTryCount = missions.filter(m => m.attempts === 1).length;

  const newCandidate: Candidate = {
    member: {
      id,
      name: input.name,
      email: input.email,
      jobRole: input.jobRole,
      yearsExperience: input.yearsExperience,
      education: input.education,
    },
    missions,
    signals: {
      missionsCompleted: missions.length,
      missionsFirstTry: firstTryCount,
      commitDays: Math.min(31, missions.length + 3),
      avgDailyHours: Math.round((1.5 + Math.random() * 2) * 10) / 10,
    },
  };

  _candidates!.push(newCandidate);

  try {
    fs.writeFileSync(
      path.join(DATA_DIR, 'candidates.json'),
      JSON.stringify({ candidates: _candidates }, null, 2),
      'utf-8'
    );
  } catch (err) {
    console.error('Failed to persist new candidate to file:', err);
  }

  return newCandidate;
}
