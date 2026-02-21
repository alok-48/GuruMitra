import { Component } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Header from './components/shared/Header';
import BottomNav from './components/shared/BottomNav';
import LoadingSpinner from './components/shared/LoadingSpinner';
import LoginScreen from './components/screens/LoginScreen';
import HomeScreen from './components/screens/HomeScreen';
import HealthScreen from './components/screens/HealthScreen';
import PensionScreen from './components/screens/PensionScreen';
import DocumentsScreen from './components/screens/DocumentsScreen';
import CommunityScreen from './components/screens/CommunityScreen';
import { UpdatesList, UpdateDetail } from './components/screens/GovUpdatesScreen';
import HelpScreen from './components/screens/HelpScreen';
import NotificationsScreen from './components/screens/NotificationsScreen';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: 'sans-serif', textAlign: 'center' }}>
          <h1 style={{ color: '#d32f2f', fontSize: 28 }}>कुछ गलत हो गया</h1>
          <p style={{ fontSize: 18, color: '#666', margin: '16px 0' }}>Something went wrong. Please refresh.</p>
          <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, textAlign: 'left', overflow: 'auto', fontSize: 14 }}>
            {this.state.error?.message}
          </pre>
          <button onClick={() => window.location.reload()}
            style={{ marginTop: 20, padding: '12px 32px', fontSize: 18, background: '#FF6F00', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer' }}>
            पुनः लोड करें (Reload)
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fdf8f0' }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 64, display: 'block', marginBottom: 16 }}>🎓</span>
          <LoadingSpinner text="गुरुमित्र लोड हो रहा है..." />
        </div>
      </div>
    );
  }

  if (!isLoggedIn) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-warm-50 max-w-lg mx-auto relative">
      <Header />
      <main className="px-4 pt-4 pb-24">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/health" element={<HealthScreen />} />
          <Route path="/pension" element={<PensionScreen />} />
          <Route path="/documents" element={<DocumentsScreen />} />
          <Route path="/community" element={<CommunityScreen />} />
          <Route path="/gov-updates" element={<UpdatesList />} />
          <Route path="/gov-updates/:id" element={<UpdateDetail />} />
          <Route path="/help" element={<HelpScreen />} />
          <Route path="/notifications" element={<NotificationsScreen />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
