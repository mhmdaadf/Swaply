import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, Search, ArrowRightLeft, Sparkles, User, Shield } from 'lucide-react';
import NotificationBell from './NotificationBell';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/matches', label: 'Smart Swaps', icon: Sparkles },
  { path: '/trades', label: 'My Deals', icon: ArrowRightLeft },
  { path: '/explore', label: 'Explore', icon: Search },
];

export default function Navbar() {
  const { user } = useAuthStore();
  const location = useLocation();

  const navItems = [...NAV_ITEMS];
  if (user?.role === 'admin' || user?.role === 'superadmin') {
    navItems.push({ path: '/admin', label: 'Admin', icon: Shield });
  }

  // On public pages (Landing, Login, Register), we show a specific public navbar if not logged in
  const isPublicPage = ['/', '/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);

  return (
    <>
      <nav className="nav-desktop glass" role="navigation" aria-label="Main navigation">
        <div className="nav-container">
          <Link to="/" aria-label="Swaply Home" className="nav-brand">
            <div className="nav-brand-icon"><ArrowRightLeft size={16} strokeWidth={2.5} /></div>
            <span className="gradient-text">Swaply</span>
          </Link>

          {user ? (
            <>
              <div className="nav-links">
                {navItems.map(({ path, label, icon: Icon }) => {
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

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <NotificationBell />
                <Link to="/profile" className="nav-user" aria-label={`Profile: ${user.username}`}>
                  <div className="nav-user-avatar">
                    {user.profilePic ? (
                      <img src={user.profilePic} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      user.username?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="nav-user-name">{user.username}</span>
                  <span className="nav-user-score">{user.totalRatings > 0 ? user.trustScore?.toFixed(1) : 'New'}</span>
                </Link>
              </div>
            </>
          ) : (
            <div className="nav-guest-actions">
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          )}
        </div>
      </nav>

      {user && (
        <nav className="nav-mobile" role="navigation" aria-label="Mobile navigation">
          {navItems.map(({ path, label, icon: Icon }) => {
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
            {user.profilePic ? (
              <img src={user.profilePic} alt="" style={{ width: 19, height: 19, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <User size={19} strokeWidth={location.pathname === '/profile' ? 2.2 : 1.6} />
            )}
            <span>Profile</span>
          </Link>
        </nav>
      )}

      <style>{`
        /* ═══ Desktop Nav ═══ 
           INTERACTION RULES:
           • Links: color transition only (duration-base / ease-smooth)
           • Active: brand underline indicator with glow
           • User pill: border + ring-shadow on hover */
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
          font-size: var(--text-xl); font-weight: 800; letter-spacing: -0.035em;
        }
        .nav-brand-icon {
          width: 30px; height: 30px; border-radius: var(--radius-sm);
          background: linear-gradient(135deg, var(--color-brand), #a78bfa);
          display: flex; align-items: center; justify-content: center;
          color: white;
          box-shadow: 0 2px 12px rgba(99,102,241,0.35),
                      inset 0 1px 0 rgba(255,255,255,0.15);
        }

        /* Links — consistent hover/active timing */
        .nav-links { display: flex; gap: var(--space-1); }
        .nav-link {
          display: flex; align-items: center; gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-sm);
          font-size: var(--text-sm); font-weight: 500;
          color: var(--color-text-muted);
          transition: color var(--duration-base) var(--ease-smooth),
                      background var(--duration-base) var(--ease-smooth);
          position: relative;
          -webkit-tap-highlight-color: transparent;
        }
        .nav-link:hover {
          color: var(--color-text-secondary);
          background: rgba(255,255,255,0.025);
        }
        .nav-link.is-active {
          color: var(--color-text-primary);
          background: var(--color-brand-subtle);
        }
        .nav-link.is-active::after {
          content: ''; position: absolute;
          bottom: -1px; left: 50%; transform: translateX(-50%);
          width: 16px; height: 2px; border-radius: 2px;
          background: var(--color-brand-light);
          box-shadow: 0 0 8px rgba(99,102,241,0.4);
        }

        /* User pill */
        .nav-user {
          display: flex; align-items: center; gap: var(--space-2);
          padding: var(--space-1) var(--space-3) var(--space-1) var(--space-1);
          border-radius: var(--radius-full);
          background: var(--color-surface-2);
          border: 1px solid var(--color-border);
          transition: border-color var(--duration-base) var(--ease-smooth),
                      box-shadow var(--duration-base) var(--ease-smooth);
        }
        .nav-user:hover {
          border-color: var(--color-border-hover);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.04);
        }
        .nav-user-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg, var(--color-brand), var(--color-accent));
          display: flex; align-items: center; justify-content: center;
          font-size: var(--text-xs); font-weight: 700; color: #fff;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.2);
        }
        .nav-user-name {
          font-size: var(--text-sm); font-weight: 500;
          color: var(--color-text-primary);
        }
        .nav-user-score {
          font-size: var(--text-xs); font-weight: 700;
          background: rgba(245,158,11,0.1); color: var(--color-accent-light);
          padding: 2px 7px; border-radius: var(--radius-full);
        }

        .nav-guest-actions {
          display: flex; gap: var(--space-3);
        }

        @media (max-width: 768px) {
          .nav-link-label { display: none; }
          .nav-user { display: none !important; }
          .nav-link { padding: var(--space-2); }
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
          padding: var(--space-1) var(--space-1) calc(var(--space-1) + env(safe-area-inset-bottom));
          justify-content: space-around;
        }
        @media (max-width: 768px) { .nav-mobile { display: flex; } }

        .nav-mobile-item {
          display: flex; flex-direction: column; align-items: center; gap: 2px;
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius);
          font-size: var(--text-xs); font-weight: 600; letter-spacing: 0.03em;
          color: var(--color-text-ghost);
          transition: color var(--duration-base) var(--ease-smooth),
                      background var(--duration-base) var(--ease-smooth);
          text-decoration: none; min-width: 56px;
          -webkit-tap-highlight-color: transparent;
        }
        .nav-mobile-item:active {
          background: rgba(255,255,255,0.03);
        }
        .nav-mobile-item.is-active {
          color: var(--color-brand-light);
          background: var(--color-brand-subtle);
        }
      `}</style>
    </>
  );
}
