import { useState } from 'react';
import api from '../lib/api';
import { Sparkles, Calculator, TrendingUp } from 'lucide-react';

const CATEGORIES = ['Electronics','Books','Clothing','Furniture','Sports','Toys','Music','Art','Tools','Automotive','Collectibles','Other'];
const CONDITIONS = ['New','Like New','Good','Fair','Poor'];

export default function EstimatorPage() {
  const [form, setForm] = useState({ category:'Electronics', originalPrice:'', condition:'Good', ageMonths:'0' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEstimate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/items/estimate', { category:form.category, originalPrice:parseFloat(form.originalPrice), condition:form.condition, ageMonths:parseInt(form.ageMonths) });
      setResult(data.swapPointValue);
    } catch { setResult(null); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-container fade-in" style={{ paddingTop:84, maxWidth:560 }}>
      <div className="page-header" style={{ textAlign:'center' }}>
        <h1 className="page-title"><Sparkles size={24} style={{ display:'inline', marginRight:8, color:'var(--color-brand-light)' }} />AI Value Estimator</h1>
        <p className="page-subtitle">Get an estimated swap value for any item</p>
      </div>
      <div className="card" style={{ padding:32 }}>
        <form onSubmit={handleEstimate}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:18 }}>
            <div><label className="label">Category</label><select name="category" className="input" value={form.category} onChange={handleChange}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label className="label">Condition</label><select name="condition" className="input" value={form.condition} onChange={handleChange}>{CONDITIONS.map(c => <option key={c}>{c}</option>)}</select></div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
            <div><label className="label">Original Price ($)</label><input name="originalPrice" type="number" className="input" placeholder="0" value={form.originalPrice} onChange={handleChange} required min="1" /></div>
            <div><label className="label">Age (months)</label><input name="ageMonths" type="number" className="input" placeholder="0" value={form.ageMonths} onChange={handleChange} min="0" /></div>
          </div>
          <button type="submit" className="btn btn-accent btn-lg" disabled={loading} style={{ width:'100%' }}>
            <Calculator size={18} /> Estimate Value
          </button>
        </form>

        {result !== null && (
          <div className="fade-in" style={{ marginTop:24, textAlign:'center', padding:24, borderRadius:'var(--radius-lg)', background:'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(245,158,11,0.1))', border:'1px solid var(--color-border)' }}>
            <TrendingUp size={28} style={{ color:'var(--color-accent)', margin:'0 auto 8px' }} />
            <p style={{ fontSize:'0.85rem', color:'var(--color-text-muted)', marginBottom:4 }}>Estimated Swap Value</p>
            <p style={{ fontSize:'2.5rem', fontWeight:800 }} className="gradient-text">{result} pts</p>
          </div>
        )}
      </div>
    </div>
  );
}
