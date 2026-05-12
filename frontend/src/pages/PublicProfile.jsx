import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import TrustBadge from '../components/TrustBadge';
import RatingDistribution from '../components/RatingDistribution';
import ReviewList from '../components/ReviewList';
import ItemCard from '../components/ItemCard';
import { 
  Package, ArrowRightLeft, Star, Calendar, 
  ShieldCheck, Loader2, MessageCircle, Flag 
} from 'lucide-react';
import ReportModal from '../components/ReportModal';

export default function PublicProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [reviewsData, setReviewsData] = useState({ ratings: [], distribution: {}, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [uRes, iRes, rRes] = await Promise.all([
        api.get(`/auth/users/${id}`),
        api.get(`/items/user/${id}`),
        api.get(`/ratings/user/${id}`)
      ]);
      setUser(uRes.data);
      setItems(iRes.data.filter(i => i.status === 'available'));
      setReviewsData(rRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="page-container" style={{ paddingTop: '100px', textAlign: 'center' }}>
      <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto', color: 'var(--color-brand-light)' }} />
    </div>
  );

  if (!user) return <div className="page-container">User not found</div>;

  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const swapSuccessRate = user.completedTrades + user.cancelledTrades > 0 
    ? Math.round((user.completedTrades / (user.completedTrades + user.cancelledTrades)) * 100) 
    : 100;

  return (
    <div className="page-container fade-in" style={{ paddingTop: 'calc(var(--nav-height) + var(--space-8))' }}>
      <div className="pp-grid">
        {/* Left Column: Profile Card & Stats */}
        <div className="pp-sidebar">
          <div className="card pp-profile-card">
            <div className="pp-avatar-wrap">
              <div className="pp-avatar">
                {user.profilePic ? <img src={user.profilePic} alt={user.username} /> : user.username.charAt(0).toUpperCase()}
              </div>
              {user.isVerified && (
                <div className="pp-verified-badge" title="Verified Trader">
                  <ShieldCheck size={16} />
                </div>
              )}
            </div>
            
            <h1 className="pp-username">{user.username}</h1>
            <div className="pp-badge-wrap">
              <TrustBadge score={user.trustScore} isVerified={user.isVerified} size="lg" />
            </div>

            <div className="pp-meta-rows">
              <div className="pp-meta-item">
                <Calendar size={14} />
                <span>Joined {joinDate}</span>
              </div>
            </div>

            <div className="pp-actions">
              <button className="btn btn-primary" style={{ width: '100%' }}>
                <MessageCircle size={16} /> Send Message
              </button>
              <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 8 }} onClick={() => setShowReport(true)}>
                <Flag size={14} /> Report User
              </button>
            </div>
          </div>

          <div className="card pp-stats-card">
            <h3>Reputation Stats</h3>
            <div className="pp-stat-grid">
              <div className="pp-stat">
                <p className="pp-stat-val">{user.completedTrades}</p>
                <p className="pp-stat-label">Swaps</p>
              </div>
              <div className="pp-stat">
                <p className="pp-stat-val">{swapSuccessRate}%</p>
                <p className="pp-stat-label">Success Rate</p>
              </div>
              <div className="pp-stat">
                <p className="pp-stat-val">{user.totalRatings}</p>
                <p className="pp-stat-label">Reviews</p>
              </div>
            </div>
            
            <div className="pp-dist-wrap">
              <p className="pp-dist-title">Review Distribution</p>
              <RatingDistribution distribution={reviewsData.distribution} total={reviewsData.total} />
            </div>
          </div>
        </div>

        {/* Right Column: Listings & Reviews */}
        <div className="pp-main">
          <div className="pp-tabs">
            <button className="pp-tab active">Items ({items.length})</button>
            <button className="pp-tab">Reviews ({reviewsData.total})</button>
          </div>

          <div className="pp-section">
            <h2 className="section-title">Available Items</h2>
            {items.length === 0 ? (
              <p className="pp-empty">This user has no active listings.</p>
            ) : (
              <div className="pp-items-grid">
                {items.map(item => <ItemCard key={item._id} item={item} showOwner={false} />)}
              </div>
            )}
          </div>

          <div className="pp-section" style={{ marginTop: 48 }}>
            <h2 className="section-title">Community Feedback</h2>
            <ReviewList reviews={reviewsData.ratings} />
          </div>
        </div>
      </div>

      {showReport && (
        <ReportModal 
          targetType="User" 
          targetId={user._id} 
          targetName={user.username} 
          onClose={() => setShowReport(false)} 
        />
      )}

      <style>{`
        .pp-grid { display: grid; grid-template-columns: 320px 1fr; gap: 32px; align-items: start; }
        
        .pp-profile-card { padding: 32px; text-align: center; }
        .pp-avatar-wrap { position: relative; width: 100px; height: 100px; margin: 0 auto 20px; }
        .pp-avatar {
          width: 100%; height: 100%; border-radius: 50%;
          background: linear-gradient(135deg, var(--color-brand), var(--color-accent));
          display: flex; align-items: center; justify-content: center;
          font-size: 2.5rem; font-weight: 800; color: #fff;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2); overflow: hidden;
        }
        .pp-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .pp-verified-badge {
          position: absolute; bottom: 0; right: 0;
          background: var(--color-brand-light); color: #fff;
          width: 28px; height: 28px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          border: 3px solid #07070c; box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }
        
        .pp-username { font-size: 1.5rem; font-weight: 800; margin: 0 0 12px; }
        .pp-badge-wrap { display: flex; justify-content: center; margin-bottom: 24px; }
        
        .pp-meta-rows { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
        .pp-meta-item {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          color: var(--color-text-ghost); font-size: 0.85rem;
        }
        
        .pp-stats-card { padding: 24px; margin-top: 24px; }
        .pp-stats-card h3 { font-size: 1rem; font-weight: 700; margin-bottom: 20px; }
        .pp-stat-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 24px; }
        .pp-stat { text-align: center; }
        .pp-stat-val { font-size: 1.2rem; font-weight: 800; color: var(--color-text-primary); margin: 0; }
        .pp-stat-label { font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-ghost); letter-spacing: 0.05em; font-weight: 600; }
        
        .pp-dist-title { font-size: 0.8rem; font-weight: 600; color: var(--color-text-muted); margin-bottom: 12px; text-transform: uppercase; }
        
        .pp-tabs { display: flex; gap: 32px; border-bottom: 1px solid var(--color-border-subtle); margin-bottom: 32px; }
        .pp-tab {
          background: none; border: none; padding: 12px 0; font-weight: 600;
          color: var(--color-text-ghost); cursor: pointer; border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }
        .pp-tab.active { color: var(--color-brand-light); border-bottom-color: var(--color-brand-light); }
        
        .pp-items-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
        }
        .pp-empty { padding: 40px; text-align: center; color: var(--color-text-ghost); background: rgba(255,255,255,0.02); border-radius: var(--radius-lg); }

        @media (max-width: 900px) {
          .pp-grid { grid-template-columns: 1fr; }
          .pp-sidebar { width: 100%; max-width: 400px; margin: 0 auto; }
        }
      `}</style>
    </div>
  );
}
