import { useEffect, useState } from 'react';
import api from '../lib/api';
import ItemCard from '../components/ItemCard';
import { Search, Filter, Package } from 'lucide-react';

const CATEGORIES = ['All','Electronics','Books','Clothing','Furniture','Sports','Toys','Music','Art','Tools','Automotive','Collectibles','Other'];

export default function ExplorePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (category !== 'All') params.category = category;
      if (search) params.search = search;
      const { data } = await api.get('/items', { params });
      setItems(data.items);
      setTotalPages(data.totalPages);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, [category, page]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchItems(); };

  return (
    <div className="page-container fade-in" style={{ paddingTop: 'calc(var(--nav-height) + 24px)' }}>
      <div className="page-header">
        <h1 className="page-title">Explore Items</h1>
        <p className="page-subtitle">Browse available items and find your next swap</p>
      </div>

      {/* Search + Filter Bar */}
      <div style={{
        display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center',
      }}>
        <form onSubmit={handleSearch} style={{ flex: 1, minWidth: 240, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text" className="input" placeholder="Search items..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 42 }}
            aria-label="Search items"
          />
        </form>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={14} style={{ color: 'var(--color-text-muted)' }} />
          <select
            className="input" value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            style={{ width: 170 }}
            aria-label="Filter by category"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 320 }} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="card" style={{ padding: '64px 32px', textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, margin: '0 auto 16px', borderRadius: '50%',
            background: 'rgba(99,102,241,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Package size={28} style={{ color: 'var(--color-text-muted)' }} />
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>No items found</p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: 6 }}>
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {items.map(item => <ItemCard key={item._id} item={item} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 36 }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i+1}
              onClick={() => setPage(i+1)}
              className={`btn btn-sm ${page === i+1 ? 'btn-primary' : 'btn-secondary'}`}
              style={{ minWidth: 38 }}
            >
              {i+1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
