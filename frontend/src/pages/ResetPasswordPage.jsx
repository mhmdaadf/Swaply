import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError('Passwords do not match');
    
    setLoading(true);
    setError('');
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
      background: 'radial-gradient(ellipse at top, rgba(99,102,241,0.08) 0%, transparent 60%)',
    }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: 420 }}>
        <div className="card" style={{ padding: 32 }}>
          {done ? (
            <div style={{ textAlign: 'center' }}>
              <CheckCircle2 size={48} style={{ color: 'var(--color-success)', margin: '0 auto 16px' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>Success!</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Your password has been reset. Redirecting to login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>Reset Password</h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  Please enter your new password below.
                </p>
              </div>

              {error && <div style={{ padding: '10px 14px', borderRadius: 'var(--radius)', background: 'rgba(239,68,68,0.1)', color: 'var(--color-error)', fontSize: '0.85rem', marginBottom: 20, border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}

              <div style={{ marginBottom: 18 }}>
                <label className="label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    type="password" className="input" placeholder="Min 6 characters"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    required style={{ paddingLeft: 38 }} minLength={6}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label className="label">Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    type="password" className="input" placeholder="Repeat password"
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    required style={{ paddingLeft: 38 }}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
