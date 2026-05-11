import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Star, ArrowRight, Brain } from 'lucide-react';
import WorthCheckModal from './WorthCheckModal';

export default function ItemCard({ item, showOwner = true }) {
  const [showAIModal, setShowAIModal] = useState(false);

  const placeholder = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="%231a1a28"><rect width="400" height="300"/><text x="50%" y="50%" fill="%2364647a" font-size="15" text-anchor="middle" dy=".3em" font-family="system-ui">No Image</text></svg>'
  );

  const handleWorthCheck = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAIModal(true);
  };

  return (
    <>
      <Link to={`/items/${item._id}`} className="card item-card fade-in" style={{
        display: 'block', overflow: 'hidden', cursor: 'pointer',
      }}>
        {/* Image */}
        <div className="item-card-img">
          <img
            src={item.images?.[0] || placeholder}
            alt={item.title}
            loading="lazy"
          />
          
          {/* Worth Check Button */}
          <button 
            onClick={handleWorthCheck}
            className="card-ai-btn"
            title="Verify with AI"
            aria-label={`Worth check for ${item.title}`}
          >
            <Brain size={13} />
            <span>Worth Check</span>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 18px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 8 }}>
            <h3 style={{
              fontSize: '0.92rem', fontWeight: 600, lineHeight: 1.35,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {item.title}
            </h3>
            <span className="badge badge-accent" style={{ flexShrink: 0, fontSize: '0.68rem' }}>
              {item.swapPointValue} pts
            </span>
          </div>

          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            <span className="badge badge-brand">
              <Tag size={9} /> {item.category}
            </span>
            <span className="badge badge-neutral">{item.condition}</span>
          </div>

          {showOwner && item.owner && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginTop: 14, paddingTop: 14,
              borderTop: '1px solid var(--color-border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--color-brand), var(--color-accent))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', fontWeight: 700, color: '#fff',
                }}>
                  {item.owner.username?.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  {item.owner.username}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Star size={12} className="star-filled" fill="var(--color-accent)" />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                  {item.owner.trustScore?.toFixed(1)}
                </span>
              </div>
            </div>
          )}

          {item.desiredItems?.length > 0 && (
            <div style={{
              marginTop: 10, display: 'flex', alignItems: 'center', gap: 5,
              fontSize: '0.75rem', color: 'var(--color-text-muted)',
            }}>
              <ArrowRight size={12} />
              <span>Wants: {item.desiredItems.slice(0, 3).join(', ')}</span>
            </div>
          )}
        </div>
      </Link>

      {showAIModal && (
        <WorthCheckModal 
          item={item} 
          onClose={() => setShowAIModal(false)} 
        />
      )}

      <style>{`
        .item-card-img {
          height: 190; overflow: hidden;
          background: var(--color-surface-elevated);
          position: relative;
        }
        .item-card-img img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @media (hover: hover) {
          .item-card:hover .item-card-img img {
            transform: scale(1.06);
          }
        }
        .card-ai-btn {
          position: absolute; bottom: 10px; right: 10px;
          background: rgba(20, 20, 32, 0.85);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(167, 139, 250, 0.25);
          border-radius: var(--radius-sm);
          padding: 6px 12px;
          color: #a78bfa;
          font-size: 0.65rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
          z-index: 10;
          opacity: 0;
          transform: translateY(4px);
        }
        .item-card:hover .card-ai-btn {
          opacity: 1;
          transform: translateY(0);
        }
        .card-ai-btn:hover {
          background: #a78bfa;
          color: #fff;
          border-color: #a78bfa;
          box-shadow: 0 4px 16px rgba(167,139,250,0.3);
        }
        @media (hover: none) {
          .card-ai-btn { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
