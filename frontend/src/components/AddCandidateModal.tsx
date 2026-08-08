import React, { useState } from 'react';
import type { Candidate } from '../types';
import { createCandidate } from '../services/api';
import { UserPlus, X, Check, Loader } from 'lucide-react';

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCandidateAdded: (newCandidate: Candidate) => void;
}

const ROLE_OPTIONS = [
  'Senior AI Engineer',
  'Full Stack AI Developer',
  'Machine Learning Engineer',
  'AI Systems Architect',
  'Data Scientist',
  'Backend Developer'
];

export const AddCandidateModal: React.FC<AddCandidateModalProps> = ({ isOpen, onClose, onCandidateAdded }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [jobRole, setJobRole] = useState(ROLE_OPTIONS[0]);
  const [yearsExperience, setYearsExperience] = useState(3);
  const [education, setEducation] = useState('BS Computer Science');
  const [preset, setPreset] = useState('intermediate');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter candidate name.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newCandidate = await createCandidate({
        name: name.trim(),
        email: email.trim(),
        jobRole,
        yearsExperience: Number(yearsExperience) || 1,
        education: education.trim(),
        preset
      });

      onCandidateAdded(newCandidate);
      onClose();
      // Reset form
      setName('');
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Failed to add candidate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      background: 'rgba(7, 7, 13, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        background: '#0D0D16',
        border: '1px solid #29233D',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '520px',
        padding: '32px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            background: 'transparent',
            border: 'none',
            color: '#6B7280',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            background: 'rgba(139, 92, 246, 0.12)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#8B5CF6'
          }}>
            <UserPlus size={22} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#F5F3FF' }}>Add Candidate</h2>
            <p style={{ margin: '2px 0 0', color: '#A1A1AA', fontSize: '13px' }}>Create a new profile for cohort evaluation</p>
          </div>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            color: '#FCA5A5',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          {/* Full Name */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#A1A1AA', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jordan Smith"
              required
              className="input-field"
              style={{ width: '100%' }}
            />
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#A1A1AA', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Email Address (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. jordan.smith@example.com"
              className="input-field"
              style={{ width: '100%' }}
            />
          </div>

          {/* Role & Experience (2 cols) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#A1A1AA', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Job Role
              </label>
              <select
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                className="input-field"
                style={{ width: '100%', cursor: 'pointer' }}
              >
                {ROLE_OPTIONS.map(r => (
                  <option key={r} value={r} style={{ background: '#0D0D16', color: '#F5F3FF' }}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#A1A1AA', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Experience (Years)
              </label>
              <input
                type="number"
                min="0"
                max="25"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(Number(e.target.value))}
                className="input-field"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Education */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#A1A1AA', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Education
            </label>
            <input
              type="text"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="e.g. MS Computer Science, Stanford"
              className="input-field"
              style={{ width: '100%' }}
            />
          </div>

          {/* Baseline Curriculum Preset */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#A1A1AA', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Cohort Baseline Progress
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {[
                { id: 'beginner', label: 'Beginner', desc: '8 Days Passed' },
                { id: 'intermediate', label: 'Intermediate', desc: '15 Days Passed' },
                { id: 'advanced', label: 'Advanced', desc: '24 Days Passed' },
                { id: 'complete', label: 'Completed', desc: '31 Days Passed' },
              ].map((p) => {
                const selected = preset === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setPreset(p.id)}
                    style={{
                      padding: '10px 12px',
                      background: selected ? 'rgba(139, 92, 246, 0.12)' : '#11111D',
                      border: `1px solid ${selected ? '#8B5CF6' : '#29233D'}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 700, color: selected ? '#C4B5FD' : '#F5F3FF' }}>
                      {p.label}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                      {p.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit / Cancel Actions */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button
              type="button"
              className="btn-ghost"
              onClick={onClose}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              {loading ? (
                <>
                  <Loader size={16} className="spin" /> Creating...
                </>
              ) : (
                <>
                  <Check size={16} /> Save Candidate
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
