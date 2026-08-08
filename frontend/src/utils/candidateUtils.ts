import type { Candidate, Mission, DayStatus } from '../types';

export function computeReadinessScore(candidate: Candidate): number {
  const { missionsCompleted, missionsFirstTry, commitDays } = candidate.signals;
  const completionScore = Math.min((missionsCompleted / 31) * 50, 50);
  const efficiencyScore = Math.min((missionsFirstTry / Math.max(missionsCompleted, 1)) * 30, 30);
  const commitScore = Math.min((commitDays / 31) * 20, 20);
  return Math.round(completionScore + efficiencyScore + commitScore);
}

export function getMissionStatus(mission: Mission): DayStatus {
  if (mission.skipped) return 'skipped';
  if (mission.passed === true) return 'completed';
  if (mission.passed === false) return 'failed';
  return 'not-started';
}

export function getCompletedDays(candidate: Candidate): number[] {
  return candidate.missions.filter(m => m.passed === true).map(m => m.day);
}

export function getSkippedDays(candidate: Candidate): number[] {
  return candidate.missions.filter(m => m.skipped === true).map(m => m.day);
}

export function getWeakDays(candidate: Candidate): number[] {
  return candidate.missions
    .filter(m => m.passed === true && (m.attempts ?? 0) >= 4)
    .map(m => m.day);
}

export function getStrongDays(candidate: Candidate): number[] {
  return candidate.missions
    .filter(m => m.passed === true && m.attempts === 1)
    .map(m => m.day);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy': return '#10B981';
    case 'medium': return '#F59E0B';
    case 'hard': return '#EF4444';
    default: return '#8B5CF6';
  }
}

export function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
}

export function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
