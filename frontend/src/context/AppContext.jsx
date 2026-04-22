import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const loadState = (key, defaultValue) => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try { return JSON.parse(saved); } catch { return defaultValue; }
    }
    return defaultValue;
  };

  const [language, setLanguage] = useState(() => loadState('healthAI_lang', 'en'));

  const [userProfile, setUserProfile] = useState(() => loadState('healthAI_profile', {
    name: 'User',
    initials: 'U',
    age: 30,
    language: 'en',
    streak: 1,
    lastActive: new Date().toISOString()
  }));

  const [healthHistory, setHealthHistory] = useState(() => loadState('healthAI_history', []));
  
  const [reminders, setReminders] = useState(() => loadState('healthAI_reminders', [
    { id: 1, title: 'Take Paracetamol', time: '08:00 AM', type: 'Medicine', status: 'Pending' },
    { id: 3, title: 'Flu Vaccine Booster', time: 'Oct 15, 2026', type: 'Vaccine', status: 'Upcoming' },
  ]));

  // Persist to localStorage
  useEffect(() => { localStorage.setItem('healthAI_profile', JSON.stringify(userProfile)); }, [userProfile]);
  useEffect(() => { localStorage.setItem('healthAI_history', JSON.stringify(healthHistory)); }, [healthHistory]);
  useEffect(() => { localStorage.setItem('healthAI_reminders', JSON.stringify(reminders)); }, [reminders]);
  useEffect(() => { localStorage.setItem('healthAI_lang', JSON.stringify(language)); }, [language]);

  // Limit history to 50 entries to save storage on free MongoDB tier
  const addHistoryRecord = (record) => {
    setHealthHistory(prev => {
      const updated = [record, ...prev];
      return updated.slice(0, 50);
    });
  };

  const updateProfile = (updates) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
  };

  const addReminder = (reminder) => {
    setReminders(prev => [...prev, { ...reminder, id: Date.now(), status: 'Pending' }]);
  };

  const completeReminder = (id) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, status: 'Completed' } : r));
  };

  const deleteReminder = (id) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  return (
    <AppContext.Provider value={{
      language, setLanguage,
      userProfile, updateProfile,
      healthHistory, setHealthHistory, addHistoryRecord,
      reminders, addReminder, completeReminder, deleteReminder
    }}>
      {children}
    </AppContext.Provider>
  );
};
