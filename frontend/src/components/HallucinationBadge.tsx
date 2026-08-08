import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import type { HallucinationFlag } from '../types';

interface HallucinationBadgeProps {
  flags: HallucinationFlag[];
}

export const HallucinationBadge: React.FC<HallucinationBadgeProps> = ({ flags }) => {
  const [expanded, setExpanded] = useState(false);
  if (!flags || flags.length === 0) return null;

  return (
    <div style={{
      marginTop: '12px',
      background: 'rgba(245, 158, 11, 0.08)',
      border: '1px solid rgba(245, 158, 11, 0.2)',
      borderRadius: '8px',
      padding: '10px 14px',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div 
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <AlertTriangle size={15} color="#FBBF24" />
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#FBBF24', flex: 1 }}>
          Fact Check: {flags.length} potential {flags.length === 1 ? 'inaccuracy' : 'inaccuracies'} detected
        </span>
        {expanded ? <ChevronUp size={14} color="#FBBF24" /> : <ChevronDown size={14} color="#FBBF24" />}
      </div>

      {expanded && (
        <div style={{ marginTop: '8px', display: 'grid', gap: '8px' }}>
          {flags.map((flag, idx) => (
            <div 
              key={idx} 
              style={{
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '6px',
                padding: '10px',
                borderLeft: `3px solid ${flag.severity === 'critical' ? '#EF4444' : '#F59E0B'}`
              }}
            >
              <div style={{ fontSize: '12px', color: '#EF4444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Refuted: {flag.claim}
              </div>
              <div style={{ fontSize: '12px', color: '#A1A1AA', marginTop: '4px', lineHeight: '1.4' }}>
                <strong style={{ color: '#10B981' }}>Correction: </strong> {flag.correction}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
