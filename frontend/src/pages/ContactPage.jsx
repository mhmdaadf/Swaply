import { Mail, MessageSquare, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="static-page">
      <div className="container">
        <header className="static-header">
          <h1 className="gradient-text">Get in Touch</h1>
          <p className="subtitle">Have questions? We're here to help you swap smarter.</p>
        </header>

        <div className="contact-grid">
          <div className="contact-info">
            <div className="info-card card">
              <div className="info-item">
                <div className="info-icon"><Mail size={20} /></div>
                <div>
                  <h4>Email Us</h4>
                  <p>support@swaply.ai</p>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon"><MessageSquare size={20} /></div>
                <div>
                  <h4>Live Chat</h4>
                  <p>Available 24/7 for Pro members</p>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon"><MapPin size={20} /></div>
                <div>
                  <h4>Headquarters</h4>
                  <p>123 AI Boulevard, Tech City, 94103</p>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form-container">
            <form className="contact-form card glass" onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" placeholder="Your Name" className="form-input" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="your@email.com" className="form-input" />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea placeholder="How can we help?" className="form-input" rows="5"></textarea>
              </div>
              <button className="btn btn-primary w-full">
                Send Message <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .static-page { padding: calc(var(--nav-height) + 64px) 0 128px; background: var(--color-surface-0); min-height: 100vh; }
        .container { max-width: 1000px; margin: 0 auto; padding: 0 var(--space-6); }
        .static-header { text-align: center; margin-bottom: 64px; }
        .static-header h1 { font-size: 3.5rem; font-weight: 900; margin-bottom: 16px; }
        .static-header .subtitle { font-size: 1.15rem; color: var(--color-text-secondary); }
        
        .contact-grid { display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 48px; }
        
        .info-card { padding: 32px; background: var(--color-surface-1); border: 1px solid var(--color-border); }
        .info-item { display: flex; gap: 16px; margin-bottom: 32px; }
        .info-item:last-child { margin-bottom: 0; }
        .info-icon { width: 44px; height: 44px; border-radius: 12px; background: var(--color-surface-2); display: flex; align-items: center; justify-content: center; color: var(--color-brand-light); }
        .info-item h4 { font-size: 1rem; font-weight: 700; margin-bottom: 4px; }
        .info-item p { color: var(--color-text-secondary); font-size: 0.95rem; }
        
        .contact-form { padding: 40px; }
        .form-group { margin-bottom: 24px; }
        .form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: var(--color-text-primary); margin-bottom: 8px; }
        .form-input { width: 100%; padding: 12px 16px; background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: 12px; color: #fff; outline: none; transition: border-color 0.2s; }
        .form-input:focus { border-color: var(--color-brand-light); }
        
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr; }
          .static-header h1 { font-size: 2.5rem; }
        }
      `}</style>
    </div>
  );
}
