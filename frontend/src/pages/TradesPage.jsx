import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { ArrowRightLeft, Clock, CheckCircle, XCircle } from 'lucide-react';

const STATUS = {
  pending: { color: 'var(--color-warning)', icon: Clock, label: 'Pending', bg: 'rgba(245,158,11,0.06)' },
  accepted: { color: 'var(--color-brand-light)', icon: CheckCircle, label: 'Accepted', bg: 'rgba(99,102,241,0.06)' },
  completed: { color: 'var(--color-success)', icon: CheckCircle, label: 'Completed', bg: 'rgba(34,197,94,0.06)' },
  cancelled: { color: 'var(--color-error)', icon: XCircle, label: 'Cancelled', bg: 'rgba(239,68,68,0.06)' },
};

export default function TradesPage() {
  const { user } = useAuthStore();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/trades').then(r => setTrades(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container fade-in" style={{ paddingTop: 'calc(var(--nav-height) + var(--space-8))' }}>
      <div className="page-header">
        <h1 className="page-title">My Deals</h1>
        <p className="page-subtitle">Track and manage your ongoing item swaps</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80 }} />)}
        </div>
      ) : trades.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon"><ArrowRightLeft size={28} style={{ color: 'var(--color-text-muted)' }} /></div>
          <p className="empty-state-title">No trades yet</p>
          <p className="empty-state-desc">Propose a trade from Explore or Smart Swaps</p>
        </div>
      ) : (
        <div className="trades-list">
          {trades.map((trade, idx) => {
            const s = STATUS[trade.status];
            const Icon = s.icon;
            const other = trade.initiator._id === user._id ? trade.receiver : trade.initiator;
            return (
              <Link key={trade._id} to={`/trades/${trade._id}`}
                className="card trades-row fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="trades-row-left">
                  <div className="trades-avatar">{other.username?.charAt(0).toUpperCase()}</div>
                  <div>
                    <p className="trades-name">Trade with {other.username}</p>
                    <p className="trades-meta">{trade.offeredItems.length} offered · {trade.requestedItems.length} requested</p>
                  </div>
                </div>
                <div className="trades-status" style={{ '--s-color': s.color, '--s-bg': s.bg }}>
                  <Icon size={12} /> {s.label}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <style>{`
        .trades-list { display: flex; flex-direction: column; gap: var(--space-3); }
        .trades-row {
          padding: var(--space-5) var(--space-6);
          display: flex; align-items: center; justify-content: space-between;
        }
        .trades-row:hover { transform: translateY(-2px); }
        .trades-row-left { display: flex; align-items: center; gap: var(--space-4); }
        .trades-avatar {
          width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, var(--color-brand), var(--color-accent));
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; color: #fff; font-size: var(--text-base);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .trades-name { font-weight: 600; font-size: var(--text-md); }
        .trades-meta { font-size: var(--text-sm); color: var(--color-text-muted); margin-top: 2px; }
        .trades-status {
          display: flex; align-items: center; gap: 5px;
          background: var(--s-bg); color: var(--s-color);
          padding: 5px 14px; border-radius: var(--radius-full);
          font-size: var(--text-sm); font-weight: 600; white-space: nowrap;
        }
      `}</style>
    </div>
  );
}
