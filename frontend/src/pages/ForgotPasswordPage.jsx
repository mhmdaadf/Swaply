import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Mail, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
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
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <CheckCircle2 size={48} style={{ color: 'var(--color-success)', margin: '0 auto 16px' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>Check your email</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 24 }}>
                We've sent a password reset link to <strong>{email}</strong>.
              </p>
              <Link to="/login" className="btn btn-secondary" style={{ width: '100%' }}>
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>Forgot Password?</h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  Enter your email and we'll send you a link to reset your password.
                </p>
              </div>

              {error && <div style={{ padding: '10px 14px', borderRadius: 'var(--radius)', background: 'rgba(239,68,68,0.1)', color: 'var(--color-error)', fontSize: '0.85rem', marginBottom: 20, border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}

              <div style={{ marginBottom: 24 }}>
                <label className="label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    type="email" className="input" placeholder="you@example.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    required style={{ paddingLeft: 38 }}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send Reset Link'}
              </button>

              <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20, fontSize: '0.85rem', color: 'var(--color-text-muted)', textDecoration: 'none' }}>
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
