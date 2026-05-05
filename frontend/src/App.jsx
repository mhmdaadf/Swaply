import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ExplorePage from './pages/ExplorePage';
import ItemDetail from './pages/ItemDetail';
import NewItemPage from './pages/NewItemPage';
import MatchesPage from './pages/MatchesPage';
import TradesPage from './pages/TradesPage';
import TradeDetail from './pages/TradeDetail';
import NewTradePage from './pages/NewTradePage';
import EstimatorPage from './pages/EstimatorPage';

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
      <Navbar />
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
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
