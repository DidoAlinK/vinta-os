import React from 'react';
import { RADIUS, FONT } from '../../styles/design-tokens';
import { useTheme } from '../../styles/ThemeContext';
import ThemeToggle from '../shared/ThemeToggle';

/* ── SVG icon helpers ─────────────────────────────────────────────────── */

const SearchIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8.5" cy="8.5" r="5.5" />
    <path d="M12.5 12.5L17 17" />
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 17a2 2 0 0 0 4 0" />
    <path d="M10 2a6 6 0 0 1 6 6c0 3.5 1 5.5 2 6H2c1-.5 2-2.5 2-6a6 6 0 0 1 6-6z" />
  </svg>
);

const ChevronIcon = () => (
  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
    <path d="M3 4.5l3 3 3-3" />
  </svg>
);

/* ── Filter option sets ───────────────────────────────────────────────── */

const ENTITY_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'student', label: 'Students' },
  { value: 'teacher', label: 'Teachers' },
  { value: 'payment', label: 'Payments' },
  { value: 'class', label: 'Classes' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
];

/* ── Tabs that show entity filter ─────────────────────────────────────── */

const ENTITY_TABS = new Set(['students', 'teachers', 'classes', 'billing']);

/* ── Tabs that show status filter ─────────────────────────────────────── */

const STATUS_TABS = new Set(['students', 'teachers', 'classes']);

/* ── Avatar gradient from props ───────────────────────────────────────── */

