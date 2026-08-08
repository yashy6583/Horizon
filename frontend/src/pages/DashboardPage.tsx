import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Candidate } from '../types';
import { fetchCandidates } from '../services/api';
import { CandidateCard } from '../components/CandidateCard';
import { computeReadinessScore, getCompletedDays, getSkippedDays } from '../utils/candidateUtils';
import { Search, ArrowRight, RefreshCw, Users, TrendingUp, BookOpen, Loader, UserPlus } from 'lucide-react';
import { AddCandidateModal } from '../components/AddCandidateModal';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchCandidates()
      .then(data => {
        setCandidates(data.candidates);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load candidates');
        setLoading(false);
      });
  }, []);

  const filtered = candidates.filter(c =>
    c.member.name.toLowerCase().includes(search.toLowerCase()) ||
    c.member.jobRole.toLowerCase().includes(search.toLowerCase())
  );

  const handleStartInterview = () => {
    if (!selected) return;
    navigate('/interview/start', { state: { candidate: selected } });
  };

  if (loading) {
    return (
      <div style={{ paddingTop: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader size={32} color="#8B5CF6" style={{ animation: 'spin 1s linear infinite', display: 'block', margin: '0 auto 16px' }} />
          <p style={{ color: '#A1A1AA' }}>Loading candidates...</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ paddingTop: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ color: '#F5F3FF', marginBottom: '8px' }}>Backend not reachable</h2>
          <p style={{ color: '#A1A1AA', marginBottom: '24px' }}>{error}</p>
          <p style={{ color: '#6B7280', fontSize: '13px', marginBottom: '24px' }}>
            Make sure the backend server is running on port 3001.
          </p>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const avgScore = Math.round(candidates.reduce((sum, c) => sum + computeReadinessScore(c), 0) / candidates.length);

  return (
    <div style={{ paddingTop: '60px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#8B5CF6', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
            ABTalks AI Cohort
          </p>
          <h1 style={{ margin: '0 0 8px', fontSize: '36px', fontWeight: 800, color: '#F5F3FF', letterSpacing: '-1px' }}>
            Welcome back 👋
          </h1>
          <p style={{ margin: 0, color: '#A1A1AA', fontSize: '16px' }}>
            Select a candidate profile to start a personalized technical interview.
          </p>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px',
          marginBottom: '40px',
        }}>
          {[
            { icon: Users, label: 'Candidates', value: candidates.length, color: '#8B5CF6' },
            { icon: TrendingUp, label: 'Avg Readiness', value: `${avgScore}%`, color: '#10B981' },
            { icon: BookOpen, label: 'Curriculum Days', value: 31, color: '#6366F1' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} style={{
              background: '#0D0D16',
              border: '1px solid #29233D',
              borderRadius: '14px',
              padding: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  background: `${color}18`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon size={18} color={color} />
                </div>
                <span style={{ fontSize: '13px', color: '#6B7280' }}>{label}</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#F5F3FF' }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: '24px', alignItems: 'start' }}>
          {/* Candidate List */}
          <div>
            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
              <input
                id="candidate-search"
                type="text"
                placeholder="Search candidates by name or role..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '40px' }}
              />
            </div>

            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#F5F3FF' }}>
                  Candidates <span style={{ color: '#6B7280', fontSize: '14px', fontWeight: 400 }}>({filtered.length})</span>
                </h2>
                {selected && (
                  <span style={{ fontSize: '13px', color: '#8B5CF6' }}>1 selected</span>
                )}
              </div>

              <button
                id="add-candidate-btn"
                className="btn-primary"
                onClick={() => setIsAddModalOpen(true)}
                style={{ padding: '8px 14px', fontSize: '13px' }}
              >
                <UserPlus size={15} /> Add Candidate
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '14px',
            }}>
              {filtered.map(candidate => (
                <CandidateCard
                  key={candidate.member.id}
                  candidate={candidate}
                  onClick={() => setSelected(selected?.member.id === candidate.member.id ? null : candidate)}
                  isSelected={selected?.member.id === candidate.member.id}
                />
              ))}
            </div>

            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px', color: '#6B7280' }}>
                No candidates match your search.
              </div>
            )}
          </div>

          {/* Selected Candidate Panel */}
          {selected && (
            <div style={{
              background: '#0D0D16',
              border: '1px solid #29233D',
              borderRadius: '20px',
              padding: '24px',
              position: 'sticky',
              top: '76px',
              animation: 'fadeIn 0.3s ease forwards',
            }}>
              <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 700, color: '#C4B5FD' }}>
                Interview Preview
              </h3>

              {/* Mini profile */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#F5F3FF', marginBottom: '4px' }}>
                  {selected.member.name}
                </div>
                <div style={{ fontSize: '13px', color: '#A1A1AA', marginBottom: '16px' }}>
                  {selected.member.jobRole}
                </div>

                {/* Score */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'rgba(139, 92, 246, 0.08)',
                  borderRadius: '10px',
                  border: '1px solid rgba(139, 92, 246, 0.15)',
                  marginBottom: '16px',
                }}>
                  <span style={{ fontSize: '13px', color: '#A1A1AA' }}>Readiness Score</span>
                  <span style={{ fontSize: '22px', fontWeight: 800, color: '#C4B5FD' }}>
                    {computeReadinessScore(selected)}
                  </span>
                </div>

                {/* Mission stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                  {[
                    { label: 'Completed Days', value: getCompletedDays(selected).length, color: '#10B981' },
                    { label: 'Skipped Days', value: getSkippedDays(selected).length, color: '#F59E0B' },
                    { label: 'First-Try Passes', value: selected.signals.missionsFirstTry, color: '#8B5CF6' },
                    { label: 'Commit Days', value: selected.signals.commitDays, color: '#6366F1' },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{
                      background: '#11111D',
                      border: '1px solid #29233D',
                      borderRadius: '10px',
                      padding: '10px 14px',
                    }}>
                      <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '4px' }}>{label}</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color }}>{value}</div>
                    </div>
                  ))}
                </div>

                {/* Learning signals */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Interview will cover
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {getCompletedDays(selected).slice(0, 5).map(day => (
                      <span key={day} className="badge badge-purple">Day {day}</span>
                    ))}
                    {getCompletedDays(selected).length > 5 && (
                      <span className="badge badge-muted">+{getCompletedDays(selected).length - 5} more</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                id="start-interview-btn"
                className="btn-primary"
                onClick={handleStartInterview}
                style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
              >
                Start Personalized Interview
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Candidate Modal */}
      <AddCandidateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCandidateAdded={(newCandidate) => {
          setCandidates(prev => [newCandidate, ...prev]);
          setSelected(newCandidate);
        }}
      />
    </div>
  );
};
