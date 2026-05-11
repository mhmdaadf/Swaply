import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard, Search, ArrowRightLeft,
  Sparkles, User,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/matches', label: 'Smart Swaps', icon: Sparkles },
  { path: '/trades', label: 'My Deals', icon: ArrowRightLeft },
  { path: '/explore', label: 'Explore', icon: Search },
];

export default function Navbar() {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) return null;

  return (
    <>
      {/* ─── Desktop Top Bar ─── */}
      <nav className="glass desktop-nav" role="navigation" aria-label="Main navigation" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '0 20px',
          height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <Link to="/" aria-label="Swaply Home" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em',
          }}>
            <ArrowRightLeft size={22} style={{ color: 'var(--color-brand-light)' }} />
            <span className="gradient-text">Swaply</span>
          </Link>

          {/* Nav Links */}
          <div style={{ display: 'flex', gap: 4 }}>
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
              const active = location.pathname.startsWith(path);
              return (
                <Link
                  key={path}
                  to={path}
                  aria-current={active ? 'page' : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', borderRadius: 'var(--radius)',
                    fontSize: '0.825rem', fontWeight: 500,
                    color: active ? 'var(--color-brand-light)' : 'var(--color-text-secondary)',
                    background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Icon size={16} />
                  <span className="nav-label">{label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link to="/profile" className="user-profile-link" aria-label={`Profile: ${user.username}`} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 12px', borderRadius: 'var(--radius)',
              background: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}>
              <User size={14} style={{ color: 'var(--color-brand-light)' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{user.username}</span>
              <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>
                {user.trustScore?.toFixed(1)}
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Mobile Bottom Bar ─── */}
      <nav className="mobile-nav" role="navigation" aria-label="Mobile navigation">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = location.pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              aria-current={active ? 'page' : undefined}
              className={`mobile-nav-item ${active ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          );
        })}
        <Link
          to="/profile"
          className={`mobile-nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
          aria-label="Profile"
        >
          <User size={20} />
          <span>Profile</span>
        </Link>
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .nav-label { display: none; }
          .desktop-nav .user-profile-link { display: none !important; }
        }
        .user-profile-link:hover {
          border-color: var(--color-brand-light) !important;
          background: rgba(99,102,241,0.05) !important;
        }

        /* Mobile bottom nav */
        .mobile-nav {
          display: none;
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
          background: rgba(15, 15, 20, 0.95);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-top: 1px solid var(--color-border);
          padding: 6px 8px calc(6px + env(safe-area-inset-bottom));
          justify-content: space-around;
        }
        @media (max-width: 768px) {
          .mobile-nav { display: flex; }
        }
        .mobile-nav-item {
          display: flex; flex-direction: column; align-items: center; gap: 2px;
          padding: 6px 10px; border-radius: 10px;
          font-size: 0.6rem; font-weight: 500;
          color: var(--color-text-muted);
          transition: color 0.2s ease;
          text-decoration: none;
        }
        .mobile-nav-item.active {
          color: var(--color-brand-light);
        }
      `}</style>
    </>
  );
}
