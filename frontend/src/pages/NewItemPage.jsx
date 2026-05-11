import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../lib/api';
import { Upload, CheckCircle2, Loader2, Wand2 } from 'lucide-react';

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
      setForm({
        title: p.title || '',
        description: p.description || '',
        category: p.category || 'Electronics',
        condition: p.condition || 'Good',
        originalPrice: p.originalPrice || '',
        ageMonths: p.ageMonths?.toString() || '0',
        desiredItems: ''
      });
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
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('category', form.category);
      fd.append('condition', form.condition);
      fd.append('originalPrice', form.originalPrice);
      fd.append('ageMonths', form.ageMonths);
      form.desiredItems.split(',').map(s => s.trim()).filter(Boolean).forEach(d => fd.append('desiredItems', d));
      files.forEach(f => fd.append('images', f));
      await api.post('/items', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate('/dashboard');
    } catch (err) { setError(err.response?.data?.message || 'Failed to create item'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-container fade-in" style={{ paddingTop:84, maxWidth:640 }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">List a New Item</h1>
          <p className="page-subtitle">Add your item to start finding swaps</p>
        </div>
        {location.state?.prefill && (
          <div className="badge" style={{ background: 'rgba(167, 139, 250, 0.1)', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Wand2 size={12} /> AI Assisted
          </div>
        )}
      </div>
      <div className="card" style={{ padding:32 }}>
        <form onSubmit={handleSubmit}>
          {error && <div style={{ padding:'10px 14px', borderRadius:'var(--radius)', background:'rgba(239,68,68,0.1)', color:'var(--color-error)', fontSize:'0.85rem', marginBottom:20, border:'1px solid rgba(239,68,68,0.2)' }}>{error}</div>}
          <div style={{ marginBottom:18 }}><label className="label">Title</label><input name="title" className="input" placeholder="What are you listing?" value={form.title} onChange={handleChange} required /></div>
          <div style={{ marginBottom:18 }}><label className="label">Description</label><textarea name="description" className="input" placeholder="Describe your item..." value={form.description} onChange={handleChange} /></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:18 }}>
            <div><label className="label">Category</label><select name="category" className="input" value={form.category} onChange={handleChange}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><label className="label">Condition</label><select name="condition" className="input" value={form.condition} onChange={handleChange}>{CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:18 }}>
            <div><label className="label">Original Price ($)</label><input name="originalPrice" type="number" className="input" placeholder="0" value={form.originalPrice} onChange={handleChange} required min="0" /></div>
            <div><label className="label">Age (months)</label><input name="ageMonths" type="number" className="input" placeholder="0" value={form.ageMonths} onChange={handleChange} min="0" /></div>
          </div>

          {form.originalPrice && (
            <div style={{ marginBottom:18 }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleEstimate}>Estimate Swap Value</button>
              {estimatedValue !== null && <span className="badge badge-accent" style={{ marginLeft:10, fontSize:'0.8rem' }}>{estimatedValue} pts</span>}
            </div>
          )}

          <div style={{ marginBottom:18 }}><label className="label">Desired Items (comma-separated)</label><input name="desiredItems" className="input" placeholder="e.g. Books, Guitar, Camera" value={form.desiredItems} onChange={handleChange} /></div>
          <div style={{ marginBottom:24 }}>
            <label className="label">Images (Capture your item — up to 5)</label>
            <label style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:24, borderRadius:'var(--radius)', border:'2px dashed var(--color-border)', cursor:'pointer', color:'var(--color-text-muted)', fontSize:'0.85rem', transition:'border-color 0.2s' }}>
              <Upload size={18} /> {files.length > 0 ? `${files.length} photo(s) captured` : 'Tap to open Camera'}
              <input type="file" multiple accept="image/*" capture="environment" onChange={(e) => setFiles([...e.target.files].slice(0,5))} style={{ display:'none' }} />
            </label>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width:'100%' }}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle2 size={18} /> Create Listing</>}
          </button>
        </form>
      </div>
    </div>
  );
}
