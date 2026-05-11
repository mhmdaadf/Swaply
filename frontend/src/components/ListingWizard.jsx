import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Brain, Send, X, Package, CheckCircle2, ChevronRight, Sparkles, Wand2 } from 'lucide-react';
import api from '../lib/api';

export default function ListingWizard({ onClose, onComplete }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your Smart AI Assistant. ✨ What would you like to list today? Just tell me the name of the item!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentData, setCurrentData] = useState({});
  const [recommendation, setRecommendation] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/items/wizard-chat', {
        messages: newMessages,
        currentData
      });

      if (data.isComplete) {
        setRecommendation(data.recommendation);
        setMessages([...newMessages, { role: 'assistant', content: data.message }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: data.message }]);
        if (data.currentData) setCurrentData(data.currentData);
      }
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: 'assistant', content: "I'm sorry, I hit a snag. Let's try that again!" }]);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    // In a real app, we'd navigate to a confirm page or just post
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
              <p className="status">{loading ? 'AI is thinking...' : 'Online'}</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close"><X size={16} /></button>
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
                <span>Optimized Listing Ready!</span>
              </div>
              <div className="rec-card">
                <div className="rec-row">
                  <span className="rec-label">Title</span>
                  <span className="rec-val">{recommendation.title}</span>
                </div>
                <div className="rec-row">
                  <span className="rec-label">Recommended Value</span>
                  <span className="rec-val pts">{recommendation.swapPointValue} pts</span>
                </div>
                <div className="rec-row">
                   <span className="rec-label">Category</span>
                   <span className="rec-val">{recommendation.category}</span>
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
                className="input"
                type="text"
                placeholder="Type your answer..."
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
        /* ═══ ListingWizard — Enterprise Polish ═══ */
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
        .status { font-size: var(--text-xs); color: var(--color-success); margin: 0; font-weight: 600; }
        .close-btn { 
          background: var(--color-surface-2); border: 1px solid var(--color-border); 
          border-radius: var(--radius-sm); color: var(--color-text-muted); 
          cursor: pointer; padding: 6px; 
          transition: all var(--duration-fast) var(--ease-smooth);
        }
        .close-btn:hover { border-color: var(--color-border-hover); color: var(--color-text-primary); }
        .close-btn:active { transform: scale(0.95); }

        .chat-area { 
          flex: 1; overflow-y: auto; padding: var(--space-6); 
          display: flex; flex-direction: column; gap: var(--space-4); 
        }
        .message-row { display: flex; width: 100%; }
        .message-row.assistant { justify-content: flex-start; }
        .message-row.user { justify-content: flex-end; }
        .message-bubble {
          max-width: 80%; padding: var(--space-3) var(--space-5); border-radius: var(--radius-lg);
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
        .rec-val { color: #fff; font-weight: 600; }
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
