import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Sparkles, TrendingUp, Brain, Cpu, Zap, BarChart3, Shield, Activity, ArrowRight, Info, ChevronDown, ChevronUp } from 'lucide-react';

const CATEGORIES = ['Electronics','Books','Clothing','Furniture','Sports','Toys','Music','Art','Tools','Automotive','Collectibles','Other'];
const CONDITIONS = ['New','Like New','Good','Fair','Poor'];

// Typewriter effect hook
function useTypewriter(text, speed = 25) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    if (!text) { setDisplayed(''); return; }
    setDisplayed('');
    let i = 0;
    const timer = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);
  return displayed;
}

// AI Processing Overlay with realistic multi-step animation
function AIProcessingOverlay() {
  const [dots, setDots] = useState('');
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const steps = [
    { label: 'Analyzing item characteristics', icon: '🔍' },
    { label: 'Querying market intelligence', icon: '📊' },
    { label: 'Running Llama 3.3 70B valuation', icon: '🧠' },
    { label: 'Generating expert assessment', icon: '✨' },
  ];

  useEffect(() => {
    const dotTimer = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400);
    const stepTimer = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 1200);
    const progressTimer = setInterval(() => setProgress(p => Math.min(p + 2, 95)), 80);
    return () => { clearInterval(dotTimer); clearInterval(stepTimer); clearInterval(progressTimer); };
  }, []);

  return (
    <div className="ai-processing-overlay">
      {/* Animated background glow */}
      <div className="ai-processing-glow" />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="ai-brain-container">
          <Brain size={28} color="#fff" />
          <div className="ai-brain-ring" />
        </div>

        <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-brand-light)', marginBottom: 4 }}>
          AI Engine Processing{dots}
        </p>

        {/* Step indicators */}
        <div className="ai-steps-container">
          {steps.map((s, i) => (
            <div key={i} className={`ai-step ${i <= step ? 'ai-step-active' : ''} ${i === step ? 'ai-step-current' : ''}`}>
              <span className="ai-step-icon">{s.icon}</span>
              <span className="ai-step-label">{s.label}</span>
              {i < step && <span className="ai-step-check">✓</span>}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="ai-progress-track">
          <div className="ai-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: 6 }}>
          {progress}% complete
        </p>
      </div>
    </div>
  );
}

// Confidence Meter component
function ConfidenceMeter({ confidence, method }) {
  const pct = Math.round((confidence || 0) * 100);
  const getColor = () => {
    if (pct >= 80) return '#22c55e';
    if (pct >= 60) return '#f59e0b';
    return '#ef4444';
  };
  const getLabel = () => {
    if (pct >= 80) return 'High';
    if (pct >= 60) return 'Moderate';
    return 'Low';
  };

  if (method !== 'ai' || confidence === null || confidence === undefined) return null;

  return (
    <div className="confidence-meter">
      <div className="confidence-header">
        <span className="confidence-label">
          <Activity size={11} /> AI Confidence
        </span>
        <span className="confidence-value" style={{ color: getColor() }}>
          {pct}% — {getLabel()}
        </span>
      </div>
      <div className="confidence-track">
        <div
          className="confidence-fill"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${getColor()}88, ${getColor()})` }}
        />
      </div>
    </div>
  );
}

// AI Result Card with dramatic reveal + real confidence
function AIResultCard({ result }) {
  const typedReasoning = useTypewriter(result.reasoning, 20);
  const [showValue, setShowValue] = useState(false);
  const [countUp, setCountUp] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    setShowValue(false);
    setCountUp(0);
    const revealTimer = setTimeout(() => setShowValue(true), 400);
    return () => clearTimeout(revealTimer);
  }, [result]);

  useEffect(() => {
    if (!showValue) return;
    const target = result.swapPointValue;
    const duration = 1400;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCountUp(Math.round(eased * target));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [showValue, result.swapPointValue]);

  const isAI = result.method === 'ai';
  const isDemo = result.method === 'demo';
  const isFallback = result.method === 'ai-fallback';
  const hasBaseline = result.baseline != null && isAI;
  const adjustment = hasBaseline ? result.swapPointValue - result.baseline : 0;

  return (
    <div className={`ai-result-card fade-in ${isAI ? 'ai-result-ai' : 'ai-result-demo'}`}>
      {/* AI Gradient border glow */}
      {isAI && <div className="ai-result-glow" />}

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Method Badge */}
        <div className="ai-result-badge-row">
          {isAI && (
            <div className="ai-badge ai-badge-real">
              <Brain size={13} />
              <span>Powered by Groq AI</span>
              <Zap size={11} style={{ color: '#fbbf24' }} />
            </div>
          )}
          {isDemo && (
            <div className="ai-badge ai-badge-demo">
              <Cpu size={13} />
              <span>Smart Demo Engine</span>
            </div>
          )}
          {isFallback && (
            <div className="ai-badge ai-badge-fallback">
              <Info size={13} />
              <span>Heuristic Fallback</span>
            </div>
          )}
        </div>

        {/* Main Value */}
        <TrendingUp size={28} style={{ color: 'var(--color-accent)', margin: '0 auto 8px', display: 'block' }} />
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Estimated Swap Value</p>
        <p className={`ai-result-value ${isAI ? 'ai-value-ai' : 'ai-value-demo'}`}>
          {showValue ? countUp : '—'} pts
        </p>

        {/* AI Adjustment indicator */}
        {hasBaseline && adjustment !== 0 && (
          <div className="ai-adjustment">
            <ArrowRight size={12} />
            <span>
              AI adjusted from {result.baseline} → {result.swapPointValue} pts
              <span style={{ color: adjustment > 0 ? '#22c55e' : '#f59e0b', marginLeft: 6, fontWeight: 700 }}>
                ({adjustment > 0 ? '+' : ''}{adjustment})
              </span>
            </span>
          </div>
        )}

        {/* Real Confidence Meter */}
        <ConfidenceMeter confidence={result.confidence} method={result.method} />

        {/* AI Reasoning with typewriter */}
        {result.reasoning && (
          <div className={`ai-reasoning ${isAI ? 'ai-reasoning-ai' : 'ai-reasoning-demo'}`}>
            <div className="ai-reasoning-header">
              <Brain size={12} style={{ color: isAI ? '#a78bfa' : 'var(--color-accent)' }} />
              <span>{isAI ? 'AI Analysis' : 'Smart Analysis'}</span>
            </div>
            <p className="ai-reasoning-text">
              "{typedReasoning}"
              <span className="ai-cursor">|</span>
            </p>
          </div>
        )}

        {/* Technical details toggle */}
        <button
          className="ai-details-toggle"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {showDetails ? 'Hide' : 'Show'} Technical Details
        </button>

        {showDetails && (
          <div className="ai-details-panel fade-in">
            <div className="ai-detail-row">
              <span className="ai-detail-label"><Shield size={10} /> Safety</span>
              <span className="ai-detail-value">Guardrailed (±4x baseline clamp)</span>
            </div>
            <div className="ai-detail-row">
              <span className="ai-detail-label"><BarChart3 size={10} /> Model</span>
              <span className="ai-detail-value">{isAI ? 'Llama 3.3 70B Versatile' : 'Heuristic Engine v2'}</span>
            </div>
            <div className="ai-detail-row">
              <span className="ai-detail-label"><Zap size={10} /> Inference</span>
              <span className="ai-detail-value">{isAI ? 'Groq LPU (ultra-fast)' : 'Local Computation'}</span>
            </div>
            {result.baseline != null && (
              <div className="ai-detail-row">
                <span className="ai-detail-label"><Activity size={10} /> Baseline</span>
                <span className="ai-detail-value">{result.baseline} pts (depreciation formula)</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function EstimatorPage() {
  const [form, setForm] = useState({
    category: 'Electronics', originalPrice: '', condition: 'Good',
    ageMonths: '0', title: '', description: '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEstimate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post('/items/estimate', {
        category: form.category,
        originalPrice: parseFloat(form.originalPrice),
        condition: form.condition,
        ageMonths: parseInt(form.ageMonths),
        title: form.title || undefined,
        description: form.description || undefined,
      });
      setResult(data);
    } catch { setResult(null); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-container fade-in" style={{ paddingTop: 84, maxWidth: 640 }}>
      {/* Header */}
      <div className="page-header" style={{ textAlign: 'center' }}>
        <div className="ai-page-badge">
          <Brain size={16} style={{ color: '#a78bfa' }} />
          <span>AI-Powered Engine</span>
        </div>
        <h1 className="page-title">
          <Sparkles size={24} style={{ display: 'inline', marginRight: 8, color: 'var(--color-brand-light)' }} />
          Worth Check
        </h1>
        <p className="page-subtitle">AI-powered item valuation & market analysis</p>
      </div>

      {/* Form Card */}
      <div className="card estimator-card">
        <form onSubmit={handleEstimate}>
          {/* Title */}
          <div className="form-group">
            <label className="label">
              Item Name
              <span className="label-ai-hint">— feeds into AI context</span>
            </label>
            <input
              name="title" className="input" placeholder="e.g. Sony WH-1000XM5 Headphones"
              value={form.title} onChange={handleChange}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="label">
              Description
              <span className="label-hint">(helps AI accuracy)</span>
            </label>
            <textarea
              name="description" className="input" rows={3}
              placeholder="Describe condition details, accessories included, etc..."
              value={form.description} onChange={handleChange}
              style={{ minHeight: 70, resize: 'vertical' }}
            />
          </div>

          {/* Category + Condition */}
          <div className="form-row">
            <div className="form-group">
              <label className="label">Category</label>
              <select name="category" className="input" value={form.category} onChange={handleChange}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Condition</label>
              <select name="condition" className="input" value={form.condition} onChange={handleChange}>
                {CONDITIONS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Price + Age */}
          <div className="form-row" style={{ marginBottom: 28 }}>
            <div className="form-group">
              <label className="label">Original Price ($)</label>
              <input
                name="originalPrice" type="number" className="input" placeholder="0"
                value={form.originalPrice} onChange={handleChange} required min="1"
              />
            </div>
            <div className="form-group">
              <label className="label">Age (months)</label>
              <input
                name="ageMonths" type="number" className="input" placeholder="0"
                value={form.ageMonths} onChange={handleChange} min="0"
              />
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className="btn btn-ai-submit btn-lg" disabled={loading}>
            {loading
              ? <><Brain size={18} className="spin-icon" /> AI is thinking...</>
              : <><Zap size={18} /> Run AI Estimation</>
            }
          </button>
        </form>

        {loading && <AIProcessingOverlay />}
        {!loading && result !== null && <AIResultCard result={result} />}
      </div>

      {/* Scoped CSS */}
      <style>{`
        /* --- Animations --- */
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes blink { 50% { opacity: 0; } }
        @keyframes pulse-glow { 0%,100% { box-shadow: 0 0 20px rgba(99,102,241,0.3); } 50% { box-shadow: 0 0 40px rgba(99,102,241,0.6); } }
        @keyframes ring-expand { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(2.5); opacity: 0; } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

        .spin-icon { animation: spin 1.5s linear infinite; }

        /* --- Processing Overlay --- */
        .ai-processing-overlay {
          margin-top: 28px; padding: 36px 24px; border-radius: var(--radius-lg);
          background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.06), rgba(245,158,11,0.03));
          border: 1px solid rgba(99,102,241,0.2);
          text-align: center; position: relative; overflow: hidden;
        }
        .ai-processing-glow {
          position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
          background: conic-gradient(from 0deg, transparent, rgba(99,102,241,0.08), transparent, rgba(139,92,246,0.08), transparent);
          animation: spin 6s linear infinite;
        }

        .ai-brain-container {
          width: 64px; height: 64px; margin: 0 auto 16px; border-radius: 50%;
          background: linear-gradient(135deg, var(--color-brand), var(--color-brand-light));
          display: flex; align-items: center; justify-content: center;
          animation: pulse-glow 2s ease-in-out infinite;
          position: relative;
        }
        .ai-brain-ring {
          position: absolute; inset: -4px; border-radius: 50%;
          border: 2px solid rgba(167,139,250,0.4);
          animation: ring-expand 2s ease-out infinite;
        }

        /* Step indicators */
        .ai-steps-container {
          display: flex; flex-direction: column; gap: 6px;
          margin: 16px auto; max-width: 280px; text-align: left;
        }
        .ai-step {
          display: flex; align-items: center; gap: 8px;
          padding: 5px 10px; border-radius: 8px;
          font-size: 0.75rem; color: var(--color-text-muted);
          transition: all 0.3s ease; opacity: 0.4;
        }
        .ai-step-active { opacity: 1; color: var(--color-text-secondary); }
        .ai-step-current {
          background: rgba(99,102,241,0.1); color: #a78bfa;
          animation: slide-up 0.3s ease-out;
        }
        .ai-step-icon { font-size: 0.9rem; }
        .ai-step-label { flex: 1; }
        .ai-step-check { color: #22c55e; font-weight: 700; }

        /* Progress */
        .ai-progress-track {
          margin-top: 16px; height: 4px; border-radius: 4px;
          background: rgba(99,102,241,0.1); overflow: hidden;
        }
        .ai-progress-fill {
          height: 100%; border-radius: 4px; transition: width 0.3s ease;
          background: linear-gradient(90deg, var(--color-brand), var(--color-brand-light), var(--color-accent));
        }

        /* --- Result Card --- */
        .ai-result-card {
          margin-top: 28px; text-align: center; padding: 32px 24px;
          border-radius: var(--radius-lg); position: relative; overflow: hidden;
        }
        .ai-result-ai {
          background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.06), rgba(99,102,241,0.03));
          border: 1px solid rgba(99,102,241,0.25);
        }
        .ai-result-demo {
          background: linear-gradient(135deg, rgba(245,158,11,0.08), rgba(234,88,12,0.04));
          border: 1px solid rgba(245,158,11,0.25);
        }
        .ai-result-glow {
          position: absolute; top: -2px; left: -2px; right: -2px; bottom: -2px;
          border-radius: var(--radius-lg);
          background: linear-gradient(135deg, rgba(99,102,241,0.15), transparent, rgba(139,92,246,0.15));
          animation: pulse-glow 4s ease-in-out infinite; z-index: 0;
        }

        /* Badge row */
        .ai-result-badge-row { margin-bottom: 16px; }
        .ai-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 14px; border-radius: 20px;
          font-size: 0.72rem; font-weight: 700;
          letter-spacing: 0.03em; text-transform: uppercase;
        }
        .ai-badge-real {
          background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.12));
          border: 1px solid rgba(99,102,241,0.35); color: #a78bfa;
          box-shadow: 0 0 20px rgba(99,102,241,0.12);
        }
        .ai-badge-demo {
          background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.3);
          color: var(--color-accent);
        }
        .ai-badge-fallback {
          background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25);
          color: #ef4444;
        }

        /* Value display */
        .ai-result-value {
          font-size: 3.2rem; font-weight: 900; letter-spacing: -0.03em;
          line-height: 1.1; margin: 0 auto 8px;
          display: block; width: fit-content;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
          background-clip: text !important;
        }
        .ai-value-ai {
          background: linear-gradient(135deg, #818cf8, #a78bfa, #fbbf24);
        }
        .ai-value-demo {
          background: linear-gradient(135deg, var(--color-accent), var(--color-brand-light));
        }

        /* Adjustment indicator */
        .ai-adjustment {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 0.75rem; color: var(--color-text-secondary);
          padding: 4px 12px; border-radius: 8px;
          background: rgba(99,102,241,0.06); margin-bottom: 12px;
        }

        /* Confidence meter */
        .confidence-meter { margin: 16px 0; }
        .confidence-header {
          display: flex; justify-content: space-between; margin-bottom: 5px;
        }
        .confidence-label {
          font-size: 0.72rem; color: var(--color-text-muted);
          display: flex; align-items: center; gap: 4px;
        }
        .confidence-value { font-size: 0.72rem; font-weight: 700; }
        .confidence-track {
          height: 5px; border-radius: 5px; background: rgba(99,102,241,0.08);
          overflow: hidden;
        }
        .confidence-fill {
          height: 100%; border-radius: 5px;
          transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* AI Reasoning */
        .ai-reasoning {
          margin-top: 16px; padding: 16px; border-radius: var(--radius);
          text-align: left;
        }
        .ai-reasoning-ai {
          background: rgba(99,102,241,0.05); border: 1px solid rgba(99,102,241,0.12);
        }
        .ai-reasoning-demo {
          background: rgba(245,158,11,0.05); border: 1px solid rgba(245,158,11,0.12);
        }
        .ai-reasoning-header {
          display: flex; align-items: center; gap: 6px; margin-bottom: 8px;
          font-size: 0.7rem; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.05em; color: #a78bfa;
        }
        .ai-reasoning-text {
          font-size: 0.82rem; color: var(--color-text-secondary);
          line-height: 1.6; font-style: italic; min-height: 3em;
        }
        .ai-cursor { animation: blink 1s step-end infinite; color: #a78bfa; }

        /* Details toggle */
        .ai-details-toggle {
          display: flex; align-items: center; gap: 4px; margin: 16px auto 0;
          font-size: 0.72rem; color: var(--color-text-muted);
          background: none; border: none; cursor: pointer;
          padding: 6px 12px; border-radius: 8px;
          transition: all 0.2s ease;
        }
        .ai-details-toggle:hover { color: var(--color-text-secondary); background: rgba(255,255,255,0.04); }

        .ai-details-panel {
          margin-top: 12px; padding: 12px; border-radius: var(--radius);
          background: rgba(255,255,255,0.02); border: 1px solid var(--color-border);
        }
        .ai-detail-row {
          display: flex; justify-content: space-between; padding: 5px 0;
          font-size: 0.7rem; border-bottom: 1px solid rgba(255,255,255,0.03);
        }
        .ai-detail-row:last-child { border-bottom: none; }
        .ai-detail-label {
          color: var(--color-text-muted); display: flex; align-items: center; gap: 4px;
        }
        .ai-detail-value { color: var(--color-text-secondary); font-weight: 500; }

        /* --- Page-level --- */
        .ai-page-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 18px; border-radius: 20px;
          background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08));
          border: 1px solid rgba(99,102,241,0.2); margin-bottom: 12px;
          font-size: 0.8rem; font-weight: 600; color: #a78bfa;
        }

        .estimator-card { padding: 36px 32px; border: 1px solid rgba(99,102,241,0.12); }

        .form-group { margin-bottom: 20px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }

        .label-ai-hint { font-size: 0.7rem; color: #a78bfa; font-weight: 500; margin-left: 6px; }
        .label-hint { font-size: 0.7rem; color: var(--color-text-muted); margin-left: 6px; }

        .btn-ai-submit {
          width: 100%;
          background: linear-gradient(135deg, var(--color-brand), var(--color-brand-light));
          color: white; font-weight: 600; border: none; cursor: pointer;
          box-shadow: 0 4px 24px rgba(99,102,241,0.3);
          transition: all 0.3s ease;
        }
        .btn-ai-submit:hover:not(:disabled) {
          box-shadow: 0 6px 32px rgba(99,102,241,0.45);
          transform: translateY(-1px);
        }
        .btn-ai-submit:disabled {
          background: var(--color-surface-elevated);
          box-shadow: none; color: var(--color-text-muted);
        }

        @media (max-width: 500px) {
          .form-row { grid-template-columns: 1fr; }
          .estimator-card { padding: 24px 18px; }
        }
      `}</style>
    </div>
  );
}
