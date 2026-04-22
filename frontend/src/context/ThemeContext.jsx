import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('healthAI_theme') || 'dark');
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('healthAI_fontSize') || 'normal');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('healthAI_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-fontsize', fontSize);
    localStorage.setItem('healthAI_fontSize', fontSize);
  }, [fontSize]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const cycleFontSize = () => {
    setFontSize(prev => {
      if (prev === 'normal') return 'large';
      if (prev === 'large') return 'xlarge';
      return 'normal';
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, fontSize, setFontSize, cycleFontSize }}>
      {children}
    </ThemeContext.Provider>
  );
};
