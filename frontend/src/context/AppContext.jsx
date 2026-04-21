import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // Try to load state from Local Storage
  const loadState = (key, defaultValue) => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultValue;
      }
    }
    return defaultValue;
  };

  const [userProfile, setUserProfile] = useState(() => loadState('healthAI_profile', {
    name: 'John Doe',
    initials: 'JD',
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

  // Save changes to Local Storage automatically
  useEffect(() => {
    localStorage.setItem('healthAI_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('healthAI_history', JSON.stringify(healthHistory));
  }, [healthHistory]);

  useEffect(() => {
    localStorage.setItem('healthAI_reminders', JSON.stringify(reminders));
  }, [reminders]);

  // Helper actions
  const addHistoryRecord = (record) => {
    // record could be { type: 'chat' | 'scan', date: iso, details: any }
    setHealthHistory(prev => [record, ...prev]);
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
      userProfile, updateProfile,
      healthHistory, setHealthHistory, addHistoryRecord,
      reminders, addReminder, completeReminder, deleteReminder
    }}>
      {children}
    </AppContext.Provider>
  );
};
