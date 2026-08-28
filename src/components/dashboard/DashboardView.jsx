import React, { useState, useCallback, useMemo } from 'react';
import { useTheme } from '../../styles/ThemeContext';
import { RADIUS, FONT, DAYS } from '../../styles/design-tokens';
import AgendaBoard from './AgendaBoard';
import SessionDetail from './SessionDetail';
import ActivityLog from './ActivityLog';
import AddCustomSessionModal from './AddCustomSessionModal';
import SessionAddStudentModal from './SessionAddStudentModal';

/**
 * DashboardView — Main dashboard container.
 *
 * Props:
 *   sessions: Array<Session>
 *   onOpenSession(sessionId)
 *   onAddSession()
 *   activityLogs: Array<Log>
 *   students: Array<Student>
 *   user: { id, name, role }
 *
 * All data is prop-driven. Zero hardcoded entities.
 */

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function formatWeekLabel(start) {
  const end = addDays(start, 6);
  const opts = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', opts)}`;
}

export default function DashboardView({
  sessions = [],
  onOpenSession,
  onAddSession,
  activityLogs = [],
  students = [],
  user,
}) {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(new Date()));

  const handleSessionClick = useCallback((id) => {
    setSelectedSessionId(id);
  }, []);

  const handleOpenSession = useCallback((id) => {
    onOpenSession?.(id);
  }, [onOpenSession]);

  const handleCloseDetail = useCallback(() => {
    setSelectedSessionId(null);
  }, []);

  const handlePrevWeek = useCallback(() => {
    setCurrentWeekStart((prev) => addDays(prev, -7));
  }, []);

  const handleNextWeek = useCallback(() => {
    setCurrentWeekStart((prev) => addDays(prev, 7));
  }, []);

  const handleToday = useCallback(() => {
    setCurrentWeekStart(getWeekStart(new Date()));
  }, []);

  const handleAddSession = useCallback(() => {
    setShowAddModal(true);
    onAddSession?.();
  }, [onAddSession]);

  const handleCloseAddModal = useCallback(() => setShowAddModal(false), []);

  const handleSubmitCustomSession = useCallback((data) => {
    // Forward to parent handler
    onAddSession?.(data);
    setShowAddModal(false);
  }, [onAddSession]);

  const handleAddStudent = useCallback(() => {
    setShowAddStudentModal(true);
  }, []);

  const handleCloseAddStudent = useCallback(() => {
    setShowAddStudentModal(false);
  }, []);

  const handleSubmitAddStudent = useCallback((studentData) => {
    // Forward to parent handler
    onOpenSession?.('add_student', studentData);
    setShowAddStudentModal(false);
  }, [onOpenSession]);

  /* Find selected session object */
  const selectedSession = useMemo(
    () => sessions.find((s) => s.id === selectedSessionId) || null,
    [sessions, selectedSessionId]
  );

  /* Empty roster — parent should provide via session detail hook */
  const roster = selectedSession?.roster || [];

  const t = {
    glass: dark ? 'rgba(255,255,255,0.055)' : 'rgba(255,255,255,0.55)',
    glassStrong: dark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.82)',
    glassBorder: dark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.75)',
    text: dark ? '#eceef0' : '#23241f',
    muted: dark ? '#9497a1' : '#75726a',
    divider: dark ? 'rgba(255,255,255,0.08)' : 'rgba(35,36,31,0.09)',
    gold: dark ? '#e0b93f' : '#b3872a',
    goldSoft: dark ? 'rgba(224,185,63,0.15)' : 'rgba(179,135,42,0.14)',
    emerald: dark ? '#1fae7c' : '#0f6b4d',
    emeraldSoft: dark ? 'rgba(31,174,124,0.15)' : 'rgba(15,107,77,0.14)',
    inputBg: dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
  };

  const todaySessions = useMemo(() => {
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return sessions.filter((s) => {
      const d = new Date(s.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return key === todayKey;
    });
  }, [sessions]);

  const stats = useMemo(() => ({
    totalStudents: students.length,
    todaySessions: todaySessions.length,
    activeNow: sessions.filter((s) => s.status === 'in_progress').length,
  }), [students, todaySessions, sessions]);

  return (
    <>
      <style>{css(t, dark)}</style>
      <div className="dv-root">
        {/* Top stats bar */}
        <div className="dv-stats-bar">
          <div className="dv-stat-card">
            <div className="dv-stat-icon" style={{ background: t.emeraldSoft, color: t.emerald }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="dv-stat-data">
              <span className="dv-stat-num">{stats.totalStudents}</span>
              <span className="dv-stat-label">Students</span>
            </div>
          </div>

          <div className="dv-stat-card">
            <div className="dv-stat-icon" style={{ background: t.goldSoft, color: t.gold }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="dv-stat-data">
              <span className="dv-stat-num">{stats.todaySessions}</span>
              <span className="dv-stat-label">Today's Sessions</span>
            </div>
          </div>

          <div className="dv-stat-card">
            <div className="dv-stat-icon" style={{ background: t.emeraldSoft, color: t.emerald }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="dv-stat-data">
              <span className="dv-stat-num">{stats.activeNow}</span>
              <span className="dv-stat-label">Active Now</span>
            </div>
          </div>
        </div>

        {/* Week navigation */}
        <div className="dv-week-nav">
          <button className="dv-nav-btn" onClick={handleToday}>Today</button>
          <button className="dv-nav-arrow" onClick={handlePrevWeek}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button className="dv-nav-arrow" onClick={handleNextWeek}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <span className="dv-week-label">{formatWeekLabel(currentWeekStart)}</span>
        </div>

        {/* Main layout: left (agenda + detail) | right (activity) */}
        <div className="dv-main">
          {/* Left column */}
          <div className="dv-left">
            <AgendaBoard
              sessions={sessions}
              onSessionClick={handleSessionClick}
              onAddSession={handleAddSession}
              currentWeekStart={currentWeekStart}
            />

            {selectedSession && (
              <SessionDetail
                session={selectedSession}
                roster={roster}
                onTogglePresence={(sid) => onOpenSession?.('toggle_presence', { sessionId: selectedSession.id, studentId: sid })}
                onCyclePayment={(sid) => onOpenSession?.('cycle_payment', { sessionId: selectedSession.id, studentId: sid })}
                onAddStudent={handleAddStudent}
                onClose={handleCloseDetail}
              />
            )}
          </div>

          {/* Right column */}
          <div className="dv-right">
            <ActivityLog
              logs={activityLogs}
              onLoadMore={() => onOpenSession?.('load_more_logs')}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddCustomSessionModal
          isOpen={showAddModal}
          onClose={handleCloseAddModal}
          onSubmit={handleSubmitCustomSession}
          teachers={[]}
          classrooms={[]}
          subjects={[]}
        />
      )}

      {showAddStudentModal && (
        <SessionAddStudentModal
          isOpen={showAddStudentModal}
          onClose={handleCloseAddStudent}
          onSubmit={handleSubmitAddStudent}
          availableStudents={students}
        />
      )}
    </>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────── */

function css(t, dark) {
  return `
    .dv-root {
      display: flex;
      flex-direction: column;
      gap: 14px;
      min-height: 0;
      flex: 1;
    }

    /* Stats bar */
    .dv-stats-bar {
      display: flex;
      gap: 12px;
    }

    .dv-stat-card {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px 20px;
      border-radius: ${RADIUS.md};
      background: ${t.glass};
      backdrop-filter: blur(40px);
      -webkit-backdrop-filter: blur(40px);
      border: 1px solid ${t.glassBorder};
      box-shadow: ${dark
        ? '0 1px 0 rgba(255,255,255,0.08) inset, 0 12px 30px rgba(0,0,0,0.4)'
        : '0 1px 0 rgba(255,255,255,0.9) inset, 0 12px 30px rgba(120,105,80,0.1)'};
    }

    .dv-stat-icon {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .dv-stat-data {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .dv-stat-num {
      font-family: ${FONT.heading};
      font-size: 24px;
      font-weight: 700;
      color: ${t.text};
      line-height: 1;
    }

    .dv-stat-label {
      font-family: ${FONT.body};
      font-size: 12px;
      color: ${t.muted};
    }

    /* Week nav */
    .dv-week-nav {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .dv-nav-btn {
      font-family: ${FONT.body};
      font-size: 12.5px;
      font-weight: 600;
      color: ${t.text};
      background: ${t.glass};
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid ${t.glassBorder};
      border-radius: ${RADIUS.sm};
      padding: 7px 16px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .dv-nav-btn:hover {
      background: ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)'};
    }

    .dv-nav-arrow {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      border: 1px solid ${t.glassBorder};
      background: ${t.glass};
      color: ${t.muted};
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    .dv-nav-arrow:hover {
      background: ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)'};
      color: ${t.text};
    }

    .dv-week-label {
      font-family: ${FONT.heading};
      font-size: 15px;
      font-weight: 600;
      color: ${t.text};
      margin-left: 8px;
    }

    /* Main layout */
    .dv-main {
      display: flex;
      gap: 14px;
      flex: 1;
      min-height: 0;
    }

    .dv-left {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 14px;
      min-width: 0;
      min-height: 0;
    }

    .dv-right {
      width: 320px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    /* Responsive */
    @media (max-width: 1100px) {
      .dv-right { width: 280px; }
    }

    @media (max-width: 900px) {
      .dv-main {
        flex-direction: column;
      }
      .dv-right {
        width: 100%;
        max-height: 320px;
      }
    }

    @media (max-width: 600px) {
      .dv-stats-bar {
        flex-direction: column;
        gap: 8px;
      }
      .dv-stat-card {
        padding: 12px 16px;
        border-radius: ${RADIUS.sm};
      }
      .dv-stat-icon {
        width: 38px;
        height: 38px;
      }
      .dv-stat-num { font-size: 20px; }
      .dv-week-nav { flex-wrap: wrap; }
      .dv-week-label { font-size: 13px; }
    }
  `;
}
