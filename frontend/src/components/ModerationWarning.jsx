import { AlertTriangle, Info, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

export default function ModerationWarning({ analysis, onConfirm, onFix }) {
  if (!analysis) return null;

  const { riskLevel, flags, suggestions, reasoning } = analysis;

  const getRiskStyles = () => {
    switch (riskLevel) {
      case 'High': return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.05)', border: 'rgba(239, 68, 68, 0.2)' };
      case 'Medium': return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.05)', border: 'rgba(245, 158, 11, 0.2)' };
      default: return { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.05)', border: 'rgba(34, 197, 94, 0.2)' };
    }
  };

  const styles = getRiskStyles();

  return (
    <div className="mw-card glass fade-in" style={{ borderColor: styles.border, background: styles.bg }}>
      <div className="mw-header">
        <div className="mw-ai-badge">
          <Sparkles size={12} /> AI Moderator
        </div>
        <div className="mw-risk" style={{ color: styles.color }}>
          {riskLevel} Risk Detected
        </div>
      </div>

      <div className="mw-content">
        {riskLevel !== 'Low' ? (
          <>
            <div className="mw-summary">
              <AlertTriangle size={18} color={styles.color} />
              <p>We've detected some potential issues with your listing that might affect its visibility or trust score.</p>
            </div>
            
            <div className="mw-flags">
              {flags.map((flag, i) => (
                <div key={i} className="mw-flag-pill">
                  {flag}
                </div>
              ))}
            </div>

            <div className="mw-suggestions">
              <Info size={14} />
              <p>{suggestions}</p>
            </div>
          </>
        ) : (
          <div className="mw-success">
            <CheckCircle2 size={18} color={styles.color} />
            <p>Listing looks great! Your description is clear and consistent.</p>
          </div>
        )}
      </div>

      <div className="mw-footer">
        {riskLevel === 'High' ? (
          <div className="mw-warning-box">
            <AlertTriangle size={14} />
            <span>High-risk listings are automatically sent for manual human review before appearing in the marketplace.</span>
          </div>
        ) : riskLevel === 'Medium' ? (
          <div className="mw-warning-box" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' }}>
            <Info size={14} />
            <span>Improving your listing now will help it get more matches faster.</span>
          </div>
        ) : null}

        <div className="mw-actions">
          <button className="btn btn-ghost btn-sm" onClick={onFix}>
            Edit Listing
          </button>
          <button 
            className={`btn btn-sm ${riskLevel === 'High' ? 'btn-danger' : 'btn-primary'}`} 
            onClick={onConfirm}
          >
            {riskLevel === 'High' ? 'Submit for Review' : 'Publish Anyway'} <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <style>{`
        .mw-card {
          margin: 20px 0; border-radius: var(--radius-lg); border: 1px solid;
          overflow: hidden; animation: slideUp 0.3s ease-out;
        }
        .mw-header {
          padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex; justify-content: space-between; align-items: center;
        }
        .mw-ai-badge {
          display: flex; align-items: center; gap: 6px; padding: 4px 10px;
          background: rgba(167, 139, 250, 0.1); color: #a78bfa;
          border-radius: var(--radius-full); font-size: 0.7rem; font-weight: 700;
          text-transform: uppercase;
        }
        .mw-risk { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
        
        .mw-content { padding: 16px; }
        .mw-summary { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 16px; }
        .mw-summary p { font-size: 0.85rem; color: var(--color-text-secondary); line-height: 1.5; margin: 0; }
        
        .mw-flags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
        .mw-flag-pill {
          padding: 4px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          border-radius: var(--radius-md); font-size: 0.75rem; font-weight: 600; color: #fff;
        }
        
        .mw-suggestions {
          display: flex; gap: 10px; padding: 12px; background: rgba(255,255,255,0.03);
          border-radius: var(--radius-md); color: var(--color-text-ghost); font-size: 0.8rem;
        }
        .mw-suggestions p { margin: 0; }

        .mw-success { display: flex; gap: 12px; align-items: center; color: var(--color-text-secondary); font-size: 0.85rem; }
        .mw-success p { margin: 0; }

        .mw-footer { padding: 16px; background: rgba(0,0,0,0.1); border-top: 1px solid rgba(255,255,255,0.05); }
        .mw-warning-box {
          display: flex; gap: 8px; font-size: 0.75rem; color: #ef4444; margin-bottom: 16px;
          background: rgba(239, 68, 68, 0.1); padding: 10px; border-radius: var(--radius-sm);
          line-height: 1.4;
        }
        
        .mw-actions { display: flex; justify-content: flex-end; gap: 12px; }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
