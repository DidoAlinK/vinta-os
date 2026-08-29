import React, { useMemo, useCallback, useState } from 'react';
import { useTheme } from '../../styles/ThemeContext';
import { DAYS, CAL_START_HOUR, CAL_END_HOUR, HOUR_PX, RADIUS, FONT } from '../../styles/design-tokens';

/**
 * AgendaBoard — Read-only weekly block grid for the Dashboard.
 *
 * Props:
 *   sessions: Array of session objects
 *   onSessionClick(sessionId)
 *   currentWeekStart: Date
 *
 * Features:
 *   - Day/Week toggle (Day shows only today, Week shows full week)
 *   - Read-only: no drag, no resize — just click to view session detail
 *   - Now-line (red horizontal line at current time)
 *   - Subject color coding
 */

function toDateKey(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
}
function parseTime(t) {
  if (!t) return 0;
  if (typeof t === 'number') return t;
  const [h, m] = String(t).split(':').map(Number);
  return h + (m || 0) / 60;
}
function formatHourLabel(h) {
  const suffix = h >= 12 ? 'PM' : 'AM';
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display} ${suffix}`;
}
function formatTimeShort(t) {
  const h = Math.floor(t);
  const m = Math.round((t - h) * 60);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return m ? `${display}:${String(m).padStart(2,'0')}${suffix}` : `${display}${suffix}`;
}

const HOUR_COUNT = CAL_END_HOUR - CAL_START_HOUR;
const GRID_HEIGHT = HOUR_COUNT * HOUR_PX;

const STATUS_COLORS = {
  scheduled: 'gold', in_progress: 'emerald', completed: 'grey', cancelled: 'red',
};

export default function AgendaBoard({ sessions = [], onSessionClick, currentWeekStart }) {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const [viewMode, setViewMode] = useState('week'); // 'day' | 'week'

  const todayDate = new Date();
  const todayKey = toDateKey(todayDate);

  /* In day mode, only show today. In week mode, show the full week. */
  const displayDays = useMemo(() => {
    if (viewMode === 'day') return [todayDate];
    const start = new Date(currentWeekStart);
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(d.getDate() + i); return d; });
  }, [viewMode, currentWeekStart]);

  /* Group sessions by day key */
  const dayMap = useMemo(() => {
    const map = {};
    sessions.forEach(s => {
      const key = toDateKey(s.date);
      if (!map[key]) map[key] = [];
      map[key].push(s);
    });
    return map;
  }, [sessions]);

  const handleSessionClick = useCallback((e, id) => { e.stopPropagation(); onSessionClick?.(id); }, [onSessionClick]);

  const t = {
    glass: dark ? 'rgba(255,255,255,0.055)' : 'rgba(255,255,255,0.55)',
    glassStrong: dark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.82)',
    glassBorder: dark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.75)',
    text: dark ? '#eceef0' : '#23241f',
    muted: dark ? '#9497a1' : '#75726a',
    divider: dark ? 'rgba(255,255,255,0.08)' : 'rgba(35,36,31,0.09)',
    gold: dark ? '#e0b93f' : '#b3872a',
    goldSoft: dark ? 'rgba(224,185,63,0.18)' : 'rgba(179,135,42,0.14)',
    emerald: dark ? '#1fae7c' : '#0f6b4d',
    emeraldSoft: dark ? 'rgba(31,174,124,0.18)' : 'rgba(15,107,77,0.14)',
    violet: dark ? '#a07cc5' : '#7c3aed',
    violetSoft: dark ? 'rgba(160,124,197,0.18)' : 'rgba(124,58,237,0.14)',
    red: dark ? '#e07a6f' : '#dc2626',
    redSoft: dark ? 'rgba(224,122,111,0.18)' : 'rgba(220,38,38,0.14)',
    grey: dark ? '#6b6e7a' : '#9ca3af',
    greySoft: dark ? 'rgba(107,110,122,0.18)' : 'rgba(156,163,175,0.14)',
    todayBg: dark ? 'rgba(31,174,124,0.06)' : 'rgba(15,107,77,0.04)',
  };

  /* Dynamic subject color palette */
  const SUBJECT_PALETTE = ['gold', 'emerald', 'violet', 'red'];
  const colorMap = { gold: { bg: t.goldSoft, accent: t.gold, text: t.gold }, emerald: { bg: t.emeraldSoft, accent: t.emerald, text: t.emerald }, violet: { bg: t.violetSoft, accent: t.violet, text: t.violet }, red: { bg: t.redSoft, accent: t.red, text: t.red } };
  const subjectColorMap = useMemo(() => {
    const map = {};
    let idx = 0;
    sessions.forEach(s => {
      if (s.subject && !map[s.subject]) {
        map[s.subject] = colorMap[SUBJECT_PALETTE[idx % SUBJECT_PALETTE.length]] || colorMap.gold;
        idx++;
      }
    });
    return map;
  }, [sessions]);

  function subjectColor(subject) {
    return subjectColorMap[subject] || colorMap.gold;
  }

  const legendSubjects = useMemo(() => Object.keys(subjectColorMap), [subjectColorMap]);

  function statusAppearance(status) {
    const c = STATUS_COLORS[status] || 'gold';
    if (c === 'grey') return { bg: t.greySoft, accent: t.grey, line: t.grey, strike: status === 'cancelled' };
    if (c === 'red') return { bg: t.redSoft, accent: t.red, line: t.red, strike: status === 'cancelled' };
    if (c === 'emerald') return { bg: t.emeraldSoft, accent: t.emerald, line: t.emerald, strike: false };
    return { bg: t.goldSoft, accent: t.gold, line: t.gold, strike: false };
  }

  /* Now-line: only shown in day mode or on today's column in week mode */
  const nowMinutes = todayDate.getHours() * 60 + todayDate.getMinutes();
  const nowTop = ((nowMinutes - CAL_START_HOUR * 60) / 60) * HOUR_PX;
  const showNowLine = nowMinutes >= CAL_START_HOUR * 60 && nowMinutes <= CAL_END_HOUR * 60;

  return (
    <>
      <style>{css(t, dark)}</style>
      <div className="ab-board">
        {/* Header */}
        <div className="ab-header">
          <div className="ab-header-left">
            <div>
              <div className="ab-title">Schedule & class agenda</div>
              <div className="ab-subtitle">Read-only view · click a block for details</div>
            </div>
            {/* Subject legend */}
            <div className="ab-legend">
              {legendSubjects.map((subj) => (
                <span key={subj} className="ab-legend-item">
                  <span className="ab-legend-dot" style={{ background: subjectColorMap[subj]?.accent }} />
                  {subj}
                </span>
              ))}
            </div>
          </div>
          {/* Day/Week toggle */}
          <div className="ab-view-toggle">
            <button className={`ab-toggle-btn ${viewMode === 'day' ? 'active' : ''}`} onClick={() => setViewMode('day')}>Day</button>
            <button className={`ab-toggle-btn ${viewMode === 'week' ? 'active' : ''}`} onClick={() => setViewMode('week')}>Week</button>
          </div>
        </div>

        {/* Day headers */}
        <div className="ab-day-headers">
          <div className="ab-gutter" />
          {displayDays.map((d, i) => {
            const key = toDateKey(d);
            const isToday = key === todayKey;
            return (
              <div key={i} className={`ab-col-head ${isToday ? 'ab-col-head--today' : ''}`}>
                <span className="ab-day-name">{viewMode === 'day' ? d.toLocaleDateString('en-US', { weekday: 'long' }) : DAYS[d.getDay()]}</span>
                <span className={`ab-day-num ${isToday ? 'ab-day-num--today' : ''}`}>{d.getDate()}</span>
              </div>
            );
          })}
        </div>

        {/* Grid body */}
        <div className="ab-body">
          <div className="ab-hours-col">
            {Array.from({ length: HOUR_COUNT }, (_, i) => (
              <div key={i} className="ab-hour-slot" style={{ height: HOUR_PX }}>
                <span className="ab-hour-label">{formatHourLabel(CAL_START_HOUR + i)}</span>
              </div>
            ))}
          </div>

          {displayDays.map((d, dayIdx) => {
            const key = toDateKey(d);
            const daySessions = dayMap[key] || [];
            const isToday = key === todayKey;
            return (
              <div key={dayIdx} className={`ab-day-col ${isToday ? 'ab-day-col--today' : ''}`}>
                {Array.from({ length: HOUR_COUNT }, (_, i) => (
                  <div key={i} className="ab-hour-row" style={{ height: HOUR_PX }} />
                ))}
                {/* Now-line on today */}
                {isToday && showNowLine && (
                  <div className="ab-now-line" style={{ top: nowTop }}>
                    <span className="ab-now-dot" />
                  </div>
                )}
                {/* Session blocks — READ ONLY */}
                {daySessions.map(session => {
                  const startH = parseTime(session.startTime);
                  const endH = parseTime(session.endTime);
                  const top = (startH - CAL_START_HOUR) * HOUR_PX;
                  const height = Math.max((endH - startH) * HOUR_PX, 28);
                  const sc = subjectColor(session.subject);
                  const sa = statusAppearance(session.status);
                  return (
                    <div key={session.id}
                      className={`ab-block ab-block--readonly ${sa.strike ? 'ab-block--cancelled' : ''}`}
                      style={{ top, height, borderLeft: `3px solid ${sc.accent}`, background: sc.bg }}
                      onClick={(e) => handleSessionClick(e, session.id)}
                      title={`${session.subject} — ${session.teacher?.name || ''}`}
                    >
                      <div className="ab-block-top">
                        <span className="ab-block-subject" style={{ color: sc.text }}>{session.subject}</span>
                        <span className="ab-block-status" style={{ background: sa.accent, color: '#fff' }}>
                          {session.status === 'in_progress' ? '● LIVE' : session.status === 'completed' ? '✓ Done' : session.status === 'cancelled' ? '✕' : ''}
                        </span>
                      </div>
                      {height > 42 && <div className="ab-block-teacher">{session.teacher?.name || '—'}</div>}
                      {height > 62 && (
                        <div className="ab-block-meta">
                          <span>{formatTimeShort(startH)}–{formatTimeShort(endH)}</span>
                          <span className="ab-block-enrolled">{session.enrolledCount ?? 0}/{session.totalCount ?? 0}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function css(t, dark) {
  return `
    .ab-board { position: relative; border-radius: ${RADIUS.lg}; background: ${t.glass}; backdrop-filter: blur(22px) saturate(180%); -webkit-backdrop-filter: blur(22px) saturate(180%); border: 1px solid ${t.glassBorder}; box-shadow: ${dark ? '0 1px 0 rgba(255,255,255,0.08) inset, 0 20px 50px rgba(0,0,0,0.55)' : '0 1px 0 rgba(255,255,255,0.9) inset, 0 18px 40px rgba(120,105,80,0.16)'}; overflow: hidden; display: flex; flex-direction: column; flex: 1; min-height: 0; }
    .ab-board::before { content: ''; position: absolute; inset: 0; border-radius: inherit; background: ${dark ? 'linear-gradient(115deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.02) 30%, rgba(255,255,255,0) 55%)' : 'linear-gradient(115deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.12) 30%, rgba(255,255,255,0) 55%)'}; pointer-events: none; }
    .ab-board > * { position: relative; z-index: 1; }

    /* Header with title + legend + toggle */
    .ab-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px 12px; border-bottom: 1px solid ${t.divider}; gap: 16px; flex-wrap: wrap; flex-shrink: 0; }
    .ab-header-left { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
    .ab-title { font-family: ${FONT.heading}; font-size: 16px; font-weight: 600; color: ${t.text}; }
    .ab-subtitle { font-family: ${FONT.body}; font-size: 12px; color: ${t.muted}; margin-top: 2px; }
    .ab-legend { display: flex; gap: 12px; flex-wrap: wrap; }
    .ab-legend-item { display: flex; align-items: center; gap: 5px; font-family: ${FONT.body}; font-size: 11px; color: ${t.muted}; font-weight: 500; }
    .ab-legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

    /* Day/Week toggle */
    .ab-view-toggle { display: flex; gap: 3px; padding: 3px; border-radius: 100px; background: ${t.glassStrong}; border: 1px solid ${t.glassBorder}; flex-shrink: 0; }
    .ab-toggle-btn { padding: 6px 16px; border-radius: 100px; font-family: ${FONT.body}; font-size: 12px; font-weight: 600; cursor: pointer; color: ${t.muted}; transition: 0.15s; background: transparent; border: none; }
    .ab-toggle-btn:hover { color: ${t.text}; }
    .ab-toggle-btn.active { color: #fff; background: linear-gradient(150deg, ${t.gold}, ${dark ? '#1fae7c' : '#0f6b4d'}); }

    /* Day headers */
    .ab-day-headers { display: flex; border-bottom: 1px solid ${t.divider}; position: sticky; top: 0; z-index: 10; background: ${t.glassStrong}; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
    .ab-gutter { width: 62px; flex-shrink: 0; }
    .ab-col-head { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 10px 4px 8px; border-left: 1px solid ${t.divider}; }
    .ab-col-head--today { background: ${t.todayBg}; }
    .ab-day-name { font-family: ${FONT.body}; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: ${t.muted}; }
    .ab-day-num { font-family: ${FONT.heading}; font-size: 20px; font-weight: 700; color: ${t.text}; margin-top: 2px; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
    .ab-day-num--today { background: ${dark ? '#1fae7c' : '#0f6b4d'}; color: #fff; }

    /* Body */
    .ab-body { display: flex; flex: 1; overflow-y: auto; overflow-x: hidden; scrollbar-width: thin; scrollbar-color: ${t.divider} transparent; }
    .ab-body::-webkit-scrollbar { width: 5px; }
    .ab-body::-webkit-scrollbar-track { background: transparent; }
    .ab-body::-webkit-scrollbar-thumb { background: ${t.divider}; border-radius: 3px; }

    .ab-hours-col { width: 62px; flex-shrink: 0; }
    .ab-hour-slot { position: relative; border-bottom: 1px solid ${t.divider}; }
    .ab-hour-label { position: absolute; top: -8px; left: 8px; right: 4px; font-family: ${FONT.heading}; font-size: 10.5px; font-weight: 600; color: ${t.muted}; white-space: nowrap; }

    .ab-day-col { flex: 1; position: relative; border-left: 1px solid ${t.divider}; min-height: ${GRID_HEIGHT}px; }
    .ab-day-col--today { background: ${t.todayBg}; }
    .ab-hour-row { border-bottom: 1px solid ${t.divider}; }

    /* Now-line */
    .ab-now-line { position: absolute; left: 0; right: 0; height: 0; border-top: 2px solid ${t.red}; z-index: 15; pointer-events: none; }
    .ab-now-dot { position: absolute; left: -4px; top: -4px; width: 8px; height: 8px; border-radius: 50%; background: ${t.red}; }

    /* Session blocks — READ ONLY */
    .ab-block { position: absolute; left: 3px; right: 3px; border-radius: ${RADIUS.sm}; padding: 5px 8px; cursor: pointer; overflow: hidden; z-index: 2; transition: box-shadow 0.18s ease, transform 0.18s ease; display: flex; flex-direction: column; gap: 1px; }
    .ab-block--readonly { cursor: pointer; }
    .ab-block--readonly:hover { box-shadow: 0 4px 18px rgba(0,0,0,${dark ? '0.5' : '0.15'}); transform: scale(1.015); z-index: 5; }
    .ab-block--cancelled { opacity: 0.55; }
    .ab-block--cancelled .ab-block-subject { text-decoration: line-through; }
    .ab-block-top { display: flex; align-items: center; justify-content: space-between; gap: 4px; }
    .ab-block-subject { font-family: ${FONT.heading}; font-size: 11.5px; font-weight: 700; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ab-block-status { font-family: ${FONT.body}; font-size: 8.5px; font-weight: 700; padding: 1px 5px; border-radius: 6px; white-space: nowrap; text-transform: uppercase; letter-spacing: 0.3px; }
    .ab-block-teacher { font-family: ${FONT.body}; font-size: 10px; color: ${t.muted}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ab-block-meta { display: flex; align-items: center; justify-content: space-between; font-family: ${FONT.body}; font-size: 9.5px; color: ${t.muted}; }
    .ab-block-enrolled { font-family: ${FONT.heading}; font-weight: 600; font-size: 10px; }

    @media (max-width: 900px) {
      .ab-gutter { width: 44px; }
      .ab-hours-col { width: 44px; }
      .ab-hour-label { font-size: 9px; left: 4px; }
      .ab-day-name { font-size: 10px; }
      .ab-day-num { font-size: 16px; }
      .ab-block { padding: 3px 5px; }
      .ab-block-subject { font-size: 10px; }
      .ab-block-status { font-size: 7.5px; padding: 1px 3px; }
      .ab-block-teacher { font-size: 9px; }
      .ab-block-meta { font-size: 8.5px; }
    }
    @media (max-width: 600px) {
      .ab-board { border-radius: ${RADIUS.md}; }
      .ab-gutter { width: 36px; }
      .ab-hours-col { width: 36px; }
      .ab-block-status { display: none; }
      .ab-block-enrolled { display: none; }
      .ab-block-meta span:first-child { display: none; }
    }
  `;
}
