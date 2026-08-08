import React, { useState } from 'react';
import { Cpu, ChevronDown, ChevronUp } from 'lucide-react';

interface ArchitectureCritiqueProps {
  critique: string;
}

export const ArchitectureCritique: React.FC<ArchitectureCritiqueProps> = ({ critique }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      marginTop: '12px',
      background: 'rgba(99, 102, 241, 0.08)',
      border: '1px solid rgba(99, 102, 241, 0.25)',
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
        <Cpu size={15} color="#818CF8" />
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#818CF8', flex: 1 }}>
          🏗️ Architecture Critic: Design Review Available
        </span>
        {expanded ? <ChevronUp size={14} color="#818CF8" /> : <ChevronDown size={14} color="#818CF8" />}
      </div>

      {expanded && (
        <div style={{ 
          marginTop: '10px', 
          background: '#07070D', 
          borderRadius: '6px', 
          padding: '12px', 
          borderLeft: '3px solid #818CF8',
          fontSize: '13px',
          color: '#E5E7EB',
          lineHeight: '1.6',
          fontFamily: 'sans-serif'
        }}>
          {critique.split('\n').map((line, idx) => {
            if (line.startsWith('### ')) {
              return <h4 key={idx} style={{ margin: '0 0 10px', color: '#818CF8', fontSize: '14px', fontWeight: 700 }}>{line.replace('### ', '')}</h4>;
            }
            if (line.startsWith('- ')) {
              const content = line.substring(2);
              let bulletColor = '#818CF8';
              if (content.includes('✅')) bulletColor = '#10B981';
              if (content.includes('⚠️')) bulletColor = '#F59E0B';
              if (content.includes('💡')) bulletColor = '#6366F1';
              
              return (
                <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'flex-start' }}>
                  <span style={{ color: bulletColor, flexShrink: 0 }}>•</span>
                  <span>{content}</span>
                </div>
              );
            }
            return <p key={idx} style={{ margin: '0 0 8px' }}>{line}</p>;
          })}
        </div>
      )}
    </div>
  );
};
