import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Send, Star, CheckCircle, XCircle, ArrowRightLeft } from 'lucide-react';
import { getImageUrl } from '../lib/utils';

export default function TradeDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [trade, setTrade] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [hasRated, setHasRated] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [t, m] = await Promise.all([api.get(`/trades/${id}`), api.get(`/trades/${id}/messages`)]);
        setTrade(t.data); setMessages(m.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
    const socket = io({ transports: ['websocket'] });
    socket.emit('join_trade', id);
    socket.on('new_message', (msg) => setMessages(prev => [...prev, msg]));
    socketRef.current = socket;
    return () => { socket.emit('leave_trade', id); socket.disconnect(); };
  }, [id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    try { await api.post(`/trades/${id}/messages`, { content: input }); setInput(''); } catch (err) { console.error(err); }
  };
  const updateStatus = async (status) => {
    try { const { data } = await api.patch(`/trades/${id}/status`, { status }); setTrade(data); } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };
  const submitRating = async () => {
    try { await api.post(`/trades/${id}/rate`, { score: rating, comment: ratingComment }); setHasRated(true); } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="page-container" style={{ paddingTop: 'calc(var(--nav-height) + var(--space-8))' }}><div className="skeleton" style={{ height: 400 }} /></div>;
  if (!trade) return null;

  const isInit = trade.initiator._id === user._id;
  const other = isInit ? trade.receiver : trade.initiator;
  const canChat = trade.status !== 'completed' && trade.status !== 'cancelled';

  const ItemRow = ({ item }) => (
    <div className="td-item-row">
      <div className="td-item-thumb">
        <img src={getImageUrl(item.images?.[0]) || 'https://via.placeholder.com/40'} alt="" />
      </div>
      <div>
        <p className="td-item-title">{item.title}</p>
        <p className="td-item-pts">{item.swapPointValue} pts</p>
      </div>
    </div>
  );

  return (
    <div className="page-container fade-in" style={{ paddingTop: 'calc(var(--nav-height) + var(--space-8))' }}>
      <div className="td-grid">
        {/* Left: Trade Info */}
        <div>
          <div className="card td-info-card">
            <div className="td-info-header">
              <div className="td-info-user">
                <div className="td-avatar">{other.username?.charAt(0).toUpperCase()}</div>
                <div>
                  <h2 className="td-info-name">Trade with {other.username}</h2>
                  <div className="td-info-trust">
                    <Star size={11} className="star-filled" fill="var(--color-accent)" />
                    <span>{other.trustScore?.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <span className={`badge ${trade.status === 'completed' ? 'badge-success' : trade.status === 'cancelled' ? 'badge-error' : trade.status === 'accepted' ? 'badge-brand' : 'badge-accent'}`}>
                {trade.status}
              </span>
            </div>

            <div className="td-items-section">
              <p className="td-items-label">Offered Items</p>
              {trade.offeredItems.map(i => <ItemRow key={i._id} item={i} />)}
            </div>
            <div className="td-items-section" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-5)' }}>
              <p className="td-items-label">Requested Items</p>
              {trade.requestedItems.map(i => <ItemRow key={i._id} item={i} />)}
            </div>
          </div>

          {/* Actions */}
          <div className="td-actions">
            {trade.status === 'pending' && !isInit && (
              <button className="btn btn-success" onClick={() => updateStatus('accepted')}><CheckCircle size={15} /> Accept</button>
            )}
            {trade.status === 'pending' && (
              <button className="btn btn-danger" onClick={() => updateStatus('cancelled')}><XCircle size={15} /> Cancel</button>
            )}
            {trade.status === 'accepted' && (
              <>
                <button className="btn btn-accent" onClick={() => updateStatus('completed')}><ArrowRightLeft size={15} /> Complete Trade</button>
                <button className="btn btn-danger" onClick={() => updateStatus('cancelled')}><XCircle size={15} /> Cancel</button>
              </>
            )}
          </div>

          {/* Rating */}
          {trade.status === 'completed' && !hasRated && (
            <div className="card td-rating-card">
              <p className="td-rating-title">Rate this trade</p>
              <div className="td-stars">
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setRating(s)} className="td-star-btn">
                    <Star size={22} fill={s <= rating ? 'var(--color-accent)' : 'none'}
                      className={s <= rating ? 'star-filled' : 'star-empty'} />
                  </button>
                ))}
              </div>
              <textarea className="input" placeholder="Optional comment..." value={ratingComment}
                onChange={e => setRatingComment(e.target.value)} style={{ minHeight: 60, marginBottom: 'var(--space-3)' }} />
              <button className="btn btn-primary" disabled={rating === 0} onClick={submitRating}>Submit Rating</button>
            </div>
          )}
          {hasRated && (
            <div className="card" style={{ padding: 'var(--space-5)', textAlign: 'center', marginTop: 'var(--space-4)' }}>
              <CheckCircle size={20} style={{ color: 'var(--color-success)', margin: '0 auto var(--space-2)' }} />
              <p style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: 'var(--text-base)' }}>Rating submitted</p>
            </div>
          )}
        </div>

        {/* Right: Chat */}
        <div className="card td-chat">
          <div className="td-chat-header">
            <span className="pulse-dot" />
            Chat
          </div>
          <div className="td-chat-messages">
            {messages.length === 0 && <p className="td-chat-empty">No messages yet. Start the conversation!</p>}
            {messages.map((msg, idx) => {
              const isMe = msg.sender?._id === user._id || msg.sender === user._id;
              return (
                <div key={idx} className={`td-msg ${isMe ? 'td-msg-me' : 'td-msg-them'}`}>
                  <div className="td-msg-bubble">
                    {!isMe && <p className="td-msg-sender">{msg.sender?.username}</p>}
                    <p>{msg.content}</p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
          {canChat && (
            <form onSubmit={sendMessage} className="td-chat-input">
              <input className="input" placeholder="Type a message..." value={input}
                onChange={e => setInput(e.target.value)} style={{ flex: 1 }} />
              <button type="submit" className="btn btn-primary btn-sm"><Send size={14} /></button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        /* ═══ TradeDetail — Interaction Rules ═══
           Trade info card: static, no hover (informational)
           Chat input: standard focus ring
           Messages: smooth scrolling */
        .td-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6); align-items: start; }

        .td-info-card { padding: var(--space-6); }
        .td-info-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: var(--space-6);
        }
        .td-info-user { display: flex; align-items: center; gap: var(--space-3); }
        .td-avatar {
          width: 42px; height: 42px; border-radius: 50%;
          background: linear-gradient(135deg, var(--color-brand), var(--color-accent));
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; color: #fff; font-size: var(--text-md);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .td-info-name { font-size: var(--text-lg); font-weight: 600; }
        .td-info-trust {
          display: flex; align-items: center; gap: var(--space-1);
          font-size: var(--text-sm); color: var(--color-text-secondary); margin-top: 2px;
        }

        .td-items-section { margin-bottom: var(--space-5); }
        .td-items-label {
          font-size: var(--text-sm); color: var(--color-text-muted); font-weight: 600;
          margin-bottom: var(--space-3); text-transform: uppercase; letter-spacing: 0.04em;
        }
        .td-item-row { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-3); }
        .td-item-thumb {
          width: 40px; height: 40px; border-radius: var(--radius-sm);
          background: var(--color-surface-2); overflow: hidden;
          border: 1px solid var(--color-border-subtle); flex-shrink: 0;
        }
        .td-item-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .td-item-title { font-size: var(--text-base); font-weight: 500; }
        .td-item-pts { font-size: var(--text-sm); color: var(--color-accent); font-weight: 600; }

        .td-actions { display: flex; gap: var(--space-2); flex-wrap: wrap; margin-top: var(--space-4); }

        .td-rating-card { padding: var(--space-5); margin-top: var(--space-4); }
        .td-rating-title { font-weight: 600; margin-bottom: var(--space-3); }
        .td-stars { display: flex; gap: var(--space-1); margin-bottom: var(--space-3); }
        .td-star-btn { background: none; border: none; cursor: pointer; padding: 2px; transition: transform var(--duration-fast); }
        .td-star-btn:active { transform: scale(0.9); }

        /* Chat */
        .td-chat { display: flex; flex-direction: column; height: calc(100vh - 280px); min-height: 400px; max-height: 600px; overflow: hidden; }
        .td-chat-header {
          padding: var(--space-4) var(--space-5);
          border-bottom: 1px solid var(--color-border);
          font-weight: 600; font-size: var(--text-base);
          display: flex; align-items: center; gap: var(--space-2);
        }
        .td-chat-messages {
          flex: 1; overflow-y: auto; padding: var(--space-4);
          display: flex; flex-direction: column; gap: var(--space-2);
        }
        .td-chat-empty {
          color: var(--color-text-ghost); text-align: center;
          margin-top: var(--space-10); font-size: var(--text-base);
        }
        .td-msg { display: flex; }
        .td-msg-me { justify-content: flex-end; }
        .td-msg-them { justify-content: flex-start; }
        .td-msg-bubble {
          max-width: 70%; padding: var(--space-2) var(--space-4);
          border-radius: var(--radius); font-size: var(--text-base); line-height: 1.5;
        }
        .td-msg-me .td-msg-bubble {
          background: var(--color-brand); color: #fff;
          border-bottom-right-radius: var(--radius-xs);
        }
        .td-msg-them .td-msg-bubble {
          background: var(--color-surface-2); color: var(--color-text-primary);
          border-bottom-left-radius: var(--radius-xs);
        }
        .td-msg-sender { font-size: var(--text-xs); font-weight: 600; color: var(--color-brand-light); margin-bottom: 2px; }

        .td-chat-input {
          display: flex; gap: var(--space-2); padding: var(--space-3);
          border-top: 1px solid var(--color-border);
        }

        @media (max-width: 768px) {
          .td-grid { grid-template-columns: 1fr; }
          .td-chat { height: 500px; }
        }
      `}</style>
    </div>
  );
}
