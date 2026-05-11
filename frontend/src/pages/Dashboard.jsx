import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import ItemCard from '../components/ItemCard';
import TrustBadge from '../components/TrustBadge';
import ListingWizard from '../components/ListingWizard';
import { Package, ArrowRightLeft, Sparkles, TrendingUp, PlusCircle, Wand2 } from 'lucide-react';

const STAT_CARDS = [
  { key: 'listings', label: 'My Listings', icon: Package, color: '#818cf8', bg: 'rgba(129,140,248,0.08)' },
  { key: 'trades', label: 'Active Trades', icon: ArrowRightLeft, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  { key: 'matches', label: 'Matches Found', icon: Sparkles, color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
  { key: 'trust', label: 'Trust Score', icon: TrendingUp, color: '#f472b6', bg: 'rgba(244,114,182,0.08)' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [myItems, setMyItems] = useState([]);
  const [stats, setStats] = useState({ trades: 0, matches: 0 });
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  const handleWizardComplete = (recommendation) => {
    setShowWizard(false);
    navigate('/items/new', { state: { prefill: recommendation } });
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [itemsRes, tradesRes, matchesRes] = await Promise.all([
          api.get('/items/my'),
          api.get('/trades'),
          api.get('/matches'),
        ]);
        setMyItems(itemsRes.data);
        setStats({
          trades: tradesRes.data.length,
          matches: matchesRes.data.length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statValues = {
    listings: myItems.length,
    trades: stats.trades,
    matches: stats.matches,
    trust: user?.trustScore?.toFixed(1) || '5.0',
  };

  return (
    <div className="page-container fade-in" style={{ paddingTop: 'calc(var(--nav-height) + 24px)' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 4, fontWeight: 500 }}>Welcome back</p>
          <h1 className="page-title">{user?.username}</h1>
          <div style={{ marginTop: 10 }}>
            <TrustBadge score={user?.trustScore} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn"
            style={{
              background: 'rgba(167, 139, 250, 0.08)',
              color: '#a78bfa',
              border: '1px solid rgba(167, 139, 250, 0.2)',
            }}
            onClick={() => setShowWizard(true)}
          >
            <Wand2 size={16} /> Smart AI List
          </button>
          <Link to="/items/new" className="btn btn-primary">
            <PlusCircle size={16} /> New Listing
          </Link>
        </div>
      </div>

      {showWizard && (
        <ListingWizard
          onClose={() => setShowWizard(false)}
          onComplete={handleWizardComplete}
        />
      )}

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 14, marginBottom: 40,
      }}>
        {STAT_CARDS.map(({ key, label, icon: Icon, color, bg }) => (
          <div key={key} className="card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6, fontWeight: 500 }}>{label}</p>
                <p style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color }}>{statValues[key]}</p>
              </div>
              <div style={{
                width: 42, height: 42, borderRadius: 'var(--radius)',
                background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={20} style={{ color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* My Items */}
      <div>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 20, letterSpacing: '-0.01em' }}>My Listings</h2>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 300 }} />)}
          </div>
        ) : myItems.length === 0 ? (
          <div className="card" style={{ padding: '48px 32px', textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, margin: '0 auto 16px', borderRadius: '50%',
              background: 'rgba(99,102,241,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Package size={28} style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <p style={{ color: 'var(--color-text-secondary)', fontWeight: 600, marginBottom: 6 }}>No listings yet</p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>List your first item to start swapping</p>
            <Link to="/items/new" className="btn btn-primary">List Your First Item</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {myItems.map(item => <ItemCard key={item._id} item={item} showOwner={false} />)}
          </div>
        )}
      </div>
    </div>
  );
}
