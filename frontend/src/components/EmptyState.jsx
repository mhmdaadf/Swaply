import { Search, Package, ArrowRightLeft, Bell, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const ICONS = {
  search: Search,
  items: Package,
  trades: ArrowRightLeft,
  notifications: Bell,
  reviews: Star
};

export default function EmptyState({ 
  type = 'items', 
  title, 
  desc, 
  actionLabel, 
  actionLink,
  icon: CustomIcon
}) {
  const Icon = CustomIcon || ICONS[type] || Package;

  return (
    <div className="empty-state fade-in">
      <div className="empty-state-icon">
        <Icon size={32} color="var(--color-brand-light)" />
      </div>
      <h3 className="empty-state-title">{title || `No ${type} found`}</h3>
      <p className="empty-state-desc">{desc || `It looks like there's nothing to show here right now.`}</p>
      
      {actionLabel && actionLink && (
        <Link to={actionLink} className="btn btn-primary">
          {actionLabel}
        </Link>
      )}

      <style>{`
        .empty-state {
          padding: 64px 24px;
          text-align: center;
          max-width: 400px;
          margin: 0 auto;
        }
        .empty-state-icon {
          width: 72px;
          height: 72px;
          margin: 0 auto 24px;
          border-radius: 50%;
          background: rgba(99, 102, 241, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(99, 102, 241, 0.1);
        }
        .empty-state-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: 12px;
        }
        .empty-state-desc {
          font-size: 0.9rem;
          color: var(--color-text-ghost);
          line-height: 1.6;
          margin-bottom: 32px;
        }
      `}</style>
    </div>
  );
}
