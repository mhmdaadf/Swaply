import { useEffect, useState } from 'react';
import api from '../lib/api';
import ItemCard from '../components/ItemCard';
import { Search, SlidersHorizontal, Package } from 'lucide-react';

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
      setItems(data.items); setTotalPages(data.totalPages);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, [category, page]);
  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchItems(); };

  return (
    <div className="page-container fade-in" style={{ paddingTop: 'calc(var(--nav-height) + var(--space-8))' }}>
      <div className="page-header">
        <h1 className="page-title">Explore Items</h1>
        <p className="page-subtitle">Browse available items and find your next swap</p>
      </div>

      {/* Search + Filter */}
      <div className="explore-toolbar">
        <form onSubmit={handleSearch} className="explore-search-wrap">
          <Search size={15} className="explore-search-icon" />
          <input type="text" className="input" placeholder="Search items..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 40 }} aria-label="Search items" />
        </form>
        <div className="explore-filter">
          <SlidersHorizontal size={14} style={{ color: 'var(--color-text-ghost)' }} />
          <select className="input" value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            style={{ width: 170 }} aria-label="Filter by category">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="explore-grid">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 340 }} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon"><Package size={28} style={{ color: 'var(--color-text-muted)' }} /></div>
          <p className="empty-state-title">No items found</p>
          <p className="empty-state-desc">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="explore-grid">
          {items.map(item => <ItemCard key={item._id} item={item} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div className="explore-pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i+1} onClick={() => setPage(i+1)}
              className={`btn btn-sm ${page === i+1 ? 'btn-primary' : 'btn-ghost'}`}
              style={{ minWidth: 38 }}>
              {i+1}
            </button>
          ))}
        </div>
      )}

      <style>{`
        .explore-toolbar {
          display: flex; gap: var(--space-3); margin-bottom: var(--space-8);
          flex-wrap: wrap; align-items: center;
        }
        .explore-search-wrap { flex: 1; min-width: 240px; position: relative; }
        .explore-search-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: var(--color-text-ghost); transition: color var(--duration-base);
        }
        .explore-search-wrap:focus-within .explore-search-icon { color: var(--color-brand-light); }
        .explore-filter { display: flex; align-items: center; gap: var(--space-2); }
        .explore-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--space-5);
        }
        .explore-pagination {
          display: flex; justify-content: center; gap: var(--space-2); margin-top: var(--space-10);
        }
      `}</style>
    </div>
  );
}
