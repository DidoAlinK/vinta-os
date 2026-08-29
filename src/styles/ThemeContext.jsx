import React, { createContext, useContext, useState, useCallback } from 'react';

const ThemeContext = createContext();

/**
 * Provides theme state (light/dark) and a toggle function.
 * Reads initial preference from localStorage, falls back to 'light'.
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('vinta-theme') || 'light';
    } catch {
      return 'light';
    }
  });

  // Set data-theme on both <html> and <body> so CSS vars resolve everywhere
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try { localStorage.setItem('vinta-theme', next); } catch { /* noop */ }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div data-theme={theme}>{children}</div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
