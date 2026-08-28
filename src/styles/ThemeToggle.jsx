import React from 'react';
import { useTheme } from './ThemeContext';

/**
 * Pill-shaped light/dark toggle — the signature glassmorphic element.
 * Reused in topbar and settings.
 */
export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className={`theme-toggle glass ${isDark ? 'dark' : ''} ${className}`}
      onClick={toggleTheme}
      role="button"
      tabIndex={0}
      aria-label="Toggle theme"
      onKeyDown={(e) => e.key === 'Enter' && toggleTheme()}
    >
      <span className="ic">☀</span>
      <span className="ic">☾</span>
      <div className="knob" />
      <style>{`
        .theme-toggle {
          display: flex; align-items: center; gap: 0;
          cursor: pointer; border-radius: 100px; padding: 5px;
          position: relative; width: 60px; height: 30px; flex-shrink: 0;
        }
        .theme-toggle .knob {
          width: 20px; height: 20px; border-radius: 50%;
          background: linear-gradient(160deg, var(--gold), var(--emerald));
          position: absolute; top: 4px; left: 4px;
          transition: left 0.3s cubic-bezier(0.4,0,0.2,1);
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        }
        .theme-toggle.dark .knob { left: 34px; }
        .theme-toggle .ic {
          font-size: 10px; color: var(--muted);
          width: 13px; text-align: center;
          position: relative; z-index: 1;
        }
        .theme-toggle .ic:first-child { margin-left: 1px; }
        .theme-toggle .ic:last-child { margin-left: auto; margin-right: 1px; }
      `}</style>
    </div>
  );
}
