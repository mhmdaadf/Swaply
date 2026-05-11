import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import TrustBadge from '../components/TrustBadge';
import { Tag, ArrowRight, Calendar, DollarSign, Sparkles, ArrowRightLeft } from 'lucide-react';
import { getImageUrl } from '../lib/utils';

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/items/${id}`).then(r => setItem(r.data)).catch(() => navigate('/explore')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-container" style={{ paddingTop: 'calc(var(--nav-height) + var(--space-8))' }}><div className="skeleton" style={{ height: 400 }} /></div>;
  if (!item) return null;

  const isOwner = user?._id === item.owner?._id;
  const placeholder = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" fill="%2312121e"><rect width="600" height="400"/><text x="50%" y="50%" fill="%233c3c52" font-size="18" text-anchor="middle" dy=".3em" font-family="system-ui">No Image</text></svg>');

  return (
    <div className="page-container fade-in" style={{ paddingTop: 'calc(var(--nav-height) + var(--space-8))' }}>
      <div className="id-grid">
        {/* Image */}
        <div className="id-image-wrap">
          <img src={getImageUrl(item.images?.[0]) || placeholder} alt={item.title} loading="lazy" />
        </div>

        {/* Details */}
        <div className="id-details">
          <div className="id-badges">
            <span className="badge badge-brand"><Tag size={10} /> {item.category}</span>
            <span className="badge badge-neutral">{item.condition}</span>
            <span className={`badge ${item.status === 'available' ? 'badge-success' : 'badge-error'}`}>{item.status}</span>
          </div>

          <h1 className="id-title">{item.title}</h1>
          <p className="id-desc">{item.description || 'No description provided.'}</p>

          {/* Value Card */}
          <div className="id-value-card">
            <div className="id-value-grid">
              <div className="id-value-item">
                <p className="id-value-label">Swap Value</p>
                <p className="id-value-main">
                  <Sparkles size={16} style={{ color: 'var(--color-accent)' }} />
                  {item.swapPointValue} <span className="id-value-unit">pts</span>
                </p>
              </div>
              <div className="id-value-item">
                <p className="id-value-label">Original Price</p>
                <p className="id-value-secondary"><DollarSign size={14} />{item.originalPrice}</p>
              </div>
              <div className="id-value-item">
                <p className="id-value-label">Item Age</p>
                <p className="id-value-secondary"><Calendar size={14} />{item.ageMonths} months</p>
              </div>
            </div>
          </div>

          {/* Desired Items */}
          {item.desiredItems?.length > 0 && (
            <div className="id-desired">
              <p className="id-desired-label">Looking for:</p>
              <div className="id-desired-tags">
                {item.desiredItems.map((d, i) => <span key={i} className="badge badge-brand"><ArrowRight size={10} /> {d}</span>)}
              </div>
            </div>
          )}

          {/* Owner Card */}
          {item.owner && !isOwner && (
            <div className="id-owner-card">
              <div className="id-owner-info">
                <div className="id-owner-avatar">{item.owner.username?.charAt(0).toUpperCase()}</div>
                <div>
                  <p className="id-owner-name">{item.owner.username}</p>
                  <TrustBadge score={item.owner.trustScore} size="sm" />
                </div>
              </div>
            </div>
          )}

          {/* Trade CTA */}
          {!isOwner && item.status === 'available' && (
            <button className="btn btn-accent btn-lg id-trade-btn"
              onClick={() => navigate(`/trades/new?receiverId=${item.owner._id}&requestedItem=${item._id}`)}>
              <ArrowRightLeft size={18} /> Propose a Trade
            </button>
          )}
        </div>
      </div>

      <style>{`
        .id-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-10);
          align-items: start;
        }
        .id-image-wrap {
          border-radius: var(--radius-xl); overflow: hidden;
          background: var(--color-surface-2); aspect-ratio: 4/3;
          border: 1px solid var(--color-border-subtle);
        }
        .id-image-wrap img { width: 100%; height: 100%; object-fit: cover; }

        .id-badges { display: flex; gap: var(--space-2); margin-bottom: var(--space-4); flex-wrap: wrap; }
        .id-title { font-size: var(--text-xl); font-weight: 700; margin-bottom: var(--space-3); letter-spacing: -0.02em; }
        .id-desc { color: var(--color-text-secondary); font-size: var(--text-md); line-height: 1.7; margin-bottom: var(--space-6); }

        /* Value Card */
        .id-value-card {
          background: var(--color-surface-2); border: 1px solid var(--color-border);
          border-radius: var(--radius-lg); padding: var(--space-5) var(--space-6);
          margin-bottom: var(--space-6);
        }
        .id-value-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-4); }
        .id-value-item { }
        .id-value-label {
          font-size: var(--text-xs); color: var(--color-text-ghost);
          text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600;
          margin-bottom: var(--space-2);
        }
        .id-value-main {
          font-size: var(--text-xl); font-weight: 800; color: var(--color-accent);
          display: flex; align-items: center; gap: var(--space-2);
        }
        .id-value-unit { font-size: var(--text-base); font-weight: 600; opacity: 0.7; }
        .id-value-secondary {
          font-size: var(--text-md); font-weight: 600;
          display: flex; align-items: center; gap: var(--space-1);
        }

        /* Desired */
        .id-desired { margin-bottom: var(--space-6); }
        .id-desired-label {
          font-size: var(--text-sm); color: var(--color-text-muted);
          margin-bottom: var(--space-2); font-weight: 500;
        }
        .id-desired-tags { display: flex; gap: var(--space-2); flex-wrap: wrap; }

        /* Owner */
        .id-owner-card {
          background: var(--color-surface-2); border: 1px solid var(--color-border);
          border-radius: var(--radius-lg); padding: var(--space-4) var(--space-5);
          margin-bottom: var(--space-6);
        }
        .id-owner-info { display: flex; align-items: center; gap: var(--space-3); }
        .id-owner-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: linear-gradient(135deg, var(--color-brand), var(--color-accent));
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; color: #fff; font-size: var(--text-base);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .id-owner-name { font-weight: 600; font-size: var(--text-md); margin-bottom: 2px; }

        .id-trade-btn { width: 100%; }

        @media (max-width: 768px) {
          .id-grid { grid-template-columns: 1fr; gap: var(--space-6); }
          .id-value-grid { grid-template-columns: 1fr; gap: var(--space-3); }
        }
      `}</style>
    </div>
  );
}
