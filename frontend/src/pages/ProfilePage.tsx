import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Candidate, Curriculum } from '../types';
import { fetchCandidate, fetchCandidates, fetchCurriculum } from '../services/api';
import { computeReadinessScore, getCompletedDays, getSkippedDays, getWeakDays, getStrongDays, getInitials, getMissionStatus } from '../utils/candidateUtils';
import { BookOpen, Target, TrendingUp, AlertTriangle, CheckCircle, XCircle, SkipForward, ArrowRight, Loader } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      // Load first candidate
      fetchCandidates()
        .then(data => {
          if (data.candidates.length > 0) {
            setCandidate(data.candidates[0]);
          }
          setLoading(false);
        })
        .catch((e: any) => { setError(e.message); setLoading(false); });
    } else {
      fetchCandidate(id)
        .then((c: Candidate) => { setCandidate(c); setLoading(false); })
        .catch((e: any) => { setError(e.message); setLoading(false); });
    }
    fetchCurriculum().then(setCurriculum).catch(() => {});
  }, [id]);

  if (loading) {
    return (
      <div style={{ paddingTop: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Loader size={32} color="#8B5CF6" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div style={{ paddingTop: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ color: '#F5F3FF', marginBottom: '8px' }}>Candidate not found</h2>
          <p style={{ color: '#A1A1AA', marginBottom: '24px' }}>{error || 'No candidate data available.'}</p>
          <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  const score = computeReadinessScore(candidate);
  const completed = getCompletedDays(candidate);
  const skipped = getSkippedDays(candidate);
  const weak = getWeakDays(candidate);
  const strong = getStrongDays(candidate);
  const scoreColor = score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';

  // Get curriculum day titles
  const getDayTitle = (day: number) => {
    if (!curriculum) return `Day ${day}`;
    const d = curriculum.days.find(c => c.day === day);
    return d ? d.title : `Day ${day}`;
  };

  return (
    <div style={{ paddingTop: '60px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{
          background: '#0D0D16',
          border: '1px solid #29233D',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 800,
              color: 'white',
              flexShrink: 0,
            }}>
              {getInitials(candidate.member.name)}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: 800, color: '#F5F3FF' }}>
                {candidate.member.name}
              </h1>
              <p style={{ margin: '0 0 4px', fontSize: '15px', color: '#A1A1AA' }}>
                {candidate.member.jobRole} · {candidate.member.yearsExperience} years experience
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>
                {candidate.member.education} · {candidate.member.status}
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
                {score}
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>Readiness Score</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '14px',
          marginBottom: '24px',
        }}>
          {[
            { icon: CheckCircle, label: 'Completed', value: completed.length, color: '#10B981' },
            { icon: SkipForward, label: 'Skipped', value: skipped.length, color: '#F59E0B' },
            { icon: Target, label: 'First Try', value: candidate.signals.missionsFirstTry, color: '#8B5CF6' },
            { icon: TrendingUp, label: 'Commit Days', value: `${candidate.signals.commitDays}/31`, color: '#6366F1' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} style={{
              background: '#0D0D16',
              border: '1px solid #29233D',
              borderRadius: '14px',
              padding: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Icon size={14} color={color} />
                <span style={{ fontSize: '12px', color: '#6B7280' }}>{label}</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Missions Detail */}
        <div style={{
          background: '#0D0D16',
          border: '1px solid #29233D',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
        }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 700, color: '#C4B5FD' }}>
            Mission History
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {candidate.missions.map(mission => {
              const status = getMissionStatus(mission);
              const statusColor = status === 'completed' ? '#10B981' :
                                  status === 'skipped' ? '#F59E0B' :
                                  status === 'failed' ? '#EF4444' : '#6B7280';
              const StatusIcon = status === 'completed' ? CheckCircle :
                                 status === 'skipped' ? SkipForward :
                                 status === 'failed' ? XCircle : BookOpen;
              return (
                <div key={mission.day} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: '#11111D',
                  borderRadius: '10px',
                  border: '1px solid #29233D',
                }}>
                  <StatusIcon size={16} color={statusColor} style={{ flexShrink: 0 }} />
                  <span style={{
                    fontSize: '13px',
                    color: '#6B7280',
                    fontFamily: 'JetBrains Mono, monospace',
                    width: '48px',
                    flexShrink: 0,
                  }}>
                    D{String(mission.day).padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: '14px', color: '#F5F3FF', flex: 1 }}>
                    {mission.title}
                  </span>
                  {mission.attempts && (
                    <span style={{
                      fontSize: '12px',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: mission.attempts >= 4 ? 'rgba(239,68,68,0.1)' : 'rgba(139,92,246,0.1)',
                      color: mission.attempts >= 4 ? '#F87171' : '#C4B5FD',
                      border: `1px solid ${mission.attempts >= 4 ? 'rgba(239,68,68,0.2)' : 'rgba(139,92,246,0.15)'}`,
                    }}>
                      {mission.attempts} {mission.attempts === 1 ? 'attempt' : 'attempts'}
                    </span>
                  )}
                  {mission.skipped && (
                    <span className="badge badge-warning">Skipped</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Learning Signals */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {/* Strong areas */}
          <div style={{
            background: '#0D0D16',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: '14px',
            padding: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <CheckCircle size={16} color="#10B981" />
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#10B981' }}>Strong Areas</span>
            </div>
            {strong.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {strong.slice(0, 6).map(day => (
                  <div key={day} style={{ fontSize: '13px', color: '#D1FAE5', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#10B981' }}>✓</span>
                    Day {day}: {getDayTitle(day)}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>No first-try passes recorded</p>
            )}
          </div>

          {/* Weak areas */}
          <div style={{
            background: '#0D0D16',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '14px',
            padding: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <AlertTriangle size={16} color="#EF4444" />
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#EF4444' }}>Needs Improvement</span>
            </div>
            {weak.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {weak.map(day => {
                  const m = candidate.missions.find(mi => mi.day === day);
                  return (
                    <div key={day} style={{ fontSize: '13px', color: '#FEE2E2', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#EF4444' }}>△</span>
                      Day {day}: {getDayTitle(day)} ({m?.attempts} attempts)
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>No weak areas detected — great job!</p>
            )}
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            className="btn-primary"
            onClick={() => navigate('/interview/start', { state: { candidate } })}
            style={{ flex: 1, justifyContent: 'center', minWidth: '200px' }}
          >
            Start Interview <ArrowRight size={16} />
          </button>
          <Link to="/dashboard" className="btn-secondary" style={{ flex: 1, justifyContent: 'center', minWidth: '160px' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};
