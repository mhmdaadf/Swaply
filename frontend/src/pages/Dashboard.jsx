import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import ItemCard from '../components/ItemCard';
import TrustBadge from '../components/TrustBadge';
import ListingWizard from '../components/ListingWizard';
import { SkeletonCard } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { Package, ArrowRightLeft, Sparkles, TrendingUp, PlusCircle, Wand2 } from 'lucide-react';

const STAT_CARDS = [
  { key: 'listings', label: 'My Listings', icon: Package, color: '#818cf8', bg: 'rgba(129,140,248,0.06)', border: 'rgba(129,140,248,0.08)' },
  { key: 'trades', label: 'Active Trades', icon: ArrowRightLeft, color: '#f59e0b', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.08)' },
  { key: 'matches', label: 'Matches Found', icon: Sparkles, color: '#22c55e', bg: 'rgba(34,197,94,0.06)', border: 'rgba(34,197,94,0.08)' },
  { key: 'trust', label: 'Trust Score', icon: TrendingUp, color: '#f472b6', bg: 'rgba(244,114,182,0.06)', border: 'rgba(244,114,182,0.08)' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [myItems, setMyItems] = useState([]);
  const [stats, setStats] = useState({ trades: 0, matches: 0 });
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  const handleWizardComplete = (rec) => {
    setShowWizard(false);
    navigate('/items/new', { state: { prefill: rec } });
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [i, t, m] = await Promise.all([api.get('/items/my'), api.get('/trades'), api.get('/matches')]);
        setMyItems(i.data);
        setStats({ trades: t.data.length, matches: m.data.length });
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const vals = {
    listings: myItems.length,
    trades: stats.trades,
    matches: stats.matches,
    trust: user?.trustScore?.toFixed(1) || '5.0',
  };

  return (
    <div className="page-container fade-in" style={{ paddingTop: 'calc(var(--nav-height) + var(--space-8))' }}>
      {/* Header */}
      <div className="dash-header">
        <div>
          <p className="dash-greeting">Welcome back</p>
          <h1 className="page-title">{user?.username}</h1>
          <div style={{ marginTop: 'var(--space-3)' }}><TrustBadge score={user?.trustScore} isVerified={user?.isVerified} /></div>
        </div>
        <div className="dash-actions">
          <button className="btn dash-ai-btn" onClick={() => setShowWizard(true)}>
            <Wand2 size={15} /> Smart AI List
          </button>
          <Link to="/items/new" className="btn btn-primary">
            <PlusCircle size={15} /> New Listing
          </Link>
        </div>
      </div>

      {showWizard && <ListingWizard onClose={() => setShowWizard(false)} onComplete={handleWizardComplete} />}

      {/* Stats Grid */}
      <div className="dash-stats">
        {STAT_CARDS.map(({ key, label, icon: Icon, color, bg, border }) => (
          <div key={key} className="dash-stat-card" style={{ '--stat-color': color, '--stat-bg': bg, '--stat-border': border }}>
            <div className="dash-stat-info">
              <p className="dash-stat-label">{label}</p>
              <p className="dash-stat-value">{vals[key]}</p>
            </div>
            <div className="dash-stat-icon">
              <Icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* My Listings */}
      <div>
        <h2 className="section-title">My Listings</h2>
        {loading ? (
          <div className="dash-grid">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : myItems.length === 0 ? (
          <EmptyState 
            type="items" 
            title="No listings yet" 
            desc="List your first item to start swapping with the community." 
            actionLabel="List Your First Item" 
            actionLink="/items/new" 
          />
        ) : (
          <div className="dash-grid">
            {myItems.map(item => <ItemCard key={item._id} item={item} showOwner={false} />)}
          </div>
        )}
      </div>

      <style>{`
        /* ═══ Dashboard — Interaction Rules ═══
           Stat cards: translateY(-2px) + border-color shift on hover
           AI btn: glow box-shadow on hover (not transform)
           Stat values: colored by CSS custom property per-card */
        .dash-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          flex-wrap: wrap; gap: var(--space-4); margin-bottom: var(--space-10);
        }
        .dash-greeting {
          font-size: var(--text-sm); color: var(--color-text-ghost);
          font-weight: 600; margin-bottom: var(--space-1);
          text-transform: uppercase; letter-spacing: 0.08em;
        }
        .dash-actions { display: flex; gap: var(--space-2); align-items: center; }
        .dash-ai-btn {
          background: rgba(167, 139, 250, 0.06); color: #a78bfa;
          border: 1px solid rgba(167, 139, 250, 0.12);
        }
        .dash-ai-btn:hover {
          background: rgba(167, 139, 250, 0.1);
          border-color: rgba(167, 139, 250, 0.2);
          box-shadow: 0 0 20px rgba(167,139,250,0.08);
        }

        /* Stats — GPU-safe: only transform + box-shadow + border-color animate */
        .dash-stats {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: var(--space-4); margin-bottom: var(--space-12);
        }
        .dash-stat-card {
          background: var(--color-surface-3); border: 1px solid var(--stat-border);
          border-radius: var(--radius-lg); padding: var(--space-5) var(--space-6);
          display: flex; justify-content: space-between; align-items: flex-start;
          transition: transform var(--duration-base) var(--ease-out),
                      border-color var(--duration-base) var(--ease-smooth),
                      box-shadow var(--duration-slow) var(--ease-smooth);
          position: relative; overflow: hidden;
        }
        .dash-stat-card::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(circle at top right, var(--stat-bg) 0%, transparent 60%);
          pointer-events: none;
        }
        .dash-stat-card:hover {
          border-color: var(--stat-color);
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          transform: translateY(-2px);
        }
        .dash-stat-info { position: relative; z-index: 1; }
        .dash-stat-label {
          font-size: var(--text-sm); color: var(--color-text-muted);
          font-weight: 500; margin-bottom: var(--space-2);
        }
        .dash-stat-value {
          font-size: var(--text-2xl); font-weight: 800; color: var(--stat-color);
          letter-spacing: -0.03em; line-height: 1;
        }
        .dash-stat-icon {
          width: 44px; height: 44px; border-radius: var(--radius);
          background: var(--stat-bg); color: var(--stat-color);
          display: flex; align-items: center; justify-content: center;
          position: relative; z-index: 1;
        }

        .dash-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--space-5);
        }

        @media (max-width: 1024px) {
          .dash-stats { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .dash-stats { grid-template-columns: 1fr; }
          .dash-actions { width: 100%; }
          .dash-actions .btn { flex: 1; justify-content: center; }
        }
      `}</style>
    </div>
  );
}
