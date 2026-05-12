import { Star, Flag, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ReviewList({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="rl-empty">
        <p>No reviews yet. Be the first to trade and leave feedback!</p>
      </div>
    );
  }

  return (
    <div className="rl-container">
      {reviews.map(review => (
        <div key={review._id} className="rl-item card">
          <div className="rl-header">
            <div className="rl-user">
              <div className="rl-avatar">
                {review.rater.profilePic ? (
                  <img src={review.rater.profilePic} alt={review.rater.username} />
                ) : (
                  review.rater.username.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <div className="rl-username">
                  {review.rater.username}
                  {review.rater.isVerified && <CheckCircle size={12} color="var(--color-brand-light)" fill="rgba(99,102,241,0.1)" />}
                </div>
                <div className="rl-stars">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star 
                      key={s} 
                      size={12} 
                      fill={s <= review.score ? 'var(--color-accent)' : 'none'} 
                      color={s <= review.score ? 'var(--color-accent)' : 'var(--color-text-ghost)'} 
                    />
                  ))}
                </div>
              </div>
            </div>
            <span className="rl-date">
              {formatDistanceToNow(new Date(review.createdAt))} ago
            </span>
          </div>
          
          <div className="rl-body">
            <p className="rl-comment">{review.comment || 'No comment provided.'}</p>
          </div>

          <div className="rl-footer">
            <button className="rl-report" title="Report Review">
              <Flag size={12} /> Report
            </button>
          </div>
        </div>
      ))}

      <style>{`
        .rl-container { display: flex; flex-direction: column; gap: 16px; }
        .rl-item { padding: 16px; border-radius: var(--radius-lg); background: var(--color-surface-2); }
        .rl-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .rl-user { display: flex; align-items: center; gap: 12px; }
        .rl-avatar {
          width: 36px; height: 36px; border-radius: 50%; background: var(--color-surface-3);
          display: flex; align-items: center; justify-content: center; overflow: hidden;
          font-weight: 700; font-size: 0.9rem; color: #fff;
        }
        .rl-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .rl-username { display: flex; align-items: center; gap: 6px; font-weight: 600; font-size: 0.9rem; }
        .rl-stars { display: flex; gap: 2px; }
        .rl-date { font-size: 0.75rem; color: var(--color-text-ghost); }
        .rl-body { margin-bottom: 12px; }
        .rl-comment { font-size: 0.9rem; color: var(--color-text-secondary); line-height: 1.5; }
        .rl-footer { display: flex; justify-content: flex-end; }
        .rl-report {
          background: none; border: none; color: var(--color-text-ghost);
          font-size: 0.75rem; display: flex; align-items: center; gap: 4px;
          cursor: pointer; transition: color 0.2s;
        }
        .rl-report:hover { color: var(--color-error); }
        .rl-empty { text-align: center; padding: 40px; color: var(--color-text-ghost); }
      `}</style>
    </div>
  );
}
