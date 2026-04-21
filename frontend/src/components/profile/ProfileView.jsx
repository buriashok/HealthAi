import React, { useState } from 'react';
import { User, Award, Settings, Save, Languages, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const ProfileView = () => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    language: user?.settings?.language || 'en',
    theme: user?.settings?.theme || 'dark',
  });

  const [savedMsg, setSavedMsg] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // In a real app, send a PUT request to /api/auth/profile
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  if (!user) return null;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div>
        <h2 className="page-title">User Profile</h2>
        <p className="page-subtitle">Manage your personal details and app preferences.</p>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Gamification Stats */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="glass-panel" 
          style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '32px' }}
        >
           {user.avatar ? (
             <img src={user.avatar} alt="Avatar" style={{ width: '80px', height: '80px', borderRadius: '40px', border: '3px solid var(--primary-color)' }} />
           ) : (
             <div style={{ width: '80px', height: '80px', borderRadius: '40px', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
               {user.name?.[0] || 'U'}
             </div>
           )}
           
           <div style={{ textAlign: 'center' }}>
              <h3 style={{ margin: 0 }}>{user.name}</h3>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{user.email}</p>
           </div>
           
           <div style={{ display: 'flex', gap: '16px', width: '100%', marginTop: '16px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'rgba(79, 70, 229, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--primary-color)' }}>
                <Zap size={24} />
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{user.gamification?.points || 0}</span>
                <span style={{ fontSize: '0.75rem' }}>Points</span>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'rgba(255, 193, 7, 0.1)', padding: '12px', borderRadius: '12px', color: '#FFC107' }}>
                <ShieldCheck size={24} />
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Lvl {user.gamification?.level || 1}</span>
                <span style={{ fontSize: '0.75rem' }}>Rank</span>
              </div>
           </div>
        </motion.div>

        {/* Edit Form */}
        <div className="glass-panel" style={{ flex: '2 1 400px', padding: '32px' }}>
           <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div className="input-group">
                 <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                    <User size={16} /> Full Name
                 </label>
                 <input 
                    type="text" 
                    className="input-field" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                 />
              </div>

              <div className="input-group">
                 <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                    <Settings size={16} /> App Theme
                 </label>
                 <select 
                    className="input-field"
                    value={formData.theme}
                    onChange={(e) => setFormData({...formData, theme: e.target.value})}
                    style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid var(--surface-border)' }}
                 >
                    <option value="dark">Dark Mode</option>
                    <option value="light">Light Mode</option>
                 </select>
              </div>

              <div className="input-group">
                 <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                    <Languages size={16} /> Default Chat Language
                 </label>
                 <select 
                    className="input-field"
                    value={formData.language}
                    onChange={(e) => setFormData({...formData, language: e.target.value})}
                    style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid var(--surface-border)' }}
                 >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                 </select>
              </div>

              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                 <button type="submit" className="btn">
                    <Save size={18} /> Save Changes
                 </button>
                 {savedMsg && <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>Saved successfully!</span>}
              </div>
           </form>
        </div>

      </div>
    </div>
  );
};

export default ProfileView;
