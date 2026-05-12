import { Search, X, Check, Package } from 'lucide-react';
import { useState } from 'react';
import { getImageUrl } from '../lib/utils';

export default function ItemSelectionModal({ title, items, selectedIds, onToggle, onClose }) {
  const [search, setSearch] = useState('');

  const safeItems = Array.isArray(items) ? items : [];
  const filtered = safeItems.filter(item => 
    item.title?.toLowerCase().includes(search.toLowerCase()) ||
    item.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="ism-overlay fade-in">
      <div className="ism-modal glass slide-up">
        <div className="ism-header">
          <div>
            <h3>{title}</h3>
            <p>{items.length} items available</p>
          </div>
          <button className="ism-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="ism-search">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search items..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="ism-list">
          {filtered.length === 0 ? (
            <div className="ism-empty">
              <Package size={32} opacity={0.2} />
              <p>No items found</p>
            </div>
          ) : (
            filtered.map(item => {
              const isSelected = selectedIds.includes(item._id);
              return (
                <div 
                  key={item._id} 
                  className={`ism-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => onToggle(item)}
                >
                  <div className="ism-thumb">
                    <img src={getImageUrl(item.images?.[0])} alt="" />
                  </div>
                  <div className="ism-info">
                    <p className="ism-item-title">{item.title}</p>
                    <p className="ism-item-meta">{item.category} • {item.swapPointValue} pts</p>
                  </div>
                  <div className={`ism-check ${isSelected ? 'active' : ''}`}>
                    {isSelected && <Check size={14} />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="ism-footer">
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>
            Done Selecting
          </button>
        </div>
      </div>

      <style>{`
        .ism-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.8);
          backdrop-filter: blur(8px); z-index: 2000;
          display: flex; align-items: center; justify-content: center;
          padding: var(--space-4);
        }
        .ism-modal {
          width: 100%; max-width: 500px; background: var(--color-surface-2);
          border: 1px solid var(--color-border); border-radius: var(--radius-xl);
          display: flex; flex-direction: column; max-height: 80vh;
        }
        .ism-header {
          padding: var(--space-5); border-bottom: 1px solid var(--color-border-subtle);
          display: flex; justify-content: space-between; align-items: flex-start;
        }
        .ism-header h3 { font-size: var(--text-lg); font-weight: 700; margin: 0; }
        .ism-header p { font-size: var(--text-sm); color: var(--color-text-ghost); margin: 4px 0 0; }
        .ism-close { background: none; border: none; color: var(--color-text-ghost); cursor: pointer; }
        
        .ism-search {
          margin: var(--space-4) var(--space-5); display: flex; align-items: center; gap: 12px;
          padding: 10px 16px; background: var(--color-surface-3);
          border-radius: var(--radius-md); border: 1px solid var(--color-border);
          color: var(--color-text-ghost);
        }
        .ism-search input {
          background: none; border: none; color: #fff; width: 100%; font-size: 0.9rem;
        }
        .ism-search input:focus { outline: none; }
        
        .ism-list { overflow-y: auto; flex: 1; padding: 0 var(--space-5) var(--space-5); }
        .ism-item {
          display: flex; align-items: center; gap: 16px; padding: 12px;
          border-radius: var(--radius-lg); cursor: pointer; border: 1px solid transparent;
          transition: all 0.2s; margin-bottom: 8px;
        }
        .ism-item:hover { background: rgba(255,255,255,0.03); }
        .ism-item.selected { background: rgba(99,102,241,0.05); border-color: rgba(99,102,241,0.2); }
        
        .ism-thumb {
          width: 48px; height: 48px; border-radius: var(--radius-md);
          overflow: hidden; background: var(--color-surface-3); flex-shrink: 0;
        }
        .ism-thumb img { width: 100%; height: 100%; object-fit: cover; }
        
        .ism-info { flex: 1; }
        .ism-item-title { font-weight: 600; font-size: 0.95rem; margin-bottom: 2px; }
        .ism-item-meta { font-size: 0.75rem; color: var(--color-text-ghost); }
        
        .ism-check {
          width: 24px; height: 24px; border-radius: 50%; border: 2px solid var(--color-border);
          display: flex; align-items: center; justify-content: center; color: #fff;
          transition: all 0.2s;
        }
        .ism-check.active { background: var(--color-brand); border-color: var(--color-brand); }
        
        .ism-empty { padding: 40px; text-align: center; color: var(--color-text-ghost); }
        .ism-footer { padding: var(--space-5); border-top: 1px solid var(--color-border-subtle); }
      `}</style>
    </div>
  );
}
