import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Home, MessageSquare, Clock, UserCircle, LayoutDashboard, CalendarDays, Pill, AlertTriangle, MapPin, Image as ImageIcon, Settings, Activity, LogOut, Sun, Moon, Loader2 } from 'lucide-react'
import './index.css'

import { useAppContext } from './context/AppContext';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import Login from './components/auth/Login';

// Lazy-loaded pages for code splitting
const HomePage = lazy(() => import('./components/home/HomePage'));
const ChatInterface = lazy(() => import('./components/chat/ChatInterface'));
const ChatHistory = lazy(() => import('./components/history/ChatHistory'));
const ProfileView = lazy(() => import('./components/profile/ProfileView'));
const DashboardView = lazy(() => import('./components/dashboard/DashboardView'));
const AppointmentBooking = lazy(() => import('./components/appointments/AppointmentBooking'));
const SmartAlerts = lazy(() => import('./components/alerts/SmartAlerts'));
const EmergencyMode = lazy(() => import('./components/emergency/EmergencyMode'));
const NearbyFacilities = lazy(() => import('./components/nearby/NearbyFacilities'));
const ImageScan = lazy(() => import('./components/scan/ImageScan'));
const AdminPanel = lazy(() => import('./components/admin/AdminPanel'));
const ResetPassword = lazy(() => import('./components/auth/ResetPassword'));

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '64px', flex: 1 }}>
    <Loader2 size={36} className="animate-spin" color="var(--primary-color)" />
  </div>
);

// ─── Sidebar ─────────────────────────────────────────────────────
const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const mainNav = [
    { path: '/', name: 'Home', icon: <Home size={18} /> },
    { path: '/chat', name: 'AI Chat', icon: <MessageSquare size={18} /> },
    { path: '/history', name: 'History', icon: <Clock size={18} /> },
    { path: '/profile', name: 'Profile', icon: <UserCircle size={18} /> },
  ];

  const healthNav = [
    { path: '/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { path: '/appointments', name: 'Appointments', icon: <CalendarDays size={18} /> },
    { path: '/reminders', name: 'Reminders', icon: <Pill size={18} /> },
    { path: '/emergency', name: 'Emergency', icon: <AlertTriangle size={18} /> },
  ];

  const toolsNav = [
    { path: '/nearby', name: 'Nearby', icon: <MapPin size={18} /> },
    { path: '/scan', name: 'Scan', icon: <ImageIcon size={18} /> },
  ];

  // Only show Admin for admin role
  if (user?.role === 'admin') {
    toolsNav.push({ path: '/admin', name: 'Admin', icon: <Settings size={18} /> });
  }

  const renderNav = (items) => items.map((link) => (
    <Link key={link.path} to={link.path}
      className={`nav-item ${location.pathname === link.path ? 'active' : ''}`}>
      <span className="icon">{link.icon}</span>
      {link.name}
    </Link>
  ));

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Activity className="icon" size={24} />
        <span>HealthAI</span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
        {renderNav(mainNav)}

        <div className="nav-section-title">Health</div>
        {renderNav(healthNav)}

        <div className="nav-section-title">Tools</div>
        {renderNav(toolsNav)}
      </nav>

      {/* Bottom section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--surface-border)', paddingTop: 'var(--space-md)' }}>
        <button className="nav-item" onClick={toggleTheme} style={{ border: 'none', background: 'none', width: '100%', cursor: 'pointer', fontFamily: 'var(--font-family)' }}>
          <span className="icon">{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</span>
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button className="nav-item" onClick={logout} style={{ border: 'none', background: 'none', width: '100%', cursor: 'pointer', color: 'var(--danger-color)', fontFamily: 'var(--font-family)' }}>
          <span className="icon"><LogOut size={18} /></span>
          Logout
        </button>
      </div>
    </aside>
  );
};

// ─── Bottom Navigation (Mobile) ──────────────────────────────────
const BottomNav = () => {
  const location = useLocation();

  const items = [
    { path: '/', name: 'Home', icon: <Home size={20} /> },
    { path: '/chat', name: 'Chat', icon: <MessageSquare size={20} /> },
    { path: '/history', name: 'History', icon: <Clock size={20} /> },
    { path: '/profile', name: 'Profile', icon: <UserCircle size={20} /> },
  ];

  return (
    <div className="bottom-nav">
      <div className="bottom-nav-items">
        {items.map((item) => (
          <Link key={item.path} to={item.path}
            className={`bottom-nav-item ${location.pathname === item.path ? 'active' : ''}`}>
            {item.icon}
            <span>{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

// ─── Layout ──────────────────────────────────────────────────────
const Layout = ({ children }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <header className="navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            <button className="btn btn-ghost btn-sm" onClick={toggleTheme} title="Toggle theme">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Link to="/profile" style={{ textDecoration: 'none' }}>
              <div className="user-badge">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" style={{ width: 32, height: 32, borderRadius: 'var(--radius-full)' }} />
                ) : (
                  <div className="avatar">{user?.name?.[0] || 'U'}</div>
                )}
                <span style={{ color: 'var(--text-primary)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                  {user?.name || 'User'}
                </span>
              </div>
            </Link>
          </div>
        </header>
        <div className="content-wrapper">
          <Suspense fallback={<PageLoader />}>
            {children}
          </Suspense>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

// ─── App ─────────────────────────────────────────────────────────
function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)' }}>
        <div style={{ textAlign: 'center' }}>
          <Activity size={48} color="var(--primary-color)" className="animate-pulse" />
          <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontFamily: 'var(--font-family)' }}>Loading HealthAI...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/reset-password/:token" element={
            <Suspense fallback={<PageLoader />}><ResetPassword /></Suspense>
          } />
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/history" element={<ChatHistory />} />
          <Route path="/profile" element={<ProfileView />} />
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/appointments" element={<AppointmentBooking />} />
          <Route path="/reminders" element={<SmartAlerts />} />
          <Route path="/emergency" element={<EmergencyMode />} />
          <Route path="/nearby" element={<NearbyFacilities />} />
          <Route path="/scan" element={<ImageScan />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
