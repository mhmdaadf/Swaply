import { Link } from 'react-router-dom';
import { Tag, Star, ArrowRight } from 'lucide-react';

export default function ItemCard({ item, showOwner = true }) {
  const placeholder = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="%231e1e27"><rect width="400" height="300"/><text x="50%" y="50%" fill="%234b5563" font-size="16" text-anchor="middle" dy=".3em" font-family="system-ui">No Image</text></svg>'
  );

  return (
    <Link to={`/items/${item._id}`} className="card fade-in" style={{
      display: 'block', overflow: 'hidden', cursor: 'pointer',
    }}>
      {/* Image */}
      <div style={{
        height: 180, overflow: 'hidden',
        background: 'var(--color-surface-elevated)',
      }}>
        <img
          src={item.images?.[0] || placeholder}
          alt={item.title}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        />
      </div>

      {/* Body */}
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 8 }}>
          <h3 style={{
            fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.3,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {item.title}
          </h3>
          <span className="badge badge-accent" style={{ flexShrink: 0, fontSize: '0.7rem' }}>
            {item.swapPointValue} pts
          </span>
        </div>

        <div style={{
          display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap',
        }}>
          <span className="badge badge-brand">
            <Tag size={10} /> {item.category}
          </span>
          <span className="badge badge-neutral">{item.condition}</span>
        </div>

        {showOwner && item.owner && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: 12, paddingTop: 12,
            borderTop: '1px solid var(--color-border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Star size={12} className="star-filled" />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                {item.owner.trustScore?.toFixed(1)}
              </span>
            </div>
          </div>
        )}

        {item.desiredItems?.length > 0 && (
          <div style={{
            marginTop: 10, display: 'flex', alignItems: 'center', gap: 4,
            fontSize: '0.75rem', color: 'var(--color-text-muted)',
          }}>
            <ArrowRight size={12} />
            <span>Wants: {item.desiredItems.slice(0, 3).join(', ')}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
