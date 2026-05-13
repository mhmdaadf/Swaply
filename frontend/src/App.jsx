import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useAuthStore } from './store/authStore';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';

// Eager-loaded (critical path)
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';

// Lazy-loaded (non-critical, loaded on demand)
const ExplorePage = lazy(() => import('./pages/ExplorePage'));
const ItemDetail = lazy(() => import('./pages/ItemDetail'));
const NewItemPage = lazy(() => import('./pages/NewItemPage'));
const MatchesPage = lazy(() => import('./pages/MatchesPage'));
const TradesPage = lazy(() => import('./pages/TradesPage'));
const TradeDetail = lazy(() => import('./pages/TradeDetail'));
const NewTradePage = lazy(() => import('./pages/NewTradePage'));
const EstimatorPage = lazy(() => import('./pages/EstimatorPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const PublicProfile = lazy(() => import('./pages/PublicProfile'));

function PageLoader() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', gap: 16,
    }}>
      <div style={{
        width: 36, height: 36, border: '2.5px solid var(--color-border)',
        borderTopColor: 'var(--color-brand-light)', borderRadius: '50%',
      }} className="animate-spin" />
      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-ghost)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Loading</span>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { accessToken } = useAuthStore();
  if (!accessToken) return <Navigate to="/login" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { accessToken } = useAuthStore();
  if (accessToken) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <div className="page-transition-wrapper">
          <Routes>
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/explore" element={<ProtectedRoute><ExplorePage /></ProtectedRoute>} />
            <Route path="/items/new" element={<ProtectedRoute><NewItemPage /></ProtectedRoute>} />
            <Route path="/items/:id" element={<ProtectedRoute><ItemDetail /></ProtectedRoute>} />
            <Route path="/matches" element={<ProtectedRoute><MatchesPage /></ProtectedRoute>} />
            <Route path="/trades" element={<ProtectedRoute><TradesPage /></ProtectedRoute>} />
            <Route path="/trades/new" element={<ProtectedRoute><NewTradePage /></ProtectedRoute>} />
            <Route path="/trades/:id" element={<ProtectedRoute><TradeDetail /></ProtectedRoute>} />
            <Route path="/estimator" element={<ProtectedRoute><EstimatorPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/users/:id" element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
            <Route path="/reset-password/:token" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
            
            {/* Public Static Pages */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/blog" element={<BlogPage />} />

            <Route path="/" element={<GuestRoute><LandingPage /></GuestRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Suspense>
    </BrowserRouter>
  );
}