function buildAvatarStyle(avatarColors) {
  if (!avatarColors || avatarColors.length < 2) {
    return { background: 'linear-gradient(135deg, var(--gold), var(--emerald))' };
  }
  return { background: `linear-gradient(135deg, ${avatarColors[0]}, ${avatarColors[1]})` };
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* ── TopHeader component ──────────────────────────────────────────────── */

export default function TopHeader({
  activeTab,
  query = '',
  onQueryChange,
  entityFilter = 'all',
  onEntityFilterChange,
  statusFilter = 'all',
  onStatusFilterChange,
  user = { name: '', role: '', avatarColors: null },
  onNotificationsClick,
  unreadCount = 0,
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const showEntity = ENTITY_TABS.has(activeTab);
  const showStatus = STATUS_TABS.has(activeTab);

  return (
    <header className="th" data-theme={theme}>
      {/* Search */}
      <div className="th-search">
        <span className="th-search-icon">
          <SearchIcon />
        </span>
        <input
          className="th-search-input"
          type="text"
          placeholder="Search…"
          value={query}
          onChange={(e) => onQueryChange?.(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="th-filters">
        {showEntity && (
          <div className="th-select-wrap">
            <select
              className="th-select"
              value={entityFilter}
              onChange={(e) => onEntityFilterChange?.(e.target.value)}
            >
              {ENTITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="th-select-chevron"><ChevronIcon /></span>
          </div>
        )}

        {showStatus && (
          <div className="th-select-wrap">
            <select
              className="th-select"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange?.(e.target.value)}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="th-select-chevron"><ChevronIcon /></span>
          </div>
        )}
      </div>

      {/* Right section */}
      <div className="th-right">
        <ThemeToggle />

        <button
          className="th-bell"
          onClick={onNotificationsClick}
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        >
          <BellIcon />
          {unreadCount > 0 && (
            <span className="th-badge">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* User avatar pill */}
        <div className="th-user">
          <div className="th-avatar" style={buildAvatarStyle(user.avatarColors)}>
            {getInitials(user.name)}
          </div>
          <div className="th-user-info">
            <span className="th-user-name">{user.name}</span>
            <span className="th-user-role">{user.role}</span>
          </div>
        </div>
      </div>

      <style>{`
        /* ── Variables ── */
        .th {
          --gold: ${isDark ? '#e0b93f' : '#b3872a'};
          --emerald: ${isDark ? '#1fae7c' : '#0f6b4d'};
          --violet: ${isDark ? '#a07cc5' : '#7c3aed'};
          --text: ${isDark ? '#ececec' : '#1f1f22'};
          --muted: ${isDark ? '#9497a1' : '#75726a'};
          --divider: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(35,36,31,0.09)'};
          --inputBg: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)'};
          --glass: ${isDark ? 'rgba(255,255,255,0.055)' : 'rgba(255,255,255,0.55)'};
          --glassBorder: ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.75)'};
          --glassShadow: ${isDark
            ? '0 1px 0 rgba(255,255,255,0.08) inset, 0 20px 50px rgba(0,0,0,0.55)'
            : '0 1px 0 rgba(255,255,255,0.9) inset, 0 18px 40px rgba(120,105,80,0.16)'};
          --sheen: ${isDark
            ? 'linear-gradient(115deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.02) 30%, rgba(255,255,255,0) 55%)'
            : 'linear-gradient(115deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.12) 30%, rgba(255,255,255,0) 55%)'};
          --red: ${isDark ? '#e07a6f' : '#dc2626'};
          --redSoft: ${isDark ? 'rgba(224,122,111,0.15)' : 'rgba(220,38,38,0.12)'};

          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 24px;
          position: relative;
          z-index: 100;
        }

        /* ── Search ── */
        .th-search {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
          max-width: 420px;
          min-width: 0;
        }
        .th-search-icon {
          position: absolute;
          left: 12px;
          width: 16px; height: 16px;
          color: var(--muted);
          display: flex; align-items: center; justify-content: center;
          pointer-events: none;
        }
        .th-search-icon svg { width: 16px; height: 16px; }
        .th-search-input {
          width: 100%;
          height: 38px;
          padding: 0 14px 0 36px;
          border: 1px solid var(--glassBorder);
          border-radius: ${RADIUS.sm};
          background: var(--inputBg);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          color: var(--text);
          font-family: ${FONT.body};
          font-size: 13px; font-weight: 500;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .th-search-input::placeholder {
          color: var(--muted);
          font-weight: 400;
        }
        .th-search-input:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px ${isDark ? 'rgba(224,185,63,0.15)' : 'rgba(179,135,42,0.14)'};
          background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.85)'};
        }

        /* ── Filters ── */
        .th-filters {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .th-select-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .th-select {
          appearance: none;
          -webkit-appearance: none;
          height: 34px;
          padding: 0 30px 0 12px;
          border: 1px solid var(--glassBorder);
          border-radius: ${RADIUS.sm};
          background: var(--inputBg);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          color: var(--text);
          font-family: ${FONT.body};
          font-size: 12px; font-weight: 500;
          cursor: pointer;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          min-width: 100px;
        }
        .th-select:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px ${isDark ? 'rgba(224,185,63,0.12)' : 'rgba(179,135,42,0.10)'};
        }
        .th-select-chevron {
          position: absolute;
          right: 8px;
          color: var(--muted);
          pointer-events: none;
          display: flex; align-items: center;
        }

        /* ── Right section ── */
        .th-right {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-left: auto;
          flex-shrink: 0;
        }

        /* ── Notification bell ── */
        .th-bell {
          position: relative;
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px;
          border: none; outline: none;
          border-radius: ${RADIUS.sm};
          background: transparent;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.2s;
        }
        .th-bell svg { width: 18px; height: 18px; }
        .th-bell:hover {
          background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(35,36,31,0.05)'};
          color: var(--text);
        }
        .th-badge {
          position: absolute;
          top: 4px; right: 4px;
          min-width: 16px; height: 16px;
          display: flex; align-items: center; justify-content: center;
          padding: 0 4px;
          border-radius: 100px;
          background: var(--red);
          color: #fff;
          font-family: ${FONT.heading};
          font-size: 9px; font-weight: 700;
          line-height: 1;
          box-shadow: 0 2px 6px rgba(220,38,38,0.35);
        }

        /* ── User pill ── */
        .th-user {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 14px 4px 4px;
          border-radius: 100px;
          border: 1px solid var(--glassBorder);
          background: ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.5)'};
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          cursor: default;
        }
        .th-avatar {
          width: 30px; height: 30px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #fff;
          font-family: ${FONT.heading};
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.02em;
          flex-shrink: 0;
        }
        .th-user-info {
          display: flex; flex-direction: column;
          line-height: 1.15;
        }
        .th-user-name {
          font-family: ${FONT.body};
          font-size: 12.5px; font-weight: 600;
          color: var(--text);
          white-space: nowrap;
        }
        .th-user-role {
          font-family: ${FONT.body};
          font-size: 10px; font-weight: 500;
          color: var(--muted);
          text-transform: capitalize;
        }

        /* ── Mobile adjustments ── */
        @media (max-width: 899px) {
          .th {
            padding: 12px 16px 12px 56px; /* room for hamburger */
            flex-wrap: wrap;
            gap: 8px;
          }
          .th-search {
            max-width: none;
            order: 10;
            flex-basis: 100%;
          }
          .th-filters {
            order: 11;
            flex-wrap: wrap;
          }
          .th-select { min-width: 80px; }
          .th-user-info { display: none; }
          .th-user { padding: 4px; }
        }
        @media (max-width: 520px) {
          .th-right { gap: 6px; }
        }
      `}</style>
    </header>
  );
}
