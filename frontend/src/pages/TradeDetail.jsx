import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Send, Star, CheckCircle, XCircle, ArrowRightLeft } from 'lucide-react';

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
        setTrade(t.data);
        setMessages(m.data);
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

  if (loading) return <div className="page-container" style={{ paddingTop: 84 }}><div className="skeleton" style={{ height: 400 }} /></div>;
  if (!trade) return null;

  const isInit = trade.initiator._id === user._id;
  const other = isInit ? trade.receiver : trade.initiator;
  const canChat = trade.status !== 'completed' && trade.status !== 'cancelled';

  return (
    <div className="page-container fade-in" style={{ paddingTop: 84 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Left: Trade Info */}
        <div>
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Trade with {other.username}</h2>
              <span className={`badge ${trade.status === 'completed' ? 'badge-success' : trade.status === 'cancelled' ? 'badge-error' : trade.status === 'accepted' ? 'badge-brand' : 'badge-accent'}`}>{trade.status}</span>
            </div>
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>Offered Items</p>
              {trade.offeredItems.map(i => <div key={i._id} style={{ padding: '6px 0', fontSize: '0.9rem' }}>{i.title} <span style={{ color: 'var(--color-accent)', fontSize: '0.8rem' }}>{i.swapPointValue}pts</span></div>)}
            </div>
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>Requested Items</p>
              {trade.requestedItems.map(i => <div key={i._id} style={{ padding: '6px 0', fontSize: '0.9rem' }}>{i.title} <span style={{ color: 'var(--color-accent)', fontSize: '0.8rem' }}>{i.swapPointValue}pts</span></div>)}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {trade.status === 'pending' && !isInit && (
              <button className="btn btn-success" onClick={() => updateStatus('accepted')}><CheckCircle size={16} /> Accept</button>
            )}
            {trade.status === 'pending' && (
              <button className="btn btn-danger" onClick={() => updateStatus('cancelled')}><XCircle size={16} /> Cancel</button>
            )}
            {trade.status === 'accepted' && (
              <>
                <button className="btn btn-accent" onClick={() => updateStatus('completed')}><ArrowRightLeft size={16} /> Complete Trade</button>
                <button className="btn btn-danger" onClick={() => updateStatus('cancelled')}><XCircle size={16} /> Cancel</button>
              </>
            )}
          </div>

          {/* Rating */}
          {trade.status === 'completed' && !hasRated && (
            <div className="card" style={{ padding: 20, marginTop: 16 }}>
              <p style={{ fontWeight: 600, marginBottom: 12 }}>Rate this trade</p>
              <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={() => setRating(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                    <Star size={24} fill={s <= rating ? 'var(--color-accent)' : 'none'} className={s <= rating ? 'star-filled' : 'star-empty'} />
                  </button>
                ))}
              </div>
              <textarea className="input" placeholder="Optional comment..." value={ratingComment} onChange={e => setRatingComment(e.target.value)} style={{ marginBottom: 12, minHeight: 60 }} />
              <button className="btn btn-primary" disabled={rating === 0} onClick={submitRating}>Submit Rating</button>
            </div>
          )}
          {hasRated && <div className="card" style={{ padding: 16, marginTop: 16, textAlign: 'center' }}><CheckCircle size={20} style={{ color: 'var(--color-success)', margin: '0 auto 8px' }} /><p style={{ color: 'var(--color-success)' }}>Rating submitted</p></div>}
        </div>

        {/* Right: Chat */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 520 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)', fontWeight: 600, fontSize: '0.9rem' }}>Chat</div>
          <div style={{ flex: 1, overflow: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.length === 0 && <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 40, fontSize: '0.85rem' }}>No messages yet. Start the conversation!</p>}
            {messages.map((msg, idx) => {
              const isMe = msg.sender?._id === user._id || msg.sender === user._id;
              return (
                <div key={idx} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '70%', padding: '8px 14px', borderRadius: 'var(--radius)', background: isMe ? 'var(--color-brand)' : 'var(--color-surface-elevated)', color: isMe ? '#fff' : 'var(--color-text-primary)', fontSize: '0.85rem' }}>
                    {!isMe && <p style={{ fontSize: '0.7rem', fontWeight: 600, marginBottom: 2, color: 'var(--color-brand-light)' }}>{msg.sender?.username}</p>}
                    <p>{msg.content}</p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
          {canChat && (
            <form onSubmit={sendMessage} style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid var(--color-border)' }}>
              <input className="input" placeholder="Type a message..." value={input} onChange={e => setInput(e.target.value)} style={{ flex: 1 }} />
              <button type="submit" className="btn btn-primary btn-sm"><Send size={16} /></button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
