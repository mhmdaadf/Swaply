import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import ItemCard from '../components/ItemCard';
import TrustBadge from '../components/TrustBadge';
import ListingWizard from '../components/ListingWizard';
import { Package, ArrowRightLeft, Sparkles, TrendingUp, PlusCircle, Wand2 } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [myItems, setMyItems] = useState([]);
  const [stats, setStats] = useState({ trades: 0, matches: 0 });
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  const handleWizardComplete = (recommendation) => {
    setShowWizard(false);
    // Navigate to NewItemPage with prefilled state
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

  const statCards = [
    { label: 'My Listings', value: myItems.length, icon: Package, color: '#818cf8', bg: 'rgba(129,140,248,0.1)' },
    { label: 'Active Trades', value: stats.trades, icon: ArrowRightLeft, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Matches Found', value: stats.matches, icon: Sparkles, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    { label: 'Trust Score', value: user?.trustScore?.toFixed(1) || '5.0', icon: TrendingUp, color: '#f472b6', bg: 'rgba(244,114,182,0.1)' },
  ];

  return (
    <div className="page-container fade-in" style={{ paddingTop: 84 }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Welcome back, {user?.username}</h1>
          <div style={{ marginTop: 8 }}>
            <TrustBadge score={user?.trustScore} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            className="btn" 
            style={{ 
              background: 'rgba(167, 139, 250, 0.1)', 
              color: '#a78bfa', 
              border: '1px solid rgba(167, 139, 250, 0.3)',
              display: 'flex', alignItems: 'center', gap: 8
            }}
            onClick={() => setShowWizard(true)}
          >
            <Wand2 size={16} /> Smart AI List
          </button>
          <Link to="/items/new" className="btn btn-primary">
            <PlusCircle size={16} /> Manual List
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
        gap: 16, marginBottom: 40,
      }}>
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>{label}</p>
                <p style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{value}</p>
              </div>
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--radius)',
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
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 20 }}>My Listings</h2>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 300 }} />)}
          </div>
        ) : myItems.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <Package size={40} style={{ color: 'var(--color-text-muted)', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}>You have not listed any items yet</p>
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
