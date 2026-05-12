import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { 
  Loader2, ArrowRightLeft, Plus, X, Shield, 
  ChevronRight, Info, AlertTriangle, Sparkles, Search
} from 'lucide-react';
import { getImageUrl } from '../lib/utils';
import FairnessGauge from '../components/FairnessGauge';
import ItemSelectionModal from '../components/ItemSelectionModal';
import { useAuthStore } from '../store/authStore';

export default function NewTradePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  
  const receiverId = params.get('receiverId');
  const initialRequestedId = params.get('requestedItem');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [receiver, setReceiver] = useState(null);
  const [myInventory, setMyInventory] = useState([]);
  const [theirInventory, setTheirInventory] = useState([]);
  
  const [offeredItems, setOfferedItems] = useState([]);
  const [requestedItems, setRequestedItems] = useState([]);
  
  const [modalType, setModalType] = useState(null); // 'offered' | 'requested' | null

  useEffect(() => {
    if (!receiverId) {
      navigate('/explore');
      return;
    }
    loadInventories();
  }, [receiverId]);

  const loadInventories = async () => {
    setLoading(true);
    try {
      const [meRes, userRes, invRes] = await Promise.all([
        api.get('/items/my'),
        api.get(`/auth/users/${receiverId}`),
        api.get(`/items/user/${receiverId}`)
      ]);
      
      const myAvail = Array.isArray(meRes.data) ? meRes.data.filter(i => i.status === 'available') : [];
      const theirAvail = Array.isArray(invRes.data) ? invRes.data.filter(i => i.status === 'available') : [];
      
      setMyInventory(myAvail);
      setTheirInventory(theirAvail);
      setReceiver(userRes.data || null);
      
      // If we came from an item page, pre-select that item
      if (initialRequestedId) {
        const item = theirAvail.find(i => i._id === initialRequestedId);
        if (item) setRequestedItems([item]);
      }
    } catch (err) {
      setError('Failed to load trade data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (item, type) => {
    const list = type === 'offered' ? offeredItems : requestedItems;
    const setter = type === 'offered' ? setOfferedItems : setRequestedItems;
    
    if (list.find(i => i._id === item._id)) {
      setter(list.filter(i => i._id !== item._id));
    } else {
      setter([...list, item]);
    }
  };

  const calculateTotal = (items) => items.reduce((sum, i) => sum + i.swapPointValue, 0);
  const myTotal = calculateTotal(offeredItems);
  const theirTotal = calculateTotal(requestedItems);

  const handleSubmit = async () => {
    if (offeredItems.length === 0 || requestedItems.length === 0) {
      setError('Please select at least one item from both sides.');
      return;
    }
    
    setSubmitting(true);
    setError('');
    try {
      const { data } = await api.post('/trades', {
        receiverId,
        offeredItemIds: offeredItems.map(i => i._id),
        requestedItemIds: requestedItems.map(i => i._id)
      });
      navigate(`/trades/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send trade proposal');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="page-container" style={{ paddingTop: '100px', textAlign: 'center' }}>
      <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto', color: 'var(--color-brand-light)' }} />
      <p style={{ marginTop: '20px', color: 'var(--color-text-ghost)' }}>Preparing Trade Builder...</p>
    </div>
  );

  return (
    <div className="page-container fade-in" style={{ paddingTop: 'calc(var(--nav-height) + var(--space-8))' }}>
      <div className="tb-header">
        <h1 className="page-title">Trade Builder</h1>
        <p className="page-subtitle">Crafting a deal with <strong>{receiver?.username}</strong></p>
      </div>

      <div className="tb-grid">
        {/* Left Side: Your Offer */}
        <div className="tb-column">
          <div className="tb-section-header">
            <h3>Your Offer</h3>
            <span className="tb-count">{offeredItems.length} items</span>
          </div>
          
          <div className="tb-cart glass">
            {offeredItems.length === 0 ? (
              <div className="tb-empty-state" onClick={() => setModalType('offered')}>
                <Plus size={24} />
                <p>Add items to offer</p>
              </div>
            ) : (
              <div className="tb-items-list">
                {offeredItems.map(item => (
                  <div key={item._id} className="tb-cart-item">
                    <img src={getImageUrl(item.images?.[0])} alt="" />
                    <div className="tb-item-info">
                      <p className="tb-item-name">{item.title}</p>
                      <p className="tb-item-pts">{item.swapPointValue} pts</p>
                    </div>
                    <button 
                      className="tb-remove" 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleItem(item, 'offered');
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button className="tb-add-more" onClick={() => setModalType('offered')}>
                  <Plus size={14} /> Add more
                </button>
              </div>
            )}
            <div className="tb-cart-footer">
              <span>Total Value:</span>
              <span className="tb-total-val">{myTotal} pts</span>
            </div>
          </div>
        </div>

        {/* Center: Fairness Indicator (Mobile: bottom/top) */}
        <div className="tb-center">
          <div className="tb-vs">
            <ArrowRightLeft size={24} />
          </div>
        </div>

        {/* Right Side: Their Items */}
        <div className="tb-column">
          <div className="tb-section-header">
            <h3>Their Items</h3>
            <span className="tb-count">{requestedItems.length} items</span>
          </div>
          
          <div className="tb-cart glass">
            {requestedItems.length === 0 ? (
              <div className="tb-empty-state" onClick={() => setModalType('requested')}>
                <Search size={24} />
                <p>Request items from them</p>
              </div>
            ) : (
              <div className="tb-items-list">
                {requestedItems.map(item => (
                  <div key={item._id} className="tb-cart-item">
                    <img src={getImageUrl(item.images?.[0])} alt="" />
                    <div className="tb-item-info">
                      <p className="tb-item-name">{item.title}</p>
                      <p className="tb-item-pts">{item.swapPointValue} pts</p>
                    </div>
                    <button 
                      className="tb-remove" 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleItem(item, 'requested');
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button className="tb-add-more" onClick={() => setModalType('requested')}>
                  <Plus size={14} /> Add more
                </button>
              </div>
            )}
            <div className="tb-cart-footer">
              <span>Total Value:</span>
              <span className="tb-total-val">{theirTotal} pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fairness & Actions */}
      <div className="tb-summary-panel slide-up">
        <FairnessGauge myValue={myTotal} theirValue={theirTotal} />
        
        {error && (
          <div className="alert-error" style={{ marginBottom: '20px' }}>
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        <div className="tb-actions">
          <div className="tb-info-box">
            <Info size={16} />
            <p>Proposals are not final until accepted by both sides.</p>
          </div>
          <button 
            className="btn btn-accent btn-lg tb-submit-btn" 
            disabled={submitting || offeredItems.length === 0 || requestedItems.length === 0}
            onClick={handleSubmit}
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : (
              <>
                <Sparkles size={18} /> Send Proposal to {receiver?.username}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Selection Modals */}
      {modalType === 'offered' && (
        <ItemSelectionModal 
          title="Offer your items"
          items={myInventory}
          selectedIds={offeredItems.map(i => i._id)}
          onToggle={(item) => toggleItem(item, 'offered')}
          onClose={() => setModalType(null)}
        />
      )}
      {modalType === 'requested' && (
        <ItemSelectionModal 
          title={`Browse ${receiver?.username}'s inventory`}
          items={theirInventory}
          selectedIds={requestedItems.map(i => i._id)}
          onToggle={(item) => toggleItem(item, 'requested')}
          onClose={() => setModalType(null)}
        />
      )}

      <style>{`
        .tb-header { margin-bottom: var(--space-8); }
        
        .tb-grid {
          display: grid; grid-template-columns: 1fr 60px 1fr;
          gap: var(--space-4); align-items: start; margin-bottom: var(--space-8);
        }
        
        .tb-column { display: flex; flex-direction: column; gap: 12px; }
        .tb-section-header { display: flex; justify-content: space-between; align-items: center; }
        .tb-section-header h3 { font-size: 1.1rem; font-weight: 700; margin: 0; }
        .tb-count { font-size: 0.75rem; color: var(--color-text-ghost); background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 10px; }
        
        .tb-cart {
          background: var(--color-surface-2); border: 1px solid var(--color-border);
          border-radius: var(--radius-xl); min-height: 200px; display: flex; flex-direction: column;
          overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .tb-empty-state {
          flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 12px; color: var(--color-text-ghost); cursor: pointer; transition: all 0.2s;
          border: 2px dashed rgba(255,255,255,0.05); margin: 12px; border-radius: var(--radius-lg);
        }
        .tb-empty-state:hover { color: var(--color-brand-light); background: rgba(99,102,241,0.03); border-color: var(--color-brand-light); }
        .tb-empty-state p { font-size: 0.9rem; font-weight: 500; }
        
        .tb-items-list { flex: 1; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
        .tb-cart-item {
          display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.03);
          padding: 8px; border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);
        }
        .tb-cart-item img { width: 40px; height: 40px; border-radius: 4px; object-fit: cover; }
        .tb-item-info { flex: 1; }
        .tb-item-name { font-size: 0.85rem; font-weight: 600; margin: 0; }
        .tb-item-pts { font-size: 0.75rem; color: var(--color-accent-light); margin: 0; }
        .tb-remove { background: none; border: none; color: var(--color-text-ghost); cursor: pointer; padding: 4px; border-radius: 4px; }
        .tb-remove:hover { background: rgba(239,68,68,0.1); color: #ef4444; }
        
        .tb-add-more {
          background: none; border: 1px dashed var(--color-border);
          color: var(--color-text-ghost); padding: 8px; border-radius: var(--radius-md);
          font-size: 0.8rem; font-weight: 500; cursor: pointer; display: flex;
          align-items: center; justify-content: center; gap: 6px; margin-top: 4px;
        }
        .tb-add-more:hover { color: var(--color-text-primary); border-color: var(--color-border-hover); }
        
        .tb-cart-footer {
          padding: 12px 16px; background: rgba(0,0,0,0.1);
          border-top: 1px solid var(--color-border-subtle);
          display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600;
        }
        .tb-total-val { color: var(--color-accent); }
        
        .tb-center { display: flex; align-items: center; justify-content: center; height: 100%; padding-top: 40px; }
        .tb-vs {
          width: 44px; height: 44px; border-radius: 50%; background: var(--color-surface-3);
          border: 1px solid var(--color-border); display: flex; align-items: center;
          justify-content: center; color: var(--color-text-ghost);
          box-shadow: 0 0 20px rgba(0,0,0,0.3);
        }
        
        .tb-summary-panel { max-width: 600px; margin: 0 auto; }
        
        .tb-actions { display: flex; flex-direction: column; gap: 16px; margin-top: var(--space-6); }
        .tb-info-box {
          display: flex; gap: 10px; padding: 12px 16px; background: rgba(99,102,241,0.05);
          border-radius: var(--radius-md); color: var(--color-text-ghost); font-size: 0.85rem;
        }
        .tb-submit-btn { width: 100%; justify-content: center; gap: 10px; height: 56px; font-size: 1.1rem; }

        @media (max-width: 900px) {
          .tb-grid { grid-template-columns: 1fr; gap: var(--space-6); }
          .tb-center { padding: 0; }
          .tb-vs { transform: rotate(90deg); }
        }
      `}</style>
    </div>
  );
}
