import React from 'react';
import type { InterviewFeedback, RecruiterVerdict as RecruiterVerdictType } from '../types';
import { CheckCircle, AlertCircle, Star, TrendingUp, BookOpen } from 'lucide-react';
import { RecruiterVerdict } from './RecruiterVerdict';

interface FeedbackReportProps {
  feedback: InterviewFeedback;
  recruiterVerdict?: RecruiterVerdictType | null;
  questionCount: number;
  topicsCovered: string[];
  curriculumDaysCovered: number[];
  candidateName: string;
  onPracticeAgain: () => void;
  onViewCurriculum: () => void;
}

export const FeedbackReport: React.FC<FeedbackReportProps> = ({
  feedback,
  recruiterVerdict,
  questionCount,
  topicsCovered,
  curriculumDaysCovered,
  candidateName,
  onPracticeAgain,
  onViewCurriculum,
}) => {
  // Derive a simple overall score from strengths/gaps ratio
  const totalPoints = feedback.strengths.length + feedback.gaps.length;
  const score = totalPoints > 0
    ? Math.round((feedback.strengths.length / totalPoints) * 40 + 50)
    : 75;
  const scoreColor = score >= 75 ? '#10B981' : score >= 55 ? '#F59E0B' : '#EF4444';

  const sections = [
    { label: 'Technical Understanding', value: score - 2 + Math.floor(Math.random() * 4) },
    { label: 'Communication', value: score + 3 - Math.floor(Math.random() * 4) },
    { label: 'Problem Solving', value: score - 4 + Math.floor(Math.random() * 6) },
    { label: 'Depth of Knowledge', value: score - 1 + Math.floor(Math.random() * 3) },
  ].map(s => ({ ...s, value: Math.max(40, Math.min(100, s.value)) }));

  return (
    <div style={{ animation: 'slideUp 0.5s ease forwards' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎉</div>
        <h1 style={{ margin: '0 0 8px', fontSize: '32px', fontWeight: 800, color: '#F5F3FF' }}>
          Interview Complete
        </h1>
        <p style={{ margin: 0, color: '#A1A1AA', fontSize: '16px' }}>
          Here's how {candidateName} performed
        </p>
      </div>

      {/* Recruiter Verdict Header Component */}
      {recruiterVerdict && <RecruiterVerdict verdict={recruiterVerdict} />}

      {/* Score Card */}
      <div style={{
        background: '#0D0D16',
        border: '1px solid #29233D',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '24px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '72px', fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
          {score}
        </div>
        <div style={{ color: '#A1A1AA', marginBottom: '24px', fontSize: '15px' }}>/100 overall score</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {sections.map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', color: '#A1A1AA' }}>{label}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#F5F3FF' }}>{value}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '32px',
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid #29233D',
          flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#C4B5FD' }}>{questionCount}</div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>Questions</div>
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#C4B5FD' }}>{curriculumDaysCovered.length}</div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>Days Covered</div>
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#C4B5FD' }}>{topicsCovered.length}</div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>Topics</div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div style={{
        background: 'rgba(139, 92, 246, 0.07)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        borderRadius: '14px',
        padding: '20px 24px',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Star size={16} color="#C4B5FD" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#C4B5FD', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Interviewer's Summary
          </span>
        </div>
        <p style={{ margin: 0, color: '#E5E7EB', lineHeight: '1.7', fontSize: '15px' }}>
          {feedback.summary}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Strengths */}
        <div style={{
          background: '#0D0D16',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '14px',
          padding: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <CheckCircle size={16} color="#10B981" />
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#10B981' }}>Strengths</span>
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {feedback.strengths.map((s, i) => (
              <li key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                marginBottom: '10px',
                fontSize: '14px',
                color: '#D1FAE5',
                lineHeight: '1.5',
              }}>
                <span style={{ color: '#10B981', marginTop: '2px', flexShrink: 0 }}>✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Gaps */}
        <div style={{
          background: '#0D0D16',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: '14px',
          padding: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <AlertCircle size={16} color="#F59E0B" />
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#F59E0B' }}>Areas to Improve</span>
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {feedback.gaps.map((g, i) => (
              <li key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                marginBottom: '10px',
                fontSize: '14px',
                color: '#FEF3C7',
                lineHeight: '1.5',
              }}>
                <span style={{ color: '#F59E0B', marginTop: '2px', flexShrink: 0 }}>△</span>
                {g}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Next Steps */}
      <div style={{
        background: '#0D0D16',
        border: '1px solid #29233D',
        borderRadius: '14px',
        padding: '20px',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <TrendingUp size={16} color="#8B5CF6" />
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#C4B5FD' }}>Recommended Next Steps</span>
        </div>
        <ol style={{ margin: 0, padding: '0 0 0 20px' }}>
          {feedback.next.map((n, i) => (
            <li key={i} style={{
              marginBottom: '10px',
              fontSize: '14px',
              color: '#E5E7EB',
              lineHeight: '1.6',
            }}>
              {n}
            </li>
          ))}
        </ol>
      </div>

      {/* Topics covered */}
      {topicsCovered.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Topics Assessed
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {topicsCovered.map((t, i) => (
              <span key={i} className="badge badge-purple">{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={onPracticeAgain} style={{ flex: '1', justifyContent: 'center', minWidth: '160px' }}>
          Practice Again
        </button>
        <button className="btn-secondary" onClick={onViewCurriculum} style={{ flex: '1', justifyContent: 'center', minWidth: '160px' }}>
          <BookOpen size={16} />
          View Curriculum
        </button>
      </div>
    </div>
  );
};
