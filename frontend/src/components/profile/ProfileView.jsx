import React, { useState } from 'react';
import { User, Award, Settings, Save, Languages } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const ProfileView = () => {
  const { userProfile, updateProfile } = useAppContext();
  
  const [formData, setFormData] = useState({
    name: userProfile.name,
    age: userProfile.age,
    language: userProfile.language,
  });

  const [savedMsg, setSavedMsg] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const initials = formData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
    updateProfile({ ...formData, initials });
    
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div>
        <h2 className="page-title">User Profile</h2>
        <p className="page-subtitle">Manage your personal details and app preferences.</p>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Gamification Stats */}
        <div className="glass-panel" style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '32px' }}>
           <div style={{ width: '80px', height: '80px', borderRadius: '40px', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
             {userProfile.initials}
           </div>
           
           <div style={{ textAlign: 'center' }}>
              <h3 style={{ margin: 0 }}>{userProfile.name}</h3>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Member</p>
           </div>
           
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,193,7,0.1)', padding: '12px 24px', borderRadius: '12px', color: '#FFC107', marginTop: '16px' }}>
              <Award size={32} />
              <div>
                 <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 'bold' }}>{userProfile.streak}</span>
                 <span style={{ fontSize: '0.8rem' }}>Day Streak!</span>
              </div>
           </div>
        </div>

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
                    <Settings size={16} /> Age
                 </label>
                 <input 
                    type="number" 
                    className="input-field" 
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    min="1"
                    max="120"
                 />
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
