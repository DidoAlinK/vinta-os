import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTheme } from '../../styles/ThemeContext';
import { RADIUS, FONT } from '../../styles/design-tokens';

/**
 * AddSubjectModal — Add a custom subject to the palette.
 *
 * Props:
 *   isOpen: boolean
 *   onClose()
 *   onSubmit(name: string, color: string)
 *
 * Simple modal: subject name input + color picker.
 */

const PRESET_COLORS = [
  { hex: '#b3872a', label: 'Gold' },
  { hex: '#0f6b4d', label: 'Emerald' },
  { hex: '#7c3aed', label: 'Violet' },
  { hex: '#dc2626', label: 'Red' },
  { hex: '#0ea5e9', label: 'Sky' },
  { hex: '#ea580c', label: 'Orange' },
  { hex: '#db2777', label: 'Pink' },
  { hex: '#0d9488', label: 'Teal' },
];

export default function AddSubjectModal({ isOpen, onClose, onSubmit }) {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const inputRef = useRef(null);

  const [name, setName] = useState('');
  const [color, setColor] = useState('#b3872a');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setColor('#b3872a');
      setError('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { setError('Subject name is required'); return; }
    if (trimmed.length > 30) { setError('Name too long (max 30 characters)'); return; }
    onSubmit?.(trimmed, color);
  }, [name, color, onSubmit]);

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
    emerald: dark ? '#1fae7c' : '#0f6b4d',
    red: dark ? '#e07a6f' : '#dc2626',
    divider: dark ? 'rgba(255,255,255,0.08)' : 'rgba(35,36,31,0.08)',
  };

  return (
    <div className="asm-overlay" onClick={handleBackdrop} style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.overlay, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', animation: 'asmFadeIn 0.15s ease' }}>
      <style>{css(t, dark)}</style>
      <div className="asm-card">
        {/* Header */}
        <div className="asm-header">
          <div className="asm-header-left">
            <span className="asm-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </span>
            <h2 className="asm-title">Add Subject</h2>
          </div>
          <button className="asm-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="asm-form">
          {/* Name */}
          <div className="asm-field">
            <label className="asm-label">Subject name</label>
            <input
              ref={inputRef}
              type="text"
              className="asm-input"
              placeholder="e.g. History, Art, PE…"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              maxLength={30}
            />
            <span className="asm-char-count">{name.length}/30</span>
          </div>

          {/* Color picker */}
          <div className="asm-field">
            <label className="asm-label">Color</label>
            <div className="asm-color-grid">
              {PRESET_COLORS.map(c => (
                <button key={c.hex} type="button"
                  className={`asm-swatch ${color === c.hex ? 'asm-swatch--active' : ''}`}
                  style={{ background: c.hex }}
                  title={c.label}
                  onClick={() => setColor(c.hex)}
                />
              ))}
              <div className="asm-custom-color">
                <div className="asm-color-preview" style={{ background: color }} />
                <input type="color" className="asm-color-input" value={color} onChange={(e) => setColor(e.target.value)} title="Custom color" />
              </div>
            </div>
            {/* Preview */}
            <div className="asm-preview">
              <span className="asm-preview-chip" style={{ background: color + '22', color: color, borderColor: color + '44' }}>
                {name || 'Subject name'}
              </span>
            </div>
          </div>

          {/* Error */}
          {error && <div className="asm-error">{error}</div>}

          {/* Actions */}
          <div className="asm-actions">
            <button type="button" className="asm-btn asm-btn--cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="asm-btn asm-btn--submit">Add Subject</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function css(t, dark) {
  return `
    @keyframes asmFadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes asmSlideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

    .asm-card {
      width: 400px; max-width: calc(100vw - 32px);
      border-radius: ${RADIUS.lg}; overflow: hidden; display: flex; flex-direction: column;
      background: ${t.card}; border: 1px solid ${t.border};
      box-shadow: ${dark ? '0 20px 60px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.05) inset' : '0 18px 50px rgba(90,80,60,0.18), 0 0 0 1px rgba(255,255,255,0.5) inset'};
      animation: asmSlideUp 0.18s ease;
    }

    .asm-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px 14px; border-bottom: 1px solid ${t.divider}; }
    .asm-header-left { display: flex; align-items: center; gap: 10px; }
    .asm-icon { width: 34px; height: 34px; border-radius: 10px; background: ${t.gold}18; color: ${t.gold}; display: flex; align-items: center; justify-content: center; }
    .asm-title { font-family: ${FONT.heading}; font-size: 17px; font-weight: 700; color: ${t.text}; margin: 0; }
    .asm-close { width: 32px; height: 32px; border-radius: 8px; border: none; background: transparent; color: ${t.muted}; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.15s; }
    .asm-close:hover { background: ${t.inputBg}; color: ${t.text}; }

    .asm-form { padding: 18px 22px 20px; display: flex; flex-direction: column; gap: 16px; }
    .asm-field { display: flex; flex-direction: column; gap: 5px; position: relative; }
    .asm-label { font-family: ${FONT.body}; font-size: 12px; font-weight: 600; color: ${t.muted}; letter-spacing: 0.2px; }
    .asm-input { width: 100%; padding: 10px 12px; border-radius: ${RADIUS.sm}; border: 1px solid ${t.inputBorder}; background: ${t.inputBg}; color: ${t.text}; font-family: ${FONT.body}; font-size: 13px; outline: none; transition: border-color 0.15s; box-sizing: border-box; }
    .asm-input:focus { border-color: ${t.gold}; }
    .asm-input::placeholder { color: ${t.muted}; }
    .asm-char-count { position: absolute; right: 10px; top: 32px; font-family: ${FONT.body}; font-size: 10px; color: ${t.muted}; pointer-events: none; }

    .asm-color-grid { display: flex; gap: 7px; align-items: center; flex-wrap: wrap; padding-top: 2px; }
    .asm-swatch { width: 32px; height: 32px; border-radius: 50%; border: 2.5px solid transparent; cursor: pointer; transition: 0.15s; flex-shrink: 0; }
    .asm-swatch:hover { transform: scale(1.15); }
    .asm-swatch--active { border-color: ${t.text}; transform: scale(1.15); box-shadow: 0 0 0 2px ${t.card}, 0 0 0 4px var(--text, ${t.text}); }
    .asm-custom-color { position: relative; width: 32px; height: 32px; margin-left: 4px; }
    .asm-color-preview { width: 100%; height: 100%; border-radius: 50%; border: 2px dashed ${t.muted}; pointer-events: none; }
    .asm-color-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }

    .asm-preview { margin-top: 6px; }
    .asm-preview-chip { font-family: ${FONT.body}; font-size: 12px; font-weight: 600; padding: 5px 14px; border-radius: 100px; border: 1px solid; display: inline-block; transition: 0.15s; }

    .asm-error { font-family: ${FONT.body}; font-size: 12px; color: ${t.red}; padding: 8px 12px; background: ${t.red}12; border-radius: ${RADIUS.sm}; border: 1px solid ${t.red}25; }

    .asm-actions { display: flex; justify-content: flex-end; gap: 8px; padding-top: 4px; }
    .asm-btn { font-family: ${FONT.body}; font-size: 13px; font-weight: 600; padding: 9px 18px; border-radius: ${RADIUS.sm}; cursor: pointer; transition: 0.15s; border: none; }
    .asm-btn--cancel { background: ${t.inputBg}; color: ${t.muted}; border: 1px solid ${t.inputBorder}; }
    .asm-btn--cancel:hover { background: ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)'}; color: ${t.text}; }
    .asm-btn--submit { background: linear-gradient(150deg, ${t.gold}, ${t.emerald}); color: #fff; box-shadow: 0 2px 10px ${t.gold}30; }
    .asm-btn--submit:hover { filter: brightness(1.05); transform: translateY(-1px); }
  `;
}
