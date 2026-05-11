import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Star, ArrowRight, Brain } from 'lucide-react';
import WorthCheckModal from './WorthCheckModal';

export default function ItemCard({ item, showOwner = true }) {
  const [showAI, setShowAI] = useState(false);

  const placeholder = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="%2312121e"><rect width="400" height="300"/><text x="50%" y="50%" fill="%233c3c52" font-size="14" text-anchor="middle" dy=".3em" font-family="system-ui">No Image</text></svg>'
  );

  return (
    <>
      <Link to={`/items/${item._id}`} className="card ic-card fade-in" style={{ display: 'block', overflow: 'hidden' }}>
        {/* Image */}
        <div className="ic-img">
          <img src={item.images?.[0] || placeholder} alt={item.title} loading="lazy" />
          <button onClick={e => { e.preventDefault(); e.stopPropagation(); setShowAI(true); }}
            className="ic-ai-btn" title="Verify with AI" aria-label={`Worth check for ${item.title}`}>
            <Brain size={12} /> Worth Check
          </button>
          <div className="ic-pts-overlay">{item.swapPointValue} pts</div>
        </div>

        {/* Body */}
        <div className="ic-body">
          <h3 className="ic-title">{item.title}</h3>
          <div className="ic-tags">
            <span className="badge badge-brand"><Tag size={9} /> {item.category}</span>
            <span className="badge badge-neutral">{item.condition}</span>
          </div>

          {showOwner && item.owner && (
            <div className="ic-owner">
              <div className="ic-owner-left">
                <div className="ic-avatar">{item.owner.username?.charAt(0).toUpperCase()}</div>
                <span className="ic-owner-name">{item.owner.username}</span>
              </div>
              <div className="ic-trust">
                <Star size={11} className="star-filled" fill="var(--color-accent)" />
                <span>{item.owner.trustScore?.toFixed(1)}</span>
              </div>
            </div>
          )}

          {item.desiredItems?.length > 0 && (
            <div className="ic-wants">
              <ArrowRight size={11} /> Wants: {item.desiredItems.slice(0, 2).join(', ')}
            </div>
          )}
        </div>
      </Link>

      {showAI && <WorthCheckModal item={item} onClose={() => setShowAI(false)} />}

      <style>{`
        .ic-card { cursor: pointer; }
        .ic-img {
          height: 200px; overflow: hidden; position: relative;
          background: var(--color-surface-2);
        }
        .ic-img img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.6s var(--ease-out), filter 0.6s var(--ease-out);
        }
        .ic-card:hover .ic-img img {
          transform: scale(1.05);
          filter: brightness(1.05);
        }

        /* Points overlay */
        .ic-pts-overlay {
          position: absolute; top: var(--space-3); right: var(--space-3);
          background: rgba(7,7,12,0.8); backdrop-filter: blur(8px);
          padding: 4px 10px; border-radius: var(--radius-full);
          font-size: var(--text-xs); font-weight: 700;
          color: var(--color-accent-light);
          border: 1px solid rgba(245,158,11,0.15);
        }

        /* AI Button */
        .ic-ai-btn {
          position: absolute; bottom: var(--space-3); right: var(--space-3);
          background: rgba(18, 18, 30, 0.85); backdrop-filter: blur(8px);
          border: 1px solid rgba(167,139,250,0.2);
          border-radius: var(--radius-sm);
          padding: 5px 10px; color: #a78bfa;
          font-size: 0.62rem; font-weight: 700;
          display: flex; align-items: center; gap: 5px;
          cursor: pointer; z-index: 5;
          opacity: 0; transform: translateY(4px);
          transition: all var(--duration-base) var(--ease-out);
        }
        .ic-card:hover .ic-ai-btn { opacity: 1; transform: translateY(0); }
        .ic-ai-btn:hover {
          background: #a78bfa; color: #fff; border-color: #a78bfa;
          box-shadow: 0 4px 16px rgba(167,139,250,0.25);
        }
        @media (hover: none) { .ic-ai-btn { opacity: 1; transform: translateY(0); } }

        /* Body */
        .ic-body { padding: var(--space-4) var(--space-5) var(--space-5); }
        .ic-title {
          font-size: var(--text-md); font-weight: 600; line-height: 1.35;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden; margin-bottom: var(--space-3);
        }
        .ic-tags { display: flex; gap: 5px; flex-wrap: wrap; }

        /* Owner */
        .ic-owner {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: var(--space-4); padding-top: var(--space-4);
          border-top: 1px solid var(--color-border-subtle);
        }
        .ic-owner-left { display: flex; align-items: center; gap: var(--space-2); }
        .ic-avatar {
          width: 24px; height: 24px; border-radius: 50%;
          background: linear-gradient(135deg, var(--color-brand), var(--color-accent));
          display: flex; align-items: center; justify-content: center;
          font-size: 0.6rem; font-weight: 700; color: #fff;
        }
        .ic-owner-name { font-size: var(--text-sm); color: var(--color-text-secondary); }
        .ic-trust {
          display: flex; align-items: center; gap: 3px;
          font-size: var(--text-sm); color: var(--color-text-secondary); font-weight: 500;
        }

        .ic-wants {
          margin-top: var(--space-3);
          display: flex; align-items: center; gap: 4px;
          font-size: var(--text-sm); color: var(--color-text-ghost);
        }
      `}</style>
    </>
  );
}
