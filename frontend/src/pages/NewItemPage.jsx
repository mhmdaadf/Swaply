import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../lib/api';
import { Upload, CheckCircle2, Loader2, Wand2, Image } from 'lucide-react';

const CATEGORIES = ['Electronics','Books','Clothing','Furniture','Sports','Toys','Music','Art','Tools','Automotive','Collectibles','Other'];
const CONDITIONS = ['New','Like New','Good','Fair','Poor'];

export default function NewItemPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ title:'', description:'', category:'Electronics', condition:'Good', originalPrice:'', ageMonths:'0', desiredItems:'' });
  const [files, setFiles] = useState([]);
  const [estimatedValue, setEstimatedValue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (location.state?.prefill) {
      const p = location.state.prefill;
      setForm({ title: p.title||'', description: p.description||'', category: p.category||'Electronics',
        condition: p.condition||'Good', originalPrice: p.originalPrice||'', ageMonths: p.ageMonths?.toString()||'0', desiredItems:'' });
      setEstimatedValue(p.swapPointValue || null);
    }
  }, [location.state]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEstimate = async () => {
    try {
      const { data } = await api.post('/items/estimate', { category: form.category, originalPrice: parseFloat(form.originalPrice), condition: form.condition, ageMonths: parseInt(form.ageMonths) });
      setEstimatedValue(data.swapPointValue);
    } catch { setEstimatedValue(null); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('title', form.title); fd.append('description', form.description);
      fd.append('category', form.category); fd.append('condition', form.condition);
      fd.append('originalPrice', form.originalPrice); fd.append('ageMonths', form.ageMonths);
      form.desiredItems.split(',').map(s => s.trim()).filter(Boolean).forEach(d => fd.append('desiredItems', d));
      files.forEach(f => fd.append('images', f));
      await api.post('/items', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate('/dashboard');
    } catch (err) { setError(err.response?.data?.message || 'Failed to create item'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-container fade-in" style={{ paddingTop: 'calc(var(--nav-height) + var(--space-8))', maxWidth: 640 }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">List a New Item</h1>
          <p className="page-subtitle">Add your item to start finding swaps</p>
        </div>
        {location.state?.prefill && (
          <div className="badge badge-brand" style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
            <Wand2 size={11} /> AI Assisted
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 'var(--space-8)' }}>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert-error">{error}</div>}

          <div className="ni-field">
            <label className="label" htmlFor="ni-title">Title</label>
            <input id="ni-title" name="title" className="input" placeholder="What are you listing?" value={form.title} onChange={handleChange} required />
          </div>

          <div className="ni-field">
            <label className="label" htmlFor="ni-desc">Description</label>
            <textarea id="ni-desc" name="description" className="input" placeholder="Describe your item..." value={form.description} onChange={handleChange} />
          </div>

          <div className="ni-row">
            <div className="ni-field"><label className="label" htmlFor="ni-cat">Category</label><select id="ni-cat" name="category" className="input" value={form.category} onChange={handleChange}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div className="ni-field"><label className="label" htmlFor="ni-cond">Condition</label><select id="ni-cond" name="condition" className="input" value={form.condition} onChange={handleChange}>{CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          </div>

          <div className="ni-row">
            <div className="ni-field"><label className="label" htmlFor="ni-price">Original Price ($)</label><input id="ni-price" name="originalPrice" type="number" className="input" placeholder="0" value={form.originalPrice} onChange={handleChange} required min="0" /></div>
            <div className="ni-field"><label className="label" htmlFor="ni-age">Age (months)</label><input id="ni-age" name="ageMonths" type="number" className="input" placeholder="0" value={form.ageMonths} onChange={handleChange} min="0" /></div>
          </div>

          {form.originalPrice && (
            <div className="ni-estimate">
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleEstimate}>Estimate Swap Value</button>
              {estimatedValue !== null && <span className="badge badge-accent" style={{ fontSize: '0.78rem' }}>{estimatedValue} pts</span>}
            </div>
          )}

          <div className="ni-field">
            <label className="label" htmlFor="ni-desired">Desired Items (comma-separated)</label>
            <input id="ni-desired" name="desiredItems" className="input" placeholder="e.g. Books, Guitar, Camera" value={form.desiredItems} onChange={handleChange} />
          </div>

          <div className="ni-field">
            <label className="label">Images (up to 5)</label>
            <label className="ni-upload">
              <Image size={18} style={{ color: 'var(--color-text-ghost)' }} />
              <span>{files.length > 0 ? `${files.length} photo(s) selected` : 'Tap to choose images'}</span>
              <input type="file" multiple accept="image/*" capture="environment" onChange={(e) => setFiles([...e.target.files].slice(0,5))} style={{ display: 'none' }} />
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: 'var(--space-2)' }}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle2 size={18} /> Create Listing</>}
          </button>
        </form>
      </div>

      <style>{`
        .ni-field { margin-bottom: var(--space-5); }
        .ni-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
        .ni-estimate {
          display: flex; align-items: center; gap: var(--space-3);
          margin-bottom: var(--space-5);
        }
        .ni-upload {
          display: flex; align-items: center; justify-content: center; gap: var(--space-2);
          padding: var(--space-6); border-radius: var(--radius);
          border: 2px dashed var(--color-border); cursor: pointer;
          color: var(--color-text-muted); font-size: var(--text-base);
          transition: all var(--duration-base) var(--ease-smooth);
        }
        .ni-upload:hover {
          border-color: var(--color-brand); color: var(--color-brand-light);
          background: rgba(99,102,241,0.02);
        }
        @media (max-width: 480px) { .ni-row { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
