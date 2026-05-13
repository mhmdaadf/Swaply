import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ArrowRightLeft, Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import GoogleAuth from '../components/GoogleAuth';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await register({ username, email, password }); navigate('/dashboard'); }
    catch (err) { console.error('Registration error:', err); }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-bg-accent" />

      <div className="fade-in auth-content">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <ArrowRightLeft size={22} strokeWidth={2.5} />
          </div>
          <span className="gradient-text auth-brand-text">Swaply</span>
          <p className="auth-brand-sub">Create your account</p>
        </div>

        <div className="auth-card">
          <form onSubmit={handleSubmit}>
            {error && <div className="alert-error">{error}</div>}

            <div className="auth-field">
              <label className="label" htmlFor="reg-username">Username</label>
              <div className="auth-input-wrap">
                <User size={15} className="auth-input-icon" />
                <input id="reg-username" type="text" className="input" placeholder="Choose a username"
                  value={username} onChange={(e) => setUsername(e.target.value)}
                  required minLength={3} style={{ paddingLeft: 40 }} />
              </div>
            </div>

            <div className="auth-field">
              <label className="label" htmlFor="reg-email">Email address</label>
              <div className="auth-input-wrap">
                <Mail size={15} className="auth-input-icon" />
                <input id="reg-email" type="email" className="input" placeholder="you@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  required style={{ paddingLeft: 40 }} />
              </div>
            </div>

            <div className="auth-field">
              <label className="label" htmlFor="reg-password">Password</label>
              <div className="auth-input-wrap">
                <Lock size={15} className="auth-input-icon" />
                <input id="reg-password" type="password" className="input" placeholder="Min 6 characters"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  required minLength={6} style={{ paddingLeft: 40 }} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <>Create Account <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <GoogleAuth />

          <p className="auth-switch" style={{ marginTop: 'var(--space-6)' }}>
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          padding: var(--space-6); padding-top: calc(var(--nav-height) + var(--space-6));
          position: relative; overflow: hidden;
          background: var(--color-surface-0);
        }
        .auth-bg {
          position: absolute; top: -30%; left: 50%; transform: translateX(-50%);
          width: 700px; height: 700px; border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%);
          pointer-events: none; filter: blur(40px);
        }
        .auth-bg-accent {
          position: absolute; bottom: -20%; right: -10%;
          width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 65%);
          pointer-events: none; filter: blur(40px);
        }
        /* ═══ RegisterPage — Interaction Rules ═══
           Brand icon: inner shadow highlight
           Inputs: icon transitions color on focus
           Submit: scale down on active for tactile feedback */
        .auth-content { width: 100%; max-width: 420px; position: relative; z-index: 1; }
        .auth-brand { text-align: center; margin-bottom: var(--space-10); }
        .auth-brand-icon {
          width: 48px; height: 48px; border-radius: var(--radius-lg); margin: 0 auto var(--space-4);
          background: linear-gradient(135deg, var(--color-brand), #a78bfa);
          display: flex; align-items: center; justify-content: center; color: #fff;
          box-shadow: 0 6px 24px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .auth-brand-text { font-size: var(--text-3xl); font-weight: 800; letter-spacing: -0.04em; display: block; }
        .auth-brand-sub { color: var(--color-text-muted); font-size: var(--text-md); margin-top: var(--space-1); }
        .auth-card {
          background: var(--color-surface-3); border: 1px solid var(--color-border);
          border-radius: var(--radius-xl); padding: var(--space-10) var(--space-8);
          box-shadow: var(--shadow-lg), var(--shadow-glow);
        }
        .auth-field { margin-bottom: var(--space-5); }
        .auth-input-wrap { position: relative; }
        .auth-input-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: var(--color-text-ghost); transition: color var(--duration-base) var(--ease-smooth);
        }
        .auth-input-wrap:focus-within .auth-input-icon { color: var(--color-brand-light); }
        .auth-submit { width: 100%; margin-top: var(--space-3); }
        .auth-divider {
          text-align: center; margin: var(--space-6) 0;
          position: relative; color: var(--color-text-ghost); font-size: var(--text-sm);
        }
        .auth-divider::before, .auth-divider::after {
          content: ''; position: absolute; top: 50%;
          width: calc(50% - 20px); height: 1px; background: var(--color-border);
        }
        .auth-divider::before { left: 0; }
        .auth-divider::after { right: 0; }
        .auth-switch { text-align: center; font-size: var(--text-base); color: var(--color-text-muted); }
        .auth-switch a { color: var(--color-brand-light); font-weight: 600; }
        .auth-switch a:hover { text-decoration: underline; }
        @media (max-width: 480px) {
          .auth-card { padding: var(--space-6) var(--space-5); border-radius: var(--radius-lg); }
          .auth-brand-text { font-size: var(--text-2xl); }
        }
      `}</style>
    </div>
  );
}
