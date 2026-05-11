export default function TermsPage() {
  return (
    <div className="static-page">
      <div className="container">
        <header className="static-header">
          <h1 className="gradient-text">Terms of Service</h1>
          <p className="subtitle">Please read these terms carefully before using Swaply.</p>
        </header>

        <div className="legal-content card glass">
          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing or using Swaply, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
          </section>
          <section>
            <h2>2. User Conduct</h2>
            <p>Users are responsible for the items they list. Any attempt to defraud, misrepresent items, or harass other users will result in immediate account termination.</p>
          </section>
          <section>
            <h2>3. AI Valuations</h2>
            <p>Swaply's AI-powered valuations are estimates provided for convenience. They do not constitute a guaranteed market price.</p>
          </section>
          <section>
            <h2>4. Trade Finality</h2>
            <p>Once a trade is confirmed by both parties, it is considered final. Swaply is not responsible for physical item exchange or shipping.</p>
          </section>
        </div>
      </div>

      <style>{`
        .static-page { padding: calc(var(--nav-height) + 64px) 0 128px; background: var(--color-surface-0); min-height: 100vh; }
        .container { max-width: 800px; margin: 0 auto; padding: 0 var(--space-6); }
        .static-header { text-align: center; margin-bottom: 48px; }
        .static-header h1 { font-size: 3rem; font-weight: 900; margin-bottom: 8px; }
        .legal-content { padding: 48px; }
        .legal-content section { margin-bottom: 40px; }
        .legal-content h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 16px; color: var(--color-brand-light); }
        .legal-content p { color: var(--color-text-secondary); line-height: 1.8; }
      `}</style>
    </div>
  );
}
