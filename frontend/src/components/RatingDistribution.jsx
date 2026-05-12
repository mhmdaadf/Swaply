import { Star } from 'lucide-react';

export default function RatingDistribution({ distribution = {}, total = 0 }) {
  const ratings = [5, 4, 3, 2, 1];
  const safeDist = distribution || {};

  return (
    <div className="rd-container">
      {ratings.map(score => {
        const count = safeDist[score] || 0;
        const percentage = total > 0 ? (count / total) * 100 : 0;
        
        return (
          <div key={score} className="rd-row">
            <div className="rd-score">
              <span>{score}</span>
              <Star size={12} fill="var(--color-accent)" color="var(--color-accent)" />
            </div>
            <div className="rd-bar-bg">
              <div 
                className="rd-bar-fill" 
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="rd-count">{count}</span>
          </div>
        );
      })}

      <style>{`
        .rd-container { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
        .rd-row { display: flex; align-items: center; gap: 12px; }
        .rd-score { display: flex; align-items: center; gap: 4px; width: 30px; font-size: 0.85rem; font-weight: 600; }
        .rd-bar-bg { flex: 1; height: 6px; background: var(--color-surface-3); border-radius: 3px; overflow: hidden; }
        .rd-bar-fill { height: 100%; background: var(--color-accent); border-radius: 3px; }
        .rd-count { width: 20px; font-size: 0.75rem; color: var(--color-text-ghost); text-align: right; }
      `}</style>
    </div>
  );
}
