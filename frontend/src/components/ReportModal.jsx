import { useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../lib/api';
import { Flag, X, AlertTriangle, Send, CheckCircle } from 'lucide-react';

const CATEGORIES = [
  { id: 'Scam', label: 'Scam or Fraud', icon: '💸' },
  { id: 'Abuse', label: 'Abusive Behavior', icon: '🚫' },
  { id: 'Fake Item', label: 'Fake/Misleading Item', icon: '🔍' },
  { id: 'Inappropriate Content', label: 'Inappropriate Content', icon: '🔞' },
  { id: 'Other', label: 'Other Issue', icon: '❓' }
];

export default function ReportModal({ targetType, targetId, targetName, onClose }) {
  const [category, setCategory] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || reason.length < 10) return;

    setLoading(true);
    setError('');
    try {
      await api.post('/reports', {
        targetType,
        targetId,
        category,
        reason
      });
      setSubmitted(true);
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return createPortal(
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-panel report-modal" onClick={e => e.stopPropagation()}>
          <div className="report-success">
            <CheckCircle size={48} color="#22c55e" />
            <h3>Report Submitted</h3>
            <p>Thank you for helping keep Swaply safe. Our moderation team will review this shortly.</p>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel report-modal" onClick={e => e.stopPropagation()}>
        <button className="report-close" onClick={onClose} aria-label="Close"><X size={18} /></button>

        <div className="report-header">
          <div className="report-header-icon">
            <Flag size={18} color="#fff" />
          </div>
          <div>
            <h3>Report {targetType}</h3>
            <p>Reporting: <span style={{ color: 'var(--color-brand-light)', fontWeight: 600 }}>{targetName}</span></p>
          </div>
        </div>

        {error && <div className="alert-error" style={{ marginBottom: 20 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Category</label>
            <div className="report-cat-grid">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`report-cat-btn ${category === cat.id ? 'active' : ''}`}
                  onClick={() => setCategory(cat.id)}
                >
                  <span className="cat-icon">{cat.icon}</span>
                  <span className="cat-label">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="label">Detailed Reason</label>
            <textarea
              className="input report-textarea"
              placeholder="Please provide specific details about the issue (min 10 characters)..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
              rows={4}
            />
          </div>

          <div className="report-warning">
            <AlertTriangle size={14} />
            <span>Misuse of the reporting system may lead to account suspension.</span>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary report-submit-btn" 
            disabled={loading || !category || reason.length < 10}
          >
            {loading ? 'Submitting...' : <><Send size={16} /> Submit Report</>}
          </button>
        </form>
      </div>

      <style>{`
        .report-modal {
          width: 100%; max-width: 460px;
          position: relative; padding: var(--space-8);
          animation: modal-slide-up 0.3s var(--ease-out);
        }
        @keyframes modal-slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .report-close {
          position: absolute; top: 18px; right: 18px; background: var(--color-surface-2);
          border: 1px solid var(--color-border); border-radius: var(--radius-sm);
          color: var(--color-text-muted); cursor: pointer; padding: 6px;
          transition: all 0.2s ease;
        }
        .report-close:hover { border-color: var(--color-border-hover); color: var(--color-text-primary); }

        .report-header { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
        .report-header-icon {
          width: 40px; height: 40px; border-radius: 12px;
          background: linear-gradient(135deg, #ef4444, #f87171);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(239,68,68,0.2);
        }
        .report-header h3 { font-size: 1.1rem; font-weight: 700; color: #fff; }
        .report-header p { font-size: 0.8rem; color: var(--color-text-muted); margin-top: 2px; }

        .report-cat-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 8px; margin-top: 8px;
        }
        .report-cat-btn {
          background: var(--color-surface-2); border: 1px solid var(--color-border);
          border-radius: var(--radius-sm); padding: 10px 12px;
          display: flex; align-items: center; gap: 10px; cursor: pointer;
          transition: all 0.2s ease; text-align: left;
        }
        .report-cat-btn:hover { border-color: var(--color-border-hover); background: var(--color-surface-3); }
        .report-cat-btn.active {
          border-color: #ef4444; background: rgba(239,68,68,0.08);
          box-shadow: 0 0 0 1px #ef4444;
        }
        .cat-icon { font-size: 1.1rem; }
        .cat-label { font-size: 0.8rem; font-weight: 500; color: var(--color-text-secondary); }
        .report-cat-btn.active .cat-label { color: #fff; }

        .report-textarea { resize: none; font-size: 0.9rem; margin-top: 8px; }

        .report-warning {
          display: flex; align-items: center; gap: 8px;
          background: rgba(245,158,11,0.05); padding: 10px 14px;
          border-radius: var(--radius-sm); border: 1px solid rgba(245,158,11,0.15);
          font-size: 0.75rem; color: #f59e0b; margin: 18px 0;
        }

        .report-submit-btn { width: 100%; justify-content: center; gap: 8px; font-weight: 600; }
        .report-submit-btn:not(:disabled) { background: #ef4444; color: #fff; }
        .report-submit-btn:not(:disabled):hover { background: #dc2626; box-shadow: 0 4px 16px rgba(239,68,68,0.3); }

        .report-success { text-align: center; padding: 20px 0; }
        .report-success h3 { font-size: 1.25rem; font-weight: 700; margin: 16px 0 8px; color: #fff; }
        .report-success p { font-size: 0.9rem; color: var(--color-text-secondary); line-height: 1.6; }

        @media (max-width: 480px) {
          .report-cat-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>,
    document.body
  );
}
