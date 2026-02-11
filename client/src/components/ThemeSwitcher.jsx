import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import './ThemeSwitcher.css';

const ThemeSwitcher = () => {
  const { currentTheme, changeTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeChange = (themeName) => {
    changeTheme(themeName);
    setIsOpen(false);
  };

  return (
    <div className="theme-switcher">
      <button 
        className="theme-switcher__button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change theme"
        title="Change color theme"
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <span className="theme-switcher__label">Theme</span>
      </button>

      {isOpen && (
        <div className="theme-switcher__dropdown">
          <div className="theme-switcher__header">
            <h3>Choose Theme</h3>
            <button 
              className="theme-switcher__close"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          
          <div className="theme-switcher__options">
            {Object.entries(themes).map(([key, theme]) => (
              <button
                key={key}
                className={`theme-option ${currentTheme === key ? 'active' : ''}`}
                onClick={() => handleThemeChange(key)}
              >
                <div className="theme-option__preview">
                  <span 
                    className="color-dot" 
                    style={{ backgroundColor: theme.colors['--primary-color'] }}
                  ></span>
                  <span 
                    className="color-dot" 
                    style={{ backgroundColor: theme.colors['--secondary-color'] }}
                  ></span>
                  <span 
                    className="color-dot" 
                    style={{ backgroundColor: theme.colors['--accent-color'] }}
                  ></span>
                </div>
                <div className="theme-option__info">
                  <span className="theme-option__name">{theme.name}</span>
                  <span className="theme-option__description">{theme.description}</span>
                </div>
                {currentTheme === key && (
                  <span className="theme-option__check">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
