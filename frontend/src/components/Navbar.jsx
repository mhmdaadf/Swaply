import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard, Search, ArrowRightLeft, MessageSquare,
  PlusCircle, LogOut, Sparkles, User,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/explore', label: 'Explore', icon: Search },
  { path: '/matches', label: 'Matches', icon: Sparkles },
  { path: '/trades', label: 'Trades', icon: ArrowRightLeft },
  { path: '/estimator', label: 'Estimator', icon: MessageSquare },
];

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="glass" style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      borderBottom: '1px solid var(--color-border)',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 20px',
        height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/dashboard" style={{
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

        {/* User + Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to="/items/new" className="btn btn-primary btn-sm">
            <PlusCircle size={14} /> List Item
          </Link>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 12px', borderRadius: 'var(--radius)',
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
          }}>
            <User size={14} style={{ color: 'var(--color-brand-light)' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{user.username}</span>
            <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>
              {user.trustScore?.toFixed(1)}
            </span>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Logout">
            <LogOut size={14} />
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .nav-label { display: none; }
        }
      `}</style>
    </nav>
  );
}
