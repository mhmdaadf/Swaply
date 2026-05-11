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
      <nav className="glass desktop-nav" role="navigation" aria-label="Main navigation">
        <div className="nav-inner">
          {/* Logo */}
          <Link to="/" aria-label="Swaply Home" className="nav-logo">
            <div className="nav-logo-icon">
              <ArrowRightLeft size={18} />
            </div>
            <span className="gradient-text">Swaply</span>
          </Link>

          {/* Nav Links */}
          <div className="nav-links">
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
              const active = location.pathname.startsWith(path);
              return (
                <Link
                  key={path}
                  to={path}
                  aria-current={active ? 'page' : undefined}
                  className={`nav-link ${active ? 'nav-link-active' : ''}`}
                >
                  <Icon size={16} />
                  <span className="nav-label">{label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Profile */}
          <Link to="/profile" className="nav-profile" aria-label={`Profile: ${user.username}`}>
            <div className="nav-avatar">
              {user.username?.charAt(0).toUpperCase()}
            </div>
            <span className="nav-username">{user.username}</span>
            <span className="badge badge-accent" style={{ fontSize: '0.62rem', padding: '2px 8px' }}>
              {user.trustScore?.toFixed(1)}
            </span>
          </Link>
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
        .desktop-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          border-bottom: 1px solid var(--color-border);
        }
        .nav-inner {
          max-width: var(--max-width); margin: 0 auto; padding: 0 24px;
          height: var(--nav-height); display: flex; align-items: center;
          justify-content: space-between;
        }

        /* Logo */
        .nav-logo {
          display: flex; align-items: center; gap: 10px;
          font-size: 1.3rem; font-weight: 800; letter-spacing: -0.03em;
        }
        .nav-logo-icon {
          width: 32px; height: 32px; border-radius: 10px;
          background: linear-gradient(135deg, var(--color-brand), #a78bfa);
          display: flex; align-items: center; justify-content: center;
          color: white; box-shadow: 0 2px 10px rgba(99,102,241,0.3);
        }

        /* Links */
        .nav-links { display: flex; gap: 2px; }
        .nav-link {
          display: flex; align-items: center; gap: 7px;
          padding: 8px 16px; border-radius: var(--radius);
          font-size: 0.84rem; font-weight: 500;
          color: var(--color-text-muted);
          transition: all 0.2s ease;
          position: relative;
        }
        .nav-link:hover {
          color: var(--color-text-secondary);
          background: rgba(255,255,255,0.03);
        }
        .nav-link-active {
          color: var(--color-brand-light) !important;
          background: rgba(99,102,241,0.08) !important;
        }
        .nav-link-active::after {
          content: ''; position: absolute; bottom: -1px;
          left: 50%; transform: translateX(-50%);
          width: 20px; height: 2px; border-radius: 2px;
          background: var(--color-brand-light);
        }

        /* Profile */
        .nav-profile {
          display: flex; align-items: center; gap: 10px;
          padding: 5px 14px 5px 5px; border-radius: 100px;
          background: var(--color-surface-elevated);
          border: 1px solid var(--color-border);
          transition: all 0.2s ease;
        }
        .nav-profile:hover {
          border-color: var(--color-border-active);
          background: rgba(99,102,241,0.04);
        }
        .nav-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: linear-gradient(135deg, var(--color-brand), var(--color-accent));
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem; font-weight: 700; color: #fff;
        }
        .nav-username {
          font-size: 0.82rem; font-weight: 500;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .nav-label { display: none; }
          .nav-profile { display: none !important; }
          .nav-links { gap: 0; }
          .nav-link { padding: 8px 10px; }
        }

        /* ─── Mobile bottom nav ─── */
        .mobile-nav {
          display: none;
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
          background: rgba(10, 10, 16, 0.96);
          backdrop-filter: blur(20px) saturate(1.4);
          -webkit-backdrop-filter: blur(20px) saturate(1.4);
          border-top: 1px solid var(--color-border);
          padding: 8px 8px calc(8px + env(safe-area-inset-bottom));
          justify-content: space-around;
        }
        @media (max-width: 768px) {
          .mobile-nav { display: flex; }
        }
        .mobile-nav-item {
          display: flex; flex-direction: column; align-items: center; gap: 3px;
          padding: 6px 12px; border-radius: 12px;
          font-size: 0.58rem; font-weight: 600; letter-spacing: 0.02em;
          color: var(--color-text-muted);
          transition: all 0.2s ease;
          text-decoration: none;
        }
        .mobile-nav-item.active {
          color: var(--color-brand-light);
          background: rgba(99,102,241,0.08);
        }
      `}</style>
    </>
  );
}
