import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  Brain, 
  ShieldCheck, 
  Users, 
  ArrowRightLeft, 
  Star, 
  MessageSquare, 
  Zap, 
  Shield, 
  TrendingUp,
  ChevronRight,
  Package
} from 'lucide-react';
import ItemCard from '../components/ItemCard';

export default function LandingPage() {
  // Expanded data for Marketplace Preview (12 items)
  const previewItems = [
    {
      _id: 'p1',
      title: 'Sony Alpha a7 III Camera',
      category: 'Electronics',
      condition: 'Like New',
      swapPointValue: 1850,
      images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400'],
      owner: { username: 'AlexK', trustScore: 4.9 }
    },
    {
      _id: 'p2',
      title: 'Apple iPad Pro 12.9" M2',
      category: 'Electronics',
      condition: 'New',
      swapPointValue: 1200,
      images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=400'],
      owner: { username: 'SarahJ', trustScore: 4.8 }
    },
    {
      _id: 'p3',
      title: 'Herman Miller Aeron Chair',
      category: 'Furniture',
      condition: 'Good',
      swapPointValue: 850,
      images: ['https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=400'],
      owner: { username: 'MikeR', trustScore: 4.7 }
    },
    {
      _id: 'p4',
      title: 'Sony WH-1000XM5',
      category: 'Audio',
      condition: 'New',
      swapPointValue: 350,
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400'],
      owner: { username: 'EmmaW', trustScore: 4.9 }
    },
    {
      _id: 'p5',
      title: 'MacBook Pro 14" M3',
      category: 'Electronics',
      condition: 'Like New',
      swapPointValue: 2400,
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400'],
      owner: { username: 'DavidL', trustScore: 5.0 }
    },
    {
      _id: 'p6',
      title: 'Garmin Fenix 7 Solar',
      category: 'Wearables',
      condition: 'New',
      swapPointValue: 700,
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400'],
      owner: { username: 'ChrisB', trustScore: 4.6 }
    },
    {
      _id: 'p7',
      title: 'Canyon Road Bike',
      category: 'Sports',
      condition: 'Used',
      swapPointValue: 1500,
      images: ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=400'],
      owner: { username: 'JuliaM', trustScore: 4.8 }
    },
    {
      _id: 'p8',
      title: 'Breville Barista Pro',
      category: 'Appliances',
      condition: 'Like New',
      swapPointValue: 650,
      images: ['https://images.unsplash.com/photo-1595434027099-31419445679a?auto=format&fit=crop&q=80&w=400'],
      owner: { username: 'RyanS', trustScore: 4.9 }
    },
    {
      _id: 'p9',
      title: 'Nike Dunk Low Panda',
      category: 'Fashion',
      condition: 'New',
      swapPointValue: 180,
      images: ['https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=400'],
      owner: { username: 'LeoT', trustScore: 4.7 }
    },
    {
      _id: 'p10',
      title: 'Peak Design Backpack',
      category: 'Accessories',
      condition: 'Good',
      swapPointValue: 220,
      images: ['https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=400'],
      owner: { username: 'SophieP', trustScore: 4.8 }
    },
    {
      _id: 'p11',
      title: 'BenQ ScreenBar Halo',
      category: 'Electronics',
      condition: 'New',
      swapPointValue: 150,
      images: ['https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&q=80&w=400'],
      owner: { username: 'MarcG', trustScore: 4.9 }
    },
    {
      _id: 'p12',
      title: 'Keychron Q1 Keyboard',
      category: 'Electronics',
      condition: 'New',
      swapPointValue: 210,
      images: ['https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=400'],
      owner: { username: 'NateW', trustScore: 5.0 }
    }
  ];

  return (
    <div className="landing-root">
      {/* ─── Hero Section ─── */}
      <section className="lp-hero">
        <div className="lp-container">
          <div className="lp-hero-content stagger">
            <div className="badge badge-brand lp-hero-badge">
              <Sparkles size={12} /> Powered by Advanced AI
            </div>
            <h1 className="lp-hero-title">
              The Intelligent Way to <br />
              <span className="gradient-text">Swap & Barter</span>
            </h1>
            <p className="lp-hero-subtitle">
              Exchange items instantly with AI-powered matching. No cash, no friction, just smart swaps with verified users.
            </p>
            <div className="lp-hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started Free <ArrowRight size={18} />
              </Link>
              <Link to="/explore" className="btn btn-secondary btn-lg">
                Browse Marketplace
              </Link>
            </div>
            <div className="lp-hero-stats">
              <div className="lp-stat">
                <span className="lp-stat-val">12k+</span>
                <span className="lp-stat-label">Smart Swaps</span>
              </div>
              <div className="lp-stat-divider" />
              <div className="lp-stat">
                <span className="lp-stat-val">4.9/5</span>
                <span className="lp-stat-label">User Rating</span>
              </div>
              <div className="lp-stat-divider" />
              <div className="lp-stat">
                <span className="lp-stat-val">Instant</span>
                <span className="lp-stat-label">AI Matches</span>
              </div>
            </div>
          </div>
          <div className="lp-hero-visual">
            <div className="lp-visual-glow" />
            <img 
              src="/swaply_hero_mockup_1778502379698.png" 
              alt="Swaply Dashboard Mockup" 
              className="lp-hero-img slide-up"
            />
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="lp-section lp-how-it-works">
        <div className="lp-container">
          <div className="lp-section-header stagger">
            <h2 className="lp-section-title">The Future of Barter</h2>
            <p className="lp-section-desc">Experience a seamless 4-step process designed for speed and safety.</p>
          </div>
          <div className="lp-steps-grid">
            {[
              { 
                icon: Package, 
                title: 'List Your Item', 
                desc: 'Quickly upload your item. Our AI suggests titles, descriptions, and values.',
                color: 'var(--color-brand)'
              },
              { 
                icon: Brain, 
                title: 'AI Smart Matching', 
                desc: 'Our engine finds items you want from users who want what you have.',
                color: 'var(--color-brand-light)'
              },
              { 
                icon: MessageSquare, 
                title: 'Chat & Negotiate', 
                desc: 'Discuss details in real-time. Finalize counts and condition within the app.',
                color: 'var(--color-accent)'
              },
              { 
                icon: ArrowRightLeft, 
                title: 'Complete Swap', 
                desc: 'Finalize the trade safely. Items are locked and ratings are exchanged.',
                color: 'var(--color-success)'
              }
            ].map((step, idx) => (
              <div key={idx} className="lp-step-card card">
                <div className="lp-step-icon" style={{ background: `rgba(${idx % 2 === 0 ? '99,102,241' : '245,158,11'}, 0.1)`, color: step.color }}>
                  <step.icon size={24} />
                  <div className="lp-step-num">{idx + 1}</div>
                </div>
                <h3 className="lp-step-title">{step.title}</h3>
                <p className="lp-step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI Showcase ─── */}
      <section className="lp-section lp-ai-showcase">
        <div className="lp-container">
          <div className="lp-ai-grid">
            <div className="lp-ai-content stagger">
              <div className="badge badge-accent mb-4">
                <Zap size={12} /> Next-Gen AI
              </div>
              <h2 className="lp-section-title mb-6">AI that works for you.</h2>
              <div className="lp-ai-feature">
                <div className="lp-ai-f-icon"><TrendingUp size={20} /></div>
                <div>
                  <h4>AI Value Estimator</h4>
                  <p>Instantly know the fair market value of your item in swap points.</p>
                </div>
              </div>
              <div className="lp-ai-feature">
                <div className="lp-ai-f-icon"><Brain size={20} /></div>
                <div>
                  <h4>Semantic Smart Matching</h4>
                  <p>Our AI understands intent. It matches what you need, not just keywords.</p>
                </div>
              </div>
              <div className="lp-ai-feature">
                <div className="lp-ai-f-icon"><ShieldCheck size={20} /></div>
                <div>
                  <h4>Honesty Audit</h4>
                  <p>AI verifies descriptions against conditions to ensure fair trading.</p>
                </div>
              </div>
            </div>
            <div className="lp-ai-visual">
              <div className="lp-ai-card card glass slide-up">
                <div className="lp-ai-card-header">
                  <Brain size={18} color="var(--color-brand-light)" />
                  <span>AI Estimation in progress...</span>
                </div>
                <div className="lp-ai-card-body">
                  <div className="skeleton mb-4" style={{ height: 200 }} />
                  <div className="lp-ai-result">
                    <div className="lp-ai-res-val">1,250 pts</div>
                    <div className="lp-ai-res-label">Estimated Swap Value</div>
                  </div>
                  <p className="lp-ai-res-reason">"Based on current market trends for Electronics and the Like New condition of your Camera."</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Marketplace Preview ─── */}
      <section className="lp-section lp-marketplace">
        <div className="lp-container">
          <div className="lp-section-header stagger">
            <h2 className="lp-section-title">Trending Now</h2>
            <p className="lp-section-desc">Join thousands of users already swapping high-value items.</p>
          </div>
          <div className="lp-carousel-wrapper">
            <div className="lp-carousel no-scrollbar">
              {previewItems.map(item => (
                <div key={item._id} className="lp-carousel-item">
                  <ItemCard item={item} />
                </div>
              ))}
            </div>
            <div className="lp-carousel-gradient left" />
            <div className="lp-carousel-gradient right" />
          </div>
          <div className="text-center mt-10">
            <Link to="/explore" className="btn btn-secondary">
              View All Items <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Trust & Safety ─── */}
      <section className="lp-section lp-trust glass">
        <div className="lp-container">
          <div className="lp-trust-grid">
            <div className="lp-trust-info stagger">
              <h2 className="lp-section-title">Built on Trust</h2>
              <p className="lp-section-desc">We prioritize safety so you can swap with confidence.</p>
              <div className="lp-trust-items">
                <div className="lp-trust-item">
                  <Star size={16} color="var(--color-accent)" />
                  <span>TrustScore™ verified community</span>
                </div>
                <div className="lp-trust-item">
                  <Shield size={16} color="var(--color-brand-light)" />
                  <span>Secure in-app escrow & tracking</span>
                </div>
                <div className="lp-trust-item">
                  <Users size={16} color="var(--color-success)" />
                  <span>Reporting & moderation around the clock</span>
                </div>
              </div>
            </div>
            <div className="lp-trust-visual">
              <div className="lp-trust-badge-card card">
                <div className="lp-trust-avatar">S</div>
                <div className="lp-trust-name">Sarah Jenkins</div>
                <div className="lp-trust-score">
                  <Star size={14} fill="var(--color-accent)" /> 4.9 Trust Score
                </div>
                <div className="badge badge-success mt-2">Verified Swapper</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="lp-cta-section">
        <div className="lp-container">
          <div className="lp-cta-card card stagger">
            <div className="lp-cta-glow" />
            <h2 className="lp-cta-title">Ready to swap?</h2>
            <p className="lp-cta-desc">Join the smartest barter community today. List your first item in under 2 minutes.</p>
            <div className="lp-cta-actions">
              <Link to="/register" className="btn btn-accent btn-lg">
                Create Account Now
              </Link>
              <Link to="/explore" className="btn btn-ghost btn-lg">
                Explore Marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-grid">
            <div className="lp-footer-brand">
              <div className="nav-brand">
                <div className="nav-brand-icon"><ArrowRightLeft size={16} strokeWidth={2.5} /></div>
                <span className="gradient-text">Swaply</span>
              </div>
              <p className="lp-footer-desc">The AI-powered barter platform for the modern world.</p>
            </div>
            <div className="lp-footer-links">
              <div>
                <h5>Platform</h5>
                <Link to="/explore">Marketplace</Link>
                <Link to="/matches">Smart Swaps</Link>
              </div>
              <div>
                <h5>Company</h5>
                <Link to="/about">About Us</Link>
                <Link to="/contact">Contact</Link>
                <Link to="/blog">Blog</Link>
              </div>
              <div>
                <h5>Legal</h5>
                <Link to="/privacy">Privacy Policy</Link>
                <Link to="/terms">Terms of Service</Link>
              </div>
              <div>
                <h5>Account</h5>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
                <Link to="/profile">Profile</Link>
              </div>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <p>&copy; 2026 Swaply. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style>{`
        .landing-root { background: var(--color-surface-0); overflow-x: hidden; }
        .lp-container { max-width: var(--max-width); margin: 0 auto; padding: 0 var(--space-6); }
        .lp-section { padding: var(--space-16) 0; }
        
        /* Hero */
        .lp-hero { padding: calc(var(--nav-height) + var(--space-16)) 0 var(--space-16); position: relative; }
        .lp-hero .lp-container { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: var(--space-12); align-items: center; }
        .lp-hero-badge { margin-bottom: var(--space-6); align-self: flex-start; }
        .lp-hero-title { font-size: 4.5rem; font-weight: 900; line-height: 1.05; letter-spacing: -0.04em; margin-bottom: var(--space-6); }
        .lp-hero-subtitle { font-size: var(--text-lg); color: var(--color-text-secondary); margin-bottom: var(--space-10); max-width: 520px; line-height: 1.6; }
        .lp-hero-actions { display: flex; gap: var(--space-4); margin-bottom: var(--space-12); }
        .lp-hero-visual { position: relative; }
        .lp-visual-glow { position: absolute; inset: -40px; background: var(--color-brand); filter: blur(120px); opacity: 0.15; z-index: 0; }
        .lp-hero-img { width: 100%; border-radius: var(--radius-xl); box-shadow: var(--shadow-xl); position: relative; z-index: 1; border: 1px solid var(--color-border); }
        
        .lp-hero-stats { display: flex; align-items: center; gap: var(--space-8); }
        .lp-stat { display: flex; flex-direction: column; }
        .lp-stat-val { font-size: var(--text-xl); font-weight: 800; color: #fff; }
        .lp-stat-label { font-size: var(--text-xs); color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
        .lp-stat-divider { width: 1px; height: 32px; background: var(--color-border); }

        /* Sections */
        .lp-section-header { text-align: center; margin-bottom: var(--space-16); }
        .lp-section-title { font-size: var(--text-3xl); font-weight: 800; letter-spacing: -0.03em; }
        .lp-section-desc { color: var(--color-text-secondary); font-size: var(--text-lg); margin-top: var(--space-4); max-width: 600px; margin-left: auto; margin-right: auto; }

        /* How It Works */
        .lp-steps-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-6); }
        .lp-step-card { padding: var(--space-8); text-align: center; }
        .lp-step-icon { width: 56px; height: 56px; border-radius: 16px; margin: 0 auto var(--space-6); display: flex; align-items: center; justify-content: center; position: relative; }
        .lp-step-num { position: absolute; top: -6px; right: -6px; width: 20px; height: 20px; background: #fff; color: #000; border-radius: 50%; font-size: 10px; font-weight: 900; display: flex; align-items: center; justify-content: center; }
        .lp-step-title { font-size: var(--text-lg); font-weight: 700; margin-bottom: var(--space-3); }
        .lp-step-desc { color: var(--color-text-secondary); font-size: var(--text-base); line-height: 1.6; }

        /* AI Showcase */
        .lp-ai-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-16); align-items: center; }
        .lp-ai-feature { display: flex; gap: var(--space-4); margin-bottom: var(--space-8); }
        .lp-ai-f-icon { width: 44px; height: 44px; border-radius: 12px; background: var(--color-surface-2); border: 1px solid var(--color-border); display: flex; align-items: center; justify-content: center; color: var(--color-brand-light); flex-shrink: 0; }
        .lp-ai-feature h4 { font-size: var(--text-base); font-weight: 700; margin-bottom: 4px; }
        .lp-ai-feature p { color: var(--color-text-secondary); font-size: var(--text-base); }

        .lp-ai-card { padding: var(--space-6); position: relative; }
        .lp-ai-card-header { display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-6); font-weight: 600; font-size: var(--text-sm); }
        .lp-ai-result { text-align: center; margin-bottom: var(--space-4); }
        .lp-ai-res-val { font-size: 2.5rem; font-weight: 800; color: var(--color-accent); }
        .lp-ai-res-label { font-size: var(--text-xs); color: var(--color-text-muted); text-transform: uppercase; font-weight: 700; }
        .lp-ai-res-reason { font-size: var(--text-sm); font-style: italic; color: var(--color-text-secondary); text-align: center; }

        /* Marketplace Carousel */
        .lp-carousel-wrapper { position: relative; margin: 0 calc(var(--space-6) * -1); padding: 0 var(--space-6); }
        .lp-carousel { display: flex; gap: var(--space-6); overflow-x: auto; scroll-snap-type: x mandatory; padding: var(--space-4) 0 var(--space-10); scroll-behavior: smooth; -webkit-overflow-scrolling: touch; }
        .lp-carousel-item { flex: 0 0 350px; scroll-snap-align: start; }
        .lp-carousel-gradient { position: absolute; top: 0; bottom: 0; width: 100px; z-index: 2; pointer-events: none; }
        .lp-carousel-gradient.left { left: 0; background: linear-gradient(to right, var(--color-surface-0), transparent); }
        .lp-carousel-gradient.right { right: 0; background: linear-gradient(to left, var(--color-surface-0), transparent); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* Trust */
        .lp-trust-grid { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: var(--space-16); align-items: center; }
        .lp-trust-items { display: flex; flex-direction: column; gap: var(--space-4); margin-top: var(--space-8); }
        .lp-trust-item { display: flex; align-items: center; gap: var(--space-3); font-weight: 600; color: var(--color-text-primary); }
        
        .lp-trust-badge-card { padding: var(--space-8); text-align: center; }
        .lp-trust-avatar { width: 64px; height: 64px; border-radius: 50%; background: var(--color-brand); margin: 0 auto var(--space-4); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 800; color: #fff; }
        .lp-trust-name { font-size: var(--text-lg); font-weight: 700; }
        .lp-trust-score { color: var(--color-text-secondary); margin-top: 4px; display: flex; align-items: center; justify-content: center; gap: 4px; }

        /* CTA */
        .lp-cta-section { padding: var(--space-16) 0 var(--space-32); }
        .lp-cta-card { padding: var(--space-16); text-align: center; position: relative; overflow: hidden; background: linear-gradient(135deg, var(--color-surface-3), var(--color-surface-2)); }
        .lp-cta-glow { position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, var(--color-brand) 0%, transparent 40%); opacity: 0.1; }
        .lp-cta-title { font-size: 3.5rem; font-weight: 900; margin-bottom: var(--space-4); position: relative; z-index: 1; }
        .lp-cta-desc { color: var(--color-text-secondary); font-size: var(--text-lg); margin-bottom: var(--space-10); max-width: 600px; margin-left: auto; margin-right: auto; position: relative; z-index: 1; }
        .lp-cta-actions { display: flex; justify-content: center; gap: var(--space-4); position: relative; z-index: 1; }

        /* Footer */
        .lp-footer { padding: var(--space-16) 0 var(--space-8); border-top: 1px solid var(--color-border); }
        .lp-footer-grid { display: flex; justify-content: space-between; margin-bottom: var(--space-16); }
        .lp-footer-brand { max-width: 320px; }
        .lp-footer-desc { color: var(--color-text-muted); margin-top: var(--space-4); font-size: var(--text-sm); }
        .lp-footer-links { display: flex; gap: var(--space-16); }
        .lp-footer-links h5 { font-size: var(--text-sm); font-weight: 700; text-transform: uppercase; margin-bottom: var(--space-6); color: #fff; }
        .lp-footer-links a { display: block; color: var(--color-text-muted); margin-bottom: var(--space-3); font-size: var(--text-sm); transition: color 0.2s; }
        .lp-footer-links a:hover { color: var(--color-brand-light); }
        .lp-footer-bottom { padding-top: var(--space-8); border-top: 1px solid var(--color-border-subtle); text-align: center; color: var(--color-text-ghost); font-size: var(--text-xs); }

        @media (max-width: 1024px) {
          .lp-hero-title { font-size: 3.5rem; }
          .lp-steps-grid { grid-template-columns: repeat(2, 1fr); }
          .lp-carousel-item { flex: 0 0 300px; }
        }

        @media (max-width: 768px) {
          .lp-hero .lp-container { grid-template-columns: 1fr; text-align: center; }
          .lp-hero-badge { align-self: center; }
          .lp-hero-subtitle { margin-left: auto; margin-right: auto; }
          .lp-hero-actions { justify-content: center; }
          .lp-hero-stats { justify-content: center; }
          .lp-ai-grid, .lp-trust-grid { grid-template-columns: 1fr; gap: var(--space-10); }
          .lp-steps-grid { grid-template-columns: 1fr; }
          .lp-carousel-item { flex: 0 0 280px; }
          .lp-cta-title { font-size: 2.5rem; }
          .lp-footer-grid { flex-direction: column; gap: var(--space-10); }
        }
      `}</style>
    </div>
  );
}
