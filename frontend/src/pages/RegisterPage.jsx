import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ArrowRightLeft, Mail, Lock, User, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({ username, email, password });
      navigate('/dashboard');
    } catch {}
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
      background: 'radial-gradient(ellipse at top, rgba(99,102,241,0.08) 0%, transparent 60%)',
    }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            <ArrowRightLeft size={28} style={{ color: 'var(--color-brand-light)' }} />
            <span className="gradient-text" style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Swaply</span>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Create your account</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: 'var(--radius)',
                background: 'rgba(239,68,68,0.1)', color: 'var(--color-error)',
                fontSize: '0.85rem', marginBottom: 20,
                border: '1px solid rgba(239,68,68,0.2)',
              }}>{error}</div>
            )}

            <div style={{ marginBottom: 18 }}>
              <label className="label">Username</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input type="text" className="input" placeholder="Choose a username"
                  value={username} onChange={(e) => setUsername(e.target.value)}
                  required minLength={3} style={{ paddingLeft: 38 }} />
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label className="label">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input type="email" className="input" placeholder="you@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  required style={{ paddingLeft: 38 }} />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input type="password" className="input" placeholder="Min 6 characters"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  required minLength={6} style={{ paddingLeft: 38 }} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
              style={{ width: '100%' }}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-brand-light)', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
