import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTheme } from '../../styles/ThemeContext';
import { RADIUS, FONT } from '../../styles/design-tokens';

/**
 * AddCustomSessionModal — Modal form for creating a custom (non-recurring) session.
 *
 * Props:
 *   isOpen: boolean
 *   onClose()
 *   onSubmit({ date, startTime, endTime, subject, teacherId, classroomId })
 *   teachers: Array<{ id, name }>
 *   classrooms: Array<{ id, name }>
 *   subjects: Array<{ id, name } | string>
 *
 * All data is prop-driven. Zero hardcoded entities.
 */

const EMPTY_FORM = {
  date: '',
  startTime: '',
  endTime: '',
  subject: '',
  teacherId: '',
  classroomId: '',
};

export default function AddCustomSessionModal({
  isOpen,
  onClose,
  onSubmit,
  teachers = [],
  classrooms = [],
  subjects = [],
}) {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const overlayRef = useRef(null);
  const firstInputRef = useRef(null);

  /* Reset form when modal opens */
  useEffect(() => {
    if (isOpen) {
      setForm(EMPTY_FORM);
      setErrors({});
      setSubmitting(false);
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  /* Close on Escape */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleChange = useCallback((field) => (e) => {
    const val = e.target.value;
    setForm((prev) => ({ ...prev, [field]: val }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const validate = useCallback(() => {
    const errs = {};
    if (!form.date) errs.date = 'Date is required';
    if (!form.startTime) errs.startTime = 'Start time is required';
    if (!form.endTime) errs.endTime = 'End time is required';
    if (!form.subject) errs.subject = 'Subject is required';
    if (!form.teacherId) errs.teacherId = 'Teacher is required';
    if (!form.classroomId) errs.classroomId = 'Classroom is required';

    if (form.startTime && form.endTime && form.startTime >= form.endTime) {
      errs.endTime = 'End time must be after start time';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form]);

  const handleSubmit = useCallback((e) => {
    e?.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    onSubmit?.({
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      subject: form.subject,
      teacherId: form.teacherId,
      classroomId: form.classroomId,
    });
  }, [form, validate, onSubmit]);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === overlayRef.current) onClose?.();
  }, [onClose]);

  /* Normalize subjects — can be strings or objects */
  const subjectList = subjects.map((s) =>
    typeof s === 'string' ? { id: s, name: s } : s
  );

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
    red: dark ? '#e07a6f' : '#dc2626',
    redSoft: dark ? 'rgba(224,122,111,0.15)' : 'rgba(220,38,38,0.14)',
    inputBg: dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
    inputBorder: dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{css(t, dark)}</style>
      <div className="acm-overlay" ref={overlayRef} onClick={handleOverlayClick}>
        <div className="acm-modal" role="dialog" aria-modal="true" aria-label="Add Custom Session">
          {/* ── Header ──────────────────────────────────────────── */}
          <div className="acm-modal-header">
            <h2 className="acm-title">New Session</h2>
            <button className="acm-close" onClick={onClose}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* ── Form ────────────────────────────────────────────── */}
          <form className="acm-form" onSubmit={handleSubmit}>
            {/* Date */}
            <div className="acm-field">
              <label className="acm-label">Date</label>
              <input
                ref={firstInputRef}
                type="date"
                className={`acm-input ${errors.date ? 'acm-input--error' : ''}`}
                value={form.date}
                onChange={handleChange('date')}
              />
              {errors.date && <span className="acm-error">{errors.date}</span>}
            </div>

            {/* Time row */}
            <div className="acm-row">
              <div className="acm-field acm-field--half">
                <label className="acm-label">Start Time</label>
                <input
                  type="time"
                  className={`acm-input ${errors.startTime ? 'acm-input--error' : ''}`}
                  value={form.startTime}
                  onChange={handleChange('startTime')}
                />
                {errors.startTime && <span className="acm-error">{errors.startTime}</span>}
              </div>
              <div className="acm-field acm-field--half">
                <label className="acm-label">End Time</label>
                <input
                  type="time"
                  className={`acm-input ${errors.endTime ? 'acm-input--error' : ''}`}
                  value={form.endTime}
                  onChange={handleChange('endTime')}
                />
                {errors.endTime && <span className="acm-error">{errors.endTime}</span>}
              </div>
            </div>

            {/* Subject */}
            <div className="acm-field">
              <label className="acm-label">Subject</label>
              <select
                className={`acm-input acm-select ${errors.subject ? 'acm-input--error' : ''}`}
                value={form.subject}
                onChange={handleChange('subject')}
              >
                <option value="">Select subject…</option>
                {subjectList.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {errors.subject && <span className="acm-error">{errors.subject}</span>}
            </div>

            {/* Teacher */}
            <div className="acm-field">
              <label className="acm-label">Teacher</label>
              <select
                className={`acm-input acm-select ${errors.teacherId ? 'acm-input--error' : ''}`}
                value={form.teacherId}
                onChange={handleChange('teacherId')}
              >
                <option value="">Select teacher…</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                ))}
              </select>
              {errors.teacherId && <span className="acm-error">{errors.teacherId}</span>}
            </div>

            {/* Classroom */}
            <div className="acm-field">
              <label className="acm-label">Classroom</label>
              <select
                className={`acm-input acm-select ${errors.classroomId ? 'acm-input--error' : ''}`}
                value={form.classroomId}
                onChange={handleChange('classroomId')}
              >
                <option value="">Select classroom…</option>
                {classrooms.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.classroomId && <span className="acm-error">{errors.classroomId}</span>}
            </div>

            {/* Actions */}
            <div className="acm-actions">
              <button
                type="button"
                className="acm-btn acm-btn--cancel"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="acm-btn acm-btn--confirm"
                disabled={submitting}
              >
                {submitting ? 'Creating…' : 'Create Session'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Styles
   ═══════════════════════════════════════════════════════════════════════ */

function css(t, dark) {
  return `
    /* ── Overlay ──────────────────────────────────────────────── */
    .acm-overlay {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,${dark ? '0.65' : '0.4'});
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      animation: acmFadeIn 0.2s ease;
    }

    @keyframes acmFadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    @keyframes acmSlideUp {
      from { opacity: 0; transform: translateY(18px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* ── Modal card ───────────────────────────────────────────── */
    .acm-modal {
      width: 440px;
      max-width: calc(100vw - 32px);
      max-height: calc(100vh - 48px);
      overflow-y: auto;
      border-radius: ${RADIUS.lg};
      background: ${t.glassStrong};
      backdrop-filter: blur(40px);
      -webkit-backdrop-filter: blur(40px);
      border: 1px solid ${t.glassBorder};
      box-shadow: ${dark
        ? '0 24px 80px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.08) inset'
        : '0 24px 80px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.9) inset'};
      animation: acmSlideUp 0.25s ease;
      scrollbar-width: thin;
      scrollbar-color: ${t.divider} transparent;
    }

    .acm-modal::-webkit-scrollbar       { width: 5px; }
    .acm-modal::-webkit-scrollbar-track  { background: transparent; }
    .acm-modal::-webkit-scrollbar-thumb  { background: ${t.divider}; border-radius: 3px; }

    /* ── Header ───────────────────────────────────────────────── */
    .acm-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 22px 24px 14px;
    }

    .acm-title {
      font-family: ${FONT.heading};
      font-size: 18px;
      font-weight: 700;
      color: ${t.text};
      margin: 0;
    }

    .acm-close {
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
    .acm-close:hover {
      background: ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
      color: ${t.text};
    }

    /* ── Form ─────────────────────────────────────────────────── */
    .acm-form {
      padding: 6px 24px 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .acm-field {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .acm-row {
      display: flex;
      gap: 12px;
    }
    .acm-field--half { flex: 1; }

    .acm-label {
      font-family: ${FONT.body};
      font-size: 12px;
      font-weight: 600;
      color: ${t.muted};
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    /* ── Inputs ───────────────────────────────────────────────── */
    .acm-input {
      font-family: ${FONT.body};
      font-size: 14px;
      color: ${t.text};
      background: ${t.inputBg};
      border: 1.5px solid ${t.inputBorder};
      border-radius: ${RADIUS.sm};
      padding: 10px 12px;
      outline: none;
      transition: border-color 0.18s, box-shadow 0.18s;
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      box-sizing: border-box;
    }

    .acm-input:focus {
      border-color: ${dark ? '#1fae7c' : '#0f6b4d'};
      box-shadow: 0 0 0 3px ${dark ? 'rgba(31,174,124,0.15)' : 'rgba(15,107,77,0.12)'};
    }

    .acm-input--error { border-color: ${t.red}; }
    .acm-input--error:focus { box-shadow: 0 0 0 3px ${t.redSoft}; }

    .acm-select {
      cursor: pointer;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2375726a' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      padding-right: 34px;
    }

    .acm-error {
      font-family: ${FONT.body};
      font-size: 11px;
      font-weight: 500;
      color: ${t.red};
    }

    /* ── Action buttons ───────────────────────────────────────── */
    .acm-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding-top: 8px;
    }

    .acm-btn {
      font-family: ${FONT.body};
      font-size: 13.5px;
      font-weight: 600;
      padding: 10px 20px;
      border-radius: ${RADIUS.sm};
      border: none;
      cursor: pointer;
      transition: background 0.18s, color 0.18s, box-shadow 0.18s;
    }
    .acm-btn:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    .acm-btn--cancel {
      background: transparent;
      color: ${t.muted};
    }
    .acm-btn--cancel:hover:not(:disabled) {
      background: ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'};
      color: ${t.text};
    }

    .acm-btn--confirm {
      background: ${dark ? '#1fae7c' : '#0f6b4d'};
      color: #fff;
      box-shadow: 0 4px 14px ${dark ? 'rgba(31,174,124,0.3)' : 'rgba(15,107,77,0.25)'};
    }
    .acm-btn--confirm:hover:not(:disabled) {
      box-shadow: 0 6px 20px ${dark ? 'rgba(31,174,124,0.45)' : 'rgba(15,107,77,0.4)'};
    }

    /* ── Responsive ───────────────────────────────────────────── */
    @media (max-width: 500px) {
      .acm-modal { border-radius: ${RADIUS.md}; }
      .acm-modal-header { padding: 18px 18px 10px; }
      .acm-form { padding: 4px 18px 20px; }
      .acm-row { flex-direction: column; gap: 14px; }
    }
  `;
}
