import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useTheme } from '../../styles/ThemeContext';
import { DAYS, CAL_START_HOUR, CAL_END_HOUR, HOUR_PX, RADIUS, FONT } from '../../styles/design-tokens';
import CreateSessionModal from './CreateSessionModal';
import AddSubjectModal from './AddSubjectModal';

/**
 * CalendarView — Full drag-and-drop scheduling calendar.
 *
 * Props:
 *   sessions: Array<Session>        — all sessions (with date, startTime, endTime, subject, teacher, status)
 *   onSessionClick(sessionId)       — open session detail
 *   onAddSession(data)              — persist new session
 *   onMoveSession(id, date, start)  — persist session move
 *   onResizeSession(id, start, end) — persist session resize
 *   currentWeekStart: Date
 *
 * Features:
 *   - Left sidebar: draggable subject palette with color chips + "Add subject" card
 *   - Center: day/week grid with 5-min snap, drag-to-create, edge-resize on blocks
 *   - Month view: simple overview grid
 *   - Now-line: thin red line at current time
 *   - CreateSessionModal: opens on drop or block click with prefilled subject/time
 *   - AddSubjectModal: add custom subjects to palette
 */

const SNAP_MIN = 5;
const SNAP_PX = (SNAP_MIN / 60) * HOUR_PX; // 5px per 5 min at 60px/hr
const HOUR_COUNT = CAL_END_HOUR - CAL_START_HOUR;
const GRID_HEIGHT = HOUR_COUNT * HOUR_PX;

/* ── Helpers ──────────────────────────────────────────────────────── */
function toDateKey(d) { const dt = new Date(d); return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`; }
function parseTime(t) { if (!t) return 0; if (typeof t === 'number') return t; const [h, m] = String(t).split(':').map(Number); return h + (m || 0) / 60; }
function formatHourLabel(h) { const suffix = h >= 12 ? 'PM' : 'AM'; const display = h > 12 ? h - 12 : h === 0 ? 12 : h; return `${display} ${suffix}`; }
function formatTimeShort(t) { const h = Math.floor(t); const m = Math.round((t - h) * 60); const suffix = h >= 12 ? 'PM' : 'AM'; const display = h > 12 ? h - 12 : h === 0 ? 12 : h; return m ? `${display}:${String(m).padStart(2,'0')}${suffix}` : `${display}${suffix}`; }
function snapToGrid(y) { return Math.round(y / SNAP_PX) * SNAP_PX; }
function yToTime(y) { const totalMin = (y / HOUR_PX) * 60 + CAL_START_HOUR * 60; const snapped = Math.round(totalMin / SNAP_MIN) * SNAP_MIN; const h = Math.floor(snapped / 60); const m = snapped % 60; return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`; }
function yToMinutes(y) { return Math.round(((y / HOUR_PX) * 60 + CAL_START_HOUR * 60) / SNAP_MIN) * SNAP_MIN; }

const STATUS_COLORS = { scheduled: 'gold', in_progress: 'emerald', completed: 'grey', cancelled: 'red' };

/* ── Default subjects (empty — user adds via color wheel) ──────── */
const DEFAULT_SUBJECTS = [];

