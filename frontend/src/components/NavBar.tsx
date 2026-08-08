import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, BookOpen, Users, Home, Menu, X } from 'lucide-react';

interface NavBarProps {
  onMobileToggle?: () => void;
}

export const NavBar: React.FC<NavBarProps> = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/dashboard', label: 'Dashboard', icon: Users },
    { to: '/curriculum', label: 'Curriculum', icon: BookOpen },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: 'rgba(7, 7, 13, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid #29233D',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 34,
            height: 34,
            background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Brain size={18} color="white" />
          </div>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#F5F3FF', letterSpacing: '-0.3px' }}>
            AI Interview Agent
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="desktop-nav">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                color: isActive(to) ? '#C4B5FD' : '#A1A1AA',
                background: isActive(to) ? 'rgba(139, 92, 246, 0.12)' : 'transparent',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                if (!isActive(to)) {
                  (e.currentTarget as HTMLElement).style.color = '#F5F3FF';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive(to)) {
                  (e.currentTarget as HTMLElement).style.color = '#A1A1AA';
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }
              }}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            to="/dashboard"
            className="btn-primary"
            style={{ padding: '8px 18px', fontSize: '13px' }}
          >
            Start Interview
          </Link>
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: 'none',
              background: 'transparent',
              border: 'none',
              color: '#A1A1AA',
              cursor: 'pointer',
              padding: '4px',
            }}
            id="mobile-menu-btn"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div style={{
          background: '#0D0D16',
          borderTop: '1px solid #29233D',
          padding: '12px',
        }}>
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: 500,
                color: isActive(to) ? '#C4B5FD' : '#A1A1AA',
                background: isActive(to) ? 'rgba(139, 92, 246, 0.12)' : 'transparent',
                marginBottom: '4px',
              }}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          #mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
};
