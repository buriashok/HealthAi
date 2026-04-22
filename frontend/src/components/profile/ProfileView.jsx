import React, { useState } from 'react';
import { User, Save, Languages, ShieldCheck, Zap, Sun, Moon, Type, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SUPPORTED_LANGUAGES } from '../../utils/translations';
import { motion } from 'framer-motion';

const ProfileView = () => {
  const { user } = useAuth();
  const { theme, toggleTheme, fontSize, setFontSize } = useTheme();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    language: user?.settings?.language || 'en',
  });

  const [savedMsg, setSavedMsg] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  if (!user) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', maxWidth: '900px', margin: '0 auto' }}>
      <div>
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your account and preferences</p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-lg)', flexWrap: 'wrap' }}>
        
        {/* User Card */}
        <motion.div whileHover={{ scale: 1.01 }} className="glass-panel"
          style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-lg)', padding: 'var(--space-xl)' }}>
          {user.avatar ? (
            <img src={user.avatar} alt="Avatar" style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-full)', border: '3px solid var(--primary-color)' }} />
          ) : (
            <div className="avatar" style={{ width: '80px', height: '80px', fontSize: 'var(--text-2xl)' }}>
              {user.name?.[0] || 'U'}
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: 0, fontWeight: 700 }}>{user.name}</h3>
            <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: 'var(--text-sm)' }}>{user.email}</p>
            <span className={`badge ${user.role === 'admin' ? 'badge-red' : user.role === 'doctor' ? 'badge-blue' : 'badge-green'}`} style={{ marginTop: '8px', display: 'inline-block' }}>
              {user.role?.toUpperCase() || 'USER'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-md)', width: '100%' }}>
            <div className="stat-card" style={{ flex: 1, textAlign: 'center', padding: 'var(--space-md)' }}>
              <Zap size={20} color="var(--primary-color)" />
              <div className="stat-value" style={{ fontSize: 'var(--text-xl)', color: 'var(--primary-color)' }}>{user.gamification?.points || 0}</div>
              <div className="stat-label">Points</div>
            </div>
            <div className="stat-card" style={{ flex: 1, textAlign: 'center', padding: 'var(--space-md)' }}>
              <ShieldCheck size={20} color="var(--warning-color)" />
              <div className="stat-value" style={{ fontSize: 'var(--text-xl)', color: 'var(--warning-color)' }}>Lvl {user.gamification?.level || 1}</div>
              <div className="stat-label">Rank</div>
            </div>
          </div>
        </motion.div>

        {/* Settings Form */}
        <div className="glass-panel" style={{ flex: '2 1 400px', padding: 'var(--space-xl)' }}>
          <h3 style={{ marginBottom: 'var(--space-lg)', fontWeight: 700 }}>Settings</h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div className="input-group">
              <label><User size={14} /> Full Name</label>
              <input className="input-field" type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>

            {/* Theme Toggle */}
            <div className="input-group">
              <label>{theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />} Theme</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => { if (theme !== 'dark') toggleTheme(); }}
                  className={`btn btn-sm ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}>
                  <Moon size={14} /> Dark
                </button>
                <button type="button" onClick={() => { if (theme !== 'light') toggleTheme(); }}
                  className={`btn btn-sm ${theme === 'light' ? 'btn-primary' : 'btn-secondary'}`}>
                  <Sun size={14} /> Light
                </button>
              </div>
            </div>

            {/* Font Size */}
            <div className="input-group">
              <label><Type size={14} /> Text Size</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['normal', 'large', 'xlarge'].map(size => (
                  <button key={size} type="button" onClick={() => setFontSize(size)}
                    className={`btn btn-sm ${fontSize === size ? 'btn-primary' : 'btn-secondary'}`}>
                    {size === 'normal' ? 'Normal' : size === 'large' ? 'Large' : 'X-Large'}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="input-group">
              <label><Languages size={14} /> Language</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {SUPPORTED_LANGUAGES.map(lang => (
                  <button key={lang.code} type="button" onClick={() => setFormData({ ...formData, language: lang.code })}
                    className={`btn btn-sm ${formData.language === lang.code ? 'btn-primary' : 'btn-secondary'}`}>
                    {lang.flag} {lang.name}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginTop: 'var(--space-sm)' }}>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Save Changes
              </button>
              {savedMsg && <span style={{ color: 'var(--accent-color)', fontWeight: 700, fontSize: 'var(--text-sm)' }}>✓ Saved!</span>}
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileView;
