import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import TrustBadge from '../components/TrustBadge';
import RatingDistribution from '../components/RatingDistribution';
import ReviewList from '../components/ReviewList';
import { User, Mail, Calendar, Package, ArrowRightLeft, Star, Heart, LogOut, Edit3, Check, X, Loader2, Shield } from 'lucide-react';

const CATEGORIES = ['Electronics','Books','Clothing','Furniture','Sports','Toys','Music','Art','Tools','Automotive','Collectibles','Other'];

export default function ProfilePage() {
  const { user, setUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ items: 0, trades: 0 });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [reviewsData, setReviewsData] = useState({ ratings: [], distribution: {}, total: 0 });
  const [form, setForm] = useState({ username: '', email: '', wishlistCategories: [] });
  const [myItems, setMyItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);

  useEffect(() => {
    if (user) setForm({ username: user.username||'', email: user.email||'', wishlistCategories: user.wishlistCategories||[] });
    const loadStats = async () => {
      try {
        const [i, t, r] = await Promise.all([
          api.get('/items/my'), 
          api.get('/trades'),
          api.get(`/ratings/user/${user._id}`)
        ]);
        setStats({ items: i.data.length, trades: t.data.length });
        setMyItems(i.data);
        setReviewsData(r.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); setItemsLoading(false); }
    };
    if (user) loadStats();
  }, [user]);

  const handleLogout = () => { logout(); navigate('/login'); };
  const handleToggleCategory = (cat) => {
    setForm(prev => ({ ...prev, wishlistCategories: prev.wishlistCategories.includes(cat) ? prev.wishlistCategories.filter(c => c !== cat) : [...prev.wishlistCategories, cat] }));
  };
  const handleSave = async () => {
    setSaving(true); setError('');
    try { const { data } = await api.patch('/auth/profile', form); setUser(data.user); setEditing(false); }
    catch (err) { setError(err.response?.data?.message || 'Failed to update profile'); }
    finally { setSaving(false); }
  };

  if (!user) return null;
  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="page-container fade-in" style={{ paddingTop: 'calc(var(--nav-height) + var(--space-8))', maxWidth: 800 }}>
      {/* Header */}
      <div className="pf-header">
        {!editing && (
          <button onClick={() => setEditing(true)} className="btn btn-ghost btn-sm pf-edit-btn">
            <Edit3 size={14} /> Edit
          </button>
        )}
        <div className="pf-avatar">
          {user.profilePic ? (
            <img src={user.profilePic} alt={user.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            user.username?.charAt(0).toUpperCase()
          )}
        </div>
        <h1 className="page-title" style={{ fontSize: 'var(--text-3xl)' }}>{user.username}</h1>
        <p className="page-subtitle">Member since {joinDate}</p>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="pf-grid">
        {/* Account */}
        <div className="card pf-section">
          <div className="pf-section-header">
            <User size={16} style={{ color: 'var(--color-brand-light)' }} />
            <h2>{editing ? 'Edit Account' : 'Account Details'}</h2>
          </div>

          <div className="pf-fields">
            <div className="pf-field-row">
              <div className="pf-field-icon"><User size={15} /></div>
              <div style={{ flex: 1 }}>
                <p className="pf-field-label">Username</p>
                {editing ? <input className="input" value={form.username} onChange={e => setForm({...form, username: e.target.value})} /> : <p className="pf-field-value">{user.username}</p>}
              </div>
            </div>
            <div className="pf-field-row">
              <div className="pf-field-icon"><Mail size={15} /></div>
              <div style={{ flex: 1 }}>
                <p className="pf-field-label">Email Address</p>
                {editing ? <input className="input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /> : <p className="pf-field-value">{user.email}</p>}
              </div>
            </div>
            {!editing && (
              <div className="pf-field-row">
                <div className="pf-field-icon"><Shield size={15} /></div>
                <div style={{ flex: 1 }}>
                  <p className="pf-field-label">Authentication</p>
                  <p className="pf-field-value">
                    {user.authType === 'google' || user.googleId ? (
                      <span style={{ color: 'var(--color-brand-light)', fontWeight: 600 }}>Google Connected</span>
                    ) : (
                      'Password Protected'
                    )}
                  </p>
                </div>
              </div>
            )}
            {!editing && (
              <div className="pf-field-row">
                <div className="pf-field-icon"><Calendar size={15} /></div>
                <div>
                  <p className="pf-field-label">Date Joined</p>
                  <p className="pf-field-value">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </div>

          {editing ? (
            <div className="pf-actions">
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 size={15} className="animate-spin" /> : <><Check size={15} /> Save</>}
              </button>
              <button className="btn btn-ghost" onClick={() => setEditing(false)} disabled={saving}><X size={15} /> Cancel</button>
            </div>
          ) : (
            <button onClick={handleLogout} className="btn btn-danger pf-logout"><LogOut size={15} /> Log Out</button>
          )}
        </div>

        {/* Trust & Stats */}
        <div className="card pf-section">
          <div className="pf-section-header">
            <Star size={16} style={{ color: 'var(--color-accent)' }} />
            <h2>Trust & Reputation</h2>
          </div>

          <div className="pf-trust-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
              <span style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Trust Score</span>
              <TrustBadge score={user.trustScore} totalRatings={user.totalRatings} isVerified={user.isVerified} />
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Based on {user.totalRatings || 0} community ratings. Maintain a high score by completing fair trades.
            </p>
          </div>

          <div className="pf-stat-grid">
            <div className="pf-stat">
              <Package size={18} style={{ color: 'var(--color-brand-light)' }} />
              <p className="pf-stat-num">{stats.items}</p>
              <p className="pf-stat-label">Items</p>
            </div>
            <div className="pf-stat">
              <ArrowRightLeft size={18} style={{ color: 'var(--color-accent)' }} />
              <p className="pf-stat-num">{stats.trades}</p>
              <p className="pf-stat-label">Trades</p>
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-6)' }}>
            <p className="pf-field-label" style={{ marginBottom: 12 }}>Review Distribution</p>
            <RatingDistribution distribution={reviewsData.distribution} total={reviewsData.total} />
          </div>
        </div>
      </div>

      {/* My Items Section */}
      <div className="card pf-section" style={{ marginTop: 'var(--space-6)' }}>
        <div className="pf-section-header">
          <Package size={16} style={{ color: 'var(--color-brand-light)' }} />
          <h2>My Listings</h2>
        </div>
        {itemsLoading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="animate-spin" /></div>
        ) : myItems.length === 0 ? (
          <div className="pf-empty-items">
            <Package size={32} opacity={0.2} />
            <p>You haven't listed any items yet.</p>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/list')}>List New Item</button>
          </div>
        ) : (
          <div className="pf-items-grid">
            {myItems.map(item => (
              <div key={item._id} className="pf-item-wrapper">
                <img src={getImageUrl(item.images?.[0])} alt={item.title} />
                <div className="pf-item-info">
                  <p className="pf-item-title">{item.title}</p>
                  <div className="pf-item-meta">
                    <span className={`badge badge-sm ${item.status === 'available' ? 'badge-brand' : 'badge-neutral'}`}>{item.status}</span>
                    <span>{item.swapPointValue} pts</span>
                  </div>
                </div>
                <button className="pf-item-action" onClick={() => navigate(`/items/${item._id}`)}>View</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feedback Section */}
      <div className="card pf-section" style={{ marginTop: 'var(--space-6)' }}>
        <div className="pf-section-header">
          <Star size={16} style={{ color: 'var(--color-accent)' }} />
          <h2>Community Feedback</h2>
        </div>
        <ReviewList reviews={reviewsData.ratings} />
      </div>

      {/* Wishlist */}
      <div className="card pf-section" style={{ marginTop: 'var(--space-6)' }}>
        <div className="pf-section-header">
          <Heart size={16} style={{ color: '#f472b6' }} />
          <h2>Wishlist Categories</h2>
        </div>
        {editing ? (
          <div className="pf-wish-grid">
            {CATEGORIES.map(cat => {
              const active = form.wishlistCategories.includes(cat);
              return (
                <button key={cat} onClick={() => handleToggleCategory(cat)}
                  className={`pf-wish-chip ${active ? 'pf-wish-active' : ''}`}>{cat}</button>
              );
            })}
          </div>
        ) : (
          <div className="pf-wish-grid">
            {user.wishlistCategories?.length > 0 ? user.wishlistCategories.map((cat, i) => (
              <span key={i} className="badge badge-brand" style={{ padding: '6px 14px', fontSize: 'var(--text-sm)' }}>{cat}</span>
            )) : <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-muted)' }}>No categories selected yet.</p>}
          </div>
        )}
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-ghost)', marginTop: 'var(--space-5)' }}>
          These categories help our AI Smart Match engine find the best items for you.
        </p>
      </div>

      <style>{`
        .pf-header { text-align: center; margin-bottom: var(--space-10); position: relative; }
        .pf-edit-btn { position: absolute; top: 0; right: 0; }
        .pf-avatar {
          width: 96px; height: 96px; border-radius: 50%; margin: 0 auto var(--space-5);
          background: linear-gradient(135deg, var(--color-brand), var(--color-accent));
          display: flex; align-items: center; justify-content: center;
          font-size: 2.4rem; font-weight: 800; color: #fff;
          box-shadow: 0 0 40px rgba(99,102,241,0.2), inset 0 2px 0 rgba(255,255,255,0.15);
        }

        .pf-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-6);
        }
        .pf-section { padding: var(--space-6); }
        .pf-section-header {
          display: flex; align-items: center; gap: var(--space-2);
          margin-bottom: var(--space-6);
        }
        .pf-section-header h2 { font-size: var(--text-lg); font-weight: 600; }

        .pf-fields { display: flex; flex-direction: column; gap: var(--space-5); }
        .pf-field-row { display: flex; align-items: flex-start; gap: var(--space-3); }
        .pf-field-icon {
          width: 36px; height: 36px; border-radius: var(--radius-sm); flex-shrink: 0;
          background: rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: center;
          color: var(--color-text-secondary);
        }
        .pf-field-label { font-size: var(--text-xs); color: var(--color-text-ghost); margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }
        .pf-field-value { font-size: var(--text-md); font-weight: 500; }

        .pf-actions { display: flex; gap: var(--space-3); margin-top: var(--space-6); }
        .pf-logout { width: 100%; margin-top: var(--space-6); justify-content: center; }

        .pf-trust-card {
          background: rgba(245,158,11,0.03); border: 1px solid rgba(245,158,11,0.08);
          border-radius: var(--radius); padding: var(--space-4) var(--space-5);
          margin-bottom: var(--space-6);
        }

        .pf-stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
        .pf-stat {
          padding: var(--space-4); background: rgba(255,255,255,0.02);
          border-radius: var(--radius); text-align: center;
        }
        .pf-stat-num { font-size: var(--text-xl); font-weight: 700; margin-top: var(--space-2); }
        .pf-stat-label {
          font-size: var(--text-xs); color: var(--color-text-ghost);
          text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600;
        }

        .pf-wish-grid { display: flex; flex-wrap: wrap; gap: var(--space-2); }
        .pf-wish-chip {
          padding: 7px 16px; border-radius: var(--radius-full);
          font-size: var(--text-sm); font-weight: 500; cursor: pointer;
          background: rgba(255,255,255,0.03); color: var(--color-text-secondary);
          border: 1px solid var(--color-border);
          transition: all var(--duration-fast) var(--ease-smooth);
        }
        .pf-wish-chip:hover { border-color: var(--color-border-hover); }
        .pf-wish-active {
          background: rgba(99,102,241,0.1); color: var(--color-brand-light);
          border-color: rgba(99,102,241,0.25);
        }

        .pf-empty-items { text-align: center; padding: 40px; display: flex; flex-direction: column; align-items: center; gap: 12px; color: var(--color-text-ghost); }
        
        .pf-items-grid { display: flex; flex-direction: column; gap: 12px; }
        .pf-item-wrapper {
          display: flex; align-items: center; gap: 16px; padding: 12px;
          background: rgba(255,255,255,0.03); border-radius: var(--radius-lg);
          border: 1px solid var(--color-border-subtle);
        }
        .pf-item-wrapper img { width: 50px; height: 50px; border-radius: var(--radius-sm); object-fit: cover; }
        .pf-item-info { flex: 1; }
        .pf-item-title { font-weight: 600; font-size: 0.9rem; margin-bottom: 4px; }
        .pf-item-meta { display: flex; align-items: center; gap: 12px; font-size: 0.75rem; color: var(--color-text-ghost); }
        .pf-item-action { background: none; border: 1px solid var(--color-border); color: var(--color-text-primary); padding: 4px 12px; border-radius: var(--radius-sm); font-size: 0.8rem; cursor: pointer; transition: all 0.2s; }
        .pf-item-action:hover { background: var(--color-surface-3); border-color: var(--color-border-hover); }
      `}</style>
    </div>
  );
}
