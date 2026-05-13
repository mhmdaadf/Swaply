import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Star, ArrowRight, Brain, Flag } from 'lucide-react';
import WorthCheckModal from './WorthCheckModal';
import ReportModal from './ReportModal';
import { getImageUrl } from '../lib/utils';

export default function ItemCard({ item, showOwner = true }) {
  const [showAI, setShowAI] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const placeholder = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="%2312121e"><rect width="400" height="300"/><text x="50%" y="50%" fill="%233c3c52" font-size="14" text-anchor="middle" dy=".3em" font-family="system-ui">No Image</text></svg>'
  );

  return (
    <>
      <Link to={`/items/${item._id}`} className="card ic-card fade-in" style={{ display: 'block', overflow: 'hidden' }}>
        {/* Image */}
        <div className="ic-img">
          <img src={getImageUrl(item.images?.[0]) || placeholder} alt={item.title} loading="lazy" />
          <button onClick={e => { e.preventDefault(); e.stopPropagation(); setShowAI(true); }}
            className="ic-ai-btn" title="Verify with AI" aria-label={`Worth check for ${item.title}`}>
            <Brain size={12} /> Worth Check
          </button>
          <button onClick={e => { e.preventDefault(); e.stopPropagation(); setShowReport(true); }}
            className="ic-report-btn" title="Report Item">
            <Flag size={12} />
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
                <span>{item.owner.totalRatings > 0 ? item.owner.trustScore?.toFixed(1) : 'New'}</span>
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
      {showReport && <ReportModal targetType="Item" targetId={item._id} targetName={item.title} onClose={() => setShowReport(false)} />}

      <style>{`
        /* ═══ ItemCard — Interaction Rules ═══
           Hover: image scale(1.05) + brightness(1.05) — duration-slow
           Active (card): translateY(-1px) — handled by .card
           AI button: reveals on hover (opacity + translateY) — duration-base */
        .ic-card {
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }
        .ic-img {
          height: 200px; overflow: hidden; position: relative;
          background: var(--color-surface-2);
        }
        .ic-img img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform var(--duration-slow) var(--ease-out),
                      filter var(--duration-slow) var(--ease-out);
          will-change: transform;
        }
        .ic-card:hover .ic-img img {
          transform: scale(1.05);
          filter: brightness(1.05);
        }

        /* Points overlay — always visible */
        .ic-pts-overlay {
          position: absolute; top: var(--space-3); right: var(--space-3);
          background: rgba(7,7,12,0.8); backdrop-filter: blur(8px);
          padding: var(--space-1) var(--space-3); border-radius: var(--radius-full);
          font-size: var(--text-xs); font-weight: 700;
          color: var(--color-accent-light);
          border: 1px solid rgba(245,158,11,0.15);
        }
        
        .ic-report-btn {
          position: absolute; top: var(--space-3); left: var(--space-3);
          background: rgba(18, 18, 30, 0.6); backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius-sm);
          width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;
          color: var(--color-text-ghost); cursor: pointer; z-index: 5;
          opacity: 0; transition: all 0.2s ease;
        }
        .ic-card:hover .ic-report-btn { opacity: 1; }
        .ic-report-btn:hover { background: #ef4444; color: #fff; border-color: #ef4444; }

        /* AI Button — reveals on hover, inverts on own hover */
        .ic-ai-btn {
          position: absolute; bottom: var(--space-3); right: var(--space-3);
          background: rgba(18, 18, 30, 0.85); backdrop-filter: blur(8px);
          border: 1px solid rgba(167,139,250,0.2);
          border-radius: var(--radius-sm);
          padding: var(--space-1) var(--space-3);
          color: #a78bfa;
          font-size: var(--text-xs); font-weight: 700;
          display: flex; align-items: center; gap: var(--space-1);
          cursor: pointer; z-index: 5;
          opacity: 1; transform: translateY(0);
          transition: opacity var(--duration-base) var(--ease-out),
                      transform var(--duration-base) var(--ease-out),
                      background var(--duration-fast) var(--ease-smooth),
                      color var(--duration-fast) var(--ease-smooth);
          -webkit-tap-highlight-color: transparent;
        }

        .ic-ai-btn:hover {
          background: #a78bfa; color: #fff; border-color: #a78bfa;
          box-shadow: 0 4px 16px rgba(167,139,250,0.25);
        }
        .ic-ai-btn:active { transform: scale(0.95); }


        /* Body */
        .ic-body { padding: var(--space-4) var(--space-5) var(--space-5); }
        .ic-title {
          font-size: var(--text-md); font-weight: 600; line-height: 1.35;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden; margin-bottom: var(--space-3);
        }
        .ic-tags { display: flex; gap: var(--space-1); flex-wrap: wrap; }

        /* Owner row */
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
          font-size: var(--text-xs); font-weight: 700; color: #fff;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .ic-owner-name { font-size: var(--text-sm); color: var(--color-text-secondary); }
        .ic-trust {
          display: flex; align-items: center; gap: var(--space-1);
          font-size: var(--text-sm); color: var(--color-text-secondary); font-weight: 500;
        }

        .ic-wants {
          margin-top: var(--space-3);
          display: flex; align-items: center; gap: var(--space-1);
          font-size: var(--text-sm); color: var(--color-text-ghost);
        }
      `}</style>
    </>
  );
}
