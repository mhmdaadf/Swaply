import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ArrowRightLeft, Mail, Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow" />
      <div className="fade-in" style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, var(--color-brand), #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
            }}>
              <ArrowRightLeft size={20} color="#fff" />
            </div>
            <span className="gradient-text" style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.04em' }}>Swaply</span>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>
            Sign in to start trading
          </p>
        </div>

        {/* Form Card */}
        <div className="card" style={{ padding: '36px 32px' }}>
          <form onSubmit={handleSubmit}>
            {error && <div className="alert-error">{error}</div>}

            <div style={{ marginBottom: 20 }}>
              <label className="label" htmlFor="login-email">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  id="login-email"
                  type="email" className="input" placeholder="you@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  required style={{ paddingLeft: 42 }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <label className="label" htmlFor="login-password">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  id="login-password"
                  type="password" className="input" placeholder="Enter your password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  required style={{ paddingLeft: 42 }}
                />
              </div>
              <div style={{ textAlign: 'right', marginTop: 10 }}>
                <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', transition: 'color 0.2s' }}
                  onMouseOver={e => e.target.style.color = 'var(--color-brand-light)'}
                  onMouseOut={e => e.target.style.color = 'var(--color-text-muted)'}
                >Forgot password?</Link>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
              style={{ width: '100%' }}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--color-brand-light)', fontWeight: 600 }}>Sign up</Link>
          </p>
        </div>

        {/* Demo hint */}
        <div style={{
          marginTop: 20, padding: '14px 18px', borderRadius: 'var(--radius)',
          background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.08)',
          fontSize: '0.8rem', color: 'var(--color-text-secondary)', textAlign: 'center',
        }}>
          Demo: use <strong style={{ color: 'var(--color-brand-light)' }}>alice@test.com</strong> / <strong style={{ color: 'var(--color-brand-light)' }}>password123</strong>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          padding: 24px; position: relative; overflow: hidden;
          background: var(--color-surface);
        }
        .auth-glow {
          position: absolute; top: -200px; left: 50%; transform: translateX(-50%);
          width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
