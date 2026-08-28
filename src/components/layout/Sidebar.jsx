import React, { useState, useCallback } from 'react';
import { NAV_ITEMS, RADIUS, FONT } from '../../styles/design-tokens';
import { useTheme } from '../../styles/ThemeContext';

/* ── SVG icons (20×20, stroke-based) ─────────────────────────────────── */

const ICONS = {
  dashboard: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="2.5" width="6.5" height="7" rx="2" />
      <rect x="11" y="2.5" width="6.5" height="4.5" rx="2" />
      <rect x="2.5" y="12" width="6.5" height="5.5" rx="2" />
      <rect x="11" y="10.5" width="6.5" height="7" rx="2" />
    </svg>
  ),
  students: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="6.5" r="3" />
      <path d="M2 17.5c0-3 2.2-5 5.5-5s5.5 2 5.5 5" />
      <circle cx="14.5" cy="7" r="2" />
      <path d="M14 12.5c2 .5 3.5 2 3.5 4.5" />
    </svg>
  ),
  teachers: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="6" r="3.5" />
      <path d="M3.5 17c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
    </svg>
  ),
  classes: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="4" width="15" height="12.5" rx="2.5" />
      <path d="M2.5 8h15" />
      <circle cx="5.5" cy="6" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="7.5" cy="6" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="9.5" cy="6" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="3.5" width="15" height="14" rx="2.5" />
      <path d="M2.5 8h15" />
      <path d="M6.5 2v3.5M13.5 2v3.5" />
    </svg>
  ),
  billing: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4.5" width="14" height="11.5" rx="2" />
      <path d="M3 8.5h14" />
      <path d="M7 12.5h3" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="2.5" />
      <path d="M16.5 10a6.5 6.5 0 0 1-.3 2l1.5 1.2-1.5 2.6-1.8-.7a6.5 6.5 0 0 1-1.7 1l-.2 1.9h-3l-.2-1.9a6.5 6.5 0 0 1-1.7-1l-1.8.7L3.3 13.2l1.5-1.2a6.5 6.5 0 0 1-.3-2 6.5 6.5 0 0 1 .3-2l-1.5-1.2 1.5-2.6 1.8.7a6.5 6.5 0 0 1 1.7-1l.2-1.9h3l.2 1.9a6.5 6.5 0 0 1 1.7 1l1.8-.7 1.5 2.6-1.5 1.2c.2.6.3 1.3.3 2z" />
    </svg>
  ),
  hamburger: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M4 6h12M4 10h12M4 14h12" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  ),
};

/* ── Staff-hidden nav IDs ─────────────────────────────────────────────── */

const STAFF_HIDDEN = ['billing', 'settings'];

/* ── Sidebar component ────────────────────────────────────────────────── */

