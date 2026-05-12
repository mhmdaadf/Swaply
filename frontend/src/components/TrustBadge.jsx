import { Star, CheckCircle } from 'lucide-react';

export default function TrustBadge({ score, isVerified = false, size = 'md' }) {
  const stars = Math.round(score || 0);
  const label = score >= 4.5 ? 'Highly Trusted' : score >= 3.5 ? 'Trusted' : score >= 2 ? 'Building Trust' : 'New User';

  const sizes = {
    sm: { star: 12, font: '0.7rem' },
    md: { star: 14, font: '0.8rem' },
    lg: { star: 18, font: '0.9rem' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ display: 'flex', gap: 2 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            size={s.star}
            className={i <= stars ? 'star-filled' : 'star-empty'}
            fill={i <= stars ? 'var(--color-accent)' : 'none'}
          />
        ))}
      </div>
      <span style={{ fontSize: s.font, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
        {score?.toFixed(1)} — {label}
        {isVerified && <CheckCircle size={s.star} color="var(--color-brand-light)" fill="rgba(99,102,241,0.1)" />}
      </span>
    </div>
  );
}
