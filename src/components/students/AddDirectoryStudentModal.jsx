import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../styles/ThemeContext';
import { RADIUS, FONT } from '../../styles/design-tokens';

/**
 * AddDirectoryStudentModal — Full student profile form.
 *
 * Props:
 *   isOpen: boolean
 *   onClose — () => void
 *   onAdd   — (studentData) => void
 */

const AVATAR_PAIRS = [
  ['#b3872a', '#0f6b4d'], ['#0f6b4d', '#b3872a'], ['#7a5a95', '#b3872a'],
  ['#0f6b4d', '#7a5a95'], ['#b3423a', '#b3872a'], ['#b3872a', '#7a5a95'],
];

export default function AddDirectoryStudentModal({ isOpen, onClose, onAdd }) {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const nameRef = useRef(null);

  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', email: '',
    dateOfBirth: '', grade: '', classroom: '',
    parentName: '', parentPhone: '', parentEmail: '',
    address: '', notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      setForm({ firstName: '', lastName: '', phone: '', email: '', dateOfBirth: '', grade: '', classroom: '', parentName: '', parentPhone: '', parentEmail: '', address: '', notes: '' });
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [isOpen]);

  function update(field, value) { setForm(prev => ({ ...prev, [field]: value })); }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.firstName.trim()) return;
    const initials = ((form.firstName[0] || '?') + (form.lastName[0] || '?')).toUpperCase();
    const pairIdx = Math.floor(Math.random() * AVATAR_PAIRS.length);
    onAdd?.({
      ...form,
      name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
      avatarColors: AVATAR_PAIRS[pairIdx],
      initials,
    });
  }

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
    emerald: dark ? '#1fae7c' : '#0f6b4d',
    divider: dark ? 'rgba(255,255,255,0.08)' : 'rgba(35,36,31,0.08)',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.overlay, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <style>{css(t, dark)}</style>
      <div className="asd-card">
        {/* Header */}
        <div className="asd-header">
          <div className="asd-header-left">
            <div className="asd-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/></svg>
            </div>
            <h2 className="asd-title">Add New Student</h2>
          </div>
          <button className="asd-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="asd-form">
          {/* Personal Info */}
          <div className="asd-section-label">Personal Information</div>
          <div className="asd-row">
            <Field asd t={t} label="First name *" ref={nameRef} placeholder="First name" value={form.firstName} onChange={v => update('firstName', v)} required />
            <Field asd t={t} label="Last name" placeholder="Last name" value={form.lastName} onChange={v => update('lastName', v)} />
          </div>
          <div className="asd-row">
            <Field asd t={t} label="Date of birth" type="date" value={form.dateOfBirth} onChange={v => update('dateOfBirth', v)} />
            <Field asd t={t} label="Grade / Year" placeholder="e.g. 3ème, 1AM" value={form.grade} onChange={v => update('grade', v)} />
          </div>

          {/* Contact */}
          <div className="asd-section-label">Contact</div>
          <div className="asd-row">
            <Field asd t={t} label="Phone" type="tel" placeholder="+213 555 00 00 00" value={form.phone} onChange={v => update('phone', v)} />
            <Field asd t={t} label="Email" type="email" placeholder="student@email.com" value={form.email} onChange={v => update('email', v)} />
          </div>
          <Field asd t={t} label="Address" placeholder="Street address, city" value={form.address} onChange={v => update('address', v)} />

          {/* Parent / Guardian */}
          <div className="asd-section-label">Parent / Guardian</div>
          <div className="asd-row">
            <Field asd t={t} label="Parent name" placeholder="Full name" value={form.parentName} onChange={v => update('parentName', v)} />
            <Field asd t={t} label="Parent phone" type="tel" placeholder="+213 555 00 00 00" value={form.parentPhone} onChange={v => update('parentPhone', v)} />
          </div>
          <Field asd t={t} label="Parent email" type="email" placeholder="parent@email.com" value={form.parentEmail} onChange={v => update('parentEmail', v)} />

          {/* Additional */}
          <div className="asd-section-label">Additional</div>
          <div className="asd-field" style={{ marginBottom: 0 }}>
            <label className="asd-label">Notes</label>
            <textarea className="asd-textarea" placeholder="Any additional notes about this student…" value={form.notes} onChange={e => update('notes', e.target.value)} rows={3} />
          </div>

          {/* Actions */}
          <div className="asd-actions">
            <button type="button" className="asd-btn asd-btn--cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="asd-btn asd-btn--submit">Add Student</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Simple field component ─────────────────────────────────────────── */

