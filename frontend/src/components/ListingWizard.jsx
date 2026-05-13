import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Brain, Send, X, CheckCircle2, Sparkles, Tag, Clock, DollarSign, Package } from 'lucide-react';
import api from '../lib/api';

const FIELD_INDICATORS = [
  { key: 'itemName', label: 'Item', icon: Package },
  { key: 'category', label: 'Category', icon: Tag },
  { key: 'condition', label: 'Condition', icon: CheckCircle2 },
  { key: 'originalPrice', label: 'Price', icon: DollarSign },
  { key: 'ageMonths', label: 'Age', icon: Clock },
];

export default function ListingWizard({ onClose, onComplete }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "What are you listing? Give me as much detail as you can — name, condition, age, price — and I'll handle the rest." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [extractedFields, setExtractedFields] = useState({});
  const [recommendation, setRecommendation] = useState(null);
  const [turnCount, setTurnCount] = useState(0);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [loading]);

  const filledCount = FIELD_INDICATORS.filter(f => {
    const val = extractedFields[f.key];
    return val !== null && val !== undefined && val !== '';
  }).length;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setTurnCount(prev => prev + 1);

    try {
      const { data } = await api.post('/items/wizard-chat', {
        messages: newMessages,
        extractedFields
      });

      if (data.isComplete) {
        setRecommendation(data.recommendation);
        setMessages([...newMessages, { role: 'assistant', content: data.message }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: data.message }]);
        if (data.extractedFields) setExtractedFields(prev => ({ ...prev, ...data.extractedFields }));
        // Legacy support
        if (data.currentData) setExtractedFields(prev => ({ ...prev, ...data.currentData }));
      }
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: 'assistant', content: "Connection hiccup — try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = () => {
    onComplete(recommendation);
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="wizard-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wizard-header">
          <div className="header-info">
            <div className="concierge-avatar">
              <Brain size={20} color="#fff" />
              <div className="pulse-ring" />
            </div>
            <div>
              <h3>Smart AI Lister</h3>
              <p className="status">{loading ? 'Analyzing...' : `${filledCount}/${FIELD_INDICATORS.length} fields detected`}</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>

        {/* Field Progress Bar */}
        <div className="wizard-progress">
          {FIELD_INDICATORS.map(({ key, label, icon: Icon }) => {
            const val = extractedFields[key];
            const filled = val !== null && val !== undefined && val !== '';
            return (
              <div key={key} className={`progress-chip ${filled ? 'filled' : ''}`} title={filled ? `${label}: ${val}` : `${label}: pending`}>
                <Icon size={11} />
                <span>{label}</span>
                {filled && <CheckCircle2 size={9} className="check-icon" />}
              </div>
            );
          })}
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {messages.map((m, i) => (
            <div key={i} className={`message-row ${m.role}`}>
              <div className="message-bubble">
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="message-row assistant">
              <div className="message-bubble loading-dots">
                <span>.</span><span>.</span><span>.</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Footer / Input or Recommendation */}
        <div className="wizard-footer">
          {recommendation ? (
            <div className="recommendation-panel slide-up">
              <div className="rec-header">
                <CheckCircle2 size={18} color="#22c55e" />
                <span>Listing Ready — {turnCount} {turnCount === 1 ? 'turn' : 'turns'}</span>
              </div>
              <div className="rec-card">
                <div className="rec-row">
                  <span className="rec-label">Title</span>
                  <span className="rec-val">{recommendation.title}</span>
                </div>
                <div className="rec-row">
                  <span className="rec-label">Value</span>
                  <span className="rec-val pts">{recommendation.swapPointValue} pts</span>
                </div>
                <div className="rec-row">
                   <span className="rec-label">Category</span>
                   <span className="rec-val">{recommendation.category}</span>
                </div>
                <div className="rec-row">
                   <span className="rec-label">Condition</span>
                   <span className="rec-val">{recommendation.condition}</span>
                </div>
                <p className="rec-desc">{recommendation.description}</p>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', padding: '14px' }} onClick={handlePost}>
                <Sparkles size={16} /> Post This Listing
              </button>
            </div>
          ) : (
            <form onSubmit={handleSend} className="input-row">
              <input
                ref={inputRef}
                className="input"
                type="text"
                placeholder={turnCount === 0 ? 'e.g. iPhone 13 Pro, good condition, bought for $999 last year' : 'Type your answer...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button type="submit" className="send-btn" disabled={!input.trim() || loading}>
                <Send size={18} />
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        /* ═══ ListingWizard v2 ═══ */
        .wizard-container {
          display: flex; flex-direction: column; overflow: hidden;
          width: 100%; max-width: 600px; 
          height: calc(100vh - var(--space-16)); 
          min-height: 400px; max-height: 700px;
          padding: 0;
        }
        
        .wizard-header {
          padding: var(--space-4) var(--space-6); 
          border-bottom: 1px solid var(--color-border);
          display: flex; justify-content: space-between; align-items: center;
          background: rgba(255,255,255,0.01);
        }
        .header-info { display: flex; align-items: center; gap: var(--space-3); }
        .concierge-avatar {
          width: 40px; height: 40px; border-radius: var(--radius);
          background: linear-gradient(135deg, var(--color-brand), #a78bfa);
          display: flex; align-items: center; justify-content: center;
          position: relative; box-shadow: inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .pulse-ring {
          position: absolute; inset: -3px; border-radius: calc(var(--radius) + 2px);
          border: 2px solid rgba(167, 139, 250, 0.3);
          animation: ring-pulse 2s infinite;
        }
        .wizard-header h3 { font-size: var(--text-md); font-weight: 700; color: #fff; margin: 0; }
        .status { font-size: var(--text-xs); color: var(--color-brand-light); margin: 0; font-weight: 600; }
        .close-btn { 
          background: var(--color-surface-2); border: 1px solid var(--color-border); 
          border-radius: var(--radius-sm); color: var(--color-text-muted); 
          cursor: pointer; padding: 6px; 
          transition: all var(--duration-fast) var(--ease-smooth);
        }
        .close-btn:hover { border-color: var(--color-border-hover); color: var(--color-text-primary); }
        .close-btn:active { transform: scale(0.95); }

        /* ── Progress Bar ── */
        .wizard-progress {
          display: flex; gap: 6px; padding: 10px var(--space-6);
          border-bottom: 1px solid var(--color-border-subtle);
          background: rgba(0,0,0,0.1);
          overflow-x: auto;
        }
        .progress-chip {
          display: flex; align-items: center; gap: 4px;
          padding: 4px 10px; border-radius: var(--radius-full);
          font-size: 0.65rem; font-weight: 600; white-space: nowrap;
          background: rgba(255,255,255,0.03);
          color: var(--color-text-ghost);
          border: 1px solid var(--color-border-subtle);
          transition: all 0.3s ease;
        }
        .progress-chip.filled {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
          border-color: rgba(34, 197, 94, 0.25);
        }
        .check-icon { margin-left: 2px; }

        .chat-area { 
          flex: 1; overflow-y: auto; padding: var(--space-6); 
          display: flex; flex-direction: column; gap: var(--space-4); 
        }
        .message-row { display: flex; width: 100%; }
        .message-row.assistant { justify-content: flex-start; }
        .message-row.user { justify-content: flex-end; }
        .message-bubble {
          max-width: 85%; padding: var(--space-3) var(--space-5); border-radius: var(--radius-lg);
          font-size: var(--text-md); line-height: 1.6;
        }
        .assistant .message-bubble { background: var(--color-surface-4); color: #fff; border-bottom-left-radius: var(--radius-xs); }
        .user .message-bubble { background: var(--color-brand); color: #fff; border-bottom-right-radius: var(--radius-xs); }

        .wizard-footer { 
          padding: var(--space-4) var(--space-6); 
          border-top: 1px solid var(--color-border); 
          background: rgba(0,0,0,0.15); 
        }
        .input-row { display: flex; gap: var(--space-2); }
        .input-row .input { flex: 1; }
        
        .send-btn {
          width: 46px; height: 46px; border-radius: var(--radius); 
          background: var(--color-brand); border: none; color: #fff; 
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: transform var(--duration-fast), filter var(--duration-base);
          box-shadow: var(--shadow-brand);
          flex-shrink: 0;
        }
        .send-btn:hover:not(:disabled) { filter: brightness(1.1); box-shadow: var(--shadow-brand-lg); }
        .send-btn:active:not(:disabled) { transform: scale(0.95); }
        .send-btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

        .recommendation-panel { }
        .rec-header { display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-4); font-weight: 600; color: #fff; }
        .rec-card {
          background: var(--color-surface-1); border: 1px solid var(--color-border);
          border-radius: var(--radius); padding: var(--space-4); margin-bottom: var(--space-4);
        }
        .rec-row { display: flex; justify-content: space-between; margin-bottom: var(--space-2); font-size: var(--text-base); }
        .rec-label { color: var(--color-text-muted); font-weight: 500; }
        .rec-val { color: #fff; font-weight: 600; text-align: right; max-width: 60%; }
        .rec-val.pts { color: var(--color-accent); font-weight: 800; }
        .rec-desc { 
          font-size: var(--text-sm); color: var(--color-text-secondary); 
          line-height: 1.7; margin-top: var(--space-3); padding-top: var(--space-3); 
          border-top: 1px solid var(--color-border-subtle); 
        }

        @keyframes ring-pulse { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(1.3); opacity: 0; } }
        .loading-dots span { animation: blink 1.4s infinite both; font-size: 1.5rem; line-height: 0; }
        .loading-dots span:nth-child(2) { animation-delay: .2s; }
        .loading-dots span:nth-child(3) { animation-delay: .4s; }
        @keyframes blink { 0% { opacity: .2; } 20% { opacity: 1; } 100% { opacity: .2; } }
      `}</style>
    </div>,
    document.body
  );
}
