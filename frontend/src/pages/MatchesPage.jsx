import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Sparkles, ArrowRightLeft, Star, CheckCircle, AlertTriangle, Brain, Cpu, Zap, Activity, Shield, BarChart3, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

// AI Loading Skeleton with animated steps
function AILoadingSkeleton() {
  const [step, setStep] = useState(0);
  const steps = ['Scanning item database...', 'Running semantic analysis...', 'Scoring compatibility...', 'Ranking best matches...'];

  useEffect(() => {
    const timer = setInterval(() => setStep(s => (s + 1) % steps.length), 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: 56 }}>
      <div className="match-brain-pulse">
        <Brain size={32} style={{ color: '#a78bfa' }} />
        <div className="match-brain-ring" />
      </div>
      <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-brand-light)', marginBottom: 8 }}>
        AI Engine Scanning...
      </p>
      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', transition: 'all 0.3s ease', minHeight: '1.4em' }}>
        {steps[step]}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 28 }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{
            height: 150, borderRadius: 'var(--radius-lg)',
            background: `linear-gradient(135deg, rgba(99,102,241,${0.03 * i}), rgba(139,92,246,${0.02 * i}))`,
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>
    </div>
  );
}

// AI Status Banner
function AIStatusBanner({ matchCount, method }) {
  const isAI = method === 'ai';
  return (
    <div className={`match-status-banner ${isAI ? 'match-status-ai' : 'match-status-demo'}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className={`match-status-icon ${isAI ? 'match-status-icon-ai' : 'match-status-icon-demo'}`}>
          {isAI ? <Brain size={18} color="#fff" /> : <Cpu size={18} color="#fff" />}
        </div>
        <div>
          <p className="match-status-title" style={{ color: isAI ? '#a78bfa' : 'var(--color-accent)' }}>
            {isAI ? '🧠 Real AI Matching Active' : '⚡ Smart Demo Engine Active'}
          </p>
          <p className="match-status-subtitle">
            {isAI ? 'Groq Llama 3.3 70B — semantic relevance scoring' : 'Local word-overlap similarity engine'}
          </p>
        </div>
      </div>
      <div className="match-status-count">
        <div>
          <p className="match-count-number" style={{ color: isAI ? '#a78bfa' : 'var(--color-accent)' }}>{matchCount}</p>
          <p className="match-count-label">matches</p>
        </div>
        <Activity size={16} style={{ color: isAI ? '#a78bfa' : 'var(--color-accent)' }} className="match-pulse" />
      </div>
    </div>
  );
}

// Match Card component
function MatchCard({ match, index, navigate }) {
  const isAI = match.matchMethod === 'ai';
  const [showReasoning, setShowReasoning] = useState(false);

  const fairnessConfig = {
    fair: { icon: <CheckCircle size={13} />, label: 'Fair Trade', color: 'var(--color-success)', bg: 'rgba(34,197,94,0.1)' },
    moderate: { icon: <AlertTriangle size={13} />, label: 'Moderate', color: 'var(--color-warning)', bg: 'rgba(245,158,11,0.1)' },
    uneven: { icon: <AlertTriangle size={13} />, label: 'Uneven', color: 'var(--color-error)', bg: 'rgba(239,68,68,0.1)' },
  };
  const fc = fairnessConfig[match.valueFairness] || fairnessConfig.moderate;

  return (
    <div className={`match-card fade-in ${isAI ? 'match-card-ai' : ''}`} style={{ animationDelay: `${index * 0.08}s` }}>
      {/* AI left accent */}
      {isAI && <div className="match-card-accent" />}

      {/* Header: User + Badges */}
      <div className="match-card-header">
        <div className="match-user-info">
          <div className="match-avatar">
            {match.user.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="match-username">{match.user.username}</p>
            <div className="match-trust">
              <Star size={12} className="star-filled" />
              <span>{match.user.trustScore?.toFixed(1)}</span>
            </div>
          </div>
        </div>
        <div className="match-badges">
          {/* Method badge */}
          {isAI ? (
            <span className="match-method-badge match-method-ai">
              <Brain size={11} /> AI Match <Zap size={9} style={{ color: '#fbbf24' }} />
            </span>
          ) : (
            <span className="match-method-badge match-method-demo">
              <Cpu size={11} /> Smart Match
            </span>
          )}
          {/* Fairness badge */}
          <span className="match-fairness-badge" style={{ color: fc.color, background: fc.bg, borderColor: `${fc.color}33` }}>
            {fc.icon} {fc.label}
          </span>
          {/* Score */}
          <span className={`match-score-badge ${isAI ? 'match-score-ai' : ''}`}>
            <BarChart3 size={11} /> {match.score}
          </span>
        </div>
      </div>

      {/* Items Grid */}
      <div className="match-items-grid">
        <div className="match-items-col">
          <p className="match-items-label">
            <span className="match-dot" style={{ background: 'var(--color-success)' }} />
            They have
          </p>
          <div className="match-items-list">
            {match.theirItems.map(i => (
              <div key={i._id} className="match-item-row">
                <div className="match-item-thumb">
                  <img src={i.images?.[0] || 'https://via.placeholder.com/48'} alt="" />
                </div>
                <div className="match-item-info">
                  <p className="match-item-title">{i.title}</p>
                  <div className="match-item-meta">
                    <span className="badge badge-neutral" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>{i.category}</span>
                    <span className="match-item-points">{i.swapPointValue}pts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="match-swap-icon">
          <ArrowRightLeft size={22} style={{ color: isAI ? '#a78bfa' : 'var(--color-brand-light)', opacity: 0.7 }} />
          <span>swap</span>
        </div>

        <div className="match-items-col">
          <p className="match-items-label">
            <span className="match-dot" style={{ background: 'var(--color-brand-light)' }} />
            You offer
          </p>
          <div className="match-items-list">
            {match.myItems.map(i => (
              <div key={i._id} className="match-item-row">
                <div className="match-item-thumb">
                  <img src={i.images?.[0] || 'https://via.placeholder.com/48'} alt="" />
                </div>
                <div className="match-item-info">
                  <p className="match-item-title">{i.title}</p>
                  <div className="match-item-meta">
                    <span className="badge badge-neutral" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>{i.category}</span>
                    <span className="match-item-points">{i.swapPointValue}pts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Reasoning (if present) */}
      {match.reasoning && isAI && (
        <div className="match-reasoning-section">
          <button className="match-reasoning-toggle" onClick={() => setShowReasoning(!showReasoning)}>
            <Brain size={12} style={{ color: '#a78bfa' }} />
            <span>AI Reasoning</span>
            {showReasoning ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showReasoning && (
            <div className="match-reasoning-content fade-in">
              <p>"{match.reasoning}"</p>
            </div>
          )}
        </div>
      )}

      {/* Action */}
      <button
        className={`btn match-propose-btn ${isAI ? 'match-propose-ai' : ''}`}
        onClick={() => navigate(`/trades/new?receiverId=${match.user._id}&requestedItem=${match.theirItems[0]?._id}&offeredItem=${match.myItems[0]?._id}`)}
      >
        <ArrowRightLeft size={16} /> Propose Trade
      </button>
    </div>
  );
}

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/matches')
      .then(r => setMatches(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const primaryMethod = matches.length > 0 ? matches[0].matchMethod : 'demo';

  return (
    <div className="page-container fade-in" style={{ paddingTop: 'calc(var(--nav-height) + 24px)' }}>
      {/* Header */}
      <div className="page-header">
        <div className="ai-page-badge">
          <Brain size={16} style={{ color: '#a78bfa' }} />
          <span>AI-Powered Engine</span>
        </div>
        <h1 className="page-title">
          <Sparkles size={24} style={{ display: 'inline', marginRight: 8, color: 'var(--color-brand-light)' }} />
          Smart Swaps
        </h1>
        <p className="page-subtitle">AI-powered trade matches based on your personal preferences</p>
      </div>

      {loading ? (
        <AILoadingSkeleton />
      ) : matches.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <div className="match-empty-icon">
            <Brain size={28} style={{ color: 'var(--color-text-muted)' }} />
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>No AI matches found yet</p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: 6 }}>
            List more items and add desired items to improve AI matching
          </p>
        </div>
      ) : (
        <>
          <AIStatusBanner matchCount={matches.length} method={primaryMethod} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {matches.map((m, idx) => (
              <MatchCard key={idx} match={m} index={idx} navigate={navigate} />
            ))}
          </div>

          {/* Footer */}
          <div className="match-footer">
            <p>
              <Shield size={10} />
              Matches powered by {primaryMethod === 'ai' ? 'Groq Llama 3.3 70B' : 'Smart Demo NLP Engine'}
            </p>
          </div>
        </>
      )}

      {/* Scoped CSS */}
      <style>{`
        @keyframes pulse-match { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.05); } }
        @keyframes ring-expand { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(2.5); opacity: 0; } }

        .match-pulse { animation: pulse-match 2s ease-in-out infinite; }

        /* Page badge */
        .ai-page-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 18px; border-radius: 20px;
          background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08));
          border: 1px solid rgba(99,102,241,0.2); margin-bottom: 12px;
          font-size: 0.8rem; font-weight: 600; color: #a78bfa;
        }

        /* Brain loading */
        .match-brain-pulse {
          width: 72px; height: 72px; margin: 0 auto 20px; border-radius: 50%;
          background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15));
          display: flex; align-items: center; justify-content: center;
          animation: pulse-match 1.5s ease-in-out infinite;
          box-shadow: 0 0 40px rgba(99,102,241,0.2);
          position: relative;
        }
        .match-brain-ring {
          position: absolute; inset: -6px; border-radius: 50%;
          border: 2px solid rgba(167,139,250,0.3);
          animation: ring-expand 2s ease-out infinite;
        }

        /* Status banner */
        .match-status-banner {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 22px; border-radius: var(--radius-lg); margin-bottom: 22px;
        }
        .match-status-ai {
          background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05));
          border: 1px solid rgba(99,102,241,0.2);
        }
        .match-status-demo {
          background: linear-gradient(135deg, rgba(245,158,11,0.08), rgba(234,88,12,0.03));
          border: 1px solid rgba(245,158,11,0.2);
        }
        .match-status-icon {
          width: 38px; height: 38px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
        }
        .match-status-icon-ai {
          background: linear-gradient(135deg, var(--color-brand), #a78bfa);
          box-shadow: 0 0 15px rgba(99,102,241,0.3);
        }
        .match-status-icon-demo {
          background: linear-gradient(135deg, var(--color-accent), #f59e0b);
          box-shadow: 0 0 15px rgba(245,158,11,0.2);
        }
        .match-status-title { font-size: 0.82rem; font-weight: 700; }
        .match-status-subtitle { font-size: 0.7rem; color: var(--color-text-muted); }
        .match-status-count { display: flex; align-items: center; gap: 10px; }
        .match-count-number { font-size: 1.3rem; font-weight: 800; text-align: right; }
        .match-count-label { font-size: 0.65rem; color: var(--color-text-muted); text-align: right; }

        /* Match card */
        .match-card {
          background: var(--color-surface-3); border: 1px solid var(--color-border);
          border-radius: var(--radius-lg); padding: var(--space-6);
          position: relative; overflow: hidden;
          transition: all var(--duration-base) var(--ease-smooth);
        }
        .match-card:hover {
          border-color: var(--color-border-hover);
          box-shadow: var(--shadow-card-hover);
          transform: translateY(-3px);
        }
        .match-card-ai { border-color: rgba(99,102,241,0.15); }
        .match-card-ai:hover { border-color: rgba(99,102,241,0.3); box-shadow: 0 8px 32px rgba(99,102,241,0.12); }
        .match-card-accent {
          position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
          background: linear-gradient(180deg, #818cf8, #a78bfa, #c084fc);
          border-radius: 3px 0 0 3px;
        }

        /* Header */
        .match-card-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 18px; flex-wrap: wrap; gap: 10px;
        }
        .match-user-info { display: flex; align-items: center; gap: 10px; }
        .match-avatar {
          width: 42px; height: 42px; border-radius: 50%;
          background: linear-gradient(135deg, var(--color-brand), var(--color-accent));
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; color: #fff; font-size: 0.95rem;
        }
        .match-username { font-weight: 600; font-size: 0.95rem; }
        .match-trust {
          display: flex; align-items: center; gap: 4px;
          font-size: 0.8rem; color: var(--color-text-secondary);
        }
        .match-badges { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }

        .match-method-badge {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 0.65rem; font-weight: 700; padding: 3px 10px; border-radius: 14px;
        }
        .match-method-ai {
          color: #a78bfa;
          background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1));
          border: 1px solid rgba(99,102,241,0.3);
          box-shadow: 0 0 10px rgba(99,102,241,0.08);
        }
        .match-method-demo {
          color: var(--color-accent);
          background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.25);
        }

        .match-fairness-badge {
          display: inline-flex; align-items: center; gap: 3px;
          font-size: 0.65rem; font-weight: 600; padding: 3px 8px; border-radius: 14px;
          border: 1px solid;
        }

        .match-score-badge {
          display: inline-flex; align-items: center; gap: 3px;
          font-size: 0.7rem; font-weight: 700; padding: 3px 10px; border-radius: 14px;
          background: var(--color-surface-2); color: var(--color-text-secondary);
          border: 1px solid var(--color-border);
        }
        .match-score-ai {
          background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05));
          color: #a78bfa; border-color: rgba(99,102,241,0.2);
        }

        /* Items grid */
        .match-items-grid {
          display: grid; grid-template-columns: 1fr auto 1fr; gap: 24px; align-items: flex-start;
        }
        .match-items-label {
          font-size: 0.7rem; color: var(--color-text-muted); margin-bottom: 10px;
          display: flex; align-items: center; gap: 5px;
        }
        .match-dot {
          width: 6px; height: 6px; border-radius: 50%; display: inline-block;
        }
        .match-items-list { display: flex; flex-direction: column; gap: 10px; }
        .match-item-row { display: flex; align-items: center; gap: 12px; }
        .match-item-thumb {
          width: 48px; height: 48px; border-radius: var(--radius);
          background: var(--color-surface-2); overflow: hidden;
          border: 1px solid var(--color-border); flex-shrink: 0;
        }
        .match-item-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .match-item-info { flex: 1; min-width: 0; }
        .match-item-title {
          font-size: 0.85rem; font-weight: 500;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .match-item-meta { display: flex; align-items: center; gap: 6px; margin-top: 3px; }
        .match-item-points { font-size: 0.75rem; color: var(--color-accent); font-weight: 600; }

        .match-swap-icon {
          display: flex; flex-direction: column; align-items: center; gap: 4px;
          padding-top: 28px;
        }
        .match-swap-icon span { font-size: 0.6rem; color: var(--color-text-muted); }

        /* AI Reasoning */
        .match-reasoning-section {
          margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--color-border);
        }
        .match-reasoning-toggle {
          display: flex; align-items: center; gap: 6px;
          font-size: 0.72rem; color: #a78bfa; font-weight: 600;
          background: none; border: none; cursor: pointer;
          padding: 4px 8px; border-radius: 6px;
          transition: all 0.2s ease;
        }
        .match-reasoning-toggle:hover { background: rgba(99,102,241,0.08); }
        .match-reasoning-content {
          margin-top: 8px; padding: 12px 14px; border-radius: var(--radius);
          background: rgba(99,102,241,0.04); border: 1px solid rgba(99,102,241,0.1);
        }
        .match-reasoning-content p {
          font-size: 0.78rem; color: var(--color-text-secondary);
          font-style: italic; line-height: 1.6;
        }

        /* Propose button */
        .match-propose-btn {
          margin-top: 18px; width: 100%;
          background: linear-gradient(135deg, var(--color-accent), #d97706);
          color: #000; font-weight: 600;
        }
        .match-propose-ai {
          background: linear-gradient(135deg, var(--color-brand), var(--color-brand-light));
          color: #fff;
          box-shadow: 0 4px 15px rgba(99,102,241,0.2);
        }
        .match-propose-ai:hover { box-shadow: 0 6px 24px rgba(99,102,241,0.35); transform: translateY(-1px); }

        /* Empty state */
        .match-empty-icon {
          width: 64px; height: 64px; margin: 0 auto 16px; border-radius: 50%;
          background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05));
          display: flex; align-items: center; justify-content: center;
        }

        /* Footer */
        .match-footer { text-align: center; padding: 28px 0; opacity: 0.35; }
        .match-footer p {
          font-size: 0.7rem; color: var(--color-text-muted);
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }

        @media (max-width: 600px) {
          .match-items-grid { grid-template-columns: 1fr; gap: 16px; }
          .match-swap-icon { flex-direction: row; padding-top: 0; }
          .match-card-header { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}
