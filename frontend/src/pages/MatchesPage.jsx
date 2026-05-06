import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Sparkles, ArrowRightLeft, Star, CheckCircle, AlertTriangle } from 'lucide-react';

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/matches').then(r => setMatches(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const fairnessIcon = (f) => f === 'fair' ? <CheckCircle size={14} style={{ color:'var(--color-success)' }} /> : f === 'moderate' ? <AlertTriangle size={14} style={{ color:'var(--color-warning)' }} /> : <AlertTriangle size={14} style={{ color:'var(--color-error)' }} />;

  return (
    <div className="page-container fade-in" style={{ paddingTop:84 }}>
      <div className="page-header">
        <h1 className="page-title"><Sparkles size={24} style={{ display:'inline', marginRight:8, color:'var(--color-brand-light)' }} />Smart Matches</h1>
        <p className="page-subtitle">AI-powered bi-directional matches based on your listings</p>
      </div>
      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:160 }} />)}</div>
      ) : matches.length === 0 ? (
        <div className="card" style={{ padding:60, textAlign:'center' }}>
          <Sparkles size={48} style={{ color:'var(--color-text-muted)', margin:'0 auto 16px' }} />
          <p style={{ color:'var(--color-text-secondary)' }}>No matches found yet</p>
          <p style={{ color:'var(--color-text-muted)', fontSize:'0.85rem', marginTop:4 }}>List more items and add desired items to improve matching</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {matches.map((m, idx) => (
            <div key={idx} className="card" style={{ padding:24 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg, var(--color-brand), var(--color-accent))', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#fff', fontSize:'0.9rem' }}>{m.user.username?.charAt(0).toUpperCase()}</div>
                  <div>
                    <p style={{ fontWeight:600 }}>{m.user.username}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.8rem', color:'var(--color-text-secondary)' }}><Star size={12} className="star-filled" /> {m.user.trustScore?.toFixed(1)}</div>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  {fairnessIcon(m.valueFairness)}
                  <span className="badge badge-brand">Score: {m.score}</span>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:24, alignItems:'center' }}>
                <div>
                  <p style={{ fontSize:'0.75rem', color:'var(--color-text-muted)', marginBottom:12 }}>They have</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {m.theirItems.map(i => (
                      <div key={i._id} style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:48, height:48, borderRadius:'var(--radius)', background:'var(--color-surface-elevated)', overflow:'hidden', border:'1px solid var(--color-border)', flexShrink:0 }}>
                          <img src={i.images?.[0] || 'https://via.placeholder.com/48'} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontSize:'0.85rem', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{i.title}</p>
                          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                            <span className="badge badge-neutral" style={{ fontSize:'0.6rem', padding:'1px 6px' }}>{i.category}</span>
                            <span style={{ fontSize:'0.75rem', color:'var(--color-accent)', fontWeight:600 }}>{i.swapPointValue}pts</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <ArrowRightLeft size={24} style={{ color:'var(--color-brand-light)', opacity:0.5 }} />

                <div>
                  <p style={{ fontSize:'0.75rem', color:'var(--color-text-muted)', marginBottom:12 }}>You offer</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {m.myItems.map(i => (
                      <div key={i._id} style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:48, height:48, borderRadius:'var(--radius)', background:'var(--color-surface-elevated)', overflow:'hidden', border:'1px solid var(--color-border)', flexShrink:0 }}>
                          <img src={i.images?.[0] || 'https://via.placeholder.com/48'} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontSize:'0.85rem', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{i.title}</p>
                          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                            <span className="badge badge-neutral" style={{ fontSize:'0.6rem', padding:'1px 6px' }}>{i.category}</span>
                            <span style={{ fontSize:'0.75rem', color:'var(--color-accent)', fontWeight:600 }}>{i.swapPointValue}pts</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <button className="btn btn-accent" style={{ marginTop:16, width:'100%' }} onClick={() => navigate(`/trades/new?receiverId=${m.user._id}&requestedItem=${m.theirItems[0]?._id}&offeredItem=${m.myItems[0]?._id}`)}>
                <ArrowRightLeft size={16} /> Propose Trade
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
