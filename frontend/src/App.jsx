import React from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Activity, MessageSquare, LayoutDashboard, MapPin, Image as ImageIcon, Bell, Settings } from 'lucide-react'
import './index.css'

import { useAppContext } from './context/AppContext';
import { useAuth } from './context/AuthContext';
import { Loader2, LogOut } from 'lucide-react';
import Login from './components/auth/Login';

// Layout Component
const Layout = ({ children }) => {
  const location = useLocation();
  const { userProfile } = useAppContext();
  const { user, logout } = useAuth();

  const navLinks = [
    { path: '/', name: 'Symptom Checker', icon: <MessageSquare size={20} /> },
    { path: '/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/nearby', name: 'Nearby Facilities', icon: <MapPin size={20} /> },
    { path: '/scan', name: 'Disease Scan', icon: <ImageIcon size={20} /> },
    { path: '/alerts', name: 'Alerts', icon: <Bell size={20} /> },
    { path: '/admin', name: 'Admin', icon: <Settings size={20} /> },
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Activity className="icon" size={28} />
          <span>HealthAI</span>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`nav-item ${location.pathname === link.path ? 'active' : ''}`}
            >
              <span className="icon">{link.icon}</span>
              {link.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="navbar">
          <div>
             <span style={{color: 'var(--text-secondary)'}}>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/profile" style={{ textDecoration: 'none' }}>
              <div className="user-badge" style={{ cursor: 'pointer' }}>
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                ) : (
                  <div className="avatar">{userProfile?.initials || 'U'}</div>
                )}
                <span style={{ color: 'var(--text-primary)' }}>{user?.name || userProfile?.name || 'User'}</span>
              </div>
            </Link>
            <button className="btn btn-secondary" onClick={logout} style={{ padding: '6px' }} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

import ChatInterface from './components/chat/ChatInterface';
import DashboardView from './components/dashboard/DashboardView';
import NearbyFacilities from './components/nearby/NearbyFacilities';
import ImageScan from './components/scan/ImageScan';
import SmartAlerts from './components/alerts/SmartAlerts';
import AdminPanel from './components/admin/AdminPanel';
import ProfileView from './components/profile/ProfileView';

// Placeholder Pages
const SymptomChecker = () => (
  <ChatInterface />
);

const Dashboard = () => (
  <DashboardView />
);

const Nearby = () => (
  <NearbyFacilities />
);

const Scan = () => (
  <ImageScan />
);

const Alerts = () => (
  <SmartAlerts />
);

const Admin = () => (
  <AdminPanel />
);

const Profile = () => (
  <ProfileView />
);

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" size={48} color="var(--primary-color)" />
      </div>
    );
  }

  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<SymptomChecker />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/nearby" element={<Nearby />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
