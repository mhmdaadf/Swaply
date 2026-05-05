import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { ArrowRightLeft, Clock, CheckCircle, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
  pending: { color:'var(--color-warning)', icon:Clock, label:'Pending' },
  accepted: { color:'var(--color-brand-light)', icon:CheckCircle, label:'Accepted' },
  completed: { color:'var(--color-success)', icon:CheckCircle, label:'Completed' },
  cancelled: { color:'var(--color-error)', icon:XCircle, label:'Cancelled' },
};

export default function TradesPage() {
  const { user } = useAuthStore();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/trades').then(r => setTrades(r.data)).catch(console.error).finally(() => setLoading(false)); }, []);

  return (
    <div className="page-container fade-in" style={{ paddingTop:84 }}>
      <div className="page-header">
        <h1 className="page-title">My Trades</h1>
        <p className="page-subtitle">Track your active and past trade proposals</p>
      </div>
      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:100 }} />)}</div>
      ) : trades.length === 0 ? (
        <div className="card" style={{ padding:60, textAlign:'center' }}>
          <ArrowRightLeft size={48} style={{ color:'var(--color-text-muted)', margin:'0 auto 16px' }} />
          <p style={{ color:'var(--color-text-secondary)' }}>No trades yet</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {trades.map(trade => {
            const sc = STATUS_CONFIG[trade.status];
            const Icon = sc.icon;
            const other = trade.initiator._id === user._id ? trade.receiver : trade.initiator;
            return (
              <Link key={trade._id} to={`/trades/${trade._id}`} className="card" style={{ padding:20, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg, var(--color-brand), var(--color-accent))', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#fff', fontSize:'0.85rem' }}>{other.username?.charAt(0).toUpperCase()}</div>
                  <div>
                    <p style={{ fontWeight:600, fontSize:'0.9rem' }}>Trade with {other.username}</p>
                    <p style={{ fontSize:'0.75rem', color:'var(--color-text-muted)' }}>{trade.offeredItems.length} offered — {trade.requestedItems.length} requested</p>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <Icon size={14} style={{ color:sc.color }} />
                  <span style={{ fontSize:'0.8rem', fontWeight:500, color:sc.color }}>{sc.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
