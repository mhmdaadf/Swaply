import { AlertCircle, CheckCircle, Scale, Sparkles } from 'lucide-react';

export default function FairnessGauge({ myValue = 0, theirValue = 0 }) {
  const v1 = Number(myValue) || 0;
  const v2 = Number(theirValue) || 0;
  const diff = Math.abs(v1 - v2);
  const max = Math.max(v1, v2) || 1;
  const ratio = diff / max;

  let status = 'balanced';
  let color = 'var(--color-success)';
  let message = 'This trade looks perfectly balanced!';
  let Icon = CheckCircle;

  if (ratio > 0.4) {
    status = 'highly_unfair';
    color = 'var(--color-error)';
    message = 'Significant value gap detected. Negotiate further?';
    Icon = AlertCircle;
  } else if (ratio > 0.15) {
    status = 'slightly_unfair';
    color = 'var(--color-warning)';
    message = 'Slightly unbalanced. Consider adding a small item.';
    Icon = Scale;
  }

  // Percentage for the visual meter (0-100 where 50 is center)
  // myValue = 100, theirValue = 0 -> progress = 0
  // myValue = 0, theirValue = 100 -> progress = 100
  // myValue = 50, theirValue = 50 -> progress = 50
  const total = v1 + v2 || 1;
  const progress = (v2 / total) * 100;

  return (
    <div className="fg-card glass">
      <div className="fg-header">
        <div className={`fg-ai-badge ${status === 'balanced' ? 'fg-sparkle' : ''}`}>
          <Sparkles size={12} /> AI Insight
        </div>
        <p className="fg-status" style={{ color }}>{message}</p>
      </div>

      <div className="fg-meter-wrap">
        <div className="fg-labels">
          <span className={v1 > v2 ? 'active' : ''}>Your Value: {v1}</span>
          <span className={v2 > v1 ? 'active' : ''}>Their Value: {v2}</span>
        </div>
        <div className="fg-meter-bg">
          <div 
            className="fg-meter-fill" 
            style={{ 
              width: `${progress}%`, 
              backgroundColor: color,
              boxShadow: status === 'balanced' ? `0 0 15px ${color}` : 'none'
            }} 
          />
          <div className="fg-meter-center" />
        </div>
      </div>

      <div className="fg-footer">
        <Icon size={14} color={color} />
        <span>Trade is {status.replace('_', ' ')}</span>
      </div>

      <style>{`
        .fg-card {
          padding: var(--space-5); border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
          background: rgba(255,255,255,0.02);
          margin-bottom: var(--space-6);
        }
        .fg-header { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-4); }
        .fg-ai-badge {
          display: flex; align-items: center; gap: 4px;
          padding: 3px 8px; background: rgba(167, 139, 250, 0.1);
          color: #a78bfa; border-radius: var(--radius-full);
          font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
        }
        .fg-status { font-size: var(--text-sm); font-weight: 600; }
        
        .fg-meter-wrap { margin-bottom: var(--space-4); }
        .fg-labels {
          display: flex; justify-content: space-between;
          font-size: var(--text-xs); font-weight: 600;
          color: var(--color-text-ghost); margin-bottom: 8px;
        }
        .fg-labels .active { color: var(--color-text-primary); }
        
        .fg-meter-bg {
          height: 8px; background: var(--color-surface-3);
          border-radius: 4px; position: relative; overflow: hidden;
        }
        .fg-meter-fill {
          height: 100%; transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          opacity: 0.9;
        }
        .fg-sparkle {
          animation: sparkle-glow 2s infinite;
        }
        @keyframes sparkle-glow {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 2px var(--color-brand-light)); }
          50% { filter: brightness(1.5) drop-shadow(0 0 8px var(--color-brand-light)); }
        }
        .fg-meter-center {
          position: absolute; left: 50%; top: 0; bottom: 0;
          width: 2px; background: rgba(255,255,255,0.3); transform: translateX(-50%);
          z-index: 2;
        }
        
        .fg-footer {
          display: flex; align-items: center; gap: 6px;
          font-size: var(--text-xs); font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.05em;
          color: var(--color-text-ghost);
        }
      `}</style>
    </div>
  );
}
