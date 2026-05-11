import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import TrustBadge from '../components/TrustBadge';
import { Tag, ArrowRight, Calendar, DollarSign, Sparkles, ArrowRightLeft } from 'lucide-react';

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/items/${id}`).then(r => setItem(r.data)).catch(() => navigate('/explore')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-container" style={{ paddingTop:84 }}><div className="skeleton" style={{ height:400 }} /></div>;
  if (!item) return null;

  const isOwner = user?._id === item.owner?._id;
  const placeholder = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" fill="%231e1e27"><rect width="600" height="400"/><text x="50%" y="50%" fill="%234b5563" font-size="20" text-anchor="middle" dy=".3em" font-family="system-ui">No Image</text></svg>');

  return (
    <div className="page-container fade-in" style={{ paddingTop:84 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:32 }} className="item-detail-grid">
        <div style={{ borderRadius:'var(--radius-lg)', overflow:'hidden', background:'var(--color-surface-elevated)', aspectRatio:'4/3' }}>
          <img src={item.images?.[0] || placeholder} alt={item.title} loading="lazy" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        </div>

      <style>{`
        @media (max-width: 768px) {
          .item-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
        <div>
          <div style={{ display:'flex', gap:8, marginBottom:12 }}>
            <span className="badge badge-brand"><Tag size={10} /> {item.category}</span>
            <span className="badge badge-neutral">{item.condition}</span>
          </div>
          <h1 style={{ fontSize:'1.5rem', fontWeight:700, marginBottom:8 }}>{item.title}</h1>
          <p style={{ color:'var(--color-text-secondary)', fontSize:'0.9rem', lineHeight:1.6, marginBottom:20 }}>{item.description || 'No description provided.'}</p>

          <div className="card" style={{ padding:20, marginBottom:20 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div><p style={{ fontSize:'0.75rem', color:'var(--color-text-muted)' }}>Swap Value</p><p style={{ fontSize:'1.3rem', fontWeight:700, color:'var(--color-accent)' }}><Sparkles size={16} style={{ display:'inline', marginRight:4 }} />{item.swapPointValue} pts</p></div>
              <div><p style={{ fontSize:'0.75rem', color:'var(--color-text-muted)' }}>Original Price</p><p style={{ fontSize:'1.1rem', fontWeight:600 }}><DollarSign size={14} style={{ display:'inline' }} />{item.originalPrice}</p></div>
              <div><p style={{ fontSize:'0.75rem', color:'var(--color-text-muted)' }}>Age</p><p style={{ fontSize:'0.95rem' }}><Calendar size={14} style={{ display:'inline', marginRight:4 }} />{item.ageMonths} months</p></div>
              <div><p style={{ fontSize:'0.75rem', color:'var(--color-text-muted)' }}>Status</p><span className={`badge ${item.status === 'available' ? 'badge-success' : 'badge-error'}`}>{item.status}</span></div>
            </div>
          </div>

          {item.desiredItems?.length > 0 && (
            <div style={{ marginBottom:20 }}>
              <p style={{ fontSize:'0.8rem', color:'var(--color-text-muted)', marginBottom:8 }}>Looking for:</p>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {item.desiredItems.map((d, i) => <span key={i} className="badge badge-brand"><ArrowRight size={10} /> {d}</span>)}
              </div>
            </div>
          )}

          {item.owner && !isOwner && (
            <div className="card" style={{ padding:16, marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg, var(--color-brand), var(--color-accent))', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#fff' }}>{item.owner.username?.charAt(0).toUpperCase()}</div>
                  <div><p style={{ fontWeight:600, fontSize:'0.9rem' }}>{item.owner.username}</p><TrustBadge score={item.owner.trustScore} size="sm" /></div>
                </div>
              </div>
            </div>
          )}

          {!isOwner && item.status === 'available' && (
            <button className="btn btn-accent btn-lg" style={{ width:'100%' }} onClick={() => navigate(`/trades/new?receiverId=${item.owner._id}&requestedItem=${item._id}`)}>
              <ArrowRightLeft size={18} /> Propose a Trade
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
