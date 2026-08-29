import React from 'react';
import { RADIUS, FONT } from '../../styles/design-tokens';
import { useTheme } from '../../styles/ThemeContext';
import ThemeToggle from '../../styles/ThemeToggle';

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
    <header className="th glass" data-theme={theme}>
      {/* Search */}
      <div className="th-search">
        <div className="search-box">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search…"
            value={query}
            onChange={(e) => onQueryChange?.(e.target.value)}
          />
        </div>
      </div>

      {/* Entity filter — button style */}
      {showEntity && (
        <div className="entity-filter" style={{ position: 'relative' }}>
          <button className="entity-btn" onClick={() => {}}>
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8.5" cy="8.5" r="5.5"/><path d="M12.5 12.5L17 17"/></svg>
            <span>{ENTITY_OPTIONS.find(o => o.value === entityFilter)?.label || 'All'}</span>
            <ChevronIcon />
          </button>
        </div>
      )}

      {/* Status chips */}
      {showStatus && (
        <div className="status-filters">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`status-chip ${statusFilter === opt.value ? 'active' : ''}`}
              onClick={() => onStatusFilterChange?.(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Spacer */}
      <div className="top-spacer" />

      {/* Bell */}
      <button
        className="icon-btn bell-btn"
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

      {/* Theme toggle */}
      <ThemeToggle />

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
          --goldSoft: ${isDark ? 'rgba(224,185,63,0.15)' : 'rgba(179,135,42,0.14)'};
          --red: ${isDark ? '#e07a6f' : '#b3423a'};
          --redSoft: ${isDark ? 'rgba(224,122,111,0.15)' : 'rgba(179,66,58,0.13)'};
          --gold: ${isDark ? '#e0b93f' : '#b3872a'};

          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          position: relative;
          z-index: 40;
        }

        /* ── Search (mockup: search-box) ── */
        .th-search {
          position: relative;
          flex: 1;
          min-width: 220px;
          max-width: 420px;
        }
        .search-box {
          display: flex; align-items: center; gap: 9px;
          padding: 9px 14px;
          border-radius: var(--r-md, ${RADIUS.md});
          background: var(--inputBg);
          border: 1px solid var(--glassBorder);
        }
        .search-box svg { width: 15px; height: 15px; color: var(--muted); flex-shrink: 0; }
        .search-box input {
          flex: 1; background: transparent; border: none; outline: none;
          color: var(--text); font-size: 13px; font-family: 'Inter', sans-serif; min-width: 0;
        }
        .search-box input::placeholder { color: var(--muted); }

        /* ── Entity filter (button style) ── */
        .entity-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 9px 13px;
          border-radius: var(--r-md, ${RADIUS.md});
          background: var(--inputBg);
          border: 1px solid var(--glassBorder);
          cursor: pointer;
          font-size: 12.5px; font-weight: 500;
          color: var(--text); white-space: nowrap;
          font-family: 'Inter', sans-serif;
        }
        .entity-btn svg { width: 13px; height: 13px; color: var(--muted); }

        /* ── Status chips ── */
        .status-filters {
          display: flex; align-items: center; gap: 6px; flex-shrink: 0;
        }
        .status-chip {
          padding: 8px 13px;
          border-radius: 100px;
          font-size: 12px; font-weight: 500;
          cursor: pointer;
          color: var(--muted);
          background: var(--glass);
          border: 1px solid var(--glassBorder);
          transition: all 0.15s;
          white-space: nowrap;
          font-family: 'Inter', sans-serif;
        }
        .status-chip:hover { color: var(--text); }
        .status-chip.active {
          color: #fff;
          background: linear-gradient(150deg, var(--gold), var(--emerald));
          border-color: transparent;
        }

        /* ── Spacer ── */
        .top-spacer { flex: 1; }

        /* ── Bell button (icon-btn) ── */
        .bell-btn { position: relative; }
        .bell-btn svg { width: 17px; height: 17px; }

        /* ── Badge ── */
        .th-badge {
          position: absolute;
          top: -2px; right: -2px;
          min-width: 16px; height: 16px;
          display: flex; align-items: center; justify-content: center;
          padding: 0 4px;
          border-radius: 100px;
          background: var(--red);
          color: #fff;
          font-family: ${FONT.heading};
          font-size: 9px; font-weight: 700;
          line-height: 1;
        }

        /* ── User pill ── */
        .th-user {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 14px 4px 4px;
          border-radius: 100px;
          border: 1px solid var(--glassBorder);
          background: var(--glass);
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
            padding: 12px 16px 12px 56px;
            flex-wrap: wrap;
            gap: 8px;
          }
          .th-search {
            max-width: none;
            order: 10;
            flex-basis: 100%;
          }
          .status-filters {
            order: 11;
            flex-wrap: wrap;
          }
          .th-user-info { display: none; }
          .th-user { padding: 4px; }
        }
        @media (max-width: 520px) {
        }
      `}</style>
    </header>
  );
}
