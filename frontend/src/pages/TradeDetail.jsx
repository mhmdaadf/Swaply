import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { 
  Send, Star, CheckCircle, XCircle, ArrowRightLeft, 
  MessageSquare, Shield, Clock, AlertTriangle, Sparkles,
  Loader2, Info
} from 'lucide-react';
import { getImageUrl } from '../lib/utils';
import FairnessGauge from '../components/FairnessGauge';

export default function TradeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [trade, setTrade] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [hasRated, setHasRated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const bottomRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [t, m] = await Promise.all([
          api.get(`/trades/${id}`),
          api.get(`/trades/${id}/messages`)
        ]);
        setTrade(t.data);
        setMessages(m.data);
      } catch (err) {
        console.error(err);
        navigate('/trades');
      } finally {
        setLoading(false);
      }
    };
    load();

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    socket.emit('join_trade', id);
    socket.on('new_message', (msg) => setMessages(prev => [...prev, msg]));
    
    socketRef.current = socket;
    return () => {
      socket.emit('leave_trade', id);
      socket.disconnect();
    };
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      await api.post(`/trades/${id}/messages`, { content: input });
      setInput('');
    } catch (err) { console.error(err); }
  };

  const updateStatus = async (status) => {
    setSubmitting(true);
    try {
      const { data } = await api.patch(`/trades/${id}/status`, { status });
      setTrade(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update trade status');
    } finally {
      setSubmitting(false);
    }
  };

  const submitRating = async () => {
    try {
      await api.post(`/trades/${id}/rate`, { score: rating, comment: ratingComment });
      setHasRated(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit rating');
    }
  };

  if (loading) return (
    <div className="page-container" style={{ paddingTop: '100px', textAlign: 'center' }}>
      <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto', color: 'var(--color-brand-light)' }} />
    </div>
  );
  if (!trade) return null;

  const isInit = trade.initiator?._id === user?._id;
  const other = isInit ? trade.receiver : trade.initiator;
  const canChat = trade.status !== 'completed' && trade.status !== 'cancelled';
  
  const myItems = (isInit ? trade.offeredItems : trade.requestedItems) || [];
  const theirItems = (isInit ? trade.requestedItems : trade.offeredItems) || [];
  
  const myVal = Array.isArray(myItems) ? myItems.reduce((s, i) => s + (i?.swapPointValue || 0), 0) : 0;
  const theirVal = Array.isArray(theirItems) ? theirItems.reduce((s, i) => s + (i?.swapPointValue || 0), 0) : 0;

  const ItemCard = ({ item }) => {
    if (!item) return null;
    return (
      <div className="td-item-mini">
        <img src={getImageUrl(item.images?.[0])} alt="" />
        <div className="td-item-mini-info">
          <p>{item.title || 'Untitled Item'}</p>
          <span>{item.swapPointValue || 0} pts</span>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container fade-in" style={{ paddingTop: 'calc(var(--nav-height) + var(--space-8))' }}>
      {/* Header Info */}
      <div className="td-header">
        <div className="td-header-left">
          <div className="td-user-pill">
            <div className="td-avatar">{other?.username?.charAt(0).toUpperCase() || '?'}</div>
            <div>
              <h3>Trade with {other?.username || 'User'}</h3>
              <div className="td-trust">
                <Star size={12} fill="var(--color-accent)" color="var(--color-accent)" />
                <span>{other?.totalRatings > 0 ? `${other.trustScore.toFixed(1)} Trust Score` : 'New Member'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="td-header-right">
          <div className={`td-status-tag ${trade.status}`}>
            {trade.status === 'pending' && <Clock size={14} />}
            {trade.status === 'accepted' && <CheckCircle size={14} />}
            {trade.status === 'completed' && <Sparkles size={14} />}
            {trade.status === 'cancelled' && <XCircle size={14} />}
            {trade.status}
          </div>
        </div>
      </div>

      <div className="td-main-grid">
        {/* Left Side: Items & Fairness */}
        <div className="td-trade-summary">
          <div className="td-comparison glass">
            <div className="td-comp-col">
              <h4>Your Items</h4>
              <div className="td-items-stack">
                {myItems.map(i => <ItemCard key={i._id} item={i} />)}
              </div>
              <div className="td-comp-total">Total: {myVal} pts</div>
            </div>
            
            <div className="td-comp-vs">
              <ArrowRightLeft size={20} />
            </div>
            
            <div className="td-comp-col">
              <h4>Their Items</h4>
              <div className="td-items-stack">
                {theirItems.map(i => <ItemCard key={i._id} item={i} />)}
              </div>
              <div className="td-comp-total">Total: {theirVal} pts</div>
            </div>
          </div>

          <FairnessGauge myValue={isInit ? myVal : theirVal} theirValue={isInit ? theirVal : myVal} />

          {/* Actions Panel */}
          <div className="td-actions-panel card">
            <div className="td-actions-content">
              {trade.status === 'pending' && !isInit && (
                <div className="td-action-prompt">
                  <p>Would you like to accept this trade proposal?</p>
                  <div className="td-btn-group">
                    <button className="btn btn-success" onClick={() => updateStatus('accepted')} disabled={submitting}>
                      <CheckCircle size={16} /> Accept Trade
                    </button>
                    <button className="btn btn-danger-outline" onClick={() => updateStatus('cancelled')} disabled={submitting}>
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                </div>
              )}
              
              {trade.status === 'pending' && isInit && (
                <div className="td-action-prompt">
                  <p>Awaiting response from {other.username}...</p>
                  <button className="btn btn-danger-outline" onClick={() => updateStatus('cancelled')} disabled={submitting}>
                    <XCircle size={16} /> Cancel Proposal
                  </button>
                </div>
              )}

              {trade.status === 'accepted' && (
                <div className="td-action-prompt">
                  <div className="td-accepted-notice">
                    <CheckCircle size={24} color="var(--color-success)" />
                    <div>
                      <p><strong>Trade Accepted!</strong></p>
                      <p>Coordinate with {other.username} to complete the physical swap.</p>
                    </div>
                  </div>
                  <div className="td-btn-group">
                    <button className="btn btn-accent" onClick={() => updateStatus('completed')} disabled={submitting}>
                      <Sparkles size={16} /> Mark as Completed
                    </button>
                    <button className="btn btn-danger-outline" onClick={() => updateStatus('cancelled')} disabled={submitting}>
                      <XCircle size={16} /> Cancel Trade
                    </button>
                  </div>
                </div>
              )}

              {trade.status === 'completed' && !hasRated && (
                <div className="td-rating-box fade-in">
                  <h4>Rate your experience</h4>
                  <div className="td-rating-stars">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} onClick={() => setRating(s)} className="td-star-btn">
                        <Star size={24} fill={s <= rating ? 'var(--color-accent)' : 'none'}
                          color={s <= rating ? 'var(--color-accent)' : 'var(--color-text-ghost)'} />
                      </button>
                    ))}
                  </div>
                  <textarea 
                    className="input" 
                    placeholder="Tell others about your experience..." 
                    value={ratingComment}
                    onChange={e => setRatingComment(e.target.value)} 
                  />
                  <button className="btn btn-primary" style={{ marginTop: 12, width: '100%' }} disabled={rating === 0} onClick={submitRating}>
                    Submit Review
                  </button>
                </div>
              )}
              
              {hasRated && (
                <div className="td-rating-success">
                  <CheckCircle size={20} color="var(--color-success)" />
                  <p>Review submitted! Thank you for keeping Swaply safe.</p>
                </div>
              )}

              {trade.status === 'cancelled' && (
                <div className="td-cancelled-box">
                  <XCircle size={24} color="var(--color-error)" />
                  <p>This trade has been cancelled.</p>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate('/explore')}>Explore more items</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Chat System */}
        <div className="td-chat-panel card">
          <div className="td-chat-header">
            <MessageSquare size={18} color="var(--color-brand-light)" />
            <h3>Negotiation Chat</h3>
          </div>
          
          <div className="td-chat-history">
            {messages.length === 0 && (
              <div className="td-chat-empty">
                <Info size={32} opacity={0.2} />
                <p>Start the conversation with {other.username}</p>
              </div>
            )}
            {messages.map((msg, idx) => {
              if (!msg) return null;
              const senderId = msg.sender?._id || msg.sender;
              const isMe = senderId === user?._id;
              let timeStr = '';
              try { 
                if (msg.createdAt) timeStr = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              } catch(e) {}

              return (
                <div key={idx} className={`td-msg ${isMe ? 'me' : 'them'}`}>
                  <div className="td-msg-bubble shadow-sm">
                    {!isMe && <p className="td-msg-name">{msg.sender?.username || 'User'}</p>}
                    <p className="td-msg-text">{msg.content}</p>
                    <span className="td-msg-time">{timeStr}</span>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {canChat && (
            <form onSubmit={sendMessage} className="td-chat-input-wrap">
              <input 
                className="input" 
                placeholder="Suggest an adjustment or coordinate meet-up..." 
                value={input}
                onChange={e => setInput(e.target.value)} 
              />
              <button type="submit" className="btn btn-primary btn-icon" disabled={!input.trim()}>
                <Send size={16} />
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        .td-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: var(--space-8);
        }
        .td-user-pill { display: flex; align-items: center; gap: 12px; }
        .td-avatar {
          width: 48px; height: 48px; border-radius: 50%;
          background: linear-gradient(135deg, var(--color-brand), var(--color-accent));
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 800; font-size: 1.2rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .td-header h3 { margin: 0; font-size: 1.2rem; font-weight: 700; }
        .td-trust { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: var(--color-text-ghost); }
        
        .td-status-tag {
          display: flex; align-items: center; gap: 6px; padding: 6px 14px;
          border-radius: var(--radius-full); font-size: 0.8rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .td-status-tag.pending { background: rgba(245,158,11,0.1); color: #f59e0b; }
        .td-status-tag.accepted { background: rgba(34,197,94,0.1); color: #22c55e; }
        .td-status-tag.completed { background: rgba(167,139,250,0.1); color: #a78bfa; }
        .td-status-tag.cancelled { background: rgba(239,68,68,0.1); color: #ef4444; }

        .td-main-grid {
          display: grid; grid-template-columns: 1fr 400px; gap: var(--space-8);
          align-items: start;
        }

        .td-comparison {
          display: grid; grid-template-columns: 1fr 50px 1fr;
          padding: var(--space-6); border-radius: var(--radius-xl);
          border: 1px solid var(--color-border); background: rgba(255,255,255,0.02);
          margin-bottom: var(--space-6);
        }
        .td-comp-col { display: flex; flex-direction: column; gap: 12px; }
        .td-comp-col h4 { font-size: 0.85rem; text-transform: uppercase; color: var(--color-text-ghost); margin: 0; }
        .td-items-stack { display: flex; flex-direction: column; gap: 8px; }
        .td-item-mini {
          display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.03);
          padding: 8px; border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);
        }
        .td-item-mini img { width: 36px; height: 36px; border-radius: 4px; object-fit: cover; }
        .td-item-mini-info p { font-size: 0.8rem; font-weight: 600; margin: 0; }
        .td-item-mini-info span { font-size: 0.7rem; color: var(--color-accent-light); }
        .td-comp-total { font-size: 0.9rem; font-weight: 700; margin-top: 8px; border-top: 1px solid var(--color-border-subtle); padding-top: 8px; }
        .td-comp-vs { display: flex; align-items: center; justify-content: center; color: var(--color-text-ghost); opacity: 0.3; }

        .td-actions-panel { padding: var(--space-6); border-radius: var(--radius-xl); }
        .td-action-prompt { text-align: center; }
        .td-action-prompt p { margin-bottom: 20px; color: var(--color-text-secondary); }
        .td-btn-group { display: flex; gap: 12px; justify-content: center; }
        
        .td-accepted-notice {
          display: flex; align-items: center; gap: 16px; text-align: left;
          background: rgba(34,197,94,0.05); padding: 16px; border-radius: var(--radius-lg);
          margin-bottom: 20px; border: 1px solid rgba(34,197,94,0.1);
        }
        .td-accepted-notice p { margin: 0; color: #fff; }
        .td-accepted-notice p:last-child { font-size: 0.85rem; color: var(--color-text-secondary); margin-top: 4px; }

        .td-rating-box h4 { margin-bottom: 16px; }
        .td-rating-stars { display: flex; gap: 8px; justify-content: center; margin-bottom: 20px; }
        .td-star-btn { background: none; border: none; cursor: pointer; transition: transform 0.1s; }
        .td-star-btn:hover { transform: scale(1.1); }
        .td-rating-success { text-align: center; color: var(--color-success); font-weight: 600; padding: 20px; }

        .td-cancelled-box { text-align: center; padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 12px; }

        /* Chat System */
        .td-chat-panel {
          display: flex; flex-direction: column; height: 600px;
          border-radius: var(--radius-xl); overflow: hidden;
        }
        .td-chat-header {
          padding: 16px 20px; border-bottom: 1px solid var(--color-border-subtle);
          display: flex; align-items: center; gap: 12px;
        }
        .td-chat-header h3 { margin: 0; font-size: 1rem; font-weight: 700; }
        
        .td-chat-history {
          flex: 1; overflow-y: auto; padding: 20px;
          display: flex; flex-direction: column; gap: 12px;
          background: rgba(0,0,0,0.05);
        }
        .td-msg { display: flex; width: 100%; }
        .td-msg.me { justify-content: flex-end; }
        .td-msg.them { justify-content: flex-start; }
        
        .td-msg-bubble {
          max-width: 85%; padding: 10px 14px; border-radius: 14px;
          position: relative;
        }
        .td-msg.me .td-msg-bubble {
          background: var(--color-brand); color: #fff;
          border-bottom-right-radius: 2px;
        }
        .td-msg.them .td-msg-bubble {
          background: var(--color-surface-3); color: #fff;
          border-bottom-left-radius: 2px;
        }
        .td-msg-name { font-size: 0.7rem; font-weight: 700; color: var(--color-brand-light); margin-bottom: 4px; }
        .td-msg-text { font-size: 0.9rem; margin: 0; line-height: 1.5; }
        .td-msg-time { font-size: 0.65rem; color: rgba(255,255,255,0.4); margin-top: 4px; display: block; text-align: right; }

        .td-chat-input-wrap {
          padding: 16px; border-top: 1px solid var(--color-border-subtle);
          display: flex; gap: 10px;
        }
        .btn-icon { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 0; flex-shrink: 0; }

        @media (max-width: 1024px) {
          .td-main-grid { grid-template-columns: 1fr; }
          .td-chat-panel { height: 500px; }
        }
        
        @media (max-width: 600px) {
          .td-comparison { grid-template-columns: 1fr; gap: 20px; text-align: center; }
          .td-comp-vs { transform: rotate(90deg); }
          .td-btn-group { flex-direction: column; }
          .btn { width: 100%; }
        }
      `}</style>
    </div>
  );
}