export default function Sidebar({
  activeNav,
  onNavChange,
  onSettingsClick,
  isStaff = false,
  userRole = 'admin',
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = useCallback(
    (id) => {
      if (id === 'settings') {
        onSettingsClick?.();
      } else {
        onNavChange?.(id);
      }
      setMobileOpen(false);
    },
    [onNavChange, onSettingsClick]
  );

  const filteredItems = NAV_ITEMS.filter(
    (item) => !(isStaff && STAFF_HIDDEN.includes(item.id))
  );

  const mainItems = filteredItems;

  const sidebar = (
    <div className="sb-inner" data-theme={theme}>
      {/* Logo */}
      <div className="sb-logo">
        <div className="sb-logo-icon" />
        <div className="sb-logo-text">
          <span className="sb-academy">Vinta School OS</span>
          <span className="sb-subtitle">École Al Amal</span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="sb-nav">
        {mainItems.map((item) => {
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              className={`sb-link ${isActive ? 'active' : ''}`}
              onClick={() => handleNav(item.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="sb-icon">{ICONS[item.id]}</span>
              <span className="sb-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1 }} />
    </div>
  );

  return (
    <>
      {/* Hamburger toggle (mobile only) */}
      <button
        className="sb-hamburger"
        onClick={() => setMobileOpen((o) => !o)}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
      >
        {mobileOpen ? ICONS.close : ICONS.hamburger}
      </button>

      {/* Overlay backdrop */}
      {mobileOpen && (
        <div className="sb-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Desktop sidebar + mobile slide-in */}
      <aside className="sb-desktop">{sidebar}</aside>
      <aside className={`sb-mobile ${mobileOpen ? 'open' : ''}`}>{sidebar}</aside>

      <style>{`
        /* ── CSS variables scoped to sidebar ── */
        .sb-desktop, .sb-mobile {
          --gold: ${isDark ? '#e0b93f' : '#b3872a'};
          --emerald: ${isDark ? '#1fae7c' : '#0f6b4d'};
          --violet: ${isDark ? '#a07cc5' : '#7c3aed'};
          --text: ${isDark ? '#ececec' : '#1f1f22'};
          --muted: ${isDark ? '#9497a1' : '#75726a'};
          --goldSoft: ${isDark ? 'rgba(224,185,63,0.15)' : 'rgba(179,135,42,0.14)'};
          --emeraldSoft: ${isDark ? 'rgba(31,174,124,0.15)' : 'rgba(15,107,77,0.13)'};
          --violetSoft: ${isDark ? 'rgba(160,124,197,0.15)' : 'rgba(122,90,149,0.14)'};
          --divider: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(35,36,31,0.09)'};
          --glass: ${isDark ? 'rgba(255,255,255,0.055)' : 'rgba(255,255,255,0.55)'};
          --glassStrong: ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.82)'};
          --glassBorder: ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.75)'};
          --glassShadow: ${isDark
            ? '0 1px 0 rgba(255,255,255,0.08) inset, 0 20px 50px rgba(0,0,0,0.55)'
            : '0 1px 0 rgba(255,255,255,0.9) inset, 0 18px 40px rgba(120,105,80,0.16)'};
          --sheen: ${isDark
            ? 'linear-gradient(115deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.02) 30%, rgba(255,255,255,0) 55%)'
            : 'linear-gradient(115deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.12) 30%, rgba(255,255,255,0) 55%)'};
        }

        /* ── Hamburger (visible < 900px) ── */
        .sb-hamburger {
          display: none;
          position: fixed; top: 16px; left: 16px; z-index: 1100;
          width: 40px; height: 40px;
          border: none; border-radius: ${RADIUS.sm};
          background: ${isDark ? 'rgba(45,45,48,0.65)' : 'rgba(255,255,255,0.45)'};
          backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px);
          color: var(--text);
          cursor: pointer; padding: 8px;
          box-shadow: ${isDark
            ? '0 4px 20px rgba(0,0,0,0.35)'
            : '0 4px 20px rgba(120,105,80,0.15)'};
          transition: background 0.2s;
        }
        .sb-hamburger:hover {
          background: ${isDark ? 'rgba(60,60,65,0.75)' : 'rgba(255,255,255,0.65)'};
        }

        /* ── Overlay ── */
        .sb-overlay {
          display: none;
          position: fixed; inset: 0; z-index: 1040;
          background: rgba(0,0,0,0.35);
          backdrop-filter: blur(4px);
          animation: sbFadeIn 0.2s ease;
        }
        @keyframes sbFadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* ── Desktop sidebar ── */
        .sb-desktop {
          position: fixed; top: 0; left: 0; bottom: 0;
          width: 240px; z-index: 1000;
          padding: 16px 10px;
          display: flex;
        }
        .sb-desktop .sb-inner {
          width: 100%;
          display: flex; flex-direction: column;
          border-radius: 0 ${RADIUS.lg} ${RADIUS.lg} 0;
          padding: 20px 12px;
          background: ${isDark ? 'rgba(35,35,38,0.60)' : 'rgba(255,255,255,0.45)'};
          backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px);
          border: 1px solid var(--glassBorder);
          box-shadow: var(--glassShadow);
          overflow: hidden;
        }
        .sb-desktop .sb-inner::before {
          content: '';
          position: absolute; inset: 0; border-radius: inherit;
          background: var(--sheen);
          pointer-events: none;
        }

        /* ── Mobile sidebar ── */
        .sb-mobile {
          display: none;
          position: fixed; top: 0; left: 0; bottom: 0;
          width: 260px; z-index: 1050;
          padding: 16px 0 16px 16px;
          transform: translateX(-110%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sb-mobile.open {
          transform: translateX(0);
        }
        .sb-mobile .sb-inner {
          width: 100%;
          display: flex; flex-direction: column;
          border-radius: 0 ${RADIUS.lg} ${RADIUS.lg} 0;
          padding: 20px 12px;
          background: ${isDark ? 'rgba(35,35,38,0.85)' : 'rgba(255,255,255,0.72)'};
          backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px);
          border: 1px solid var(--glassBorder);
          box-shadow: var(--glassShadow);
          overflow: hidden;
          position: relative;
        }
        .sb-mobile .sb-inner::before {
          content: '';
          position: absolute; inset: 0; border-radius: inherit;
          background: var(--sheen);
          pointer-events: none;
        }

        @media (max-width: 899px) {
          .sb-desktop { display: none !important; }
          .sb-hamburger { display: flex; align-items: center; justify-content: center; }
          .sb-mobile { display: block; }
          .sb-overlay { display: block; }
        }

        /* ── Logo area ── */
        .sb-logo {
          display: flex; align-items: center; gap: 10px;
          padding: 6px 8px 18px;
        }
        .sb-logo-icon {
          width: 32px; height: 32px; flex-shrink: 0;
          border-radius: 11px;
          background: linear-gradient(150deg, var(--gold), var(--emerald));
          box-shadow: 0 6px 14px rgba(0,0,0,.18), 0 1px 0 rgba(255,255,255,.3) inset;
        }
        .sb-logo-text {
          display: flex; flex-direction: column; line-height: 1.1;
          overflow: hidden;
        }
        .sb-academy {
          font-family: ${FONT.heading};
          font-size: 14.5px; font-weight: 600;
          color: var(--text);
        }
        .sb-subtitle {
          font-family: ${FONT.body};
          font-size: 11px; font-weight: 500;
          color: var(--muted);
        }

        /* ── Nav links ── */
        .sb-nav {
          display: flex; flex-direction: column; gap: 6px;
          padding: 6px 0;
          flex: 1;
        }
        .sb-link {
          display: flex; align-items: center; gap: 12px;
          width: 100%;
          padding: 11px 12px;
          border: none; outline: none;
          border-radius: ${RADIUS.md};
          background: transparent;
          color: var(--muted);
          font-family: ${FONT.body};
          font-size: 13.5px; font-weight: 500;
          cursor: pointer;
          transition: all 0.18s;
          position: relative;
        }
        .sb-link:hover {
          background: rgba(127,127,127,0.08);
          color: var(--text);
        }
        .sb-link.active {
          background: var(--goldSoft);
          color: var(--text);
          font-weight: 600;
          box-shadow: inset 0 0 0 1px var(--glassBorder);
        }
        .sb-link.active:hover {
          background: var(--goldSoft);
        }
        .sb-icon {
          width: 20px; height: 20px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .sb-icon svg { width: 18px; height: 18px; }
        .sb-label {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

      `}</style>
    </>
  );
}
