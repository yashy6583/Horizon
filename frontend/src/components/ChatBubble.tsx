import React from 'react';
import type { ChatMessage } from '../types';
import { getDifficultyColor } from '../utils/candidateUtils';

interface ChatBubbleProps {
  message: ChatMessage;
  candidateName?: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, candidateName }) => {
  const isAI = message.role === 'ai';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isAI ? 'row' : 'row-reverse',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '8px 0',
        animation: 'fadeIn 0.35s ease forwards',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: isAI
          ? 'linear-gradient(135deg, #8B5CF6, #6366F1)'
          : 'linear-gradient(135deg, #374151, #1F2937)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontSize: '12px',
        fontWeight: 700,
        color: 'white',
        border: isAI ? '2px solid rgba(139, 92, 246, 0.3)' : '2px solid rgba(255,255,255,0.08)',
      }}>
        {isAI ? 'AI' : (candidateName ? candidateName.slice(0, 2).toUpperCase() : 'ME')}
      </div>

      <div style={{ flex: 1, maxWidth: '78%' }}>
        {/* Sender label */}
        <div style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#6B7280',
          marginBottom: '6px',
          textAlign: isAI ? 'left' : 'right',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
        }}>
          {isAI ? 'AI Interviewer' : (candidateName || 'You')}
        </div>

        {/* Message bubble */}
        <div style={{
          background: isAI ? '#11111D' : 'rgba(139, 92, 246, 0.15)',
          border: `1px solid ${isAI ? '#29233D' : 'rgba(139, 92, 246, 0.25)'}`,
          borderRadius: isAI ? '14px 14px 14px 4px' : '14px 14px 4px 14px',
          padding: '16px 18px',
          lineHeight: '1.65',
          fontSize: '15px',
          color: '#F5F3FF',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {message.content}
        </div>

        {/* Metadata row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '6px',
          justifyContent: isAI ? 'flex-start' : 'flex-end',
          flexWrap: 'wrap',
        }}>
          {message.topic && (
            <span style={{
              fontSize: '11px',
              padding: '2px 8px',
              background: 'rgba(139, 92, 246, 0.1)',
              color: '#C4B5FD',
              borderRadius: '12px',
              border: '1px solid rgba(139, 92, 246, 0.2)',
            }}>
              {message.topic}
            </span>
          )}
          {message.difficulty && (
            <span style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '12px',
              color: getDifficultyColor(message.difficulty),
              background: `${getDifficultyColor(message.difficulty)}18`,
              border: `1px solid ${getDifficultyColor(message.difficulty)}30`,
              textTransform: 'capitalize',
            }}>
              {message.difficulty}
            </span>
          )}
          <span style={{ fontSize: '11px', color: '#4B5563' }}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};
