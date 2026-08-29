import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useTheme } from '../../styles/ThemeContext';
import { RADIUS, FONT } from '../../styles/design-tokens';

/**
 * SessionAddStudentModal — Modal to add an existing student (or create a new one) to a session.
 *
 * Props:
 *   isOpen: boolean
 *   onClose()
 *   onSubmit(studentData)
 *   availableStudents: Array<{ id, name, phone }>
 *
 * All data is prop-driven. Zero hardcoded entities.
 */

const EMPTY_NEW_STUDENT = {
  first_name: '',
  last_name: '',
  phone: '',
  parent_phone: '',
};

export default function SessionAddStudentModal({
  isOpen,
  onClose,
  onSubmit,
  availableStudents = [],
}) {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showNewForm, setShowNewForm] = useState(false);
  const [newStudent, setNewStudent] = useState(EMPTY_NEW_STUDENT);
  const [errors, setErrors] = useState({});

  const overlayRef = useRef(null);
  const searchRef = useRef(null);

  /* Reset state on open */
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIds(new Set());
      setShowNewForm(false);
      setNewStudent(EMPTY_NEW_STUDENT);
      setErrors({});
      setTimeout(() => searchRef.current?.focus(), 100);
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

  /* Filter students by search */
  const filtered = useMemo(() => {
    if (!search.trim()) return availableStudents;
    const q = search.toLowerCase();
    return availableStudents.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.phone?.includes(q) ||
        String(s.id).includes(q)
    );
  }, [availableStudents, search]);

  const handleToggle = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleNewField = useCallback((field) => (e) => {
    setNewStudent((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const validateNew = useCallback(() => {
    const errs = {};
    if (!newStudent.first_name.trim()) errs.first_name = 'First name required';
    if (!newStudent.last_name.trim()) errs.last_name = 'Last name required';
    if (!newStudent.phone.trim()) errs.phone = 'Phone required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [newStudent]);

  const handleSubmit = useCallback((e) => {
    e?.preventDefault();

    if (showNewForm) {
      if (!validateNew()) return;
      onSubmit?.({
        mode: 'create',
        student: {
          first_name: newStudent.first_name.trim(),
          last_name: newStudent.last_name.trim(),
          phone: newStudent.phone.trim(),
          parent_phone: newStudent.parent_phone.trim(),
        },
      });
    } else {
      const selected = filtered.filter((s) => selectedIds.has(s.id));
      if (selected.length === 0) return;
      onSubmit?.({
        mode: 'add_existing',
        studentIds: Array.from(selectedIds),
        students: selected,
      });
    }
  }, [showNewForm, newStudent, selectedIds, filtered, validateNew, onSubmit]);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === overlayRef.current) onClose?.();
  }, [onClose]);

  const t = {
    glass: dark ? 'rgba(255,255,255,0.055)' : 'rgba(255,255,255,0.55)',
    glassStrong: dark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.82)',
    glassBorder: dark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.75)',
    text: dark ? '#eceef0' : '#23241f',
    muted: dark ? '#9497a1' : '#75726a',
    divider: dark ? 'rgba(255,255,255,0.08)' : 'rgba(35,36,31,0.09)',
    emerald: dark ? '#1fae7c' : '#0f6b4d',
    emeraldSoft: dark ? 'rgba(31,174,124,0.15)' : 'rgba(15,107,77,0.14)',
    gold: dark ? '#e0b93f' : '#b3872a',
    goldSoft: dark ? 'rgba(224,185,63,0.15)' : 'rgba(179,135,42,0.14)',
    violet: dark ? '#a07cc5' : '#7c3aed',
    violetSoft: dark ? 'rgba(160,124,197,0.15)' : 'rgba(124,58,237,0.14)',
    red: dark ? '#e07a6f' : '#dc2626',
    redSoft: dark ? 'rgba(224,122,111,0.15)' : 'rgba(220,38,38,0.14)',
    inputBg: dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
    inputBorder: dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
  };

  if (!isOpen) return null;

  const selectedCount = selectedIds.size;
  const hasSelection = selectedCount > 0 || showNewForm;

  return (
    <>
      <style>{css(t, dark)}</style>
      <div className="sam-overlay" ref={overlayRef} onClick={handleOverlayClick}>
        <div className="sam-modal" role="dialog" aria-modal="true" aria-label="Add Student to Session">
          {/* Header */}
          <div className="sam-header">
            <h2 className="sam-title">Add Student</h2>
            <button className="sam-close" onClick={onClose}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="sam-search-wrap">
            <svg className="sam-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              className="sam-search"
              placeholder="Search students by name or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Student list */}
          <div className="sam-student-list">
            {filtered.length === 0 && !showNewForm && (
              <div className="sam-empty">
                {search ? 'No students match your search.' : 'No available students.'}
              </div>
            )}
            {filtered.map((student) => {
              const isSelected = selectedIds.has(student.id);
              return (
                <button
                  key={student.id}
                  className={`sam-student ${isSelected ? 'sam-student--selected' : ''}`}
                  onClick={() => handleToggle(student.id)}
                  type="button"
                >
                  <div className={`sam-check ${isSelected ? 'sam-check--on' : ''}`}>
                    {isSelected && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <div className="sam-student-info">
                    <span className="sam-student-name">{student.name}</span>
                    {student.phone && (
                      <span className="sam-student-phone">{student.phone}</span>
                    )}
                  </div>
                </button>
              );
            })}

            {/* Add new student divider */}
            <button
              className={`sam-new-btn ${showNewForm ? 'sam-new-btn--active' : ''}`}
              onClick={() => setShowNewForm((p) => !p)}
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                {showNewForm ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </>
                )}
              </svg>
              {showNewForm ? 'Cancel new student' : 'Add new student'}
            </button>

            {/* Inline new student form */}
            {showNewForm && (
              <div className="sam-new-form">
                <div className="sam-row">
                  <div className="sam-field">
                    <label className="sam-label">First Name</label>
                    <input
                      type="text"
                      className={`sam-input ${errors.first_name ? 'sam-input--error' : ''}`}
                      value={newStudent.first_name}
                      onChange={handleNewField('first_name')}
                      placeholder="First name"
                    />
                    {errors.first_name && <span className="sam-error">{errors.first_name}</span>}
                  </div>
                  <div className="sam-field">
                    <label className="sam-label">Last Name</label>
                    <input
                      type="text"
                      className={`sam-input ${errors.last_name ? 'sam-input--error' : ''}`}
                      value={newStudent.last_name}
                      onChange={handleNewField('last_name')}
                      placeholder="Last name"
                    />
                    {errors.last_name && <span className="sam-error">{errors.last_name}</span>}
                  </div>
                </div>
                <div className="sam-field">
                  <label className="sam-label">Phone</label>
                  <input
                    type="tel"
                    className={`sam-input ${errors.phone ? 'sam-input--error' : ''}`}
                    value={newStudent.phone}
                    onChange={handleNewField('phone')}
                    placeholder="Student phone number"
                  />
                  {errors.phone && <span className="sam-error">{errors.phone}</span>}
                </div>
                <div className="sam-field">
                  <label className="sam-label">Parent Phone</label>
                  <input
                    type="tel"
                    className="sam-input"
                    value={newStudent.parent_phone}
                    onChange={handleNewField('parent_phone')}
                    placeholder="Parent phone (optional)"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sam-footer">
            <button className="sam-btn sam-btn--cancel" onClick={onClose} type="button">
              Cancel
            </button>
            <button
              className="sam-btn sam-btn--confirm"
              onClick={handleSubmit}
              disabled={!hasSelection}
              type="button"
            >
              {showNewForm
                ? 'Create & Add'
                : selectedCount > 0
                  ? `Add ${selectedCount} Student${selectedCount > 1 ? 's' : ''}`
                  : 'Select Students'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────── */

function css(t, dark) {
  return `
    .sam-overlay {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,${dark ? '0.65' : '0.4'});
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      animation: samFadeIn 0.2s ease;
    }

    @keyframes samFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes samSlideUp {
      from { opacity: 0; transform: translateY(18px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .sam-modal {
      width: 460px;
      max-width: calc(100vw - 32px);
      max-height: calc(100vh - 48px);
      display: flex;
      flex-direction: column;
      border-radius: ${RADIUS.lg};
      background: ${t.glassStrong};
      backdrop-filter: blur(22px) saturate(180%);
      -webkit-backdrop-filter: blur(22px) saturate(180%);
      border: 1px solid ${t.glassBorder};
      box-shadow: ${dark
        ? '0 24px 80px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.08) inset'
        : '0 24px 80px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.9) inset'};
      animation: samSlideUp 0.25s ease;
      overflow: hidden;
    }

    /* Header */
    .sam-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 22px 24px 12px;
      flex-shrink: 0;
    }

    .sam-title {
      font-family: ${FONT.heading};
      font-size: 18px;
      font-weight: 700;
      color: ${t.text};
      margin: 0;
    }

    .sam-close {
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
    .sam-close:hover {
      background: ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
      color: ${t.text};
    }

    /* Search */
    .sam-search-wrap {
      position: relative;
      padding: 0 24px 12px;
      flex-shrink: 0;
    }

    .sam-search-icon {
      position: absolute;
      left: 36px;
      top: 50%;
      transform: translateY(-calc(50% - 6px));
      color: ${t.muted};
      pointer-events: none;
    }

    .sam-search {
      width: 100%;
      font-family: ${FONT.body};
      font-size: 14px;
      color: ${t.text};
      background: ${t.inputBg};
      border: 1.5px solid ${t.inputBorder};
      border-radius: ${RADIUS.sm};
      padding: 10px 12px 10px 38px;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.18s, box-shadow 0.18s;
    }
    .sam-search::placeholder { color: ${t.muted}; }
    .sam-search:focus {
      border-color: ${dark ? '#1fae7c' : '#0f6b4d'};
      box-shadow: 0 0 0 3px ${dark ? 'rgba(31,174,124,0.15)' : 'rgba(15,107,77,0.12)'};
    }

    /* Student list */
    .sam-student-list {
      flex: 1;
      overflow-y: auto;
      padding: 0 12px;
      min-height: 0;
      max-height: 360px;
      scrollbar-width: thin;
      scrollbar-color: ${t.divider} transparent;
    }

    .sam-student-list::-webkit-scrollbar { width: 4px; }
    .sam-student-list::-webkit-scrollbar-track { background: transparent; }
    .sam-student-list::-webkit-scrollbar-thumb { background: ${t.divider}; border-radius: 3px; }

    .sam-empty {
      text-align: center;
      padding: 32px 16px;
      color: ${t.muted};
      font-family: ${FONT.body};
      font-size: 13px;
    }

    /* Student row */
    .sam-student {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 10px 12px;
      border-radius: ${RADIUS.sm};
      border: 1.5px solid transparent;
      background: transparent;
      cursor: pointer;
      text-align: left;
      font-family: ${FONT.body};
      transition: background 0.15s, border-color 0.15s;
    }
    .sam-student:hover {
      background: ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'};
    }
    .sam-student--selected {
      background: ${t.emeraldSoft};
      border-color: ${t.emerald};
    }

    .sam-check {
      width: 22px;
      height: 22px;
      border-radius: 7px;
      border: 2px solid ${dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.18)'};
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background 0.18s, border-color 0.18s;
    }
    .sam-check--on {
      background: ${dark ? '#1fae7c' : '#0f6b4d'};
      border-color: ${dark ? '#1fae7c' : '#0f6b4d'};
    }

    .sam-student-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .sam-student-name {
      font-size: 13.5px;
      font-weight: 500;
      color: ${t.text};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sam-student-phone {
      font-size: 12px;
      color: ${t.muted};
    }

    /* Add new button */
    .sam-new-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 10px;
      margin-top: 6px;
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
    .sam-new-btn:hover {
      border-color: ${dark ? '#a07cc5' : '#7c3aed'};
      color: ${dark ? '#a07cc5' : '#7c3aed'};
      background: ${dark ? 'rgba(160,124,197,0.06)' : 'rgba(124,58,237,0.04)'};
    }
    .sam-new-btn--active {
      border-color: ${t.red};
      color: ${t.red};
    }

    /* Inline new student form */
    .sam-new-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 14px 12px;
      margin-top: 4px;
      border-radius: ${RADIUS.sm};
      background: ${dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.025)'};
      border: 1px solid ${t.divider};
      animation: samSlideUp 0.18s ease;
    }

    .sam-row {
      display: flex;
      gap: 12px;
    }
    .sam-row .sam-field { flex: 1; }

    .sam-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .sam-label {
      font-family: ${FONT.body};
      font-size: 11px;
      font-weight: 600;
      color: ${t.muted};
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .sam-input {
      font-family: ${FONT.body};
      font-size: 13px;
      color: ${t.text};
      background: ${t.inputBg};
      border: 1.5px solid ${t.inputBorder};
      border-radius: 10px;
      padding: 8px 12px;
      outline: none;
      transition: border-color 0.18s, box-shadow 0.18s;
      box-sizing: border-box;
    }
    .sam-input::placeholder { color: ${t.muted}; }
    .sam-input:focus {
      border-color: ${dark ? '#1fae7c' : '#0f6b4d'};
      box-shadow: 0 0 0 3px ${dark ? 'rgba(31,174,124,0.15)' : 'rgba(15,107,77,0.12)'};
    }
    .sam-input--error { border-color: ${t.red}; }
    .sam-input--error:focus { box-shadow: 0 0 0 3px ${t.redSoft}; }

    .sam-error {
      font-family: ${FONT.body};
      font-size: 11px;
      font-weight: 500;
      color: ${t.red};
    }

    /* Footer */
    .sam-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 16px 24px;
      border-top: 1px solid ${t.divider};
      flex-shrink: 0;
    }

    .sam-btn {
      font-family: ${FONT.body};
      font-size: 13.5px;
      font-weight: 600;
      padding: 10px 20px;
      border-radius: ${RADIUS.sm};
      border: none;
      cursor: pointer;
      transition: background 0.18s, color 0.18s, box-shadow 0.18s;
    }

    .sam-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .sam-btn--cancel {
      background: transparent;
      color: ${t.muted};
    }
    .sam-btn--cancel:hover:not(:disabled) {
      background: ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'};
      color: ${t.text};
    }

    .sam-btn--confirm {
      background: ${dark ? '#1fae7c' : '#0f6b4d'};
      color: #fff;
      box-shadow: 0 4px 14px ${dark ? 'rgba(31,174,124,0.3)' : 'rgba(15,107,77,0.25)'};
    }
    .sam-btn--confirm:hover:not(:disabled) {
      box-shadow: 0 6px 20px ${dark ? 'rgba(31,174,124,0.45)' : 'rgba(15,107,77,0.4)'};
    }

    /* Responsive */
    @media (max-width: 500px) {
      .sam-modal { border-radius: ${RADIUS.md}; }
      .sam-header { padding: 18px 18px 10px; }
      .sam-search-wrap { padding: 0 18px 10px; }
      .sam-student-list { padding: 0 8px; }
      .sam-footer { padding: 14px 18px; }
      .sam-row { flex-direction: column; gap: 12px; }
    }
  `;
}
