import React, { useCallback, useState } from 'react';
import { useTheme } from '../../styles/ThemeContext';
import { RADIUS, FONT, STATUS_META } from '../../styles/design-tokens';

/**
 * SessionDetail — Panel showing a clicked session's info and student roster.
 *
 * Props:
 *   session: { id, date, startTime, endTime, subject,
 *              teacher:{ name }, classroom:{ name }, status }
 *   roster: Array<{ studentId, name, isPresent, paymentStatus }>
 *   onTogglePresence(studentId)
 *   onCyclePayment(studentId)
 *   onAddStudent()
 *   onClose()
 *
 * All data is prop-driven. Zero hardcoded entities.
 */

const PAYMENT_CYCLE = ['paid', 'due', 'overdue'];

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTimeDisplay(time) {
  if (!time) return '';
  const [h, m] = String(time).split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return m ? `${display}:${String(m).padStart(2, '0')} ${suffix}` : `${display} ${suffix}`;
}

export default function SessionDetail({
  session,
  roster = [],
  onTogglePresence,
  onCyclePayment,
  onAddStudent,
  onClose,
}) {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const [expandedStudent, setExpandedStudent] = useState(null);

  const handleToggle = useCallback(
    (studentId) => onTogglePresence?.(studentId),
    [onTogglePresence]
  );

  const handleCycle = useCallback(
    (studentId) => onCyclePayment?.(studentId),
    [onCyclePayment]
  );

  const handleCall = useCallback((phone) => {
    if (phone) window.location.href = `tel:${phone}`;
  }, []);

  const handleMessage = useCallback((phone) => {
    if (phone) window.location.href = `sms:${phone}`;
  }, []);

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
    violet: dark ? '#a07cc5' : '#7c3aed',
    violetSoft: dark ? 'rgba(160,124,197,0.15)' : 'rgba(124,58,237,0.14)',
    red: dark ? '#e07a6f' : '#dc2626',
    redSoft: dark ? 'rgba(224,122,111,0.15)' : 'rgba(220,38,38,0.14)',
    inputBg: dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
  };

  if (!session) return null;

  const presentCount = roster.filter((s) => s.isPresent).length;
  const paidCount = roster.filter((s) => s.paymentStatus === 'paid').length;

  function paymentBadgeColor(status) {
    if (status === 'paid') return { bg: t.emeraldSoft, text: t.emerald, label: 'Paid' };
    if (status === 'overdue') return { bg: t.redSoft, text: t.red, label: 'Overdue' };
    return { bg: t.goldSoft, text: t.gold, label: 'Due' };
  }

  return (
    <>
      <style>{css(t, dark)}</style>
      <div className="sd-panel">
        {/* Header */}
        <div className="sd-header">
          <div className="sd-header-left">
            <span className="sd-subject">{session.subject}</span>
            <span className={`sd-status sd-status--${session.status}`}>
              {session.status === 'in_progress'
                ? '● In Progress'
                : session.status === 'completed'
                  ? '✓ Completed'
                  : session.status === 'cancelled'
                    ? '✕ Cancelled'
                    : 'Scheduled'}
            </span>
          </div>
          <button className="sd-close" onClick={onClose} title="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Info chips */}
        <div className="sd-info">
          <div className="sd-chip">
            <svg className="sd-chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <span>
              {formatTimeDisplay(session.startTime)} – {formatTimeDisplay(session.endTime)}
            </span>
          </div>
          <div className="sd-chip">
            <svg className="sd-chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            <span>{session.teacher?.name || '—'}</span>
          </div>
          <div className="sd-chip">
            <svg className="sd-chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>{session.classroom?.name || '—'}</span>
          </div>
          <div className="sd-chip">
            <svg className="sd-chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{formatDisplayDate(session.date)}</span>
          </div>
        </div>

        {/* Stats bar */}
        <div className="sd-stats">
          <div className="sd-stat">
            <span className="sd-stat-num" style={{ color: t.gold }}>{presentCount}</span>
            <span className="sd-stat-label">/ {roster.length} Present</span>
          </div>
          <div className="sd-stat">
            <span className="sd-stat-num" style={{ color: t.emerald }}>{paidCount}</span>
            <span className="sd-stat-label">/ {roster.length} Paid</span>
          </div>
        </div>

        {/* Roster list */}
        <div className="sd-roster">
          {roster.length === 0 && (
            <div className="sd-empty">No students in this session yet.</div>
          )}
          {roster.map((student) => {
            const badge = paymentBadgeColor(student.paymentStatus);
            return (
              <div key={student.studentId} className="sd-student">
                <label className="sd-check">
                  <input
                    type="checkbox"
                    checked={!!student.isPresent}
                    onChange={() => handleToggle(student.studentId)}
                  />
                  <span className={`sd-check-box ${student.isPresent ? 'sd-check-box--on' : ''}`}>
                    {student.isPresent && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                </label>

                <div className="sd-student-info">
                  <span className="sd-student-name">{student.name}</span>
                  <button
                    className="sd-payment-badge"
                    style={{ background: badge.bg, color: badge.text }}
                    onClick={() => handleCycle(student.studentId)}
                    title="Click to cycle payment status"
                  >
                    {badge.label}
                  </button>
                </div>

                <div className="sd-student-actions">
                  <button
                    className="sd-action-btn"
                    onClick={() => handleCall(student.phone)}
                    title="Call"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.37 1.6.68 2.36a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.76.31 1.55.55 2.36.68a2 2 0 0 1 1.72 2.03z" />
                    </svg>
                  </button>
                  <button
                    className="sd-action-btn"
                    onClick={() => handleMessage(student.phone)}
                    title="Message"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add student */}
        <button className="sd-add-btn" onClick={onAddStudent}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Student
        </button>
      </div>
    </>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────── */

function css(t, dark) {
  return `
    .sd-panel {
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
      min-width: 0;
    }

    /* Header */
    .sd-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 20px 22px 12px;
    }

    .sd-header-left {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .sd-subject {
      font-family: ${FONT.heading};
      font-size: 20px;
      font-weight: 700;
      color: ${t.text};
    }

    .sd-status {
      font-family: ${FONT.body};
      font-size: 11.5px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .sd-status--scheduled { color: ${t.gold}; }
    .sd-status--in_progress { color: ${t.emerald}; }
    .sd-status--completed { color: ${t.muted}; }
    .sd-status--cancelled { color: ${t.red}; }

    .sd-close {
      background: none;
      border: none;
      color: ${t.muted};
      cursor: pointer;
      padding: 4px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s, color 0.15s;
    }
    .sd-close:hover {
      background: ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
      color: ${t.text};
    }

    /* Info chips */
    .sd-info {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 0 22px 16px;
    }

    .sd-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      background: ${t.inputBg};
      border: 1px solid ${t.divider};
      border-radius: ${RADIUS.sm};
      padding: 5px 10px;
      font-family: ${FONT.body};
      font-size: 12px;
      color: ${t.text};
    }

    .sd-chip-icon {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
      stroke: ${t.muted};
    }

    /* Stats bar */
    .sd-stats {
      display: flex;
      gap: 16px;
      padding: 0 22px 14px;
      border-bottom: 1px solid ${t.divider};
    }

    .sd-stat {
      display: flex;
      align-items: baseline;
      gap: 3px;
    }

    .sd-stat-num {
      font-family: ${FONT.heading};
      font-size: 20px;
      font-weight: 700;
    }

    .sd-stat-label {
      font-family: ${FONT.body};
      font-size: 12px;
      color: ${t.muted};
    }

    /* Roster */
    .sd-roster {
      flex: 1;
      overflow-y: auto;
      padding: 8px 22px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      scrollbar-width: thin;
      scrollbar-color: ${t.divider} transparent;
    }

    .sd-roster::-webkit-scrollbar { width: 4px; }
    .sd-roster::-webkit-scrollbar-track { background: transparent; }
    .sd-roster::-webkit-scrollbar-thumb { background: ${t.divider}; border-radius: 3px; }

    .sd-empty {
      text-align: center;
      padding: 32px 16px;
      color: ${t.muted};
      font-family: ${FONT.body};
      font-size: 13px;
    }

    .sd-student {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 10px;
      border-radius: ${RADIUS.sm};
      transition: background 0.15s;
    }
    .sd-student:hover {
      background: ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'};
    }

    /* Checkbox */
    .sd-check {
      cursor: pointer;
      display: flex;
      align-items: center;
    }
    .sd-check input { display: none; }

    .sd-check-box {
      width: 22px;
      height: 22px;
      border-radius: 7px;
      border: 2px solid ${dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.18)'};
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.18s, border-color 0.18s;
      flex-shrink: 0;
    }

    .sd-check-box--on {
      background: ${dark ? '#1fae7c' : '#0f6b4d'};
      border-color: ${dark ? '#1fae7c' : '#0f6b4d'};
    }

    /* Student info */
    .sd-student-info {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }

    .sd-student-name {
      font-family: ${FONT.body};
      font-size: 13.5px;
      font-weight: 500;
      color: ${t.text};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sd-payment-badge {
      font-family: ${FONT.body};
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      white-space: nowrap;
      transition: opacity 0.15s;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .sd-payment-badge:hover { opacity: 0.8; }

    /* Action buttons */
    .sd-student-actions {
      display: flex;
      gap: 2px;
      flex-shrink: 0;
    }

    .sd-action-btn {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: ${t.muted};
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    .sd-action-btn:hover {
      background: ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
      color: ${t.text};
    }

    /* Add student button */
    .sd-add-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin: 12px 22px 18px;
      padding: 12px;
      border-radius: ${RADIUS.sm};
      border: 2px dashed ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'};
      background: transparent;
      color: ${t.muted};
      font-family: ${FONT.body};
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: border-color 0.18s, color 0.18s, background 0.18s;
    }
    .sd-add-btn:hover {
      border-color: ${dark ? '#1fae7c' : '#0f6b4d'};
      color: ${dark ? '#1fae7c' : '#0f6b4d'};
      background: ${dark ? 'rgba(31,174,124,0.06)' : 'rgba(15,107,77,0.04)'};
    }

    /* Responsive */
    @media (max-width: 600px) {
      .sd-info { padding: 0 14px 12px; }
      .sd-stats { padding: 0 14px 12px; }
      .sd-roster { padding: 8px 14px; }
      .sd-header { padding: 16px 14px 10px; }
      .sd-subject { font-size: 17px; }
      .sd-add-btn { margin: 10px 14px 16px; }
    }
  `;
}
