import { useState, useEffect, useRef } from 'react';
import { Bell, Package, ArrowRightLeft, Star, Flag, Info, Check } from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';

const ICON_MAP = {
  new_trade: ArrowRightLeft,
  trade_update: Package,
  new_message: Info,
  new_rating: Star,
  report_update: Flag,
  ai_match: Info
};

export default function NotificationBell() {
  const { user } = useAuthStore();
  const { notifications, unreadCount, fetchNotifications, markAllAsRead, markOneAsRead, initSocket } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      initSocket(user._id);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // Logic to mark all as read after a delay or on button click
    }
  };

  const handleMarkAll = (e) => {
    e.stopPropagation();
    markAllAsRead();
  };

  const handleItemClick = (n) => {
    markOneAsRead(n._id);
    setIsOpen(false);
  };

  return (
    <div className="nb-container" ref={dropdownRef}>
      <button className={`nb-btn ${isOpen ? 'active' : ''}`} onClick={handleToggle} aria-label="Notifications">
        <Bell size={20} />
        {unreadCount > 0 && <span className="nb-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="nb-dropdown glass">
          <div className="nb-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button className="nb-mark-read" onClick={handleMarkAll}>
                <Check size={14} /> Mark all read
              </button>
            )}
          </div>

          <div className="nb-list">
            {notifications.length === 0 ? (
              <div className="nb-empty">
                <Info size={24} style={{ opacity: 0.3, marginBottom: 12 }} />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => {
                const Icon = ICON_MAP[n.type] || Info;
                return (
                  <Link 
                    key={n._id} 
                    to={n.link || '#'} 
                    className={`nb-item ${n.isRead ? 'read' : 'unread'}`}
                    onClick={() => handleItemClick(n)}
                  >
                    <div className={`nb-icon-wrap ${n.type}`}>
                      <Icon size={14} />
                    </div>
                    <div className="nb-content">
                      <p className="nb-text">{n.content}</p>
                      <p className="nb-time">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.createdAt).toLocaleDateString()}</p>
                    </div>
                    {!n.isRead && <div className="nb-dot" />}
                  </Link>
                );
              })
            )}
          </div>

          <div className="nb-footer">
            <button className="btn btn-ghost btn-xs" style={{ width: '100%' }} onClick={() => setIsOpen(false)}>Close</button>
          </div>
        </div>
      )}

      <style>{`
        .nb-container { position: relative; }
        .nb-btn {
          background: none; border: none; color: var(--color-text-muted);
          padding: 8px; cursor: pointer; position: relative; border-radius: 50%;
          transition: all 0.2s;
        }
        .nb-btn:hover, .nb-btn.active { color: var(--color-brand-light); background: rgba(255,255,255,0.05); }
        .nb-badge {
          position: absolute; top: 4px; right: 4px;
          background: #ef4444; color: #fff; font-size: 0.65rem;
          font-weight: 800; min-width: 16px; height: 16px;
          border-radius: 8px; display: flex; align-items: center; justify-content: center;
          border: 2px solid #07070c;
        }

        .nb-dropdown {
          position: absolute; top: calc(100% + 12px); right: 0;
          width: 320px; max-height: 480px; border-radius: var(--radius-lg);
          border: 1px solid var(--color-border); overflow: hidden;
          display: flex; flex-direction: column; z-index: 1000;
          animation: slideDown 0.2s ease-out;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .nb-header {
          padding: 16px; border-bottom: 1px solid var(--color-border-subtle);
          display: flex; justify-content: space-between; align-items: center;
        }
        .nb-header h3 { font-size: 0.95rem; font-weight: 700; margin: 0; }
        .nb-mark-read {
          background: none; border: none; color: var(--color-brand-light);
          font-size: 0.75rem; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 4px;
        }
        .nb-mark-read:hover { background: rgba(99,102,241,0.1); }

        .nb-list { overflow-y: auto; flex: 1; }
        .nb-item {
          display: flex; gap: 12px; padding: 14px 16px; text-decoration: none;
          transition: background 0.2s; border-bottom: 1px solid var(--color-border-subtle);
          position: relative; align-items: flex-start;
        }
        .nb-item:hover { background: rgba(255,255,255,0.03); }
        .nb-item.unread { background: rgba(99,102,241,0.03); }

        .nb-icon-wrap {
          width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .nb-icon-wrap.new_trade { background: rgba(99,102,241,0.1); color: #818cf8; }
        .nb-icon-wrap.trade_update { background: rgba(245,158,11,0.1); color: #f59e0b; }
        .nb-icon-wrap.new_rating { background: rgba(34,197,94,0.1); color: #22c55e; }
        .nb-icon-wrap.report_update { background: rgba(239,68,68,0.1); color: #ef4444; }
        .nb-icon-wrap.ai_match { background: rgba(167,139,250,0.1); color: #a78bfa; }

        .nb-content { flex: 1; }
        .nb-text { font-size: 0.85rem; color: var(--color-text-primary); line-height: 1.4; margin: 0 0 4px; }
        .nb-time { font-size: 0.7rem; color: var(--color-text-ghost); margin: 0; }
        .nb-dot {
          width: 6px; height: 6px; border-radius: 50%; background: var(--color-brand-light);
          position: absolute; top: 18px; right: 12px;
        }

        .nb-empty { padding: 40px 20px; text-align: center; color: var(--color-text-ghost); font-size: 0.85rem; }
        .nb-footer { padding: 8px 16px; border-top: 1px solid var(--color-border-subtle); background: rgba(0,0,0,0.1); }

        @media (max-width: 480px) {
          .nb-dropdown { position: fixed; top: 60px; left: 16px; right: 16px; width: auto; max-height: 80vh; }
        }
      `}</style>
    </div>
  );
}
