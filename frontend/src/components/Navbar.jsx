import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, Search, ArrowRightLeft, Sparkles, User } from 'lucide-react';

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
      <nav className="nav-desktop glass" role="navigation" aria-label="Main navigation">
        <div className="nav-container">
          <Link to="/" aria-label="Swaply Home" className="nav-brand">
            <div className="nav-brand-icon"><ArrowRightLeft size={16} strokeWidth={2.5} /></div>
            <span className="gradient-text">Swaply</span>
          </Link>

          <div className="nav-links">
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
              const active = location.pathname.startsWith(path);
              return (
                <Link key={path} to={path} aria-current={active ? 'page' : undefined}
                  className={`nav-link ${active ? 'is-active' : ''}`}>
                  <Icon size={15} strokeWidth={active ? 2.2 : 1.8} />
                  <span className="nav-link-label">{label}</span>
                </Link>
              );
            })}
          </div>

          <Link to="/profile" className="nav-user" aria-label={`Profile: ${user.username}`}>
            <div className="nav-user-avatar">{user.username?.charAt(0).toUpperCase()}</div>
            <span className="nav-user-name">{user.username}</span>
            <span className="nav-user-score">{user.trustScore?.toFixed(1)}</span>
          </Link>
        </div>
      </nav>

      <nav className="nav-mobile" role="navigation" aria-label="Mobile navigation">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = location.pathname.startsWith(path);
          return (
            <Link key={path} to={path} aria-current={active ? 'page' : undefined}
              className={`nav-mobile-item ${active ? 'is-active' : ''}`}>
              <Icon size={19} strokeWidth={active ? 2.2 : 1.6} />
              <span>{label}</span>
            </Link>
          );
        })}
        <Link to="/profile" className={`nav-mobile-item ${location.pathname === '/profile' ? 'is-active' : ''}`}>
          <User size={19} strokeWidth={location.pathname === '/profile' ? 2.2 : 1.6} />
          <span>Profile</span>
        </Link>
      </nav>

      <style>{`
        /* ═══ Desktop Nav ═══ */
        .nav-desktop {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          border-bottom: 1px solid var(--color-border-subtle);
        }
        .nav-container {
          max-width: var(--max-width); margin: 0 auto;
          padding: 0 var(--space-6);
          height: var(--nav-height);
          display: flex; align-items: center; justify-content: space-between;
        }

        /* Brand */
        .nav-brand {
          display: flex; align-items: center; gap: var(--space-3);
          font-size: 1.25rem; font-weight: 800; letter-spacing: -0.035em;
        }
        .nav-brand-icon {
          width: 30px; height: 30px; border-radius: var(--radius-sm);
          background: linear-gradient(135deg, var(--color-brand), #a78bfa);
          display: flex; align-items: center; justify-content: center;
          color: white;
          box-shadow: 0 2px 12px rgba(99,102,241,0.35),
                      inset 0 1px 0 rgba(255,255,255,0.15);
        }

        /* Links */
        .nav-links { display: flex; gap: 1px; }
        .nav-link {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: var(--radius-sm);
          font-size: 0.82rem; font-weight: 500;
          color: var(--color-text-muted);
          transition: all var(--duration-base) var(--ease-smooth);
          position: relative;
        }
        .nav-link:hover {
          color: var(--color-text-secondary);
          background: rgba(255,255,255,0.025);
        }
        .nav-link.is-active {
          color: var(--color-text-primary);
          background: rgba(99,102,241,0.06);
        }
        .nav-link.is-active::after {
          content: ''; position: absolute;
          bottom: -1px; left: 50%; transform: translateX(-50%);
          width: 16px; height: 2px; border-radius: 2px;
          background: var(--color-brand-light);
          box-shadow: 0 0 8px rgba(99,102,241,0.4);
        }

        /* User */
        .nav-user {
          display: flex; align-items: center; gap: var(--space-2);
          padding: 4px 12px 4px 4px; border-radius: var(--radius-full);
          background: var(--color-surface-2);
          border: 1px solid var(--color-border);
          transition: all var(--duration-base) var(--ease-smooth);
        }
        .nav-user:hover {
          border-color: var(--color-border-hover);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.04);
        }
        .nav-user-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg, var(--color-brand), var(--color-accent));
          display: flex; align-items: center; justify-content: center;
          font-size: 0.7rem; font-weight: 700; color: #fff;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.2);
        }
        .nav-user-name { font-size: 0.78rem; font-weight: 500; }
        .nav-user-score {
          font-size: 0.6rem; font-weight: 700;
          background: rgba(245,158,11,0.1); color: var(--color-accent-light);
          padding: 2px 7px; border-radius: var(--radius-full);
        }

        @media (max-width: 768px) {
          .nav-link-label { display: none; }
          .nav-user { display: none !important; }
          .nav-link { padding: 8px; }
          .nav-container { padding: 0 var(--space-3); }
        }

        /* ═══ Mobile Nav ═══ */
        .nav-mobile {
          display: none;
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
          background: rgba(7, 7, 12, 0.96);
          backdrop-filter: blur(24px) saturate(1.5);
          -webkit-backdrop-filter: blur(24px) saturate(1.5);
          border-top: 1px solid var(--color-border-subtle);
          padding: 6px 4px calc(6px + env(safe-area-inset-bottom));
          justify-content: space-around;
        }
        @media (max-width: 768px) { .nav-mobile { display: flex; } }

        .nav-mobile-item {
          display: flex; flex-direction: column; align-items: center; gap: 2px;
          padding: 6px 14px; border-radius: var(--radius);
          font-size: 0.55rem; font-weight: 600; letter-spacing: 0.03em;
          color: var(--color-text-ghost);
          transition: all var(--duration-base) var(--ease-smooth);
          text-decoration: none; min-width: 56px;
        }
        .nav-mobile-item.is-active {
          color: var(--color-brand-light);
          background: rgba(99,102,241,0.06);
        }
      `}</style>
    </>
  );
}
