import React, { useState, useCallback, useEffect } from 'react';
import { useTheme } from '../../styles/ThemeContext';
import { RADIUS, FONT } from '../../styles/design-tokens';

/**
 * CreateSessionModal — Create or edit a calendar session.
 *
 * Props:
 *   isOpen: boolean
 *   onClose()
 *   onSubmit({ subject, date, startTime, endTime, teacher, room, color })
 *   data: { subject?, color?, date?, startTime?, endTime?, sessionId?, teacher?, room? }
 *   subjects: Array<{ id, name, color }>
 *
 * Used when:
 *   - Dropping a subject from the palette → prefilled with subject, date, start/end
 *   - Clicking an existing block → prefilled with all fields (edit mode)
 */

const EMPTY_FORM = { subject: '', date: '', startTime: '08:00', endTime: '09:00', teacher: '', room: '' };

export default function CreateSessionModal({ isOpen, onClose, onSubmit, data = {}, subjects = [] }) {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const [form, setForm] = useState(EMPTY_FORM);
  const [color, setColor] = useState(data.color || '#b3872a');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setForm({
        subject: data.subject || '',
        date: data.date || new Date().toISOString().slice(0, 10),
        startTime: data.startTime || '08:00',
        endTime: data.endTime || '09:00',
        teacher: data.teacher || '',
        room: data.room || '',
      });
      setColor(data.color || '#b3872a');
      setError('');
    }
  }, [isOpen, data]);

  const handleChange = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === 'subject') {
      const found = subjects.find(s => s.name === value);
      if (found) setColor(found.color);
    }
    setError('');
  }, [subjects]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!form.subject.trim()) { setError('Subject is required'); return; }
    if (!form.date) { setError('Date is required'); return; }
    if (!form.startTime || !form.endTime) { setError('Start and end times are required'); return; }
    if (form.startTime >= form.endTime) { setError('End time must be after start time'); return; }
    onSubmit?.({ ...form, color, sessionId: data.sessionId || null });
  }, [form, color, data.sessionId, onSubmit]);

  const handleBackdrop = useCallback((e) => { if (e.target === e.currentTarget) onClose?.(); }, [onClose]);

  if (!isOpen) return null;

  const t = {
    overlay: dark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.35)',
    card: dark ? 'rgba(30,31,28,0.97)' : 'rgba(255,255,255,0.97)',
    border: dark ? 'rgba(255,255,255,0.12)' : 'rgba(35,36,31,0.12)',
    text: dark ? '#eceef0' : '#23241f',
    muted: dark ? '#9497a1' : '#75726a',
    inputBg: dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
    inputBorder: dark ? 'rgba(255,255,255,0.1)' : 'rgba(35,36,31,0.13)',
    gold: dark ? '#e0b93f' : '#b3872a',
    goldHover: dark ? '#c9a535' : '#9f7824',
    emerald: dark ? '#1fae7c' : '#0f6b4d',
    red: dark ? '#e07a6f' : '#dc2626',
    divider: dark ? 'rgba(255,255,255,0.08)' : 'rgba(35,36,31,0.08)',
  };

  return (
    <div className="csm-overlay" onClick={handleBackdrop} style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.overlay, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', animation: 'csmFadeIn 0.15s ease' }}>
      <style>{css(t, dark)}</style>
      <div className="csm-card">
        {/* Header */}
        <div className="csm-header">
          <div className="csm-header-left">
            <span className="csm-color-dot" style={{ background: color }} />
            <h2 className="csm-title">{data.sessionId ? 'Edit Session' : 'New Session'}</h2>
          </div>
          <button className="csm-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="csm-form">
          {/* Subject */}
          <div className="csm-field">
            <label className="csm-label">Subject</label>
            <div className="csm-select-wrap">
              <select className="csm-input" value={form.subject} onChange={(e) => handleChange('subject', e.target.value)}>
                <option value="">Select a subject…</option>
                {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
          </div>

          {/* Date */}
          <div className="csm-field">
            <label className="csm-label">Date</label>
            <input type="date" className="csm-input" value={form.date} onChange={(e) => handleChange('date', e.target.value)} />
          </div>

          {/* Time row */}
          <div className="csm-row">
            <div className="csm-field csm-field--half">
              <label className="csm-label">Start time</label>
              <input type="time" className="csm-input" value={form.startTime} step="300" onChange={(e) => handleChange('startTime', e.target.value)} />
            </div>
            <div className="csm-field csm-field--half">
              <label className="csm-label">End time</label>
              <input type="time" className="csm-input" value={form.endTime} step="300" onChange={(e) => handleChange('endTime', e.target.value)} />
            </div>
          </div>

          {/* Teacher */}
          <div className="csm-field">
            <label className="csm-label">Teacher</label>
            <input type="text" className="csm-input" placeholder="e.g. Mme. Kahina" value={form.teacher} onChange={(e) => handleChange('teacher', e.target.value)} />
          </div>

          {/* Room */}
          <div className="csm-field">
            <label className="csm-label">Room</label>
            <input type="text" className="csm-input" placeholder="e.g. Room 204" value={form.room} onChange={(e) => handleChange('room', e.target.value)} />
          </div>

          {/* Color picker */}
          <div className="csm-field">
            <label className="csm-label">Color</label>
            <div className="csm-color-row">
              {['#b3872a','#0f6b4d','#7c3aed','#dc2626','#0ea5e9','#ea580c','#db2777','#0d9488'].map(c => (
                <button key={c} type="button" className={`csm-swatch ${color === c ? 'csm-swatch--active' : ''}`}
                  style={{ background: c }} onClick={() => setColor(c)} />
              ))}
              <div className="csm-custom-color">
                <div className="csm-color-preview" style={{ background: color }} />
                <input type="color" className="csm-color-input" value={color} onChange={(e) => setColor(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && <div className="csm-error">{error}</div>}

          {/* Actions */}
          <div className="csm-actions">
            <button type="button" className="csm-btn csm-btn--cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="csm-btn csm-btn--submit">
              {data.sessionId ? 'Save Changes' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function css(t, dark) {
  return `
    @keyframes csmFadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes csmSlideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

    .csm-card {
      width: 440px; max-width: calc(100vw - 32px); max-height: calc(100vh - 60px);
      border-radius: ${RADIUS.lg}; overflow: hidden; display: flex; flex-direction: column;
      background: ${t.card}; border: 1px solid ${t.border};
      box-shadow: ${dark ? '0 20px 60px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.05) inset' : '0 18px 50px rgba(90,80,60,0.18), 0 0 0 1px rgba(255,255,255,0.5) inset'};
      animation: csmSlideUp 0.18s ease;
    }

    .csm-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px 14px; border-bottom: 1px solid ${t.divider}; }
    .csm-header-left { display: flex; align-items: center; gap: 10px; }
    .csm-color-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
    .csm-title { font-family: ${FONT.heading}; font-size: 17px; font-weight: 700; color: ${t.text}; margin: 0; }
    .csm-close { width: 32px; height: 32px; border-radius: 8px; border: none; background: transparent; color: ${t.muted}; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.15s; }
    .csm-close:hover { background: ${t.inputBg}; color: ${t.text}; }

    .csm-form { padding: 18px 22px 20px; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; }
    .csm-field { display: flex; flex-direction: column; gap: 5px; }
    .csm-label { font-family: ${FONT.body}; font-size: 12px; font-weight: 600; color: ${t.muted}; letter-spacing: 0.2px; }
    .csm-input { width: 100%; padding: 10px 12px; border-radius: ${RADIUS.sm}; border: 1px solid ${t.inputBorder}; background: ${t.inputBg}; color: ${t.text}; font-family: ${FONT.body}; font-size: 13px; outline: none; transition: border-color 0.15s; box-sizing: border-box; }
    .csm-input:focus { border-color: ${t.gold}; }
    .csm-input::placeholder { color: ${t.muted}; }
    .csm-select-wrap { position: relative; }
    .csm-select-wrap::after { content: ''; position: absolute; right: 12px; top: 50%; transform: translateY(-50%); border: 4px solid transparent; border-top-color: ${t.muted}; pointer-events: none; }

    .csm-row { display: flex; gap: 10px; }
    .csm-field--half { flex: 1; }

    .csm-color-row { display: flex; gap: 7px; align-items: center; flex-wrap: wrap; }
    .csm-swatch { width: 28px; height: 28px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; transition: 0.15s; flex-shrink: 0; }
    .csm-swatch:hover { transform: scale(1.15); }
    .csm-swatch--active { border-color: ${t.text}; transform: scale(1.15); }
    .csm-custom-color { position: relative; width: 28px; height: 28px; margin-left: 4px; }
    .csm-color-preview { width: 100%; height: 100%; border-radius: 50%; border: 2px dashed ${t.muted}; pointer-events: none; }
    .csm-color-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }

    .csm-error { font-family: ${FONT.body}; font-size: 12px; color: ${t.red}; padding: 8px 12px; background: ${t.red}12; border-radius: ${RADIUS.sm}; border: 1px solid ${t.red}25; }

    .csm-actions { display: flex; justify-content: flex-end; gap: 8px; padding-top: 6px; }
    .csm-btn { font-family: ${FONT.body}; font-size: 13px; font-weight: 600; padding: 9px 18px; border-radius: ${RADIUS.sm}; cursor: pointer; transition: 0.15s; border: none; }
    .csm-btn--cancel { background: ${t.inputBg}; color: ${t.muted}; border: 1px solid ${t.inputBorder}; }
    .csm-btn--cancel:hover { background: ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)'}; color: ${t.text}; }
    .csm-btn--submit { background: linear-gradient(150deg, ${t.gold}, ${t.emerald}); color: #fff; box-shadow: 0 2px 10px ${t.gold}30; }
    .csm-btn--submit:hover { filter: brightness(1.05); transform: translateY(-1px); }
  `;
}
