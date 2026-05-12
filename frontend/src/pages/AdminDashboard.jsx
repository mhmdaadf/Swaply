import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { 
  Users, Package, ArrowRightLeft, Flag, Shield, Activity, 
  Search, Check, X, AlertCircle, ExternalLink, MoreVertical
} from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'listings', label: 'Listings', icon: Package },
  { id: 'moderation', label: 'Moderation', icon: Shield },
  { id: 'reports', label: 'Reports', icon: Flag },
  { id: 'trades', label: 'Trades', icon: ArrowRightLeft },
];

export default function AdminDashboard() {
  const { user: currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState({
    stats: null,
    users: [],
    listings: [],
    reports: [],
    trades: [],
    moderationQueue: []
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [stats, users, listings, reports, trades] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/listings'),
        api.get('/reports'), // Re-using report route
        api.get('/admin/trades')
      ]);
      setData({
        stats: stats.data,
        users: users.data,
        listings: listings.data,
        reports: reports.data,
        trades: trades.data,
        moderationQueue: (await api.get('/admin/moderation-queue')).data
      });
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUser = async (userId) => {
    try {
      const { data: updated } = await api.patch(`/admin/users/${userId}/toggle`);
      setData(prev => ({
        ...prev,
        users: prev.users.map(u => u._id === userId ? updated.user : u)
      }));
    } catch (err) { alert('Failed to update user status'); }
  };

  const handleVerifyUser = async (userId) => {
    try {
      const { data: updated } = await api.post(`/admin/users/${userId}/verify`);
      setData(prev => ({
        ...prev,
        users: prev.users.map(u => u._id === userId ? updated.user : u)
      }));
    } catch (err) { alert('Failed to verify user'); }
  };

  const handleModeration = async (itemId, status) => {
    try {
      const { data: updated } = await api.patch(`/admin/listings/${itemId}`, { status });
      setData(prev => ({
        ...prev,
        moderationQueue: prev.moderationQueue.filter(i => i._id !== itemId),
        listings: prev.listings.map(l => l._id === itemId ? updated : l)
      }));
    } catch (err) { alert('Failed to moderate listing'); }
  };

  const handleUpdateReport = async (reportId, status, notes) => {
    try {
      const { data: updated } = await api.patch(`/reports/${reportId}`, { status, adminNotes: notes });
      setData(prev => ({
        ...prev,
        reports: prev.reports.map(r => r._id === reportId ? updated : r)
      }));
    } catch (err) { alert('Failed to update report'); }
  };

  if (currentUser?.role !== 'admin' && currentUser?.role !== 'superadmin') {
    return <div className="page-container">Access Denied</div>;
  }

  return (
    <div className="page-container fade-in" style={{ paddingTop: 'calc(var(--nav-height) + var(--space-8))' }}>
      <div className="admin-header">
        <div className="admin-header-title">
          <Shield size={24} color="var(--color-brand-light)" />
          <h1 className="page-title">Super Admin Control</h1>
        </div>
        <p className="admin-subtitle">Platform intelligence and community moderation</p>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`admin-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="admin-content">
        {loading ? (
          <div className="skeleton" style={{ height: 400 }} />
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="overview-grid">
                <div className="stat-card">
                  <Users size={20} color="#818cf8" />
                  <h3>{data.stats?.users}</h3>
                  <p>Total Users</p>
                </div>
                <div className="stat-card">
                  <Package size={20} color="#f59e0b" />
                  <h3>{data.stats?.items}</h3>
                  <p>Total Items</p>
                </div>
                <div className="stat-card">
                  <ArrowRightLeft size={20} color="#22c55e" />
                  <h3>{data.stats?.trades}</h3>
                  <p>Successful Swaps</p>
                </div>
                <div className="stat-card">
                  <Flag size={20} color="#ef4444" />
                  <h3>{data.stats?.pendingReports}</h3>
                  <p>Pending Reports</p>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Trust</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.users.map(user => (
                      <tr key={user._id}>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar-sm">{user.username.charAt(0)}</div>
                            <span>{user.username}</span>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td><span className={`role-badge ${user.role}`}>{user.role}</span></td>
                        <td>{user.trustScore.toFixed(1)}</td>
                        <td>
                          <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                            {user.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button 
                              className={`btn btn-xs ${user.isActive ? 'btn-danger-outline' : 'btn-success-outline'}`}
                              onClick={() => handleToggleUser(user._id)}
                            >
                              {user.isActive ? 'Suspend' : 'Activate'}
                            </button>
                            {!user.isVerified && (
                              <button 
                                className="btn btn-xs btn-primary-outline"
                                onClick={() => handleVerifyUser(user._id)}
                              >
                                Verify
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="reports-list">
                {data.reports.length === 0 ? (
                  <p className="empty-msg">No reports found.</p>
                ) : (
                  data.reports.map(report => (
                    <div key={report._id} className="report-card">
                      <div className="report-card-header">
                        <span className={`status-badge ${report.status.toLowerCase()}`}>{report.status}</span>
                        <span className="report-date">{new Date(report.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="report-body">
                        <p className="report-info">
                          <strong>Reporter:</strong> {report.reporter?.username} <br />
                          <strong>Target:</strong> {report.targetType} ({report.targetId?.title || report.targetId?.username})
                        </p>
                        <p className="report-reason">"{report.reason}"</p>
                      </div>
                      <div className="report-actions">
                        <button className="btn btn-sm btn-ghost" onClick={() => handleUpdateReport(report._id, 'Resolved', 'Marked as resolved by admin')}>
                          <Check size={14} /> Resolve
                        </button>
                        <button className="btn btn-sm btn-ghost" onClick={() => handleUpdateReport(report._id, 'Dismissed', 'False report')}>
                          <X size={14} /> Dismiss
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            {activeTab === 'moderation' && (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Owner</th>
                      <th>Risk</th>
                      <th>AI Reasons</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.moderationQueue.length === 0 ? (
                      <tr><td colSpan="5" className="empty-msg" style={{ textAlign: 'center', padding: 40 }}>Moderation queue is empty</td></tr>
                    ) : (
                      data.moderationQueue.map(item => (
                        <tr key={item._id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{item.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-ghost)' }}>{item.category}</div>
                          </td>
                          <td>{item.owner?.username}</td>
                          <td>
                            <span className={`status-badge ${item.moderationRisk === 'High' ? 'inactive' : 'pending'}`}>
                              {item.moderationRisk}
                            </span>
                          </td>
                          <td style={{ maxWidth: 300 }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
                              {item.moderationFlags.map((f, i) => <span key={i} className="role-badge user" style={{ fontSize: '0.6rem' }}>{f}</span>)}
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: 0 }}>{item.moderationReasoning}</p>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-xs btn-success-outline" onClick={() => handleModeration(item._id, 'available')}>Approve</button>
                              <button className="btn btn-xs btn-danger-outline" onClick={() => handleModeration(item._id, 'flagged')}>Reject</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .admin-header { margin-bottom: var(--space-8); }
        .admin-header-title { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
        .admin-subtitle { color: var(--color-text-ghost); font-size: 0.9rem; }

        .admin-tabs {
          display: flex; gap: 8px; margin-bottom: var(--space-8);
          border-bottom: 1px solid var(--color-border); padding-bottom: 2px;
          overflow-x: auto;
        }
        .admin-tab-btn {
          padding: 10px 18px; display: flex; align-items: center; gap: 8px;
          background: none; border: none; border-bottom: 2px solid transparent;
          color: var(--color-text-muted); cursor: pointer; transition: all 0.2s;
          white-space: nowrap; font-weight: 500; font-size: 0.9rem;
        }
        .admin-tab-btn:hover { color: var(--color-text-primary); background: rgba(255,255,255,0.02); }
        .admin-tab-btn.active {
          color: var(--color-brand-light); border-bottom-color: var(--color-brand-light);
          background: rgba(99,102,241,0.05);
        }

        .overview-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-4);
        }
        .stat-card {
          background: var(--color-surface-2); border: 1px solid var(--color-border);
          padding: 24px; border-radius: var(--radius-lg); text-align: center;
        }
        .stat-card h3 { font-size: 1.8rem; font-weight: 800; margin: 12px 0 4px; }
        .stat-card p { font-size: 0.8rem; color: var(--color-text-ghost); text-transform: uppercase; letter-spacing: 0.05em; }

        .admin-table-wrap {
          background: var(--color-surface-2); border: 1px solid var(--color-border);
          border-radius: var(--radius-lg); overflow: hidden;
        }
        .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
        .admin-table th {
          background: rgba(255,255,255,0.02); padding: 14px 20px;
          font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-ghost);
          border-bottom: 1px solid var(--color-border);
        }
        .admin-table td { padding: 14px 20px; border-bottom: 1px solid var(--color-border-subtle); font-size: 0.9rem; }
        
        .user-cell { display: flex; align-items: center; gap: 10px; }
        .user-avatar-sm {
          width: 28px; height: 28px; border-radius: 50%;
          background: var(--color-brand); display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 700; font-size: 0.75rem;
        }

        .role-badge { font-size: 0.7rem; padding: 2px 8px; border-radius: 10px; font-weight: 600; text-transform: uppercase; }
        .role-badge.admin { background: rgba(99,102,241,0.2); color: #818cf8; }
        .role-badge.superadmin { background: rgba(167,139,250,0.2); color: #a78bfa; }
        .role-badge.user { background: rgba(255,255,255,0.05); color: var(--color-text-muted); }

        .status-badge { font-size: 0.7rem; padding: 2px 8px; border-radius: 10px; font-weight: 600; }
        .status-badge.active { background: rgba(34,197,94,0.15); color: #22c55e; }
        .status-badge.inactive { background: rgba(239,68,68,0.15); color: #ef4444; }
        .status-badge.pending { background: rgba(245,158,11,0.15); color: #f59e0b; }
        .status-badge.resolved { background: rgba(34,197,94,0.15); color: #22c55e; }
        .status-badge.dismissed { background: rgba(255,255,255,0.05); color: var(--color-text-ghost); }

        .reports-list { display: flex; flex-direction: column; gap: 16px; }
        .report-card {
          background: var(--color-surface-2); border: 1px solid var(--color-border);
          border-radius: var(--radius-lg); padding: 20px;
        }
        .report-card-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
        .report-date { font-size: 0.75rem; color: var(--color-text-ghost); }
        .report-info { font-size: 0.85rem; line-height: 1.6; margin-bottom: 12px; }
        .report-reason {
          background: rgba(255,255,255,0.02); padding: 12px; border-radius: var(--radius-sm);
          font-size: 0.9rem; font-style: italic; color: var(--color-text-secondary);
        }
        .report-actions { display: flex; gap: 12px; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--color-border-subtle); }

        .btn-xs { padding: 4px 10px; font-size: 0.75rem; }
        .btn-danger-outline { border: 1px solid rgba(239,68,68,0.3); color: #ef4444; background: none; }
        .btn-danger-outline:hover { background: rgba(239,68,68,0.1); border-color: #ef4444; }
        .btn-success-outline { border: 1px solid rgba(34,197,94,0.3); color: #22c55e; background: none; }
        .btn-success-outline:hover { background: rgba(34,197,94,0.1); border-color: #22c55e; }
        .btn-primary-outline { border: 1px solid rgba(99,102,241,0.3); color: #a78bfa; background: none; }
        .btn-primary-outline:hover { background: rgba(99,102,241,0.1); border-color: #a78bfa; }
        .tab-badge {
          background: #ef4444; color: #fff; font-size: 0.6rem; padding: 2px 6px; 
          border-radius: 10px; margin-left: 6px; font-weight: 800;
        }
      `}</style>
    </div>
  );
}
