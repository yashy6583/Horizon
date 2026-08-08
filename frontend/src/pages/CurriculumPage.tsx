import React, { useState, useEffect } from 'react';
import type { Curriculum } from '../types';
import { fetchCurriculum } from '../services/api';
import { Loader, Search } from 'lucide-react';

type Filter = 'all' | 'SETUP' | 'BUILD' | 'LEARN' | 'AI_CORE' | 'SHIP_IT' | 'OPTIMIZE' | 'CAPSTONE';

const TYPE_COLORS: Record<string, string> = {
  SETUP: '#6366F1',
  BUILD: '#10B981',
  LEARN: '#F59E0B',
  AI_CORE: '#8B5CF6',
  SHIP_IT: '#EF4444',
  OPTIMIZE: '#06B6D4',
  CAPSTONE: '#EC4899',
};

const TYPE_LABELS: Record<string, string> = {
  SETUP: 'Setup',
  BUILD: 'Build',
  LEARN: 'Learn',
  AI_CORE: 'AI Core',
  SHIP_IT: 'Ship It',
  OPTIMIZE: 'Optimize',
  CAPSTONE: 'Capstone',
};

export const CurriculumPage: React.FC = () => {
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    fetchCurriculum()
      .then(data => { setCurriculum(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const days = curriculum?.days || [];
  const filtered = days.filter(d => {
    const matchesType = filter === 'all' || d.type === filter;
    const matchesSearch = !search ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.tools.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const allTypes = Array.from(new Set(days.map(d => d.type)));

  if (loading) {
    return (
      <div style={{ paddingTop: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Loader size={32} color="#8B5CF6" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '60px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#8B5CF6', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
            ABTalks AI Cohort
          </p>
          <h1 style={{ margin: '0 0 8px', fontSize: '36px', fontWeight: 800, color: '#F5F3FF', letterSpacing: '-1px' }}>
            31-Day Curriculum
          </h1>
          <p style={{ margin: 0, color: '#A1A1AA', fontSize: '16px' }}>
            {curriculum?.cohort} — Explore all topics covered in the cohort.
          </p>
        </div>

        {/* Modules Overview */}
        {curriculum && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '32px' }}>
            {curriculum.modules.map(mod => (
              <div key={mod.n} style={{
                background: '#0D0D16',
                border: '1px solid #29233D',
                borderRadius: '12px',
                padding: '14px 16px',
              }}>
                <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '4px' }}>Module {mod.n}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#F5F3FF', lineHeight: '1.4' }}>{mod.title}</div>
                <div style={{ fontSize: '12px', color: '#8B5CF6', marginTop: '6px' }}>Days {mod.days[0]}–{mod.days[1]}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
              background: filter === 'all' ? '#8B5CF6' : 'transparent',
              borderColor: filter === 'all' ? '#8B5CF6' : '#29233D',
              color: filter === 'all' ? 'white' : '#A1A1AA',
            }}
          >
            All ({days.length})
          </button>
          {allTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilter(type as Filter)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
                background: filter === type ? TYPE_COLORS[type] || '#8B5CF6' : 'transparent',
                borderColor: filter === type ? TYPE_COLORS[type] || '#8B5CF6' : '#29233D',
                color: filter === type ? 'white' : '#A1A1AA',
              }}
            >
              {TYPE_LABELS[type] || type} ({days.filter(d => d.type === type).length})
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
          <input
            id="curriculum-search"
            type="text"
            placeholder="Search topics or tools..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '40px' }}
          />
        </div>

        <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>
          Showing {filtered.length} of {days.length} days
        </div>

        {/* Day Cards */}
        <div style={{ display: 'grid', gap: '12px' }}>
          {filtered.map(day => (
            <div
              key={day.day}
              style={{
                background: '#0D0D16',
                border: '1px solid #29233D',
                borderRadius: '14px',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#3D3454'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#29233D'}
            >
              <button
                onClick={() => setExpanded(expanded === day.day ? null : day.day)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '18px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  textAlign: 'left',
                }}
              >
                {/* Day number */}
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  background: `${TYPE_COLORS[day.type] || '#8B5CF6'}18`,
                  border: `1px solid ${TYPE_COLORS[day.type] || '#8B5CF6'}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: TYPE_COLORS[day.type] || '#8B5CF6', fontFamily: 'JetBrains Mono, monospace' }}>
                    {String(day.day).padStart(2, '0')}
                  </span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#F5F3FF' }}>
                      {day.title}
                    </h3>
                    <span style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: `${TYPE_COLORS[day.type] || '#8B5CF6'}15`,
                      color: TYPE_COLORS[day.type] || '#8B5CF6',
                      border: `1px solid ${TYPE_COLORS[day.type] || '#8B5CF6'}25`,
                      fontWeight: 600,
                    }}>
                      {TYPE_LABELS[day.type] || day.type}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {day.tools.slice(0, 4).map(tool => (
                      <span key={tool} style={{ fontSize: '11px', color: '#6B7280', background: '#11111D', border: '1px solid #29233D', borderRadius: '4px', padding: '1px 6px', fontFamily: 'JetBrains Mono, monospace' }}>
                        {tool}
                      </span>
                    ))}
                    {day.tools.length > 4 && (
                      <span style={{ fontSize: '11px', color: '#6B7280' }}>+{day.tools.length - 4}</span>
                    )}
                  </div>
                </div>

                <div style={{
                  color: '#6B7280',
                  fontSize: '18px',
                  transform: expanded === day.day ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s ease',
                }}>
                  ↓
                </div>
              </button>

              {/* Expanded objectives */}
              {expanded === day.day && (
                <div style={{
                  padding: '0 24px 20px',
                  borderTop: '1px solid #29233D',
                  marginTop: '0',
                  animation: 'fadeIn 0.2s ease',
                }}>
                  <div style={{ paddingTop: '16px' }}>
                    <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                      Learning Objectives
                    </div>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                      {day.objectives.map((obj, i) => (
                        <li key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px', fontSize: '14px', color: '#D1D5DB', lineHeight: '1.5' }}>
                          <span style={{ color: '#8B5CF6', flexShrink: 0, marginTop: '2px' }}>→</span>
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px', color: '#6B7280' }}>
            No curriculum days match your filter.
          </div>
        )}
      </div>
    </div>
  );
};
