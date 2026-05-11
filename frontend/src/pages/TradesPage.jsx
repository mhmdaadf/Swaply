import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { ArrowRightLeft, Clock, CheckCircle, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
  pending: { color: 'var(--color-warning)', icon: Clock, label: 'Pending', bg: 'rgba(245,158,11,0.08)' },
  accepted: { color: 'var(--color-brand-light)', icon: CheckCircle, label: 'Accepted', bg: 'rgba(99,102,241,0.08)' },
  completed: { color: 'var(--color-success)', icon: CheckCircle, label: 'Completed', bg: 'rgba(34,197,94,0.08)' },
  cancelled: { color: 'var(--color-error)', icon: XCircle, label: 'Cancelled', bg: 'rgba(239,68,68,0.08)' },
};

export default function TradesPage() {
  const { user } = useAuthStore();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/trades').then(r => setTrades(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container fade-in" style={{ paddingTop: 'calc(var(--nav-height) + 24px)' }}>
      <div className="page-header">
        <h1 className="page-title">My Deals</h1>
        <p className="page-subtitle">Track and manage your ongoing item swaps</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 88 }} />)}
        </div>
      ) : trades.length === 0 ? (
        <div className="card" style={{ padding: '64px 32px', textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, margin: '0 auto 16px', borderRadius: '50%',
            background: 'rgba(99,102,241,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ArrowRightLeft size={28} style={{ color: 'var(--color-text-muted)' }} />
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>No trades yet</p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: 6 }}>
            Propose a trade from the Explore or Smart Swaps page
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {trades.map(trade => {
            const sc = STATUS_CONFIG[trade.status];
            const Icon = sc.icon;
            const other = trade.initiator._id === user._id ? trade.receiver : trade.initiator;
            return (
              <Link key={trade._id} to={`/trades/${trade._id}`} className="card" style={{
                padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--color-brand), var(--color-accent))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, color: '#fff', fontSize: '0.9rem', flexShrink: 0,
                  }}>
                    {other.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.92rem' }}>Trade with {other.username}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                      {trade.offeredItems.length} offered — {trade.requestedItems.length} requested
                    </p>
                  </div>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: sc.bg, padding: '5px 12px', borderRadius: 100,
                }}>
                  <Icon size={13} style={{ color: sc.color }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: sc.color }}>{sc.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
