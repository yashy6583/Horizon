import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Candidate } from '../types';
import { useInterview } from '../hooks/useInterview';
import { ChatBubble } from '../components/ChatBubble';
import { AITypingIndicator } from '../components/AITypingIndicator';
import { FeedbackReport } from '../components/FeedbackReport';
import { KnowledgeGraph } from '../components/KnowledgeGraph';
import { HallucinationBadge } from '../components/HallucinationBadge';
import { ArchitectureCritique } from '../components/ArchitectureCritique';
import { computeReadinessScore, getDifficultyColor } from '../utils/candidateUtils';
import {
  Send, SkipForward, Square, ChevronRight,
  Zap, X, AlertTriangle
} from 'lucide-react';

const MIN_CHARS = 10;
const MAX_CHARS = 2000;

export const LiveInterviewPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const candidate = location.state?.candidate as Candidate | undefined;
  const persona = location.state?.persona as string | undefined;

  const { state, begin, respond, reset } = useInterview();
  const [answer, setAnswer] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const started = useRef(false);

  // Auto-start interview
  useEffect(() => {
    if (!candidate || started.current) return;
    started.current = true;
    begin(candidate, persona).catch(err => {
      setError(err.message || 'Failed to start interview. Is the backend running?');
    });
  }, [candidate, persona, begin]);

  // Auto-scroll to newest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages, state.isAIThinking]);

  const handleSubmit = useCallback(async () => {
    const trimmed = answer.trim();
    if (!trimmed || trimmed.length < MIN_CHARS) return;
    if (state.status !== 'active') return;

    setAnswer('');
    setError(null);

    try {
      await respond(trimmed);
    } catch (err: any) {
      setError(err.message || 'Failed to send response. Please try again.');
    }
  }, [answer, state.status, respond]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSkip = async () => {
    if (state.status !== 'active') return;
    setError(null);
    try {
      await respond('[SKIP] I\'d like to move to the next question.');
    } catch (err: any) {
      setError(err.message || 'Failed to skip.');
    }
  };

  const handleEndInterview = async () => {
    setShowEndConfirm(false);
    if (state.status === 'active' || state.status === 'evaluating') {
      try {
        await respond('[END] I would like to end the interview and receive feedback.');
      } catch (err: any) {
        setError(err.message || 'Failed to end interview.');
      }
    }
  };

  if (!candidate) {
    return (
      <div style={{ paddingTop: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ color: '#F5F3FF', marginBottom: '8px' }}>No candidate selected</h2>
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
        </div>
      </div>
    );
  }

  if (state.status === 'complete' && state.feedback) {
    return (
      <div style={{ paddingTop: '60px', minHeight: '100vh' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
          <FeedbackReport
            feedback={state.feedback}
            recruiterVerdict={state.recruiterVerdict}
            questionCount={state.questionCount}
            topicsCovered={state.topicsCovered}
            curriculumDaysCovered={state.curriculumDaysCovered}
            candidateName={candidate.member.name}
            onPracticeAgain={() => { reset(); navigate('/dashboard'); }}
            onViewCurriculum={() => navigate('/curriculum')}
          />
        </div>
      </div>
    );
  }

  const charCount = answer.length;
  const canSubmit = charCount >= MIN_CHARS && state.status === 'active';
  const isThinking = state.isAIThinking;
  const diffColor = getDifficultyColor(state.difficulty);

  return (
    <div style={{
      paddingTop: '60px',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          display: 'none',
          position: 'fixed',
          bottom: '90px',
          right: '16px',
          zIndex: 200,
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: '#8B5CF6',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(139,92,246,0.4)',
        }}
        id="sidebar-toggle-btn"
        aria-label="Toggle sidebar"
      >
        <ChevronRight size={18} />
      </button>

      <div style={{ flex: 1, display: 'flex', maxWidth: '100%', overflow: 'hidden' }}>

        {/* ── Left Sidebar ─────────────────────────────────────── */}
        <div style={{
          width: '240px',
          background: '#0D0D16',
          borderRight: '1px solid #29233D',
          padding: '20px 16px',
          flexShrink: 0,
          overflowY: 'auto',
          position: 'sticky',
          top: '60px',
          height: 'calc(100vh - 60px)',
        }} className="interview-sidebar">

          {/* Candidate */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', fontWeight: 600 }}>
              Candidate
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                color: 'white',
                flexShrink: 0,
              }}>
                {candidate.member.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#F5F3FF' }}>{candidate.member.name}</div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>{candidate.member.jobRole}</div>
              </div>
            </div>
          </div>

          <div className="divider" style={{ margin: '0 0 20px' }} />

          {/* Progress */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', fontWeight: 600 }}>
              Interview Progress
            </div>
            <div style={{ display: 'grid', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#A1A1AA' }}>Questions</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#C4B5FD' }}>{state.questionCount}/8+</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min((state.questionCount / 8) * 100, 100)}%` }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#A1A1AA' }}>Days Covered</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#C4B5FD' }}>{state.curriculumDaysCovered.length}/4+</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min((state.curriculumDaysCovered.length / 4) * 100, 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Difficulty */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: 600 }}>
              Current Difficulty
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              background: `${diffColor}12`,
              border: `1px solid ${diffColor}25`,
              borderRadius: '8px',
            }}>
              <Zap size={13} color={diffColor} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: diffColor, textTransform: 'capitalize' }}>
                {state.difficulty}
              </span>
            </div>
          </div>

          {/* Topics */}
          {state.topicsCovered.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: 600 }}>
                Topics Covered
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {state.topicsCovered.map((t, i) => (
                  <span key={i} style={{
                    fontSize: '12px',
                    padding: '4px 10px',
                    background: 'rgba(139,92,246,0.1)',
                    color: '#C4B5FD',
                    borderRadius: '6px',
                    border: '1px solid rgba(139,92,246,0.15)',
                  }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Days covered */}
          {state.curriculumDaysCovered.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: 600 }}>
                Curriculum Days
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {state.curriculumDaysCovered.map(d => (
                  <span key={d} style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    background: '#11111D',
                    color: '#A1A1AA',
                    borderRadius: '4px',
                    border: '1px solid #29233D',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}>
                    D{d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Knowledge Graph */}
          <KnowledgeGraph topicsCovered={state.topicsCovered} />
        </div>

        {/* ── Main Chat Area ─────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Top Status Bar */}
          <div style={{
            padding: '12px 24px',
            background: '#0D0D16',
            borderBottom: '1px solid #29233D',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 600,
                color: isThinking ? '#F59E0B' : state.status === 'active' ? '#10B981' : '#6B7280',
              }}>
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: isThinking ? '#F59E0B' : state.status === 'active' ? '#10B981' : '#6B7280',
                  display: 'inline-block',
                  animation: isThinking ? 'pulse-glow 1.5s infinite' : undefined,
                }} />
                {isThinking ? 'Evaluating...' : state.status === 'active' ? 'Interview Active' : state.status === 'starting' ? 'Starting...' : 'Interview Complete'}
              </div>
              <span style={{ fontSize: '13px', color: '#6B7280' }}>
                Q{state.questionCount} · {state.messages.length} messages
              </span>
            </div>

            <button
              id="end-interview-btn"
              onClick={() => setShowEndConfirm(true)}
              disabled={state.status !== 'active'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                background: 'transparent',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#F87171',
                borderRadius: '8px',
                cursor: state.status === 'active' ? 'pointer' : 'not-allowed',
                fontSize: '13px',
                fontWeight: 500,
                opacity: state.status !== 'active' ? 0.5 : 1,
                transition: 'all 0.15s',
              }}
            >
              <Square size={13} /> End Interview
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div style={{
              padding: '12px 24px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderLeft: '3px solid #EF4444',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#FCA5A5',
              fontSize: '14px',
            }}>
              <AlertTriangle size={16} />
              {error}
              <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#FCA5A5', cursor: 'pointer' }}>
                <X size={14} />
              </button>
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
            {state.status === 'starting' && (
              <div style={{ textAlign: 'center', padding: '48px', color: '#6B7280' }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>🤖</div>
                <p>Starting your interview...</p>
              </div>
            )}

            {state.messages.map(msg => (
              <React.Fragment key={msg.id}>
                <ChatBubble
                  message={msg}
                  candidateName={candidate.member.name}
                />
                {msg.hallucinationFlags && msg.hallucinationFlags.length > 0 && (
                  <div style={{ maxWidth: '80%', marginLeft: msg.role === 'user' ? 'auto' : '44px', marginBottom: '16px' }}>
                    <HallucinationBadge flags={msg.hallucinationFlags} />
                  </div>
                )}
                {msg.architectureCritique && (
                  <div style={{ maxWidth: '80%', marginLeft: '44px', marginBottom: '16px' }}>
                    <ArchitectureCritique critique={msg.architectureCritique} />
                  </div>
                )}
              </React.Fragment>
            ))}

            {isThinking && <AITypingIndicator />}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          {state.status !== 'complete' && (
            <div style={{
              padding: '16px 24px',
              background: '#0D0D16',
              borderTop: '1px solid #29233D',
              flexShrink: 0,
            }}>
              <div style={{ position: 'relative' }}>
                <textarea
                  ref={textareaRef}
                  id="answer-input"
                  value={answer}
                  onChange={e => setAnswer(e.target.value.slice(0, MAX_CHARS))}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your answer here... (Ctrl+Enter to submit)"
                  disabled={!canSubmit && state.status !== 'active'}
                  className="input-field"
                  rows={4}
                  style={{ paddingBottom: '44px', resize: 'vertical', minHeight: '100px' }}
                />
                {/* Character counter */}
                <div style={{
                  position: 'absolute',
                  bottom: '52px',
                  right: '12px',
                  fontSize: '11px',
                  color: charCount > MAX_CHARS * 0.9 ? '#F59E0B' : '#6B7280',
                }}>
                  {charCount}/{MAX_CHARS}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                <button
                  id="submit-answer-btn"
                  className="btn-primary"
                  onClick={handleSubmit}
                  disabled={!canSubmit || isThinking}
                  style={{ flex: '1', justifyContent: 'center', minWidth: '120px' }}
                >
                  <Send size={15} />
                  Submit Answer
                </button>
                <button
                  id="skip-btn"
                  className="btn-secondary"
                  onClick={handleSkip}
                  disabled={state.status !== 'active' || isThinking}
                  style={{ justifyContent: 'center' }}
                >
                  <SkipForward size={15} />
                  Skip
                </button>
              </div>

              {charCount > 0 && charCount < MIN_CHARS && (
                <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#6B7280' }}>
                  Please write at least {MIN_CHARS} characters to submit.
                </p>
              )}
              <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#4B5563' }}>
                Tip: Press Ctrl+Enter to submit quickly
              </p>
            </div>
          )}
        </div>

        {/* ── Right Context Panel (desktop only) ─────────────── */}
        <div style={{
          width: '220px',
          background: '#0D0D16',
          borderLeft: '1px solid #29233D',
          padding: '20px 16px',
          flexShrink: 0,
          overflowY: 'auto',
          position: 'sticky',
          top: '60px',
          height: 'calc(100vh - 60px)',
        }} className="interview-context-panel">
          <div style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px', fontWeight: 600 }}>
            Context
          </div>

          {[
            { label: 'Current Status', value: isThinking ? 'Evaluating' : state.status === 'active' ? 'Active' : state.status, color: isThinking ? '#F59E0B' : '#10B981' },
            { label: 'Questions Asked', value: String(state.questionCount), color: '#C4B5FD' },
            { label: 'Difficulty', value: state.difficulty, color: diffColor },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '4px' }}>{label}</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color, textTransform: 'capitalize' }}>{value}</div>
            </div>
          ))}

          <div className="divider" style={{ margin: '16px 0' }} />

          {/* Last topic */}
          {state.topicsCovered.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '6px' }}>Current Topic</div>
              <div style={{
                padding: '8px 10px',
                background: 'rgba(139,92,246,0.1)',
                border: '1px solid rgba(139,92,246,0.2)',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#C4B5FD',
                fontWeight: 600,
              }}>
                {state.topicsCovered[state.topicsCovered.length - 1]}
              </div>
            </div>
          )}

          {state.curriculumDaysCovered.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '6px' }}>Last Curriculum Day</div>
              <div style={{
                padding: '8px 10px',
                background: '#11111D',
                border: '1px solid #29233D',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#F5F3FF',
                fontWeight: 700,
                fontFamily: 'JetBrains Mono, monospace',
              }}>
                Day {state.curriculumDaysCovered[state.curriculumDaysCovered.length - 1]}
              </div>
            </div>
          )}

          <div className="divider" style={{ margin: '16px 0' }} />

          <div style={{ fontSize: '12px', color: '#4B5563', lineHeight: '1.6' }}>
            Readiness Score<br />
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#C4B5FD' }}>
              {computeReadinessScore(candidate)}
            </span>
          </div>
        </div>
      </div>

      {/* End Interview Confirmation Modal */}
      {showEndConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px',
        }}>
          <div style={{
            background: '#0D0D16',
            border: '1px solid #29233D',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '420px',
            width: '100%',
            animation: 'fadeIn 0.2s ease',
          }}>
            <div style={{ fontSize: '36px', marginBottom: '16px', textAlign: 'center' }}>⚠️</div>
            <h2 style={{ margin: '0 0 8px', textAlign: 'center', color: '#F5F3FF', fontSize: '20px' }}>
              End Interview?
            </h2>
            {state.questionCount < 8 && (
              <p style={{ color: '#F59E0B', fontSize: '14px', textAlign: 'center', marginBottom: '8px' }}>
                You've only answered {state.questionCount} questions. We recommend at least 8 for a complete evaluation.
              </p>
            )}
            <p style={{ color: '#A1A1AA', fontSize: '14px', textAlign: 'center', marginBottom: '24px' }}>
              The AI will generate your final feedback report based on answers so far.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn-secondary"
                onClick={() => setShowEndConfirm(false)}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Continue Interview
              </button>
              <button
                id="confirm-end-btn"
                onClick={handleEndInterview}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(239,68,68,0.15)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#F87171',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                End & Get Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .interview-sidebar { display: none !important; }
          .interview-context-panel { display: none !important; }
          #sidebar-toggle-btn { display: flex !important; }
        }
        @media (max-width: 1024px) {
          .interview-context-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
};
