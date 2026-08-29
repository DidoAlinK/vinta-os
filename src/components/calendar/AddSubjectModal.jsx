import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTheme } from '../../styles/ThemeContext';
import { RADIUS, FONT } from '../../styles/design-tokens';

/**
 * AddSubjectModal — Add a custom subject with a full color wheel picker.
 *
 * Props:
 *   isOpen: boolean
 *   onClose()
 *   onSubmit(name: string, color: string)
 */

/* ── HSL ↔ Hex helpers ──────────────────────────────────────────────── */

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r, g, b;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToHsl(hex) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/* ── ColorWheel component ───────────────────────────────────────────── */

function ColorWheel({ color, onChange }) {
  const wheelRef = useRef(null);
  const satRef = useRef(null);
  const lumRef = useRef(null);
  const [dragging, setDragging] = useState(null); // 'hue' | 'sat' | 'lum'
  const hsl = hexToHsl(color);

  const getColorAtPos = useCallback((wheelEl, clientX, clientY) => {
    const rect = wheelEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const radius = rect.width / 2;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > radius) return null;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 180;
    const sat = Math.min(100, (dist / radius) * 100);
    return { h: Math.round(angle) % 360, s: Math.round(sat) };
  }, []);

  const handleWheelInteraction = useCallback((e) => {
    const pos = getColorAtPos(wheelRef.current, e.clientX, e.clientY);
    if (pos) {
      onChange(hslToHex(pos.h, pos.s, hsl.l));
    }
  }, [getColorAtPos, hsl.l, onChange]);

  const handleSatInteraction = useCallback((e) => {
    const rect = satRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onChange(hslToHex(hsl.h, Math.round(pct * 100), hsl.l));
  }, [hsl.h, hsl.l, onChange]);

  const handleLumInteraction = useCallback((e) => {
    const rect = lumRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onChange(hslToHex(hsl.h, hsl.s, Math.round(pct * 100)));
  }, [hsl.h, hsl.s, onChange]);

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e) => {
      e.preventDefault();
      if (dragging === 'hue') handleWheelInteraction(e);
      else if (dragging === 'sat') handleSatInteraction(e);
      else if (dragging === 'lum') handleLumInteraction(e);
    };
    const handleUp = () => setDragging(null);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [dragging, handleWheelInteraction, handleSatInteraction, handleLumInteraction]);

  const WHEEL_SIZE = 180;
  const DOT_SIZE = 12;
  const hueAngle = (hsl.h - 180) * (Math.PI / 180);
  const hueDist = (hsl.s / 100) * (WHEEL_SIZE / 2);
  const dotX = WHEEL_SIZE / 2 + hueDist * Math.cos(hueAngle) - DOT_SIZE / 2;
  const dotY = WHEEL_SIZE / 2 + hueDist * Math.sin(hueAngle) - DOT_SIZE / 2;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
      {/* Color wheel */}
      <div ref={wheelRef}
        onMouseDown={(e) => { setDragging('hue'); handleWheelInteraction(e); }}
        onTouchStart={(e) => { setDragging('hue'); handleWheelInteraction(e.touches[0]); }}
        style={{
          width: WHEEL_SIZE, height: WHEEL_SIZE, borderRadius: '50%',
          background: `conic-gradient(
            hsl(0,100%,50%), hsl(30,100%,50%), hsl(60,100%,50%), hsl(90,100%,50%),
            hsl(120,100%,50%), hsl(150,100%,50%), hsl(180,100%,50%), hsl(210,100%,50%),
            hsl(240,100%,50%), hsl(270,100%,50%), hsl(300,100%,50%), hsl(330,100%,50%),
            hsl(360,100%,50%)
          )`,
          position: 'relative', cursor: 'crosshair',
          boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
        }}
      >
        {/* White center overlay for saturation */}
        <div style={{
          position: 'absolute', inset: '15%', borderRadius: '50%',
          background: 'radial-gradient(circle, white 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />
        {/* Selector dot */}
        <div style={{
          position: 'absolute', left: dotX, top: dotY,
          width: DOT_SIZE, height: DOT_SIZE, borderRadius: '50%',
          background: color, border: '2.5px solid white',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
          pointerEvents: 'none', transition: dragging ? 'none' : 'all 0.1s ease',
        }} />
      </div>

      {/* Saturation slider */}
      <div style={{ width: '100%' }}>
        <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: '6px' }}>Saturation</div>
        <div ref={satRef}
          onMouseDown={(e) => { setDragging('sat'); handleSatInteraction(e); }}
          onTouchStart={(e) => { setDragging('sat'); handleSatInteraction(e.touches[0]); }}
          style={{
            width: '100%', height: '14px', borderRadius: '100px', position: 'relative', cursor: 'pointer',
            background: `linear-gradient(to right, hsl(${hsl.h},0%,${hsl.l}%), hsl(${hsl.h},100%,${hsl.l}%))`,
            border: '1px solid var(--glass-border)',
          }}
        >
          <div style={{
            position: 'absolute', left: `${hsl.s}%`, top: '50%', transform: 'translate(-50%, -50%)',
            width: '18px', height: '18px', borderRadius: '50%', background: color,
            border: '2.5px solid white', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            pointerEvents: 'none',
          }} />
        </div>
      </div>

      {/* Lightness slider */}
      <div style={{ width: '100%' }}>
        <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: '6px' }}>Lightness</div>
        <div ref={lumRef}
          onMouseDown={(e) => { setDragging('lum'); handleLumInteraction(e); }}
          onTouchStart={(e) => { setDragging('lum'); handleLumInteraction(e.touches[0]); }}
          style={{
            width: '100%', height: '14px', borderRadius: '100px', position: 'relative', cursor: 'pointer',
            background: `linear-gradient(to right, hsl(${hsl.h},${hsl.s}%,0%), hsl(${hsl.h},${hsl.s}%,50%), hsl(${hsl.h},${hsl.s}%,100%))`,
            border: '1px solid var(--glass-border)',
          }}
        >
          <div style={{
            position: 'absolute', left: `${hsl.l}%`, top: '50%', transform: 'translate(-50%, -50%)',
            width: '18px', height: '18px', borderRadius: '50%', background: color,
            border: '2.5px solid white', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            pointerEvents: 'none',
          }} />
        </div>
      </div>
    </div>
  );
}

