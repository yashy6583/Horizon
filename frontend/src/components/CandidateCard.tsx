import React from 'react';
import type { Candidate } from '../types';
import { computeReadinessScore, getInitials, getCompletedDays, getSkippedDays, getWeakDays } from '../utils/candidateUtils';

interface CandidateCardProps {
  candidate: Candidate;
  onClick?: () => void;
  isSelected?: boolean;
  compact?: boolean;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  onClick,
  isSelected,
  compact,
}) => {
  const score = computeReadinessScore(candidate);
  const completedDays = getCompletedDays(candidate);
  const skippedDays = getSkippedDays(candidate);
  const weakDays = getWeakDays(candidate);
  const { name, jobRole, yearsExperience, education } = candidate.member;

  const scoreColor = score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <div
      onClick={onClick}
      style={{
        background: '#0D0D16',
        border: `1px solid ${isSelected ? '#8B5CF6' : '#29233D'}`,
        borderRadius: '14px',
        padding: compact ? '14px' : '20px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        boxShadow: isSelected ? '0 0 0 1px rgba(139,92,246,0.4), 0 4px 16px rgba(139,92,246,0.15)' : 'none',
      }}
      onMouseEnter={e => {
        if (onClick) {
          (e.currentTarget as HTMLElement).style.borderColor = isSelected ? '#8B5CF6' : '#3D3454';
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={e => {
        if (onClick) {
          (e.currentTarget as HTMLElement).style.borderColor = isSelected ? '#8B5CF6' : '#29233D';
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        {/* Avatar */}
        <div style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '15px',
          fontWeight: 700,
          color: 'white',
          flexShrink: 0,
        }}>
          {getInitials(name)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#F5F3FF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {name}
            </h3>
            <div style={{
              fontSize: '16px',
              fontWeight: 700,
              color: scoreColor,
              flexShrink: 0,
            }}>
              {score}
            </div>
          </div>

          <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#A1A1AA' }}>
            {jobRole} · {yearsExperience}y exp
          </p>

          {!compact && (
            <>
              <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#6B7280' }}>{education}</p>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '2px' }}>Completed</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#10B981' }}>{completedDays.length}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '2px' }}>Skipped</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#F59E0B' }}>{skippedDays.length}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '2px' }}>Struggled</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#EF4444' }}>{weakDays.length}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '2px' }}>Commit days</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#C4B5FD' }}>{candidate.signals.commitDays}</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {isSelected && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          background: 'rgba(139, 92, 246, 0.1)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#C4B5FD',
          textAlign: 'center',
          fontWeight: 500,
        }}>
          ✓ Selected for interview
        </div>
      )}
    </div>
  );
};
