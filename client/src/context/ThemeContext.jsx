import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const themes = {
  blue: {
    name: 'Ocean Blue',
    description: 'Cool and modern blue theme',
    colors: {
      '--primary-color': '#2563eb',
      '--primary-dark': '#1e40af',
      '--primary-light': '#3b82f6',
      '--secondary-color': '#0891b2',
      '--secondary-dark': '#0e7490',
      '--accent-color': '#7c3aed',
      '--accent-dark': '#6d28d9',
      '--background-light': '#f0f9ff',
      '--background-white': '#ffffff',
      '--text-dark': '#1e293b',
      '--text-medium': '#475569',
      '--text-light': '#64748b',
      '--border-color': '#e2e8f0',
      '--success-color': '#10b981',
      '--warning-color': '#f59e0b',
    }
  },
  sunset: {
    name: 'Egyptian Sunset',
    description: 'Warm desert colors',
    colors: {
      '--primary-color': '#d97706',
      '--primary-dark': '#b45309',
      '--primary-light': '#f59e0b',
      '--secondary-color': '#dc2626',
      '--secondary-dark': '#b91c1c',
      '--accent-color': '#ea580c',
      '--accent-dark': '#c2410c',
      '--background-light': '#fef3c7',
      '--background-white': '#fffbeb',
      '--text-dark': '#1c1917',
      '--text-medium': '#57534e',
      '--text-light': '#78716c',
      '--border-color': '#fde68a',
      '--success-color': '#22c55e',
      '--warning-color': '#eab308',
    }
  },
  emerald: {
    name: 'Nile Emerald',
    description: 'Fresh green inspired by the Nile',
    colors: {
      '--primary-color': '#059669',
      '--primary-dark': '#047857',
      '--primary-light': '#10b981',
      '--secondary-color': '#0d9488',
      '--secondary-dark': '#0f766e',
      '--accent-color': '#8b5cf6',
      '--accent-dark': '#7c3aed',
      '--background-light': '#ecfdf5',
      '--background-white': '#f0fdf4',
      '--text-dark': '#1e293b',
      '--text-medium': '#475569',
      '--text-light': '#64748b',
      '--border-color': '#d1fae5',
      '--success-color': '#10b981',
      '--warning-color': '#f59e0b',
    }
  },
  royal: {
    name: 'Royal Purple',
    description: 'Regal Egyptian royalty theme',
    colors: {
      '--primary-color': '#7c3aed',
      '--primary-dark': '#6d28d9',
      '--primary-light': '#8b5cf6',
      '--secondary-color': '#db2777',
      '--secondary-dark': '#be185d',
      '--accent-color': '#f97316',
      '--accent-dark': '#ea580c',
      '--background-light': '#faf5ff',
      '--background-white': '#fefce8',
      '--text-dark': '#1e1b4b',
      '--text-medium': '#4c1d95',
      '--text-light': '#6b21a8',
      '--border-color': '#e9d5ff',
      '--success-color': '#10b981',
      '--warning-color': '#f59e0b',
    }
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('blue');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('egyptAdvisorTheme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Apply theme colors to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const themeColors = themes[currentTheme].colors;
    
    Object.entries(themeColors).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
    
    // Save to localStorage
    localStorage.setItem('egyptAdvisorTheme', currentTheme);
  }, [currentTheme]);

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, changeTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};