const Field = React.forwardRef(({ t, label, type = 'text', placeholder, value, onChange, required }, ref) => (
  <div className="asd-field">
    <label className="asd-label">{label}</label>
    <input ref={ref} type={type} className="asd-input" placeholder={placeholder}
      value={value} onChange={e => onChange(e.target.value)} required={required} />
  </div>
));

/* ── Styles ─────────────────────────────────────────────────────────── */

function css(t, dark) {
  return `
    @keyframes asdSlideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

    .asd-card {
      width: 520px; max-width: calc(100vw - 32px); max-height: calc(100vh - 48px);
      border-radius: ${RADIUS.lg}; overflow: hidden; display: flex; flex-direction: column;
      background: ${t.card}; border: 1px solid ${t.border};
      box-shadow: ${dark ? '0 20px 60px rgba(0,0,0,0.65)' : '0 18px 50px rgba(90,80,60,0.18)'};
      animation: asdSlideUp 0.18s ease;
    }
    .asd-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px 14px; border-bottom: 1px solid ${t.divider}; flex-shrink: 0; }
    .asd-header-left { display: flex; align-items: center; gap: 10px; }
    .asd-icon { width: 34px; height: 34px; border-radius: 10px; background: ${t.gold}18; color: ${t.gold}; display: flex; align-items: center; justify-content: center; }
    .asd-title { font-family: ${FONT.heading}; font-size: 17px; font-weight: 700; color: ${t.text}; margin: 0; }
    .asd-close { width: 32px; height: 32px; border-radius: 8px; border: none; background: transparent; color: ${t.muted}; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.15s; }
    .asd-close:hover { background: ${t.inputBg}; color: ${t.text}; }

    .asd-form { padding: 18px 22px 20px; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; flex: 1; }

    .asd-section-label { font-size: 10.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: ${t.muted}; margin-top: 4px; padding-bottom: 4px; border-bottom: 1px solid ${t.divider}; }

    .asd-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .asd-field { display: flex; flex-direction: column; gap: 4px; }
    .asd-label { font-family: ${FONT.body}; font-size: 11.5px; font-weight: 600; color: ${t.muted}; letter-spacing: 0.2px; }
    .asd-input { width: 100%; padding: 9px 12px; border-radius: ${RADIUS.sm}; border: 1px solid ${t.inputBorder}; background: ${t.inputBg}; color: ${t.text}; font-family: ${FONT.body}; font-size: 13px; outline: none; transition: border-color 0.15s; box-sizing: border-box; }
    .asd-input:focus { border-color: ${t.gold}; box-shadow: 0 0 0 2px ${t.gold}20; }
    .asd-input::placeholder { color: ${t.muted}; }
    .asd-textarea { width: 100%; padding: 9px 12px; border-radius: ${RADIUS.sm}; border: 1px solid ${t.inputBorder}; background: ${t.inputBg}; color: ${t.text}; font-family: ${FONT.body}; font-size: 13px; outline: none; resize: vertical; min-height: 60px; box-sizing: border-box; }
    .asd-textarea:focus { border-color: ${t.gold}; box-shadow: 0 0 0 2px ${t.gold}20; }

    .asd-actions { display: flex; justify-content: flex-end; gap: 8px; padding-top: 8px; flex-shrink: 0; }
    .asd-btn { font-family: ${FONT.body}; font-size: 13px; font-weight: 600; padding: 10px 20px; border-radius: ${RADIUS.sm}; cursor: pointer; transition: 0.15s; border: none; }
    .asd-btn--cancel { background: ${t.inputBg}; color: ${t.muted}; border: 1px solid ${t.inputBorder}; }
    .asd-btn--cancel:hover { color: ${t.text}; }
    .asd-btn--submit { background: linear-gradient(150deg, ${t.gold}, ${t.emerald}); color: #fff; }
    .asd-btn--submit:hover { filter: brightness(1.05); transform: translateY(-1px); }

    @media (max-width: 560px) { .asd-row { grid-template-columns: 1fr; } }
  `;
}
