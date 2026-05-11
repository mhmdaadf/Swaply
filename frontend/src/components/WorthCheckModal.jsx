import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Brain, Sparkles, TrendingUp, Zap, Shield, BarChart3, Activity, X, Search, Info, ShieldCheck, AlertTriangle } from 'lucide-react';

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
        itemId: item._id, // Pass ID to exclude it from market comparisons
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
    <div className="modal-overlay fade-in" onClick={onClose}>
      <div className="modal-content worth-check-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={20} /></button>

        <div className="ai-modal-header">
          <Brain size={22} color="#a78bfa" />
          <div>
            <h3>AI Fairness Verification</h3>
            <p>Analyzing "{item.title}"</p>
          </div>
        </div>

        {loading ? (
          <div className="ai-modal-loading">
            <div className="ai-brain-pulse">
              <Brain size={24} color="#fff" />
              <div className="ai-brain-ring" />
            </div>
            <p>AI Engine Processing{dots}</p>
            <p className="loading-sub">Scanning global markets & Swaply database</p>
          </div>
        ) : result ? (
          <div className="ai-modal-result fade-in">
             <div className="ai-result-main">
                <TrendingUp size={24} color="var(--color-accent)" />
                <p className="ai-val-label">AI Estimated Worth</p>
                <p className={`ai-val-number ${isAI ? 'ai-val-gradient' : ''}`}>
                  {result.swapPointValue} pts
                </p>
             </div>

             {/* Comparative badge — Logic: Price vs Value AND Honesty */}
             <div className="ai-fairness-badge">
                <Info size={12} />
                <span>
                  {(() => {
                    const priceDiff = item.swapPointValue - result.swapPointValue;
                    const isPriceFair = Math.abs(priceDiff) < 50;
                    const isHonest = result.honestyScore > 0.7;

                    if (isPriceFair && isHonest) {
                      return <>Seller Price: {item.swapPointValue} pts — <span style={{ color: '#22c55e', fontWeight: 700 }}>Fair Deal</span></>;
                    } else if (isPriceFair && !isHonest) {
                      return <>Seller Price: {item.swapPointValue} pts — <span style={{ color: '#f59e0b', fontWeight: 700 }}>Risky Deal</span></>;
                    } else if (!isPriceFair && isHonest) {
                      return <>Seller Price: {item.swapPointValue} pts — <span style={{ color: '#f59e0b', fontWeight: 700 }}>Premium Price</span></>;
                    } else {
                      return <>Seller Price: {item.swapPointValue} pts — <span style={{ color: '#ef4444', fontWeight: 700 }}>Suspect Pricing</span></>;
                    }
                  })()}
                </span>
             </div>

             <div className="ai-modal-reasoning">
                <p className="reasoning-title">AI Analysis</p>
                <p className="reasoning-text">"{result.reasoning}"</p>
             </div>

             {/* Honesty Audit Section */}
             <div className="ai-honesty-audit">
                <div className="honesty-header">
                   <div className="honesty-label">
                      <ShieldCheck size={14} color={result.honestyScore > 0.8 ? '#22c55e' : '#f59e0b'} />
                      <span>Seller Integrity Audit</span>
                   </div>
                   <span className="honesty-val" style={{ color: result.honestyScore > 0.8 ? '#22c55e' : '#f59e0b' }}>
                      {Math.round(result.honestyScore * 100)}% Honest
                   </span>
                </div>
                <div className="honesty-track">
                   <div className="honesty-fill" style={{ 
                      width: `${result.honestyScore * 100}%`,
                      background: result.honestyScore > 0.8 ? '#22c55e' : '#f59e0b'
                   }} />
                </div>
                
                {result.redFlags?.length > 0 && (
                   <div className="ai-red-flags">
                      {result.redFlags.map((flag, i) => (
                        <div key={i} className="red-flag">
                           <AlertTriangle size={10} />
                           <span>{flag}</span>
                        </div>
                      ))}
                   </div>
                )}
             </div>

             {result.internalComparison?.length > 0 && (
                <div className="ai-modal-internal">
                   <p className="internal-title">Market Comparisons</p>
                   {result.internalComparison.map((ex, i) => (
                     <div key={i} className="internal-row">
                        <span>{ex.title}</span>
                        <span>{ex.value} pts</span>
                     </div>
                   ))}
                </div>
             )}

          </div>
        ) : (
          <p style={{ textAlign: 'center', padding: 20 }}>Failed to analyze item.</p>
        )}

        <button className="btn btn-primary modal-btn" onClick={onClose}>Got it</button>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.85);
          backdrop-filter: blur(8px); z-index: 1000;
          display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .modal-content {
          background: #1e1e27; border: 1px solid var(--color-border);
          border-radius: var(--radius-lg); width: 100%; max-width: 520px;
          position: relative; padding: 24px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          max-height: 90vh; overflow-y: auto;
        }
        .modal-close {
          position: absolute; top: 16px; right: 16px; background: none; border: none;
          color: var(--color-text-muted); cursor: pointer;
        }
        .ai-modal-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
        .ai-modal-header h3 { font-size: 1.1rem; font-weight: 700; color: #fff; }
        .ai-modal-header p { font-size: 0.75rem; color: var(--color-text-muted); }

        .ai-modal-loading { text-align: center; padding: 20px 0; }
        .ai-brain-pulse {
          width: 54px; height: 54px; margin: 0 auto 16px; border-radius: 50%;
          background: linear-gradient(135deg, var(--color-brand), #a78bfa);
          display: flex; align-items: center; justify-content: center;
          position: relative;
        }
        .ai-brain-ring {
          position: absolute; inset: -4px; border-radius: 50%;
          border: 2px solid rgba(167,139,250,0.4);
          animation: ring-expand 2s ease-out infinite;
        }
        .loading-sub { font-size: 0.7rem; color: var(--color-text-muted); margin-top: 4px; }

        .ai-result-main { text-align: center; margin-bottom: 14px; }
        .ai-val-label { font-size: 0.72rem; color: var(--color-text-muted); margin-top: 2px; }
        .ai-val-number { font-size: 2.8rem; font-weight: 900; margin-top: 2px; }
        .ai-val-gradient {
           background: linear-gradient(135deg, #818cf8, #a78bfa, #fbbf24);
           -webkit-background-clip: text; -webkit-text-fill-color: transparent;
           background-clip: text;
        }

        .ai-fairness-badge {
          display: flex; align-items: center; gap: 8px; justify-content: center;
          background: rgba(255,255,255,0.03); padding: 6px 14px; border-radius: 8px;
          font-size: 0.72rem; margin-bottom: 14px;
        }

        .ai-modal-reasoning { background: rgba(99,102,241,0.05); padding: 12px 16px; border-radius: 8px; margin-bottom: 14px; }
        .reasoning-title { font-size: 0.7rem; font-weight: 700; color: #a78bfa; text-transform: uppercase; margin-bottom: 6px; }
        .reasoning-text { font-size: 0.82rem; color: var(--color-text-secondary); line-height: 1.5; font-style: italic; }

        .ai-modal-internal { margin-bottom: 20px; }
        .internal-title { font-size: 0.65rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 8px; }
        .internal-row { display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--color-text-secondary); margin-bottom: 4px; }

        .ai-honesty-audit {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
          padding: 12px 14px; border-radius: 8px; margin-bottom: 14px;
        }
        .honesty-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .honesty-label { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; font-weight: 700; color: #fff; }
        .honesty-val { font-size: 0.75rem; font-weight: 800; }
        .honesty-track { height: 4px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; margin-bottom: 10px; }
        .honesty-fill { height: 100%; border-radius: 4px; transition: width 1s ease; }
        
        .ai-red-flags { display: flex; flex-direction: column; gap: 6px; }
        .red-flag {
          display: flex; align-items: center; gap: 6px; font-size: 0.68rem; color: #f87171;
          background: rgba(239,68,68,0.08); padding: 4px 8px; border-radius: 4px;
        }

        .ai-modal-tech { display: flex; gap: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.05); }
        .tech-row { display: flex; align-items: center; gap: 4px; font-size: 0.65rem; color: var(--color-text-muted); }

        .modal-btn { width: 100%; margin-top: 12px; }

        @keyframes ring-expand { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(2); opacity: 0; } }
      `}</style>
    </div>
  );
}
