export default function BlogPage() {
  return (
    <div className="static-page">
      <div className="container">
        <header className="static-header">
          <h1 className="gradient-text">Swaply Blog</h1>
          <p className="subtitle">Stories, tips, and updates from the future of barter.</p>
        </header>

        <div className="blog-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="card glass blog-card">
              <div className="blog-img-placeholder" />
              <div className="blog-content">
                <span className="blog-date">May {10-i}, 2026</span>
                <h3>Coming Soon: The Swaply Pro Experience</h3>
                <p>We're working on some exciting new features for our most active swappers...</p>
                <button className="btn btn-ghost btn-sm">Read More</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .static-page { padding: calc(var(--nav-height) + 64px) 0 128px; background: var(--color-surface-0); min-height: 100vh; }
        .container { max-width: 1000px; margin: 0 auto; padding: 0 var(--space-6); }
        .static-header { text-align: center; margin-bottom: 64px; }
        .static-header h1 { font-size: 3.5rem; font-weight: 900; }
        
        .blog-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
        .blog-card { overflow: hidden; padding: 0; }
        .blog-img-placeholder { height: 200px; background: var(--color-surface-2); }
        .blog-content { padding: 24px; }
        .blog-date { font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .blog-content h3 { font-size: 1.25rem; margin: 12px 0; font-weight: 700; }
        .blog-content p { color: var(--color-text-secondary); font-size: 0.9rem; margin-bottom: 20px; }
        
        @media (max-width: 768px) {
          .blog-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