export default function CalendarView({
  sessions = [],
  onSessionClick,
  onAddSession,
  onMoveSession,
  onResizeSession,
  currentWeekStart: propWeekStart,
}) {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  /* ── State ─────────────────────────────────────────────────────── */
  const [weekStart, setWeekStart] = useState(propWeekStart || (() => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); d.setHours(0,0,0,0); return d; }));
  const [viewMode, setViewMode] = useState('week'); // 'day' | 'week' | 'month'
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);
  const [dragSubject, setDragSubject] = useState(null);
  const [dragOver, setDragOver] = useState(null); // { dayIdx, y }
  const [resizeState, setResizeState] = useState(null); // { sessionId, edge, startY, origTop, origHeight, origStart, origEnd, dayIdx }
  const [moveState, setMoveState] = useState(null); // { sessionId, startY, origTop, dayIdx, origDayIdx }
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({}); // { subject, date, startTime, endTime, sessionId? }
  const [addSubjectOpen, setAddSubjectOpen] = useState(false);

  const gridRef = useRef(null);
  const resizeRef = useRef(null);
  const moveRef = useRef(null);

  const todayDate = new Date();
  const todayKey = toDateKey(todayDate);

  /* ── Week days ────────────────────────────────────────────────── */
  const displayDays = useMemo(() => {
    if (viewMode === 'day') return [todayDate];
    const start = new Date(weekStart);
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(d.getDate() + i); return d; });
  }, [viewMode, weekStart]);

  /* Group sessions by day key */
  const dayMap = useMemo(() => {
    const map = {};
    sessions.forEach(s => { const key = toDateKey(s.date); if (!map[key]) map[key] = []; map[key].push(s); });
    return map;
  }, [sessions]);

  /* Subject color lookup */
  const subjectColor = useCallback((name) => {
    const found = subjects.find(s => s.name === name || s.id === name);
    return found?.color || '#b3872a';
  }, [subjects]);

  /* ── Navigation ──────────────────────────────────────────────── */
  const navigateWeek = useCallback((dir) => {
    setWeekStart(prev => { const d = new Date(prev); d.setDate(d.getDate() + dir * 7); return d; });
  }, []);
  const goToToday = useCallback(() => {
    const d = new Date(); d.setDate(d.getDate() - d.getDay()); d.setHours(0,0,0,0); setWeekStart(d);
  }, []);

  /* ── Drag-to-create from sidebar ─────────────────────────────── */
  const handleSubjectDragStart = useCallback((e, subject) => {
    e.dataTransfer.setData('application/vinta-subject', JSON.stringify(subject));
    e.dataTransfer.effectAllowed = 'copy';
    setDragSubject(subject);
  }, []);

  const handleGridDragOver = useCallback((e, dayIdx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    const rect = gridRef.current.getBoundingClientRect();
    const y = snapToGrid(e.clientY - rect.top);
    setDragOver({ dayIdx, y });
  }, []);

  const handleGridDrop = useCallback((e, dayIdx) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/vinta-subject');
    if (!raw) { setDragOver(null); return; }
    const subject = JSON.parse(raw);
    const rect = gridRef.current.getBoundingClientRect();
    const y = snapToGrid(e.clientY - rect.top);
    const startTime = yToTime(y);
    const startMin = yToMinutes(y);
    const endMin = startMin + 60; // default 1hr
    const endH = Math.floor(endMin / 60);
    const endM = endMin % 60;
    const endTime = `${String(Math.min(endH, CAL_END_HOUR)).padStart(2,'0')}:${String(endM).padStart(2,'0')}`;
    const day = displayDays[dayIdx];
    setModalData({ subject: subject.name, color: subject.color, date: toDateKey(day), startTime, endTime });
    setModalOpen(true);
    setDragOver(null);
    setDragSubject(null);
  }, [displayDays]);

  /* ── Edge-resize on existing blocks ──────────────────────────── */
  const handleResizeStart = useCallback((e, sessionId, edge) => {
    e.stopPropagation();
    e.preventDefault();
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;
    const dayIdx = displayDays.findIndex(d => toDateKey(d) === toDateKey(session.date));
    const startY = e.clientY;
    const startH = parseTime(session.startTime);
    const endH = parseTime(session.endTime);
    const origTop = (startH - CAL_START_HOUR) * HOUR_PX;
    const origHeight = (endH - startH) * HOUR_PX;
    const state = { sessionId, edge, startY, origTop, origHeight, origStart: session.startTime, origEnd: session.endTime, dayIdx };
    setResizeState(state);
    resizeRef.current = state;

    const onMove = (ev) => {
      const delta = ev.clientY - startY;
      const snappedDelta = Math.round(delta / SNAP_PX) * SNAP_PX;
      resizeRef.current = { ...resizeRef.current, currentDelta: snappedDelta };
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      const rs = resizeRef.current;
      if (rs && rs.currentDelta) {
        const sMin = yToMinutes(rs.origTop);
        const origEndMin = yToMinutes(rs.origTop + rs.origHeight);
        let newStartMin = sMin, newEndMin = origEndMin;
        if (rs.edge === 'top') { newStartMin = Math.min(sMin + Math.round(rs.currentDelta / SNAP_PX) * SNAP_MIN, origEndMin - SNAP_MIN); }
        else { newEndMin = Math.max(origEndMin + Math.round(rs.currentDelta / SNAP_PX) * SNAP_MIN, sMin + SNAP_MIN); }
        newStartMin = Math.max(CAL_START_HOUR * 60, Math.min(newStartMin, CAL_END_HOUR * 60 - SNAP_MIN));
        newEndMin = Math.max(newStartMin + SNAP_MIN, Math.min(newEndMin, CAL_END_HOUR * 60));
        const fmt = (min) => `${String(Math.floor(min/60)).padStart(2,'0')}:${String(min%60).padStart(2,'0')}`;
        onResizeSession?.(rs.sessionId, fmt(newStartMin), fmt(newEndMin));
      }
      setResizeState(null);
      resizeRef.current = null;
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [sessions, displayDays, onResizeSession]);

  /* ── Drag-to-move existing blocks ────────────────────────────── */
  const handleBlockDragStart = useCallback((e, sessionId) => {
    e.stopPropagation();
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;
    const dayIdx = displayDays.findIndex(d => toDateKey(d) === toDateKey(session.date));
    const startH = parseTime(session.startTime);
    const origTop = (startH - CAL_START_HOUR) * HOUR_PX;
    e.dataTransfer.setData('application/vinta-session', sessionId);
    e.dataTransfer.effectAllowed = 'move';
    setMoveState({ sessionId, startY: e.clientY, origTop, dayIdx, origDayIdx: dayIdx });
  }, [sessions, displayDays]);

  const handleBlockDrop = useCallback((e, targetDayIdx) => {
    e.preventDefault();
    e.stopPropagation();
    const sessionId = e.dataTransfer.getData('application/vinta-session');
    if (!sessionId) return;
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;
    const rect = gridRef.current.getBoundingClientRect();
    const y = snapToGrid(e.clientY - rect.top);
    const startTime = yToTime(y);
    onMoveSession?.(sessionId, toDateKey(displayDays[targetDayIdx]), startTime);
    setMoveState(null);
  }, [sessions, displayDays, onMoveSession]);

  /* ── Block click → open detail ───────────────────────────────── */
  const handleBlockClick = useCallback((e, session) => {
    e.stopPropagation();
    if (resizeState || moveState) return;
    // Open modal in edit mode
    setModalData({
      subject: session.subject,
      color: subjectColor(session.subject),
      date: toDateKey(session.date),
      startTime: session.startTime,
      endTime: session.endTime,
      sessionId: session.id,
      teacher: session.teacher?.name || '',
      room: session.room || '',
    });
    setModalOpen(true);
  }, [resizeState, moveState, subjectColor]);

  /* ── Add subject ─────────────────────────────────────────────── */
  const handleAddSubject = useCallback((name, color) => {
    setSubjects(prev => [...prev, { id: `subj-${Date.now()}`, name, color }]);
    setAddSubjectOpen(false);
  }, []);

  /* ── Submit session from modal ───────────────────────────────── */
  const handleSessionSubmit = useCallback((data) => {
    onAddSession?.(data);
    setModalOpen(false);
  }, [onAddSession]);

  /* ── Now-line position ───────────────────────────────────────── */
  const nowMinutes = todayDate.getHours() * 60 + todayDate.getMinutes();
  const nowTop = ((nowMinutes - CAL_START_HOUR * 60) / 60) * HOUR_PX;
  const showNowLine = nowMinutes >= CAL_START_HOUR * 60 && nowMinutes <= CAL_END_HOUR * 60;

  /* ── Theme tokens ────────────────────────────────────────────── */
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
    red: dark ? '#e07a6f' : '#dc2626',
    grey: dark ? '#6b6e7a' : '#9ca3af',
    todayBg: dark ? 'rgba(31,174,124,0.06)' : 'rgba(15,107,77,0.04)',
    hoverBg: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
    dropBg: dark ? 'rgba(31,174,124,0.12)' : 'rgba(15,107,77,0.08)',
  };

  /* ── Month view data ─────────────────────────────────────────── */
  const monthData = useMemo(() => {
    if (viewMode !== 'month') return null;
    const ref = new Date(weekStart);
    const year = ref.getFullYear();
    const month = ref.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 7) % 7; // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return { cells, year, month };
  }, [viewMode, weekStart]);

  /* ═══════════════════════════════════════════════════════════════ */
  /* ── RENDER ──────────────────────────────────────────────────── */
  /* ═══════════════════════════════════════════════════════════════ */

  return (
    <>
      <style>{css(t, dark)}</style>
      <div className="cv-root">

        {/* ── Left Sidebar ──────────────────────────────────────── */}
        <aside className="cv-sidebar">
          <div className="cv-sidebar-header">
            <span className="cv-sidebar-title">Subjects</span>
          </div>
          <div className="cv-subject-list">
            {subjects.map(subj => (
              <div key={subj.id}
                className="cv-subject-card"
                draggable
                onDragStart={(e) => handleSubjectDragStart(e, subj)}
              >
                <svg className="cv-grip-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="9" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="6" r="1.5" fill="currentColor" stroke="none"/>
                  <circle cx="9" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.5" fill="currentColor" stroke="none"/>
                  <circle cx="9" cy="18" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="18" r="1.5" fill="currentColor" stroke="none"/>
                </svg>
                <span className="cv-subject-chip" style={{ background: subj.color + '22', color: subj.color, borderColor: subj.color + '44' }}>
                  {subj.name}
                </span>
              </div>
            ))}
            {/* Add subject card */}
            <div className="cv-subject-card cv-add-subject" onClick={() => setAddSubjectOpen(true)}>
              <span className="cv-add-icon">+</span>
              <span className="cv-add-label">Add subject</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="cv-sidebar-hint">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 9l4-4 4 4"/><path d="M5 15l4 4 4-4"/></svg>
            <span>Drag a subject onto the grid to create a session. Drag block edges to resize.</span>
          </div>
        </aside>

        {/* ── Main Calendar ─────────────────────────────────────── */}
        <div className="cv-main">
          {/* Toolbar */}
          <div className="cv-toolbar">
            <div className="cv-toolbar-left">
              <button className="cv-nav-btn" onClick={goToToday}>Today</button>
              <button className="cv-arrow-btn" onClick={() => navigateWeek(-1)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <button className="cv-arrow-btn" onClick={() => navigateWeek(1)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <span className="cv-week-label">
                {viewMode === 'month'
                  ? `${new Date(weekStart).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
                  : `${displayDays[0]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${displayDays[displayDays.length-1]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                }
              </span>
            </div>
            {/* View mode toggle */}
            <div className="cv-view-toggle">
              {['day','week','month'].map(mode => (
                <button key={mode} className={`cv-toggle-btn ${viewMode === mode ? 'active' : ''}`} onClick={() => setViewMode(mode)}>
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* ── Day/Week Grid ──────────────────────────────────────── */}
          {viewMode !== 'month' && (
            <>
              {/* Day headers */}
              <div className="cv-day-headers">
                <div className="cv-gutter" />
                {displayDays.map((d, i) => {
                  const key = toDateKey(d);
                  const isToday = key === todayKey;
                  return (
                    <div key={i} className={`cv-col-head ${isToday ? 'cv-col-head--today' : ''}`}>
                      <span className="cv-day-name">{viewMode === 'day' ? d.toLocaleDateString('en-US', { weekday: 'long' }) : DAYS[d.getDay()]}</span>
                      <span className={`cv-day-num ${isToday ? 'cv-day-num--today' : ''}`}>{d.getDate()}</span>
                    </div>
                  );
                })}
              </div>

              {/* Grid body */}
              <div className="cv-body" ref={gridRef}>
                <div className="cv-hours-col">
                  {Array.from({ length: HOUR_COUNT }, (_, i) => (
                    <div key={i} className="cv-hour-slot" style={{ height: HOUR_PX }}>
                      <span className="cv-hour-label">{formatHourLabel(CAL_START_HOUR + i)}</span>
                    </div>
                  ))}
                </div>

                {displayDays.map((d, dayIdx) => {
                  const key = toDateKey(d);
                  const daySessions = dayMap[key] || [];
                  const isToday = key === todayKey;
                  const isDropTarget = dragOver?.dayIdx === dayIdx;
                  return (
                    <div key={dayIdx}
                      className={`cv-day-col ${isToday ? 'cv-day-col--today' : ''} ${isDropTarget ? 'cv-day-col--drop' : ''}`}
                      onDragOver={(e) => handleGridDragOver(e, dayIdx)}
                      onDragLeave={() => setDragOver(null)}
                      onDrop={(e) => handleGridDrop(e, dayIdx)}
                    >
                      {/* Hour lines */}
                      {Array.from({ length: HOUR_COUNT }, (_, i) => (
                        <div key={i} className="cv-hour-row" style={{ height: HOUR_PX }} />
                      ))}
                      {/* Now-line */}
                      {isToday && showNowLine && (
                        <div className="cv-now-line" style={{ top: nowTop }}>
                          <span className="cv-now-dot" />
                        </div>
                      )}
                      {/* Drop ghost */}
                      {isDropTarget && (
                        <div className="cv-drop-ghost" style={{ top: snapToGrid(dragOver.y), height: SNAP_PX * 12 }} />
                      )}
                      {/* Session blocks */}
                      {daySessions.map(session => {
                        const startH = parseTime(session.startTime);
                        const endH = parseTime(session.endTime);
                        const top = (startH - CAL_START_HOUR) * HOUR_PX;
                        const height = Math.max((endH - startH) * HOUR_PX, 28);
                        const color = subjectColor(session.subject);
                        const sa = { scheduled: t.gold, in_progress: t.emerald, completed: t.grey, cancelled: t.red }[session.status] || t.gold;
                        return (
                          <div key={session.id}
                            className="cv-block"
                            style={{ top, height, borderLeft: `3px solid ${color}`, background: color + '20' }}
                            draggable
                            onDragStart={(e) => handleBlockDragStart(e, session.id)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleBlockDrop(e, dayIdx)}
                            onClick={(e) => handleBlockClick(e, session)}
                          >
                            {/* Resize handle: top */}
                            <div className="cv-resize-handle cv-resize-top"
                              onMouseDown={(e) => handleResizeStart(e, session.id, 'top')} />
                            <div className="cv-block-content">
                              <div className="cv-block-top">
                                <span className="cv-block-subject" style={{ color }}>{session.subject}</span>
                                <span className="cv-block-status" style={{ background: sa, color: '#fff' }}>
                                  {session.status === 'in_progress' ? '● LIVE' : session.status === 'completed' ? '✓' : session.status === 'cancelled' ? '✕' : ''}
                                </span>
                              </div>
                              {height > 42 && <div className="cv-block-teacher">{session.teacher?.name || '—'}</div>}
                              {height > 62 && (
                                <div className="cv-block-meta">
                                  <span>{formatTimeShort(startH)}–{formatTimeShort(endH)}</span>
                                  <span>{session.enrolledCount ?? 0}/{session.totalCount ?? 0}</span>
                                </div>
                              )}
                            </div>
                            {/* Resize handle: bottom */}
                            <div className="cv-resize-handle cv-resize-bottom"
                              onMouseDown={(e) => handleResizeStart(e, session.id, 'bottom')} />
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── Month View ────────────────────────────────────────── */}
          {viewMode === 'month' && monthData && (
            <div className="cv-month-grid">
              {DAYS.map(d => <div key={d} className="cv-month-header">{d}</div>)}
              {monthData.cells.map((cell, i) => {
                if (!cell) return <div key={i} className="cv-month-cell cv-month-cell--empty" />;
                const key = toDateKey(cell);
                const daySessions = dayMap[key] || [];
                const isToday = key === todayKey;
                return (
                  <div key={i} className={`cv-month-cell ${isToday ? 'cv-month-cell--today' : ''}`}>
                    <span className="cv-month-day-num">{cell.getDate()}</span>
                    <div className="cv-month-events">
                      {daySessions.slice(0, 3).map(s => (
                        <div key={s.id} className="cv-month-event" style={{ background: subjectColor(s.subject) + '25', color: subjectColor(s.subject), borderLeft: `2px solid ${subjectColor(s.subject)}` }}
                          onClick={() => onSessionClick?.(s.id)}>
                          <span className="cv-month-event-time">{s.startTime}</span> {s.subject}
                        </div>
                      ))}
                      {daySessions.length > 3 && <div className="cv-month-more">+{daySessions.length - 3} more</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ────────────────────────────────────────────────── */}
      {modalOpen && (
        <CreateSessionModal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setModalData({}); }}
          onSubmit={handleSessionSubmit}
          data={modalData}
          subjects={subjects}
        />
      )}
      {addSubjectOpen && (
        <AddSubjectModal
          isOpen={addSubjectOpen}
          onClose={() => setAddSubjectOpen(false)}
          onSubmit={handleAddSubject}
        />
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/* ── Styles ─────────────────────────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════════ */

function css(t, dark) {
  return `
    .cv-root { display: flex; gap: 14px; height: 100%; min-height: 0; flex: 1; }

    /* ── Sidebar ──────────────────────────────────────────────── */
    .cv-sidebar { width: 180px; flex-shrink: 0; display: flex; flex-direction: column; gap: 10px;
      background: ${t.glass}; backdrop-filter: blur(22px) saturate(180%); -webkit-backdrop-filter: blur(22px) saturate(180%);
      border: 1px solid ${t.glassBorder}; border-radius: ${RADIUS.lg};
      box-shadow: ${dark ? '0 1px 0 rgba(255,255,255,0.08) inset, 0 16px 40px rgba(0,0,0,0.5)' : '0 1px 0 rgba(255,255,255,0.9) inset, 0 16px 36px rgba(120,105,80,0.13)'};
      padding: 14px 10px; }
    .cv-sidebar-header { padding: 0 4px 6px; border-bottom: 1px solid ${t.divider}; }
    .cv-sidebar-title { font-family: ${FONT.heading}; font-size: 13px; font-weight: 700; color: ${t.text}; letter-spacing: -0.2px; }
    .cv-subject-list { display: flex; flex-direction: column; gap: 6px; flex: 1; overflow-y: auto; }

    .cv-subject-card { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: ${RADIUS.sm};
      cursor: grab; transition: background 0.15s, transform 0.15s; }
    .cv-subject-card:hover { background: ${t.hoverBg}; transform: translateY(-1px); }
    .cv-subject-card:active { cursor: grabbing; transform: scale(0.97); }
    .cv-grip-icon { color: ${t.muted}; flex-shrink: 0; opacity: 0.5; }
    .cv-subject-chip { font-family: ${FONT.body}; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 100px; border: 1px solid; white-space: nowrap; }

    .cv-add-subject { border: 1.5px dashed ${t.divider}; cursor: pointer; justify-content: center; gap: 6px; }
    .cv-add-subject:hover { border-color: ${t.gold}; background: ${t.goldSoft}; }
    .cv-add-icon { font-size: 16px; font-weight: 600; color: ${t.gold}; }
    .cv-add-label { font-family: ${FONT.body}; font-size: 12px; font-weight: 600; color: ${t.muted}; }

    .cv-sidebar-hint { display: flex; align-items: flex-start; gap: 8px; padding: 10px 8px; border-top: 1px solid ${t.divider};
      font-family: ${FONT.body}; font-size: 10.5px; color: ${t.muted}; line-height: 1.45; }
    .cv-sidebar-hint svg { flex-shrink: 0; margin-top: 1px; color: ${t.gold}; }

    /* ── Main ─────────────────────────────────────────────────── */
    .cv-main { flex: 1; display: flex; flex-direction: column; gap: 0; min-height: 0;
      background: ${t.glass}; backdrop-filter: blur(22px) saturate(180%); -webkit-backdrop-filter: blur(22px) saturate(180%);
      border: 1px solid ${t.glassBorder}; border-radius: ${RADIUS.lg};
      box-shadow: ${dark ? '0 1px 0 rgba(255,255,255,0.08) inset, 0 16px 40px rgba(0,0,0,0.5)' : '0 1px 0 rgba(255,255,255,0.9) inset, 0 16px 36px rgba(120,105,80,0.13)'};
      overflow: hidden; }

    /* Toolbar */
    .cv-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid ${t.divider}; flex-shrink: 0; }
    .cv-toolbar-left { display: flex; align-items: center; gap: 8px; }
    .cv-nav-btn { font-family: ${FONT.body}; font-size: 12.5px; font-weight: 600; color: ${t.text}; background: ${t.glassStrong}; border: 1px solid ${t.glassBorder}; border-radius: ${RADIUS.sm}; padding: 6px 14px; cursor: pointer; transition: background 0.15s; }
    .cv-nav-btn:hover { background: ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)'}; }
    .cv-arrow-btn { width: 30px; height: 30px; border-radius: 8px; border: 1px solid ${t.glassBorder}; background: ${t.glassStrong}; color: ${t.muted}; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.15s; }
    .cv-arrow-btn:hover { background: ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)'}; color: ${t.text}; }
    .cv-week-label { font-family: ${FONT.heading}; font-size: 15px; font-weight: 600; color: ${t.text}; margin-left: 6px; }

    .cv-view-toggle { display: flex; gap: 3px; padding: 3px; border-radius: 100px; background: ${t.glassStrong}; border: 1px solid ${t.glassBorder}; }
    .cv-toggle-btn { padding: 5px 14px; border-radius: 100px; font-family: ${FONT.body}; font-size: 11.5px; font-weight: 600; cursor: pointer; color: ${t.muted}; background: transparent; border: none; transition: 0.15s; }
    .cv-toggle-btn:hover { color: ${t.text}; }
    .cv-toggle-btn.active { color: #fff; background: linear-gradient(150deg, ${t.gold}, ${dark ? '#1fae7c' : '#0f6b4d'}); }

    /* Day headers */
    .cv-day-headers { display: flex; border-bottom: 1px solid ${t.divider}; background: ${t.glassStrong}; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); flex-shrink: 0; position: sticky; top: 0; z-index: 10; }
    .cv-gutter { width: 56px; flex-shrink: 0; }
    .cv-col-head { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 8px 4px 6px; border-left: 1px solid ${t.divider}; }
    .cv-col-head--today { background: ${t.todayBg}; }
    .cv-day-name { font-family: ${FONT.body}; font-size: 10.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: ${t.muted}; }
    .cv-day-num { font-family: ${FONT.heading}; font-size: 18px; font-weight: 700; color: ${t.text}; margin-top: 2px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
    .cv-day-num--today { background: ${dark ? '#1fae7c' : '#0f6b4d'}; color: #fff; }

    /* Grid body */
    .cv-body { display: flex; flex: 1; overflow-y: auto; overflow-x: hidden; scrollbar-width: thin; scrollbar-color: ${t.divider} transparent; }
    .cv-body::-webkit-scrollbar { width: 5px; }
    .cv-body::-webkit-scrollbar-thumb { background: ${t.divider}; border-radius: 3px; }

    .cv-hours-col { width: 56px; flex-shrink: 0; }
    .cv-hour-slot { position: relative; border-bottom: 1px solid ${t.divider}; }
    .cv-hour-label { position: absolute; top: 0; left: 6px; right: 4px; font-family: ${FONT.heading}; font-size: 10px; font-weight: 600; color: ${t.muted}; white-space: nowrap; }

    .cv-day-col { flex: 1; position: relative; border-left: 1px solid ${t.divider}; min-height: ${GRID_HEIGHT}px; transition: background 0.2s; }
    .cv-day-col--today { background: ${t.todayBg}; }
    .cv-day-col--drop { background: ${t.dropBg} !important; }
    .cv-hour-row { border-bottom: 1px solid ${t.divider}; }

    /* Now-line */
    .cv-now-line { position: absolute; left: 0; right: 0; height: 0; border-top: 2px solid ${t.red}; z-index: 15; pointer-events: none; }
    .cv-now-dot { position: absolute; left: -4px; top: -4px; width: 8px; height: 8px; border-radius: 50%; background: ${t.red}; }

    /* Drop ghost */
    .cv-drop-ghost { position: absolute; left: 2px; right: 2px; border-radius: ${RADIUS.sm}; background: ${t.emerald}18; border: 2px dashed ${t.emerald}55; z-index: 5; pointer-events: none; }

    /* Session blocks */
    .cv-block { position: absolute; left: 3px; right: 3px; border-radius: ${RADIUS.sm}; cursor: pointer; overflow: visible; z-index: 2; transition: box-shadow 0.18s, transform 0.18s; display: flex; flex-direction: column; }
    .cv-block:hover { box-shadow: 0 4px 18px rgba(0,0,0,${dark ? '0.5' : '0.15'}); transform: scale(1.01); z-index: 5; }
    .cv-block-content { padding: 5px 8px; flex: 1; overflow: hidden; display: flex; flex-direction: column; gap: 1px; }
    .cv-block-top { display: flex; align-items: center; justify-content: space-between; gap: 4px; }
    .cv-block-subject { font-family: ${FONT.heading}; font-size: 11px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cv-block-status { font-family: ${FONT.body}; font-size: 8px; font-weight: 700; padding: 1px 4px; border-radius: 5px; white-space: nowrap; }
    .cv-block-teacher { font-family: ${FONT.body}; font-size: 9.5px; color: ${t.muted}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cv-block-meta { display: flex; align-items: center; justify-content: space-between; font-family: ${FONT.body}; font-size: 9px; color: ${t.muted}; }

    /* Edge-resize handles */
    .cv-resize-handle { position: absolute; left: 0; right: 0; height: 8px; cursor: ns-resize; z-index: 10; }
    .cv-resize-top { top: -4px; }
    .cv-resize-bottom { bottom: -4px; }
    .cv-resize-handle::after { content: ''; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 24px; height: 4px; border-radius: 2px; background: transparent; transition: background 0.15s; }
    .cv-resize-handle:hover::after { background: ${t.gold}55; }

    /* ── Month View ───────────────────────────────────────────── */
    .cv-month-grid { display: grid; grid-template-columns: repeat(7, 1fr); flex: 1; }
    .cv-month-header { padding: 10px; text-align: center; font-family: ${FONT.body}; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: ${t.muted}; border-bottom: 1px solid ${t.divider}; background: ${t.glassStrong}; }
    .cv-month-cell { min-height: 90px; padding: 6px; border: 1px solid ${t.divider}; border-top: none; display: flex; flex-direction: column; gap: 3px; }
    .cv-month-cell--empty { background: ${dark ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.02)'}; }
    .cv-month-cell--today { background: ${t.todayBg}; }
    .cv-month-day-num { font-family: ${FONT.heading}; font-size: 13px; font-weight: 700; color: ${t.text}; margin-bottom: 2px; }
    .cv-month-cell--today .cv-month-day-num { color: ${t.emerald}; }
    .cv-month-events { display: flex; flex-direction: column; gap: 2px; }
    .cv-month-event { font-family: ${FONT.body}; font-size: 10px; font-weight: 600; padding: 2px 5px; border-radius: 4px; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cv-month-event:hover { filter: brightness(1.1); }
    .cv-month-event-time { font-weight: 700; margin-right: 3px; }
    .cv-month-more { font-family: ${FONT.body}; font-size: 10px; color: ${t.muted}; padding: 1px 4px; }

    /* ── Responsive ───────────────────────────────────────────── */
    @media (max-width: 900px) {
      .cv-sidebar { width: 140px; padding: 10px 8px; }
      .cv-subject-chip { font-size: 11px; padding: 3px 8px; }
      .cv-gutter { width: 44px; }
      .cv-hours-col { width: 44px; }
      .cv-hour-label { font-size: 9px; left: 4px; }
      .cv-day-name { font-size: 9.5px; }
      .cv-day-num { font-size: 15px; width: 26px; height: 26px; }
      .cv-block-content { padding: 3px 5px; }
      .cv-block-subject { font-size: 10px; }
    }
    @media (max-width: 700px) {
      .cv-root { flex-direction: column; }
      .cv-sidebar { width: 100%; flex-direction: row; overflow-x: auto; gap: 8px; padding: 8px; }
      .cv-sidebar-header { display: none; }
      .cv-subject-list { flex-direction: row; flex-wrap: nowrap; }
      .cv-add-subject { min-width: 100px; }
      .cv-sidebar-hint { display: none; }
      .cv-subject-card { padding: 6px 8px; }
    }
    @media (max-width: 600px) {
      .cv-block-status { display: none; }
      .cv-block-meta span:last-child { display: none; }
      .cv-block-meta span:first-child { display: none; }
    }
  `;
}
