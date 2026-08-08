import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Zap, Target, MessageSquare, BarChart3, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: Target,
    title: 'Personalized Interviews',
    description: 'Questions adapt to exactly what you\'ve completed in the 31-day curriculum.',
    color: '#8B5CF6',
  },
  {
    icon: Zap,
    title: 'Adaptive Questions',
    description: 'Difficulty adjusts in real-time based on your answer quality.',
    color: '#6366F1',
  },
  {
    icon: MessageSquare,
    title: 'Intelligent Follow-ups',
    description: 'AI digs deeper on your answers, just like a real senior engineer would.',
    color: '#8B5CF6',
  },
  {
    icon: Brain,
    title: 'Context-Aware Evaluation',
    description: 'Every answer is evaluated for correctness, depth, and reasoning.',
    color: '#6366F1',
  },
  {
    icon: BarChart3,
    title: 'Actionable Feedback',
    description: 'Get a detailed report with strengths, gaps, and recommended next steps.',
    color: '#8B5CF6',
  },
];

const stats = [
  { value: '31', label: 'Day Curriculum' },
  { value: '8+', label: 'Questions Per Interview' },
  { value: '4+', label: 'Topics Covered' },
  { value: '20', label: 'Candidates' },
];

export const LandingPage: React.FC = () => {
  return (
    <div style={{ paddingTop: '60px' }}>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={{
        minHeight: 'calc(100vh - 60px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '960px', width: '100%', textAlign: 'center', zIndex: 1 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            borderRadius: '20px',
            fontSize: '13px',
            color: '#C4B5FD',
            fontWeight: 500,
            marginBottom: '32px',
          }}>
            <span style={{ width: 6, height: 6, background: '#10B981', borderRadius: '50%', display: 'inline-block' }} />
            ABTalks AI Cohort · 31-Day Program
          </div>

          <h1 style={{
            fontSize: 'clamp(40px, 7vw, 76px)',
            fontWeight: 800,
            margin: '0 0 16px',
            lineHeight: 1.1,
            letterSpacing: '-2px',
          }}>
            <span className="gradient-text">AI Interview Agent</span>
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2.5vw, 22px)',
            color: '#A1A1AA',
            margin: '0 0 12px',
            fontWeight: 400,
            fontStyle: 'italic',
          }}>
            "Build the interviewer, not the interview."
          </p>

          <p style={{
            fontSize: 'clamp(14px, 2vw, 17px)',
            color: '#6B7280',
            margin: '0 0 48px',
            maxWidth: '560px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.6,
          }}>
            Practice realistic technical interviews personalized to your AI engineering learning journey.
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '64px' }}>
            <Link to="/dashboard" className="btn-primary" style={{ fontSize: '16px', padding: '14px 28px' }}>
              Start Interview
              <ArrowRight size={18} />
            </Link>
            <Link to="/curriculum" className="btn-secondary" style={{ fontSize: '16px', padding: '14px 28px' }}>
              Explore Curriculum
            </Link>
          </div>

          {/* AI Interviewer Card */}
          <div style={{
            display: 'inline-block',
            background: '#0D0D16',
            border: '1px solid #29233D',
            borderRadius: '20px',
            padding: '24px 28px',
            textAlign: 'left',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 0 60px rgba(139,92,246,0.08)',
            maxWidth: '400px',
            width: '100%',
            animation: 'fadeIn 0.8s ease forwards',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 700,
                color: 'white',
              }}>
                AI
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#F5F3FF' }}>AI Interviewer</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#10B981' }}>
                  <span style={{ width: 6, height: 6, background: '#10B981', borderRadius: '50%', display: 'inline-block', animation: 'pulse-glow 2s infinite' }} />
                  Ready
                </div>
              </div>
            </div>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: '#D1D5DB',
              lineHeight: '1.7',
              fontStyle: 'italic',
              borderLeft: '2px solid rgba(139,92,246,0.4)',
              paddingLeft: '14px',
            }}>
              "Let's assess your understanding of the systems you've built. I'll ask you questions based on what you've completed in the curriculum."
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <section style={{
        padding: '48px 24px',
        borderTop: '1px solid #29233D',
        borderBottom: '1px solid #29233D',
        background: '#0D0D16',
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px',
          textAlign: 'center',
        }}>
          {stats.map(({ value, label }) => (
            <div key={label}>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#C4B5FD', marginBottom: '4px' }}>
                {value}
              </div>
              <div style={{ fontSize: '13px', color: '#6B7280' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section style={{ padding: '96px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#F5F3FF', margin: '0 0 12px', letterSpacing: '-1px' }}>
            Built for serious learners
          </h2>
          <p style={{ color: '#6B7280', fontSize: '16px', margin: 0 }}>
            Every interview is unique, adaptive, and designed to reveal your real understanding.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}>
          {features.map(({ icon: Icon, title, description, color }) => (
            <div
              key={title}
              style={{
                background: '#0D0D16',
                border: '1px solid #29233D',
                borderRadius: '16px',
                padding: '24px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = '#3D3454';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = '#29233D';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                background: `${color}18`,
                border: `1px solid ${color}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <Icon size={20} color={color} />
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700, color: '#F5F3FF' }}>
                {title}
              </h3>
              <p style={{ margin: 0, color: '#A1A1AA', fontSize: '14px', lineHeight: '1.6' }}>
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section style={{
        padding: '80px 24px',
        textAlign: 'center',
        background: '#0D0D16',
        borderTop: '1px solid #29233D',
      }}>
        <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#F5F3FF', margin: '0 0 16px' }}>
          Ready to be interviewed?
        </h2>
        <p style={{ color: '#6B7280', fontSize: '16px', margin: '0 0 36px' }}>
          Select your candidate profile and start a personalized technical interview.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/dashboard" className="btn-primary" style={{ fontSize: '16px', padding: '14px 32px' }}>
            Start Interview <ArrowRight size={18} />
          </Link>
          <Link to="/curriculum" className="btn-secondary" style={{ fontSize: '16px', padding: '14px 32px' }}>
            View 31-Day Curriculum
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #29233D',
        padding: '24px',
        textAlign: 'center',
        color: '#4B5563',
        fontSize: '13px',
      }}>
        AI Interview Agent · ABTalks AI Cohort · Built with ♥
      </footer>
    </div>
  );
};
