import React, { useMemo, useCallback } from 'react';
import { useTheme } from '../../styles/ThemeContext';
import { RADIUS, FONT } from '../../styles/design-tokens';

/**
 * ActivityLog — Sidebar showing recent activity entries.
 *
 * Props:
 *   logs: Array<{ id, type, description, timestamp, userName }>
 *   onLoadMore()
 *
 * All data is prop-driven. Zero hardcoded entities.
 *
 * Log type → color mapping:
 *   payment  → emerald
 *   checkin  → gold
 *   student  → violet
 *   alert    → red
 *   (fallback → muted)
 */

/* ── Relative timestamp helper ──────────────────────────────────────── */

function relativeTime(ts) {
  if (!ts) return '';
  const now = Date.now();
  const then = new Date(ts).getTime();
  const diffSec = Math.max(0, Math.floor((now - then) / 1000));

  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 5) return `${diffWeek} week${diffWeek > 1 ? 's' : ''} ago`;
  const diffMonth = Math.floor(diffDay / 30);
  return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
}

/* ── Icon SVGs by type ──────────────────────────────────────────────── */

const TYPE_ICONS = {
  payment: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  checkin: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  student: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  alert: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

export default function ActivityLog({ logs = [], onLoadMore }) {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const t = {
    glass: dark ? 'rgba(255,255,255,0.055)' : 'rgba(255,255,255,0.55)',
    glassBorder: dark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.75)',
    text: dark ? '#eceef0' : '#23241f',
    muted: dark ? '#9497a1' : '#75726a',
    divider: dark ? 'rgba(255,255,255,0.08)' : 'rgba(35,36,31,0.09)',
    gold: dark ? '#e0b93f' : '#b3872a',
    goldSoft: dark ? 'rgba(224,185,63,0.15)' : 'rgba(179,135,42,0.14)',
    emerald: dark ? '#1fae7c' : '#0f6b4d',
    emeraldSoft: dark ? 'rgba(31,174,124,0.15)' : 'rgba(15,107,77,0.14)',
    violet: dark ? '#a07cc5' : '#7c3aed',
    violetSoft: dark ? 'rgba(160,124,197,0.15)' : 'rgba(124,58,237,0.14)',
    red: dark ? '#e07a6f' : '#dc2626',
    redSoft: dark ? 'rgba(224,122,111,0.15)' : 'rgba(220,38,38,0.14)',
    inputBg: dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
  };

  function typeStyle(type) {
    const map = {
      payment: { color: t.emerald, bg: t.emeraldSoft },
      checkin: { color: t.gold, bg: t.goldSoft },
      student: { color: t.violet, bg: t.violetSoft },
      alert: { color: t.red, bg: t.redSoft },
    };
    return map[type] || { color: t.muted, bg: t.inputBg };
  }

  return (
    <>
      <style>{css(t, dark)}</style>
      <div className="al-panel">
        <div className="al-header">
          <h3 className="al-title">Activity</h3>
          <span className="al-count">{logs.length}</span>
        </div>

        <div className="al-list">
          {logs.length === 0 && (
            <div className="al-empty">No recent activity.</div>
          )}
          {logs.map((log) => {
            const style = typeStyle(log.type);
            return (
              <div key={log.id} className="al-entry">
                <div
                  className="al-icon"
                  style={{ background: style.bg, color: style.color }}
                >
                  {TYPE_ICONS[log.type] || TYPE_ICONS.alert}
                </div>
                <div className="al-entry-body">
                  <p className="al-desc">
                    {log.userName && (
                      <span className="al-user">{log.userName} </span>
                    )}
                    {log.description}
                  </p>
                  <span className="al-time">{relativeTime(log.timestamp)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {logs.length > 0 && (
          <button className="al-load-more" onClick={onLoadMore}>
            Load more
          </button>
        )}
      </div>
    </>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────── */

function css(t, dark) {
  return `
    .al-panel {
      position: relative;
      border-radius: ${RADIUS.lg};
      background: ${t.glass};
      backdrop-filter: blur(22px) saturate(180%);
      -webkit-backdrop-filter: blur(22px) saturate(180%);
      border: 1px solid ${t.glassBorder};
      box-shadow: ${dark
        ? '0 1px 0 rgba(255,255,255,0.08) inset, 0 20px 50px rgba(0,0,0,0.55)'
        : '0 1px 0 rgba(255,255,255,0.9) inset, 0 18px 40px rgba(120,105,80,0.16)'};
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-height: 0;
      flex: 1;
    }
    .al-panel::before { content: ''; position: absolute; inset: 0; border-radius: inherit; background: ${dark ? 'linear-gradient(115deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.02) 30%, rgba(255,255,255,0) 55%)' : 'linear-gradient(115deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.12) 30%, rgba(255,255,255,0) 55%)'}; pointer-events: none; }
    .al-panel > * { position: relative; z-index: 1; }

    /* Header */
    .al-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 20px 14px;
      border-bottom: 1px solid ${t.divider};
    }

    .al-title {
      font-family: ${FONT.heading};
      font-size: 15px;
      font-weight: 700;
      color: ${t.text};
      margin: 0;
    }

    .al-count {
      font-family: ${FONT.heading};
      font-size: 11px;
      font-weight: 600;
      color: ${t.muted};
      background: ${t.inputBg};
      padding: 2px 8px;
      border-radius: 10px;
    }

    /* Scrollable list */
    .al-list {
      flex: 1;
      overflow-y: auto;
      padding: 8px 12px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      scrollbar-width: thin;
      scrollbar-color: ${t.divider} transparent;
    }

    .al-list::-webkit-scrollbar { width: 4px; }
    .al-list::-webkit-scrollbar-track { background: transparent; }
    .al-list::-webkit-scrollbar-thumb { background: ${t.divider}; border-radius: 3px; }

    .al-empty {
      text-align: center;
      padding: 40px 16px;
      color: ${t.muted};
      font-family: ${FONT.body};
      font-size: 13px;
    }

    /* Entry */
    .al-entry {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 8px;
      border-radius: ${RADIUS.sm};
      transition: background 0.15s;
    }
    .al-entry:hover {
      background: ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'};
    }

    .al-icon {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .al-entry-body {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .al-desc {
      font-family: ${FONT.body};
      font-size: 12.5px;
      color: ${t.text};
      margin: 0;
      line-height: 1.4;
      word-wrap: break-word;
    }

    .al-user {
      font-weight: 600;
    }

    .al-time {
      font-family: ${FONT.body};
      font-size: 11px;
      color: ${t.muted};
    }

    /* Load more */
    .al-load-more {
      margin: 8px 12px 14px;
      padding: 10px;
      border-radius: ${RADIUS.sm};
      border: 1px solid ${t.divider};
      background: ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'};
      color: ${t.muted};
      font-family: ${FONT.body};
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    .al-load-more:hover {
      background: ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
      color: ${t.text};
    }

    /* Responsive */
    @media (max-width: 900px) {
      .al-panel { border-radius: ${RADIUS.md}; }
      .al-header { padding: 14px 16px 12px; }
      .al-list { padding: 6px 8px; }
    }
  `;
}
