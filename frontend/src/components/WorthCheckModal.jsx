import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Brain, TrendingUp, X, Info, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function WorthCheckModal({ item, onClose }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!item) return;
    runEstimation();
  }, [item]);

  useEffect(() => {
    const timer = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400);
    return () => clearInterval(timer);
  }, []);

  const runEstimation = async () => {
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post('/items/estimate', {
        category: item.category,
        originalPrice: item.originalPrice,
        condition: item.condition,
        ageMonths: item.ageMonths,
        title: item.title,
        description: item.description,
        itemId: item._id,
      });
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isAI = result?.method === 'ai';

  return (
    <div className="wc-overlay fade-in" onClick={onClose}>
      <div className="wc-modal" onClick={e => e.stopPropagation()}>
        <button className="wc-close" onClick={onClose} aria-label="Close"><X size={18} /></button>

        <div className="wc-header">
          <div className="wc-header-icon">
            <Brain size={18} color="#fff" />
          </div>
          <div>
            <h3>AI Fairness Verification</h3>
            <p>Analyzing "{item.title}"</p>
          </div>
        </div>

        {loading ? (
          <div className="wc-loading">
            <div className="wc-brain-pulse">
              <Brain size={22} color="#fff" />
              <div className="wc-brain-ring" />
            </div>
            <p className="wc-loading-title">AI Engine Processing{dots}</p>
            <p className="wc-loading-sub">Scanning global markets & Swaply database</p>
          </div>
        ) : result ? (
          <div className="wc-result fade-in">
            <div className="wc-value-section">
              <p className="wc-val-label">AI Estimated Worth</p>
              <p className={`wc-val-number ${isAI ? 'wc-val-gradient' : ''}`}>
                {result.swapPointValue} <span className="wc-val-unit">pts</span>
              </p>
            </div>

            {/* Fairness Badge */}
            <div className="wc-fairness">
              <Info size={12} />
              <span>
                {(() => {
                  const priceDiff = item.swapPointValue - result.swapPointValue;
                  const isPriceFair = Math.abs(priceDiff) < 50;
                  const isHonest = result.honestyScore > 0.7;

                  if (isPriceFair && isHonest) {
                    return <>Seller: {item.swapPointValue} pts — <span style={{ color: '#22c55e', fontWeight: 700 }}>Fair Deal</span></>;
                  } else if (isPriceFair && !isHonest) {
                    return <>Seller: {item.swapPointValue} pts — <span style={{ color: '#f59e0b', fontWeight: 700 }}>Risky Deal</span></>;
                  } else if (!isPriceFair && isHonest) {
                    return <>Seller: {item.swapPointValue} pts — <span style={{ color: '#f59e0b', fontWeight: 700 }}>Premium Price</span></>;
                  } else {
                    return <>Seller: {item.swapPointValue} pts — <span style={{ color: '#ef4444', fontWeight: 700 }}>Suspect Pricing</span></>;
                  }
                })()}
              </span>
            </div>

            {/* AI Reasoning */}
            <div className="wc-reasoning">
              <p className="wc-reasoning-title">AI Analysis</p>
              <p className="wc-reasoning-text">"{result.reasoning}"</p>
            </div>

            {/* Honesty Audit */}
            <div className="wc-honesty">
              <div className="wc-honesty-header">
                <div className="wc-honesty-label">
                  <ShieldCheck size={14} color={result.honestyScore > 0.8 ? '#22c55e' : '#f59e0b'} />
                  <span>Seller Integrity</span>
                </div>
                <span className="wc-honesty-val" style={{ color: result.honestyScore > 0.8 ? '#22c55e' : '#f59e0b' }}>
                  {Math.round(result.honestyScore * 100)}%
                </span>
              </div>
              <div className="wc-honesty-track">
                <div className="wc-honesty-fill" style={{ 
                  width: `${result.honestyScore * 100}%`,
                  background: result.honestyScore > 0.8 ? '#22c55e' : '#f59e0b'
                }} />
              </div>
              
              {result.redFlags?.length > 0 && (
                <div className="wc-red-flags">
                  {result.redFlags.map((flag, i) => (
                    <div key={i} className="wc-red-flag">
                      <AlertTriangle size={10} />
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Market Comparisons */}
            {result.internalComparison?.length > 0 && (
              <div className="wc-market">
                <p className="wc-market-title">Market Comparisons</p>
                {result.internalComparison.map((ex, i) => (
                  <div key={i} className="wc-market-row">
                    <span>{ex.title}</span>
                    <span style={{ fontWeight: 600 }}>{ex.value} pts</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="wc-error">
            <p>Unable to analyze this item. Please try again.</p>
          </div>
        )}

        <button className="btn btn-primary wc-action-btn" onClick={onClose}>Got it</button>
      </div>

      <style>{`
        .wc-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.8);
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          z-index: 1000; display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }
        .wc-modal {
          background: var(--color-surface-card); border: 1px solid var(--color-border);
          border-radius: var(--radius-xl); width: 100%; max-width: 480px;
          position: relative; padding: 28px;
          box-shadow: var(--shadow-lg), var(--shadow-glow);
          max-height: 90vh; overflow-y: auto;
        }
        .wc-close {
          position: absolute; top: 18px; right: 18px; background: var(--color-surface-elevated);
          border: 1px solid var(--color-border); border-radius: var(--radius-sm);
          color: var(--color-text-muted); cursor: pointer; padding: 6px;
          transition: all 0.2s ease;
        }
        .wc-close:hover { border-color: var(--color-border-hover); color: var(--color-text-primary); }

        /* Header */
        .wc-header { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; }
        .wc-header-icon {
          width: 40px; height: 40px; border-radius: 12px;
          background: linear-gradient(135deg, var(--color-brand), #a78bfa);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(99,102,241,0.25);
        }
        .wc-header h3 { font-size: 1.05rem; font-weight: 700; color: #fff; }
        .wc-header p { font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px; }

        /* Loading */
        .wc-loading { text-align: center; padding: 28px 0; }
        .wc-brain-pulse {
          width: 56px; height: 56px; margin: 0 auto 18px; border-radius: 50%;
          background: linear-gradient(135deg, var(--color-brand), #a78bfa);
          display: flex; align-items: center; justify-content: center;
          position: relative; box-shadow: 0 0 30px rgba(99,102,241,0.2);
        }
        .wc-brain-ring {
          position: absolute; inset: -5px; border-radius: 50%;
          border: 2px solid rgba(167,139,250,0.3);
          animation: wc-ring 2s ease-out infinite;
        }
        .wc-loading-title { font-size: 0.9rem; font-weight: 600; color: var(--color-brand-light); }
        .wc-loading-sub { font-size: 0.72rem; color: var(--color-text-muted); margin-top: 6px; }

        /* Result */
        .wc-value-section { text-align: center; margin-bottom: 18px; }
        .wc-val-label { font-size: 0.72rem; color: var(--color-text-muted); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }
        .wc-val-number { font-size: 3rem; font-weight: 900; letter-spacing: -0.03em; line-height: 1.1; }
        .wc-val-unit { font-size: 1.2rem; font-weight: 600; opacity: 0.7; }
        .wc-val-gradient {
          background: linear-gradient(135deg, #818cf8, #a78bfa, #fbbf24);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .wc-fairness {
          display: flex; align-items: center; gap: 8px; justify-content: center;
          background: rgba(255,255,255,0.02); padding: 8px 16px; border-radius: var(--radius);
          font-size: 0.75rem; margin-bottom: 18px; border: 1px solid var(--color-border);
        }

        .wc-reasoning {
          background: rgba(99,102,241,0.04); padding: 16px 18px;
          border-radius: var(--radius); margin-bottom: 16px;
          border: 1px solid rgba(99,102,241,0.08);
        }
        .wc-reasoning-title { font-size: 0.7rem; font-weight: 700; color: #a78bfa; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
        .wc-reasoning-text { font-size: 0.84rem; color: var(--color-text-secondary); line-height: 1.6; font-style: italic; }

        .wc-honesty {
          background: rgba(255,255,255,0.015); border: 1px solid var(--color-border);
          padding: 14px 16px; border-radius: var(--radius); margin-bottom: 16px;
        }
        .wc-honesty-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .wc-honesty-label { display: flex; align-items: center; gap: 7px; font-size: 0.78rem; font-weight: 700; color: #fff; }
        .wc-honesty-val { font-size: 0.78rem; font-weight: 800; }
        .wc-honesty-track { height: 4px; background: rgba(255,255,255,0.04); border-radius: 4px; overflow: hidden; margin-bottom: 12px; }
        .wc-honesty-fill { height: 100%; border-radius: 4px; transition: width 1s cubic-bezier(0.22, 1, 0.36, 1); }
        
        .wc-red-flags { display: flex; flex-direction: column; gap: 6px; }
        .wc-red-flag {
          display: flex; align-items: center; gap: 7px; font-size: 0.72rem; color: #f87171;
          background: rgba(239,68,68,0.06); padding: 6px 10px; border-radius: var(--radius-sm);
        }

        .wc-market { margin-bottom: 8px; }
        .wc-market-title { font-size: 0.65rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px; }
        .wc-market-row { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--color-text-secondary); padding: 4px 0; }

        .wc-error { text-align: center; padding: 28px; color: var(--color-text-secondary); font-size: 0.9rem; }

        .wc-action-btn { width: 100%; margin-top: 16px; }

        @keyframes wc-ring { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(2.2); opacity: 0; } }
      `}</style>
    </div>
  );
}
