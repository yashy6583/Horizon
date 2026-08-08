import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import type { Candidate } from '../types';
import { computeReadinessScore, getCompletedDays, getSkippedDays, getWeakDays, getStrongDays } from '../utils/candidateUtils';
import { Clock, MessageSquare, Zap, Target, ArrowRight, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';

const PERSONAS_LIST = [
  { id: 'engineer', name: 'Sarah Chen', title: 'Senior Staff Engineer', avatar: '👩‍💻', desc: 'Methodical, fair, and production-focused.', pressure: 'Medium' },
  { id: 'cto', name: 'Marcus Vance', title: 'Startup CTO', avatar: '🔥', desc: 'Fast-paced, pragmatic, business costs focus.', pressure: 'High' },
  { id: 'researcher', name: 'Dr. Evelyn Hayes', title: 'AI Scientist', avatar: '🎓', desc: 'Theory-first, mathematical formulas, and scientific limits.', pressure: 'Med-High' },
  { id: 'mentor', name: 'Dave Miller', title: 'Friendly Mentor', avatar: '🤝', desc: 'Warm, supportive, gives hints & guides you.', pressure: 'Low' },
  { id: 'skeptic', name: 'Viktor Kael', title: 'Tech Lead Skeptic', avatar: '⚔️', desc: 'Critical, dry, challenges decisions and edge cases.', pressure: 'Very High' }
];

export const StartInterviewPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const candidate = location.state?.candidate as Candidate | undefined;
  const [selectedPersona, setSelectedPersona] = useState('engineer');

  if (!candidate) {
    return (
      <div style={{ paddingTop: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ color: '#F5F3FF', marginBottom: '8px' }}>No candidate selected</h2>
          <p style={{ color: '#A1A1AA', marginBottom: '24px' }}>Please select a candidate from the dashboard first.</p>
          <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  const completedDays = getCompletedDays(candidate);
  const skippedDays = getSkippedDays(candidate);
  const weakDays = getWeakDays(candidate);
  const strongDays = getStrongDays(candidate);
  const score = computeReadinessScore(candidate);

  const handleBegin = () => {
    navigate('/interview/live', { state: { candidate, persona: selectedPersona } });
  };

  return (
    <div style={{ paddingTop: '60px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Back */}
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-ghost"
          style={{ marginBottom: '32px' }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#8B5CF6', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Interview Configuration
          </p>
          <h1 style={{ margin: '0 0 8px', fontSize: '32px', fontWeight: 800, color: '#F5F3FF', letterSpacing: '-1px' }}>
            Ready to Begin?
          </h1>
          <p style={{ margin: 0, color: '#A1A1AA' }}>
            Your interview is configured based on <strong style={{ color: '#C4B5FD' }}>{candidate.member.name}</strong>'s learning progress.
          </p>
        </div>

        {/* Interview Config Card */}
        <div style={{
          background: '#0D0D16',
          border: '1px solid #29233D',
          borderRadius: '20px',
          padding: '28px',
          marginBottom: '24px',
        }}>
          <h2 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: 700, color: '#C4B5FD' }}>
            Interview Settings
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            {[
              { icon: Target, label: 'Interview Type', value: 'Technical AI Engineering', color: '#8B5CF6' },
              { icon: Clock, label: 'Duration', value: '15–30 minutes', color: '#6366F1' },
              { icon: MessageSquare, label: 'Questions', value: '8–12 adaptive', color: '#10B981' },
              { icon: Zap, label: 'Difficulty', value: 'Adaptive', color: '#F59E0B' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} style={{
                background: '#11111D',
                border: '1px solid #29233D',
                borderRadius: '12px',
                padding: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Icon size={15} color={color} />
                  <span style={{ fontSize: '12px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{label}</span>
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#F5F3FF' }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '20px',
            padding: '14px 16px',
            background: 'rgba(139, 92, 246, 0.07)',
            border: '1px solid rgba(139, 92, 246, 0.15)',
            borderRadius: '10px',
            fontSize: '14px',
            color: '#C4B5FD',
          }}>
            💡 Your interview will adapt based on your answers. Strong answers lead to harder, deeper questions. Weak answers lead to clarifying follow-ups.
          </div>
        </div>

        {/* Choose Persona Selector */}
        <div style={{
          background: '#0D0D16',
          border: '1px solid #29233D',
          borderRadius: '20px',
          padding: '28px',
          marginBottom: '24px',
        }}>
          <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#C4B5FD' }}>
            Interviewer Persona
          </h2>
          <p style={{ color: '#A1A1AA', fontSize: '14px', marginBottom: '20px' }}>
            Select who will conduct your technical interview. Each has a unique grading philosophy.
          </p>

          <div style={{ display: 'grid', gap: '12px' }}>
            {PERSONAS_LIST.map((p) => {
              const isSelected = selectedPersona === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPersona(p.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    background: isSelected ? 'rgba(139, 92, 246, 0.08)' : '#11111D',
                    border: `1px solid ${isSelected ? '#8B5CF6' : '#29233D'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  className="persona-card"
                >
                  <div style={{ fontSize: '28px' }}>{p.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, color: '#F5F3FF', fontSize: '15px' }}>{p.name}</span>
                      <span style={{ color: '#6B7280', fontSize: '12px' }}>{p.title}</span>
                    </div>
                    <p style={{ margin: '4px 0 0', color: '#A1A1AA', fontSize: '13px', lineHeight: '1.4' }}>{p.desc}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '8px',
                      background: p.pressure === 'Low' ? 'rgba(16, 185, 129, 0.15)' : p.pressure === 'Medium' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: p.pressure === 'Low' ? '#34D399' : p.pressure === 'Medium' ? '#818CF8' : '#F87171',
                      border: `1px solid ${p.pressure === 'Low' ? 'rgba(16, 185, 129, 0.2)' : p.pressure === 'Medium' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                      fontWeight: 600
                    }}>
                      {p.pressure} pressure
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Candidate Overview */}
        <div style={{
          background: '#0D0D16',
          border: '1px solid #29233D',
          borderRadius: '20px',
          padding: '28px',
          marginBottom: '24px',
        }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 700, color: '#C4B5FD' }}>
            Candidate Profile
          </h2>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 700,
              color: 'white',
              flexShrink: 0,
            }}>
              {candidate.member.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#F5F3FF' }}>{candidate.member.name}</div>
              <div style={{ color: '#A1A1AA', fontSize: '14px' }}>{candidate.member.jobRole} · {candidate.member.yearsExperience}y exp</div>
              <div style={{ color: '#6B7280', fontSize: '13px' }}>{candidate.member.education}</div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: '36px', fontWeight: 800, color: score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444' }}>
                {score}
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>readiness score</div>
            </div>
          </div>

          {/* Progress bars */}
          <div style={{ display: 'grid', gap: '12px' }}>
            {[
              { label: 'Completed Days', value: completedDays.length, max: 31, color: '#10B981' },
              { label: 'First-Try Passes', value: candidate.signals.missionsFirstTry, max: candidate.signals.missionsCompleted || 1, color: '#8B5CF6' },
              { label: 'Commit Days', value: candidate.signals.commitDays, max: 31, color: '#6366F1' },
            ].map(({ label, value, max, color }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: '#A1A1AA' }}>{label}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#F5F3FF' }}>{value}/{max}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(value / max) * 100}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Topics that will be covered */}
        <div style={{
          background: '#0D0D16',
          border: '1px solid #29233D',
          borderRadius: '20px',
          padding: '28px',
          marginBottom: '32px',
        }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 700, color: '#C4B5FD' }}>
            Topics Automatically Selected
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {strongDays.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <CheckCircle size={14} color="#10B981" />
                  <span style={{ fontSize: '12px', color: '#10B981', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Strong Areas</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {strongDays.slice(0, 5).map(d => (
                    <span key={d} className="badge badge-success">Day {d}</span>
                  ))}
                </div>
              </div>
            )}

            {weakDays.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <AlertTriangle size={14} color="#F59E0B" />
                  <span style={{ fontSize: '12px', color: '#F59E0B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Needs More Practice</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {weakDays.slice(0, 5).map(d => (
                    <span key={d} className="badge badge-warning">Day {d}</span>
                  ))}
                </div>
              </div>
            )}

            {skippedDays.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Skipped (will avoid)</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {skippedDays.slice(0, 5).map(d => (
                    <span key={d} className="badge badge-muted">Day {d}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Begin Button */}
        <button
          id="begin-interview-btn"
          className="btn-primary"
          onClick={handleBegin}
          style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '16px' }}
        >
          Begin Interview
          <ArrowRight size={20} />
        </button>

        <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '13px', marginTop: '12px' }}>
          The interview typically takes 15–30 minutes. You can end it early at any time.
        </p>
      </div>
    </div>
  );
};
