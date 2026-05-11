import { ArrowRightLeft, Target, Users, ShieldCheck, Zap } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="static-page">
      <div className="container">
        <header className="static-header">
          <h1 className="gradient-text">About Swaply</h1>
          <p className="subtitle">Revolutionizing the way we exchange value through AI-powered bartering.</p>
        </header>

        <section className="static-section">
          <div className="grid grid-2">
            <div>
              <h2>Our Mission</h2>
              <p>
                At Swaply, we believe that value is subjective and that traditional currency shouldn't be the only way to get what you need. Our mission is to build a global, intelligent marketplace where people can trade items and services directly, powered by state-of-the-art AI.
              </p>
              <p>
                Whether you're looking to declutter your home or find your next favorite gadget, Swaply makes the process seamless, safe, and rewarding.
              </p>
            </div>
            <div className="card glass mission-card">
              <div className="mission-icon"><Target size={32} color="var(--color-brand-light)" /></div>
              <h3>Empowering Sustainable Trade</h3>
              <p>By encouraging reuse and direct exchange, we're reducing waste and building a more circular economy.</p>
            </div>
          </div>
        </section>

        <section className="static-section">
          <h2>Core Values</h2>
          <div className="grid grid-3">
            <div className="value-item">
              <ShieldCheck size={24} color="var(--color-success)" />
              <h4>Trust First</h4>
              <p>Our TrustScore™ system ensures every swapper is verified and reliable.</p>
            </div>
            <div className="value-item">
              <Zap size={24} color="var(--color-accent)" />
              <h4>AI-Driven</h4>
              <p>We leverage cutting-edge technology to provide fair valuations and perfect matches.</p>
            </div>
            <div className="value-item">
              <Users size={24} color="var(--color-brand)" />
              <h4>Community Built</h4>
              <p>Swaply is a platform for the people, built by listening to our users' needs.</p>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .static-page { padding: calc(var(--nav-height) + 64px) 0 128px; background: var(--color-surface-0); min-height: 100vh; }
        .container { max-width: 1000px; margin: 0 auto; padding: 0 var(--space-6); }
        .static-header { text-align: center; margin-bottom: 80px; }
        .static-header h1 { font-size: 4rem; font-weight: 900; margin-bottom: 16px; }
        .static-header .subtitle { font-size: 1.25rem; color: var(--color-text-secondary); max-width: 600px; margin: 0 auto; }
        
        .static-section { margin-bottom: 80px; }
        .static-section h2 { font-size: 2rem; font-weight: 800; margin-bottom: 24px; }
        .static-section p { color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 16px; }
        
        .grid { display: grid; gap: 40px; }
        .grid-2 { grid-template-columns: 1.2fr 0.8fr; }
        .grid-3 { grid-template-columns: repeat(3, 1fr); }
        
        .mission-card { padding: 40px; text-align: center; }
        .mission-icon { margin-bottom: 20px; display: flex; justify-content: center; }
        
        .value-item { padding: 32px; background: var(--color-surface-1); border-radius: 20px; border: 1px solid var(--color-border); }
        .value-item h4 { margin: 16px 0 8px; font-size: 1.25rem; font-weight: 700; }
        .value-item p { font-size: 0.95rem; margin-bottom: 0; }

        @media (max-width: 768px) {
          .grid-2, .grid-3 { grid-template-columns: 1fr; }
          .static-header h1 { font-size: 2.5rem; }
        }
      `}</style>
    </div>
  );
}
