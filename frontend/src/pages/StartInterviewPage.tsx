import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import type { Candidate } from '../types';
import { computeReadinessScore } from '../utils/candidateUtils';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const PERSONAS_LIST = [
  { id: 'engineer', name: 'Sarah Chen', title: 'Senior Staff Engineer', avatar: '👩‍💻', desc: 'Methodical, fair, and production-focused.', pressure: 'Medium' },
  { id: 'cto', name: 'Marcus Vance', title: 'Startup CTO', avatar: '🔥', desc: 'Fast-paced, pragmatic, business costs focus.', pressure: 'High' },
  { id: 'researcher', name: 'Dr. Evelyn Hayes', title: 'AI Scientist', avatar: '🎓', desc: 'Theory-first, mathematical formulas, and scientific limits.', pressure: 'Med-High' },
  { id: 'mentor', name: 'Dave Miller', title: 'Friendly Mentor', avatar: '🤝', desc: 'Warm, supportive, gives hints & guides you.', pressure: 'Low' },
  { id: 'skeptic', name: 'Viktor Kael', title: 'Tech Lead Skeptic', avatar: '⚔️', desc: 'Critical, dry, challenges decisions and edge cases.', pressure: 'Very High' }
];

const DEFAULT_CANDIDATE: Candidate = {
  member: {
    id: 'CAND-001',
    name: 'Jordan Rivera',
    email: 'jordan.rivera@example.com',
    jobRole: 'Senior AI Systems Engineer',
    yearsExperience: 4,
    education: 'MS Computer Science, MIT'
  },
  missions: [
    { day: 7, title: 'Text Embeddings & Semantic Similarity', passed: true, attempts: 3 },
    { day: 8, title: 'Vector Databases', passed: true, attempts: 1 },
    { day: 10, title: 'Retrieval Engine & Hybrid Search', passed: true, attempts: 1 },
    { day: 11, title: 'Retrieval-Augmented Generation (RAG)', passed: true, attempts: 1 },
    { day: 12, title: 'Prompt Engineering', passed: true, attempts: 2 },
    { day: 13, title: 'LLM Function Calling & Structured Outputs', passed: true, attempts: 1 }
  ],
  signals: { missionsCompleted: 24, missionsFirstTry: 14, commitDays: 27, avgDailyHours: 2.8 }
};

export const StartInterviewPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const candidate = (location.state?.candidate as Candidate | undefined) || DEFAULT_CANDIDATE;
  const [selectedPersona, setSelectedPersona] = useState('engineer');

  const score = computeReadinessScore(candidate);

  const handleBegin = () => {
    navigate('/interview/live', { state: { candidate, persona: selectedPersona } });
  };

  return (
    <div style={{ paddingTop: '60px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Back Link */}
        <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#A1A1AA', textDecoration: 'none', fontSize: '14px', marginBottom: '24px' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#8B5CF6', background: 'rgba(139, 92, 246, 0.15)', padding: '4px 12px', borderRadius: '20px' }}>
              Step 1 of 2 — Configure Interview
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#F5F3FF', margin: 0 }}>
            Configure Interview for {candidate.member.name}
          </h1>
          <p style={{ color: '#A1A1AA', margin: '8px 0 0', fontSize: '15px' }}>
            Review candidate learning signals and choose your AI Interviewer Persona before starting.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>

          {/* Left Column — Persona Selection */}
          <div>
            <h3 style={{ color: '#F5F3FF', fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
              Select AI Interviewer Persona
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {PERSONAS_LIST.map((p) => {
                const isSelected = selectedPersona === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPersona(p.id)}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      background: isSelected ? 'rgba(139, 92, 246, 0.12)' : '#12121A',
                      border: isSelected ? '2px solid #8B5CF6' : '1px solid #29233D',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px',
                    }}
                  >
                    <span style={{ fontSize: '28px', lineHeight: 1 }}>{p.avatar}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h4 style={{ color: '#F5F3FF', margin: 0, fontSize: '15px', fontWeight: 600 }}>
                          {p.name}
                        </h4>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '10px',
                          background: p.pressure === 'Very High' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(139, 92, 246, 0.2)',
                          color: p.pressure === 'Very High' ? '#FCA5A5' : '#C4B5FD',
                        }}>
                          {p.pressure} Pressure
                        </span>
                      </div>
                      <p style={{ color: '#8B5CF6', margin: '2px 0 6px', fontSize: '13px', fontWeight: 500 }}>
                        {p.title}
                      </p>
                      <p style={{ color: '#A1A1AA', margin: 0, fontSize: '13px' }}>
                        {p.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Launch Button */}
            <button
              onClick={handleBegin}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '16px',
                marginTop: '24px',
                fontSize: '16px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
              }}
            >
              Begin AI Voice Interview <ArrowRight size={18} />
            </button>
          </div>

          {/* Right Column — Candidate Overview Card */}
          <div>
            <div style={{
              background: '#12121A',
              borderRadius: '16px',
              border: '1px solid #29233D',
              padding: '24px',
              position: 'sticky',
              top: '84px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '18px'
                }}>
                  {candidate.member.name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ color: '#F5F3FF', margin: 0, fontSize: '16px', fontWeight: 700 }}>
                    {candidate.member.name}
                  </h3>
                  <p style={{ color: '#8B5CF6', margin: '2px 0 0', fontSize: '13px', fontWeight: 500 }}>
                    {candidate.member.jobRole}
                  </p>
                </div>
              </div>

              {/* Score Badge */}
              <div style={{
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
              }}>
                <span style={{ color: '#A1A1AA', fontSize: '13px', fontWeight: 500 }}>Readiness Score</span>
                <span style={{ color: '#C4B5FD', fontSize: '20px', fontWeight: 800 }}>{score}%</span>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: '#181824', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ color: '#A1A1AA', fontSize: '11px' }}>Missions</div>
                  <div style={{ color: '#F5F3FF', fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>
                    {candidate.signals.missionsCompleted}
                  </div>
                </div>
                <div style={{ background: '#181824', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ color: '#A1A1AA', fontSize: '11px' }}>Experience</div>
                  <div style={{ color: '#F5F3FF', fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>
                    {candidate.member.yearsExperience} yrs
                  </div>
                </div>
              </div>

              {/* Focus Areas */}
              <h4 style={{ color: '#A1A1AA', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                Evaluation Focus
              </h4>
              <ul style={{ margin: 0, paddingLeft: '16px', color: '#D4D4D8', fontSize: '13px', lineHeight: '1.6' }}>
                <li>System Architecture & Design</li>
                <li>Retrieval Engine & Vector DBs</li>
                <li>Hallucination Diagnostics</li>
              </ul>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
