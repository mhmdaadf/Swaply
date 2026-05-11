import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Loader2, ArrowRightLeft, Check } from 'lucide-react';

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

  if (loading) return <div className="page-container" style={{ paddingTop: 'calc(var(--nav-height) + var(--space-8))' }}><div className="skeleton" style={{ height: 300 }} /></div>;

  return (
    <div className="page-container fade-in" style={{ paddingTop: 'calc(var(--nav-height) + var(--space-8))', maxWidth: 640 }}>
      <div className="page-header">
        <h1 className="page-title">Propose a Trade</h1>
        <p className="page-subtitle">Select items you want to offer</p>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-5)' }}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)', fontWeight: 500 }}>Your items to offer:</p>
        {myItems.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-md)' }}>No available items to offer</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {myItems.map(item => {
              const selected = selectedOffered.includes(item._id);
              return (
                <label key={item._id} className="nt-item-row" style={{ borderColor: selected ? 'var(--color-brand)' : undefined, background: selected ? 'rgba(99,102,241,0.03)' : undefined }}>
                  <div className={`nt-check ${selected ? 'nt-check-active' : ''}`}>
                    {selected && <Check size={12} />}
                  </div>
                  <input type="checkbox" checked={selected} onChange={() => toggleOffered(item._id)} style={{ display: 'none' }} />
                  <div className="nt-item-thumb">
                    <img src={item.images?.[0] || 'https://via.placeholder.com/40'} alt="" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 500, fontSize: 'var(--text-md)' }}>{item.title}</p>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{item.category} · {item.swapPointValue} pts</p>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <button className="btn btn-accent btn-lg" style={{ width: '100%' }} disabled={submitting || !selectedOffered.length} onClick={handleSubmit}>
        {submitting ? <Loader2 size={18} className="animate-spin" /> : <><ArrowRightLeft size={18} /> Send Trade Proposal</>}
      </button>

      <style>{`
        .nt-item-row {
          display: flex; align-items: center; gap: var(--space-3); cursor: pointer;
          padding: var(--space-3) var(--space-4); border-radius: var(--radius);
          border: 1px solid var(--color-border);
          transition: all var(--duration-base) var(--ease-smooth);
        }
        .nt-item-row:hover { border-color: var(--color-border-hover); }
        .nt-check {
          width: 22px; height: 22px; border-radius: 6px; flex-shrink: 0;
          border: 2px solid var(--color-border-hover);
          display: flex; align-items: center; justify-content: center;
          transition: all var(--duration-fast) var(--ease-smooth);
        }
        .nt-check-active {
          background: var(--color-brand); border-color: var(--color-brand); color: #fff;
        }
        .nt-item-thumb {
          width: 40px; height: 40px; border-radius: var(--radius-sm);
          background: var(--color-surface-2); overflow: hidden;
          border: 1px solid var(--color-border-subtle); flex-shrink: 0;
        }
        .nt-item-thumb img { width: 100%; height: 100%; object-fit: cover; }
      `}</style>
    </div>
  );
}
