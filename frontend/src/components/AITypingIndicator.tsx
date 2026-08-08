import React from 'react';

export const AITypingIndicator: React.FC = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
      {/* AI Avatar */}
      <div style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontSize: '14px',
        fontWeight: 700,
        color: 'white',
      }}>
        AI
      </div>

      <div style={{
        background: '#11111D',
        border: '1px solid #29233D',
        borderRadius: '14px',
        borderBottomLeftRadius: '4px',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        <span style={{
          color: '#A1A1AA',
          fontSize: '13px',
          marginRight: '8px',
          fontStyle: 'italic',
        }}>
          Evaluating your answer
        </span>
        {[0, 1, 2].map(i => (
          <span
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#8B5CF6',
              display: 'inline-block',
              animation: `typing 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes typing {
          0% { opacity: 0.2; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-4px); }
          80% { opacity: 0.2; transform: translateY(0); }
          100% { opacity: 0.2; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
