import React, { useState, useCallback, useRef } from 'react';
import { DAYS, CAL_START_HOUR, CAL_END_HOUR, HOUR_PX } from '../../styles/design-tokens';

const SUBJECT_COLORS = {
  Math: 'var(--gold)', French: 'var(--violet)', English: 'var(--sky)', Science: 'var(--emerald)',
};

export default function CalendarView({ sessions = [], onSessionClick, onAddSession, onMoveSession, currentWeekStart: propWeekStart }) {
  const [weekStart, setWeekStart] = useState(propWeekStart || (() => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); d.setHours(0,0,0,0); return d; }));
  const [dragging, setDragging] = useState(null);
  const gridRef = useRef(null);

  const hours = [];
  for (let h = CAL_START_HOUR; h < CAL_END_HOUR; h++) hours.push(h);

  const weekDays = DAYS.map((name, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return { name, date: d, key: d.toISOString().slice(0, 10) };
  });

  const isToday = (date) => { const t = new Date(); return date.toDateString() === t.toDateString(); };

  const getSessionsForDay = (dateKey) => sessions.filter(s => s.date === dateKey);

  const navigateWeek = (dir) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + dir * 7);
    setWeekStart(d);
  };

  const goToToday = () => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); d.setHours(0,0,0,0); setWeekStart(d); };

  const handleDragStart = (e, session) => {
    e.dataTransfer.setData('text/plain', session.id);
    setDragging(session.id);
  };

  const handleDrop = (e, dayKey) => {
    e.preventDefault();
    const sessionId = e.dataTransfer.getData('text/plain');
    const rect = gridRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const minutes = Math.round(((y / HOUR_PX) * 60) / 5) * 5;
    const hour = CAL_START_HOUR + Math.floor(minutes / 60);
    const min = minutes % 60;
    const startTime = `${String(hour).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
    const session = sessions.find(s => s.id === sessionId);
    if (session && onMoveSession) {
      onMoveSession(sessionId, dayKey, startTime, session.endTime);
    }
    setDragging(null);
  };

  return (
    <>
      <div className="calendar-view">
        <div className="cal-toolbar">
          <button className="icon-btn" onClick={() => navigateWeek(-1)}>◀</button>
          <button className="ghost-btn today-btn" onClick={goToToday}>Today</button>
          <span className="cal-week-label">{weekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          <button className="icon-btn" onClick={() => navigateWeek(1)}>▶</button>
          <div style={{ flex: 1 }} />
          <button className="confirm-btn" onClick={onAddSession}>+ Add Session</button>
        </div>
        <div className="cal-header">
          <div className="cal-time-gutter" />
          {weekDays.map(d => (
            <div key={d.key} className={`cal-day-header ${isToday(d.date) ? 'today' : ''}`}>
              <span className="day-name">{d.name}</span>
              <span className="day-num">{d.date.getDate()}</span>
            </div>
          ))}
        </div>
        <div className="cal-body" ref={gridRef}>
          {hours.map(h => (
            <div key={h} className="cal-row">
              <div className="cal-time-gutter"><span>{h}:00</span></div>
              {weekDays.map(d => (
                <div key={`${d.key}-${h}`} className="cal-cell"
                     onDragOver={e => e.preventDefault()}
                     onDrop={e => handleDrop(e, d.key)} />
              ))}
            </div>
          ))}
          {/* Session blocks overlay */}
          {sessions.map(s => {
            const dayIdx = weekDays.findIndex(d => d.key === s.date);
            if (dayIdx < 0) return null;
            const [sh, sm] = (s.startTime || '08:00').split(':').map(Number);
            const [eh, em] = (s.endTime || '09:00').split(':').map(Number);
            const top = ((sh - CAL_START_HOUR) * 60 + sm) / 60 * HOUR_PX;
            const height = Math.max(((eh - sh) * 60 + (em - sm)) / 60 * HOUR_PX, 20);
            const color = SUBJECT_COLORS[s.subject] || 'var(--gold)';
            return (
              <div key={s.id} className={`cal-session-block ${dragging === s.id ? 'dragging' : ''}`}
                   style={{ top: `${top + 40}px`, left: `calc(${(dayIdx + 1) * (100 / 8)}% + 4px)`, width: `calc(${100 / 8}% - 8px)`, height: `${height - 4}px`, borderLeft: `3px solid ${color}` }}
                   draggable onDragStart={e => handleDragStart(e, s)} onClick={() => onSessionClick?.(s.id)}>
                <span className="cal-block-title">{s.subject}</span>
                <span className="cal-block-time">{s.startTime}–{s.endTime}</span>
                <span className="cal-block-teacher">{s.teacher?.name}</span>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        .calendar-view { display: flex; flex-direction: column; height: 100%; }
        .cal-toolbar { display: flex; align-items: center; gap: 8px; padding: 12px 0; }
        .cal-week-label { font-family: 'Space Grotesk'; font-size: 15px; font-weight: 600; color: var(--text); margin: 0 8px; }
        .today-btn { font-size: 12px; padding: 6px 14px; }
        .cal-header { display: grid; grid-template-columns: 60px repeat(7, 1fr); border-bottom: 1px solid var(--border); }
        .cal-day-header { text-align: center; padding: 8px 0; }
        .cal-day-header.today { background: rgba(179,135,42,0.1); border-radius: 8px; }
        .day-name { display: block; font-family: 'Inter'; font-size: 11px; color: var(--text-muted); text-transform: uppercase; }
        .day-num { display: block; font-family: 'Space Grotesk'; font-size: 18px; font-weight: 700; color: var(--text); }
        .cal-day-header.today .day-num { color: var(--gold); }
        .cal-body { position: relative; flex: 1; overflow-y: auto; }
        .cal-row { display: grid; grid-template-columns: 60px repeat(7, 1fr); height: ${HOUR_PX}px; }
        .cal-time-gutter { font-family: 'Inter'; font-size: 10px; color: var(--text-muted); text-align: right; padding-right: 8px; padding-top: 2px; }
        .cal-cell { border: 1px solid var(--border); border-left: none; }
        .cal-session-block { position: absolute; border-radius: 8px; padding: 6px 8px; cursor: grab; z-index: 10; overflow: hidden; background: var(--card); backdrop-filter: blur(20px); transition: opacity 0.2s; }
        .cal-session-block:hover { opacity: 0.85; }
        .cal-session-block.dragging { opacity: 0.4; }
        .cal-block-title { display: block; font-family: 'Space Grotesk'; font-size: 12px; font-weight: 600; color: var(--text); }
        .cal-block-time { display: block; font-family: 'Inter'; font-size: 10px; color: var(--text-muted); }
        .cal-block-teacher { display: block; font-family: 'Inter'; font-size: 10px; color: var(--text-muted); margin-top: 2px; }
      `}</style>
    </>
  );
}