/* ── Main modal ─────────────────────────────────────────────────────── */

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

  return (
    <div className="asm-overlay" onClick={handleBackdrop}>
      <style>{css(dark)}</style>
      <div className="asm-card">
        <div className="asm-header">
          <div className="asm-header-left">
            <h2 className="asm-title">Add Subject</h2>
          </div>
          <button className="asm-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="asm-form">
          <div className="asm-field">
            <label className="asm-label">Subject name</label>
            <input ref={inputRef} type="text" className="asm-input"
              placeholder="e.g. History, Art, PE…"
              value={name} onChange={(e) => { setName(e.target.value); setError(''); }}
              maxLength={30} />
            <span className="asm-char-count">{name.length}/30</span>
          </div>

          <div className="asm-field">
            <label className="asm-label">Color</label>
            <ColorWheel color={color} onChange={setColor} />
            <div className="asm-preview">
              <span className="asm-preview-chip" style={{ background: color + '22', color: color, borderColor: color + '44' }}>
                {name || 'Subject name'}
              </span>
            </div>
          </div>

          {error && <div className="asm-error">{error}</div>}

          <div className="asm-actions">
            <button type="button" className="asm-btn asm-btn--cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="asm-btn asm-btn--submit">Add Subject</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function css(dark) {
  const t = {
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
    overlay: dark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.35)',
  };
  return `
    @keyframes asmFadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes asmSlideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

    .asm-overlay { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; background: ${t.overlay}; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); animation: asmFadeIn 0.15s ease; }

    .asm-card {
      width: 420px; max-width: calc(100vw - 32px);
      border-radius: ${RADIUS.lg}; overflow: hidden; display: flex; flex-direction: column;
      background: ${t.card}; border: 1px solid ${t.border};
      box-shadow: ${dark ? '0 20px 60px rgba(0,0,0,0.65)' : '0 18px 50px rgba(90,80,60,0.18)'};
      animation: asmSlideUp 0.18s ease;
    }
    .asm-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px 14px; border-bottom: 1px solid ${t.divider}; }
    .asm-header-left { display: flex; align-items: center; gap: 10px; }
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

    .asm-preview { margin-top: 8px; }
    .asm-preview-chip { font-family: ${FONT.body}; font-size: 12px; font-weight: 600; padding: 5px 14px; border-radius: 100px; border: 1px solid; display: inline-block; transition: 0.15s; }

    .asm-error { font-family: ${FONT.body}; font-size: 12px; color: ${t.red}; padding: 8px 12px; background: ${t.red}12; border-radius: ${RADIUS.sm}; border: 1px solid ${t.red}25; }

    .asm-actions { display: flex; justify-content: flex-end; gap: 8px; padding-top: 4px; }
    .asm-btn { font-family: ${FONT.body}; font-size: 13px; font-weight: 600; padding: 9px 18px; border-radius: ${RADIUS.sm}; cursor: pointer; transition: 0.15s; border: none; }
    .asm-btn--cancel { background: ${t.inputBg}; color: ${t.muted}; border: 1px solid ${t.inputBorder}; }
    .asm-btn--cancel:hover { color: ${t.text}; }
    .asm-btn--submit { background: linear-gradient(150deg, ${t.gold}, ${t.emerald}); color: #fff; }
    .asm-btn--submit:hover { filter: brightness(1.05); transform: translateY(-1px); }
  `;
}
