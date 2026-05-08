import React, { createContext, useContext, useState, useEffect } from 'react';
import { profileAPI } from '../services/api';
import { useAuth } from './AuthContext';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Only load theme from server if user is authenticated
    if (isAuthenticated) {
      loadTheme();
    } else {
      // Use localStorage fallback when not logged in
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setTheme(savedTheme);
      }
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const loadTheme = async () => {
    try {
      // First check localStorage for quick load
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setTheme(savedTheme);
      }
      
      // Then sync with server (only if authenticated)
      if (isAuthenticated) {
        const response = await profileAPI.getTheme();
        if (response.data.success) {
          setTheme(response.data.data.theme);
        }
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = async () => {
  const newTheme = theme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
  
  if (isAuthenticated) {
    try {
      await profileAPI.updateTheme(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }
};

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};