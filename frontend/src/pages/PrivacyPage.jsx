export default function PrivacyPage() {
  return (
    <div className="static-page">
      <div className="container">
        <header className="static-header">
          <h1 className="gradient-text">Privacy Policy</h1>
          <p className="subtitle">Last updated: May 11, 2026</p>
        </header>

        <div className="legal-content card glass">
          <section>
            <h2>1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create an account, list an item, or communicate with other users.</p>
          </section>
          <section>
            <h2>2. How We Use Information</h2>
            <p>We use the information to facilitate swaps, improve our AI matching engine, and ensure the safety of our community.</p>
          </section>
          <section>
            <h2>3. AI Processing</h2>
            <p>Our AI models process item descriptions and images to provide fair valuations. This data is used to improve the accuracy of our platform.</p>
          </section>
          <section>
            <h2>4. Data Security</h2>
            <p>We implement industry-standard security measures to protect your personal information from unauthorized access or disclosure.</p>
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
