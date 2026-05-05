import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Loader2, ArrowRightLeft } from 'lucide-react';

export default function NewTradePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [myItems, setMyItems] = useState([]);
  const [selectedOffered, setSelectedOffered] = useState([]);
  const [selectedRequested, setSelectedRequested] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const receiverId = params.get('receiverId');
  const requestedItemId = params.get('requestedItem');
  const offeredItemId = params.get('offeredItem');

  useEffect(() => {
    if (requestedItemId) setSelectedRequested([requestedItemId]);
    if (offeredItemId) setSelectedOffered([offeredItemId]);
    api.get('/items/my').then(r => { setMyItems(r.data.filter(i => i.status === 'available')); setLoading(false); });
  }, []);

  const toggleOffered = (id) => setSelectedOffered(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleSubmit = async () => {
    if (!selectedOffered.length || !selectedRequested.length) { setError('Select at least one item on each side'); return; }
    setSubmitting(true); setError('');
    try {
      const { data } = await api.post('/trades', { receiverId, offeredItemIds: selectedOffered, requestedItemIds: selectedRequested });
      navigate(`/trades/${data._id}`);
    } catch (err) { setError(err.response?.data?.message || 'Failed to create trade'); setSubmitting(false); }
  };

  if (loading) return <div className="page-container" style={{ paddingTop:84 }}><div className="skeleton" style={{ height:300 }} /></div>;

  return (
    <div className="page-container fade-in" style={{ paddingTop:84, maxWidth:640 }}>
      <div className="page-header">
        <h1 className="page-title">Propose a Trade</h1>
        <p className="page-subtitle">Select items you want to offer</p>
      </div>
      {error && <div style={{ padding:'10px 14px', borderRadius:'var(--radius)', background:'rgba(239,68,68,0.1)', color:'var(--color-error)', fontSize:'0.85rem', marginBottom:20, border:'1px solid rgba(239,68,68,0.2)' }}>{error}</div>}
      <div className="card" style={{ padding:24, marginBottom:20 }}>
        <p style={{ fontSize:'0.8rem', color:'var(--color-text-muted)', marginBottom:12 }}>Your items to offer:</p>
        {myItems.length === 0 ? <p style={{ color:'var(--color-text-secondary)', fontSize:'0.9rem' }}>No available items to offer</p> : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {myItems.map(item => (
              <label key={item._id} className="card" style={{ padding:12, display:'flex', alignItems:'center', gap:12, cursor:'pointer', borderColor: selectedOffered.includes(item._id) ? 'var(--color-brand)' : undefined }}>
                <input type="checkbox" checked={selectedOffered.includes(item._id)} onChange={() => toggleOffered(item._id)} />
                <div style={{ flex:1 }}>
                  <p style={{ fontWeight:500, fontSize:'0.9rem' }}>{item.title}</p>
                  <p style={{ fontSize:'0.75rem', color:'var(--color-text-muted)' }}>{item.category} — {item.swapPointValue} pts</p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
      <button className="btn btn-accent btn-lg" style={{ width:'100%' }} disabled={submitting || !selectedOffered.length} onClick={handleSubmit}>
        {submitting ? <Loader2 size={18} className="animate-spin" /> : <><ArrowRightLeft size={18} /> Send Trade Proposal</>}
      </button>
    </div>
  );
}
