import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import TrustBadge from '../components/TrustBadge';
import { User, Mail, Calendar, Package, ArrowRightLeft, Star, Heart, Settings, LogOut, Edit3, Check, X, Loader2 } from 'lucide-react';

const CATEGORIES = ['Electronics','Books','Clothing','Furniture','Sports','Toys','Music','Art','Tools','Automotive','Collectibles','Other'];

export default function ProfilePage() {
  const { user, setUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ items: 0, trades: 0 });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    username: '',
    email: '',
    wishlistCategories: []
  });

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || '',
        email: user.email || '',
        wishlistCategories: user.wishlistCategories || []
      });
    }
    
    const loadStats = async () => {
      try {
        const [itemsRes, tradesRes] = await Promise.all([
          api.get('/items/my'),
          api.get('/trades'),
        ]);
        setStats({
          items: itemsRes.data.length,
          trades: tradesRes.data.length,
        });
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleToggleCategory = (cat) => {
    setForm(prev => ({
      ...prev,
      wishlistCategories: prev.wishlistCategories.includes(cat)
        ? prev.wishlistCategories.filter(c => c !== cat)
        : [...prev.wishlistCategories, cat]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const { data } = await api.patch('/auth/profile', form);
      setUser(data.user);
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="page-container fade-in" style={{ paddingTop: 'calc(var(--nav-height) + 24px)', maxWidth: 800 }}>
      <div className="page-header" style={{ textAlign: 'center', marginBottom: 40, position: 'relative' }}>
        {!editing && (
          <button 
            onClick={() => setEditing(true)}
            className="btn btn-secondary btn-sm" 
            style={{ position: 'absolute', top: 0, right: 0 }}
          >
            <Edit3 size={14} /> Edit Profile
          </button>
        )}
        <div style={{
          width: 100, height: 100, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-brand), var(--color-accent))',
          margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.5rem', fontWeight: 800, color: '#fff',
          boxShadow: '0 0 30px rgba(99, 102, 241, 0.3)',
        }}>
          {user.username?.charAt(0).toUpperCase()}
        </div>
        <h1 className="page-title" style={{ fontSize: '2.25rem' }}>{user.username}</h1>
        <p className="page-subtitle">Member since {joinDate}</p>
      </div>

      {error && <div style={{ padding: '10px 14px', borderRadius: 'var(--radius)', background: 'rgba(239,68,68,0.1)', color: 'var(--color-error)', fontSize: '0.85rem', marginBottom: 24, border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        {/* Account Info */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Settings size={18} style={{ color: 'var(--color-brand-light)' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{editing ? 'Edit Account' : 'Account Details'}</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius)', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={16} style={{ color: 'var(--color-text-secondary)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Username</p>
                {editing ? (
                  <input className="input input-sm" value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
                ) : (
                  <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user.username}</p>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius)', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={16} style={{ color: 'var(--color-text-secondary)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Email Address</p>
                {editing ? (
                  <input className="input input-sm" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                ) : (
                  <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user.email}</p>
                )}
              </div>
            </div>

            {!editing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius)', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={16} style={{ color: 'var(--color-text-secondary)' }} />
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Date Joined</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </div>

          {editing ? (
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <><Check size={16} /> Save</>}
              </button>
              <button className="btn btn-secondary" onClick={() => setEditing(false)} disabled={saving}>
                <X size={16} /> Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: 24, justifyContent: 'center', color: 'var(--color-error)' }}
            >
              <LogOut size={16} /> Log Out
            </button>
          )}
        </div>

        {/* Reputation & Stats */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Star size={18} style={{ color: 'var(--color-accent)' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Trust & Reputation</h2>
          </div>

          <div style={{ background: 'rgba(245, 158, 11, 0.05)', padding: 16, borderRadius: 'var(--radius)', marginBottom: 24, border: '1px solid rgba(245, 158, 11, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Trust Score</span>
              <TrustBadge score={user.trustScore} />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Based on {user.totalRatings || 0} community ratings. Maintain a high score by completing fair trades.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
              <Package size={20} style={{ color: 'var(--color-brand-light)', marginBottom: 8, margin: '0 auto' }} />
              <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.items}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items</p>
            </div>
            <div style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
              <ArrowRightLeft size={20} style={{ color: 'var(--color-accent)', marginBottom: 8, margin: '0 auto' }} />
              <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.trades}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trades</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wishlist Categories */}
      <div className="card" style={{ padding: 24, marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <Heart size={18} style={{ color: '#f472b6' }} />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Wishlist Categories</h2>
        </div>
        
        {editing ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => handleToggleCategory(cat)}
                className={`badge ${form.wishlistCategories.includes(cat) ? 'badge-brand' : 'badge-neutral'}`}
                style={{ cursor: 'pointer', border: 'none', padding: '6px 14px' }}
              >
                {cat}
              </button>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {user.wishlistCategories?.length > 0 ? (
              user.wishlistCategories.map((cat, i) => (
                <span key={i} className="badge badge-brand" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                  {cat}
                </span>
              ))
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>No categories selected yet.</p>
            )}
          </div>
        )}
        
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 16 }}>
          These categories help our AI Smart Match engine find the best items for you.
        </p>
      </div>
    </div>
  );
}
