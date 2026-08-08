import React, { useState } from 'react';
import type { RecruiterVerdict as RecruiterVerdictType } from '../types';
import { Check, X, ShieldAlert, Award, FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface RecruiterVerdictProps {
  verdict: RecruiterVerdictType;
}

export const RecruiterVerdict: React.FC<RecruiterVerdictProps> = ({ verdict }) => {
  const [showEvidence, setShowEvidence] = useState(false);
  const { verdict: level, confidence, evidenceFor, evidenceAgainst, recruiterNotes } = verdict;

  const getVerdictDetails = (v: typeof level) => {
    switch (v) {
      case 'STRONG_HIRE':
        return { label: 'Strong Hire', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)', border: '#10B981', icon: Award };
      case 'HIRE':
        return { label: 'Hire', color: '#6366F1', bg: 'rgba(99, 102, 241, 0.12)', border: '#6366F1', icon: Award };
      case 'BORDERLINE':
        return { label: 'Borderline', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)', border: '#F59E0B', icon: ShieldAlert };
      case 'NO_HIRE':
        return { label: 'No Hire', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)', border: '#EF4444', icon: ShieldAlert };
    }
  };

  const details = getVerdictDetails(level);
  const IconComponent = details.icon;

  return (
    <div style={{
      background: '#0D0D16',
      border: `1px solid ${details.color}44`,
      borderRadius: '20px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: `0 8px 30px ${details.color}0a`
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <span style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
            ABTalks Recruiter Verdict
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: details.bg,
              border: `1px solid ${details.color}33`,
              borderRadius: '8px',
              color: details.color,
              fontWeight: 800,
              fontSize: '18px',
              textTransform: 'uppercase'
            }}>
              <IconComponent size={18} />
              {details.label}
            </div>
            <div style={{ fontSize: '14px', color: '#A1A1AA' }}>
              with <strong style={{ color: details.color }}>{confidence}%</strong> confidence
            </div>
          </div>
        </div>

        {/* Confidence Progress ring / bar */}
        <div style={{ width: '120px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6B7280', marginBottom: '4px' }}>
            <span>Confidence</span>
            <span>{confidence}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${confidence}%`, background: details.color }} />
          </div>
        </div>
      </div>

      {/* Recruiter notes */}
      <div style={{
        background: '#11111D',
        border: '1px solid #29233D',
        borderRadius: '12px',
        padding: '16px',
        fontSize: '14px',
        color: '#E5E7EB',
        lineHeight: '1.6',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start'
      }}>
        <FileText size={18} color="#A1A1AA" style={{ marginTop: '2px', flexShrink: 0 }} />
        <div>
          <strong style={{ color: '#F5F3FF' }}>Evaluation Summary: </strong>
          {recruiterNotes}
        </div>
      </div>

      {/* Evidence Accordion Toggle */}
      <div 
        onClick={() => setShowEvidence(!showEvidence)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid #29233D',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 600,
          color: '#C4B5FD',
          userSelect: 'none'
        }}
      >
        <span>{showEvidence ? 'Hide Supporting Evidence Quotes' : 'Show Supporting Evidence Quotes'}</span>
        {showEvidence ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </div>

      {showEvidence && (
        <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', animation: 'fadeIn 0.2s ease' }}>
          {/* Evidence For */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Check size={14} /> Positive Indicators ({evidenceFor.length})
            </div>
            {evidenceFor.length === 0 ? (
              <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>No strong positive quotes logged.</p>
            ) : (
              <div style={{ display: 'grid', gap: '8px' }}>
                {evidenceFor.map((ev, i) => (
                  <div key={i} style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '8px', padding: '10px' }}>
                    <div style={{ fontSize: '13px', color: '#D1FAE5', fontStyle: 'italic' }}>{ev.quote}</div>
                    <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '6px' }}>
                      Q{ev.turn} on **{ev.topic}** (Day {ev.day}) · Score: {Math.round(ev.score * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Evidence Against */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <X size={14} /> Areas of Concern ({evidenceAgainst.length})
            </div>
            {evidenceAgainst.length === 0 ? (
              <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>No negative indicators logged. Exemplary consistency.</p>
            ) : (
              <div style={{ display: 'grid', gap: '8px' }}>
                {evidenceAgainst.map((ev, i) => (
                  <div key={i} style={{ background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '8px', padding: '10px' }}>
                    <div style={{ fontSize: '13px', color: '#FEE2E2', fontStyle: 'italic' }}>{ev.quote}</div>
                    <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '6px' }}>
                      Q{ev.turn} on **{ev.topic}** (Day {ev.day}) · Score: {Math.round(ev.score * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
