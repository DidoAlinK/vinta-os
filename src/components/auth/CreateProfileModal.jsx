import React, { useState, useRef, useCallback } from 'react';
import { useTheme } from '../../styles/ThemeContext';
import { RADIUS, FONT } from '../../styles/design-tokens';

/**
 * CreateProfileModal — Create a new owner or staff profile.
 *
 * Props:
 *   isOpen: boolean
 *   onClose()
 *   onSubmit({ name, role, phone, pin, picture })
 *   lockedRole?: 'owner' | 'staff'  — if set, role toggle is hidden (used for first-time academy setup)
 *
 * Features:
 *   - Profile picture: preset color avatars + custom image upload
 *   - Role toggle: Owner / Staff
 *   - PIN: required for ALL roles (owner PIN = login credential, staff PIN = action attribution)
 *   - Phone (optional)
 */

const AVATAR_PRESETS = [
  { colors: ['#b3872a', '#0f6b4d'] },
  { colors: ['#7c3aed', '#0ea5e9'] },
  { colors: ['#dc2626', '#ea580c'] },
  { colors: ['#0d9488', '#10b981'] },
  { colors: ['#db2777', '#ec4899'] },
  { colors: ['#6366f1', '#8b5cf6'] },
  { colors: ['#f59e0b', '#ef4444'] },
  { colors: ['#14b8a6', '#06b6d4'] },
];

export default function CreateProfileModal({ isOpen, onClose, onSubmit, lockedRole }) {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const fileInputRef = useRef(null);

  const [name, setName] = useState('');
  const [role, setRole] = useState(lockedRole || 'owner');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [picture, setPicture] = useState(null); // null = default, { type: 'preset', colors: [...] } | { type: 'upload', dataUrl: '...' }
  const [error, setError] = useState('');

  const reset = useCallback(() => {
    setName(''); setRole(lockedRole || 'owner'); setPhone(''); setPin(''); setConfirmPin('');
    setPicture(null); setError('');
  }, [lockedRole]);

  const handleClose = useCallback(() => { reset(); onClose?.(); }, [reset, onClose]);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError('Image must be under 2MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPicture({ type: 'upload', dataUrl: ev.target.result });
      setError('');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required'); return; }
    if (pin.length !== 4) { setError('PIN must be exactly 4 digits'); return; }
    if (pin !== confirmPin) { setError('PINs do not match'); return; }
    onSubmit?.({
      name: name.trim(),
      role,
      phone: phone.trim(),
      pin,
      picture: picture || { type: 'preset', colors: AVATAR_PRESETS[0].colors },
    });
    reset();
  }, [name, role, phone, pin, confirmPin, picture, onSubmit, reset]);

  const handleBackdrop = useCallback((e) => { if (e.target === e.currentTarget) handleClose(); }, [handleClose]);

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
    goldSoft: dark ? 'rgba(224,185,63,0.18)' : 'rgba(179,135,42,0.14)',
    emeraldSoft: dark ? 'rgba(31,174,124,0.18)' : 'rgba(15,107,77,0.14)',
  };

  const initials = name.trim() ? name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';
  const avatarColors = picture?.type === 'preset' ? picture.colors : picture?.type === 'upload' ? null : AVATAR_PRESETS[0].colors;
  const isUpload = picture?.type === 'upload';

  return (
    <div className="cpm-overlay" onClick={handleBackdrop} style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.overlay, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', animation: 'cpmFadeIn 0.15s ease' }}>
      <style>{css(t, dark)}</style>
      <div className="cpm-card">
        {/* Header */}
        <div className="cpm-header">
          <h2 className="cpm-title">{lockedRole === 'owner' ? 'Set up your owner profile' : 'Create profile'}</h2>
          <button className="cpm-close" onClick={handleClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="cpm-form">
          {/* Profile Picture */}
          <div className="cpm-picture-section">
            <div className="cpm-avatar-wrap">
              {isUpload ? (
                <img src={picture.dataUrl} alt="Profile" className="cpm-avatar-img" />
              ) : (
                <div className="cpm-avatar-gradient" style={{ background: `linear-gradient(135deg, ${avatarColors[0]}, ${avatarColors[1]})` }}>
                  <span className="cpm-avatar-initials">{initials}</span>
                </div>
              )}
              <button type="button" className="cpm-avatar-edit" onClick={() => fileInputRef.current?.click()} title="Upload photo">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="cpm-file-input" onChange={handleImageUpload} />
            </div>
            {/* Preset color swatches */}
            <div className="cpm-presets">
              {AVATAR_PRESETS.map((preset, i) => (
                <button key={i} type="button"
                  className={`cpm-preset-btn ${!isUpload && avatarColors?.[0] === preset.colors[0] ? 'cpm-preset--active' : ''}`}
                  onClick={() => setPicture({ type: 'preset', colors: preset.colors })}
                  title={`Avatar ${i + 1}`}
                >
                  <div className="cpm-preset-dot" style={{ background: `linear-gradient(135deg, ${preset.colors[0]}, ${preset.colors[1]})` }} />
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="cpm-field">
            <label className="cpm-label">Profile name</label>
            <input type="text" className="cpm-input" placeholder="e.g. Ali Bensalem" value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }} autoFocus />
          </div>

          {/* Role */}
          {!lockedRole && (
            <div className="cpm-field">
              <label className="cpm-label">Role</label>
              <div className="cpm-role-toggle">
                <button type="button" className={`cpm-role-btn ${role === 'owner' ? 'cpm-role-btn--active' : ''}`}
                  onClick={() => setRole('owner')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                  Owner
                </button>
                <button type="button" className={`cpm-role-btn ${role === 'staff' ? 'cpm-role-btn--active' : ''}`}
                  onClick={() => setRole('staff')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  Staff
                </button>
              </div>
              <p className="cpm-hint">
                {role === 'owner'
                  ? 'Full access to all features, settings, and profile management.'
                  : 'Operational access. Actions are attributed via PIN.'}
              </p>
            </div>
          )}

          {/* Phone (optional) */}
          <div className="cpm-field">
            <label className="cpm-label">Phone <span className="cpm-optional">(optional)</span></label>
            <input type="tel" className="cpm-input" placeholder="+213 6•• •• •• ••" value={phone}
              onChange={(e) => setPhone(e.target.value)} />
          </div>

          {/* PIN */}
          <div className="cpm-field">
            <label className="cpm-label">4-Digit PIN</label>
            <div className="cpm-pin-row">
              {[0,1,2,3].map(i => (
                <input key={i} type="password" maxLength={1} inputMode="numeric" className="cpm-pin-box"
                  value={pin[i] || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    const newPin = pin.slice(0, i) + val + pin.slice(i + 1);
                    setPin(newPin.slice(0, 4));
                    setError('');
                    if (val && i < 3) {
                      const next = e.target.parentElement.querySelector(`input[data-idx="${i+1}"]`);
                      next?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !pin[i] && i > 0) {
                      const prev = e.target.parentElement.querySelector(`input[data-idx="${i-1}"]`);
                      prev?.focus();
                    }
                  }}
                  data-idx={i}
                />
              ))}
            </div>
            <p className="cpm-hint">
              {role === 'owner'
                ? 'Used to log in to your owner account.'
                : 'Used to attribute actions in the system.'}
            </p>
          </div>

          {/* Confirm PIN */}
          <div className="cpm-field">
            <label className="cpm-label">Confirm PIN</label>
            <div className="cpm-pin-row">
              {[0,1,2,3].map(i => (
                <input key={i} type="password" maxLength={1} inputMode="numeric" className={`cpm-pin-box ${confirmPin && pin !== confirmPin.slice(0, i+1) ? 'cpm-pin-box--error' : ''}`}
                  value={confirmPin[i] || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    const newPin = confirmPin.slice(0, i) + val + confirmPin.slice(i + 1);
                    setConfirmPin(newPin.slice(0, 4));
                    setError('');
                    if (val && i < 3) {
                      const next = e.target.parentElement.querySelector(`input[data-idx="${i+1}"]`);
                      next?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !confirmPin[i] && i > 0) {
                      const prev = e.target.parentElement.querySelector(`input[data-idx="${i-1}"]`);
                      prev?.focus();
                    }
                  }}
                  data-idx={i}
                />
              ))}
            </div>
            {confirmPin && pin !== confirmPin && (
              <p className="cpm-pin-mismatch">PINs do not match</p>
            )}
          </div>

          {/* Error */}
          {error && <div className="cpm-error">{error}</div>}

          {/* Actions */}
          <div className="cpm-actions">
            <button type="button" className="cpm-btn cpm-btn--cancel" onClick={handleClose}>Cancel</button>
            <button type="submit" className="cpm-btn cpm-btn--submit"
              disabled={!name.trim() || pin.length !== 4 || pin !== confirmPin}>
              {lockedRole === 'owner' ? 'Set up owner' : 'Create profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function css(t, dark) {
  return `
    @keyframes cpmFadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes cpmSlideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

    .cpm-card {
      width: 440px; max-width: calc(100vw - 32px); max-height: calc(100vh - 40px);
      border-radius: ${RADIUS.lg}; overflow: hidden; display: flex; flex-direction: column;
      background: ${t.card}; border: 1px solid ${t.border};
      box-shadow: ${dark ? '0 20px 60px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.05) inset' : '0 18px 50px rgba(90,80,60,0.18), 0 0 0 1px rgba(255,255,255,0.5) inset'};
      animation: cpmSlideUp 0.18s ease;
    }

    .cpm-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 14px; }
    .cpm-title { font-family: ${FONT.heading}; font-size: 20px; font-weight: 700; color: ${t.text}; margin: 0; }
    .cpm-close { width: 32px; height: 32px; border-radius: 8px; border: none; background: transparent; color: ${t.muted}; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.15s; }
    .cpm-close:hover { background: ${t.inputBg}; color: ${t.text}; }

    .cpm-form { padding: 0 24px 24px; display: flex; flex-direction: column; gap: 18px; overflow-y: auto; }

    /* ── Profile Picture ─────────────────────────────────────── */
    .cpm-picture-section { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 8px 0 4px; }
    .cpm-avatar-wrap { position: relative; width: 72px; height: 72px; }
    .cpm-avatar-gradient { width: 100%; height: 100%; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
    .cpm-avatar-initials { font-family: ${FONT.heading}; font-size: 26px; font-weight: 700; color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,0.2); }
    .cpm-avatar-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
    .cpm-avatar-edit { position: absolute; bottom: -2px; right: -2px; width: 28px; height: 28px; border-radius: 50%; background: ${t.gold}; color: #fff; border: 2.5px solid ${t.card}; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.15s; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
    .cpm-avatar-edit:hover { transform: scale(1.1); }
    .cpm-file-input { display: none; }

    .cpm-presets { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
    .cpm-preset-btn { width: 28px; height: 28px; border-radius: 50%; border: 2.5px solid transparent; background: transparent; cursor: pointer; padding: 0; display: flex; align-items: center; justify-content: center; transition: 0.15s; }
    .cpm-preset-btn:hover { transform: scale(1.15); }
    .cpm-preset--active { border-color: ${t.text}; }
    .cpm-preset-dot { width: 20px; height: 20px; border-radius: 50%; }

    /* ── Fields ──────────────────────────────────────────────── */
    .cpm-field { display: flex; flex-direction: column; gap: 5px; }
    .cpm-label { font-family: ${FONT.body}; font-size: 12px; font-weight: 600; color: ${t.muted}; letter-spacing: 0.2px; }
    .cpm-optional { font-weight: 400; opacity: 0.6; }
    .cpm-input { width: 100%; padding: 10px 12px; border-radius: ${RADIUS.sm}; border: 1px solid ${t.inputBorder}; background: ${t.inputBg}; color: ${t.text}; font-family: ${FONT.body}; font-size: 13px; outline: none; transition: border-color 0.15s; box-sizing: border-box; }
    .cpm-input:focus { border-color: ${t.gold}; }
    .cpm-input::placeholder { color: ${t.muted}; }

    /* ── Role Toggle ─────────────────────────────────────────── */
    .cpm-role-toggle { display: flex; gap: 4px; padding: 3px; border-radius: ${RADIUS.sm}; background: ${t.inputBg}; border: 1px solid ${t.inputBorder}; }
    .cpm-role-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 9px 12px; border: none; border-radius: 7px; background: transparent; font-family: ${FONT.body}; font-size: 12.5px; font-weight: 500; color: ${t.muted}; cursor: pointer; transition: 0.15s; }
    .cpm-role-btn:hover { color: ${t.text}; }
    .cpm-role-btn--active { background: ${t.gold}; color: #fff; font-weight: 600; box-shadow: 0 2px 8px ${t.gold}40; }

    /* ── PIN Boxes ───────────────────────────────────────────── */
    .cpm-pin-row { display: flex; gap: 8px; }
    .cpm-pin-box { width: 48px; height: 52px; text-align: center; font-family: ${FONT.heading}; font-size: 20px; font-weight: 700; color: ${t.text}; border-radius: ${RADIUS.sm}; border: 1.5px solid ${t.inputBorder}; background: ${t.inputBg}; outline: none; transition: border-color 0.15s, box-shadow 0.15s; caret-color: ${t.gold}; }
    .cpm-pin-box:focus { border-color: ${t.gold}; box-shadow: 0 0 0 3px ${t.gold}20; }
    .cpm-pin-box--error { border-color: ${t.red}; }
    .cpm-pin-mismatch { font-family: ${FONT.body}; font-size: 11px; color: ${t.red}; margin-top: 2px; }

    .cpm-hint { font-family: ${FONT.body}; font-size: 11.5px; color: ${t.muted}; margin-top: 2px; line-height: 1.4; }

    .cpm-error { font-family: ${FONT.body}; font-size: 12px; color: ${t.red}; padding: 8px 12px; background: ${t.red}12; border-radius: ${RADIUS.sm}; border: 1px solid ${t.red}25; }

    .cpm-actions { display: flex; justify-content: flex-end; gap: 8px; padding-top: 4px; }
    .cpm-btn { font-family: ${FONT.body}; font-size: 13px; font-weight: 600; padding: 10px 20px; border-radius: ${RADIUS.sm}; cursor: pointer; transition: 0.15s; border: none; }
    .cpm-btn:disabled { opacity: 0.45; cursor: not-allowed; }
    .cpm-btn--cancel { background: ${t.inputBg}; color: ${t.muted}; border: 1px solid ${t.inputBorder}; }
    .cpm-btn--cancel:hover:not(:disabled) { background: ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)'}; color: ${t.text}; }
    .cpm-btn--submit { background: linear-gradient(150deg, ${t.gold}, ${t.emerald}); color: #fff; box-shadow: 0 2px 10px ${t.gold}30; }
    .cpm-btn--submit:hover:not(:disabled) { filter: brightness(1.05); transform: translateY(-1px); }

    @media (max-width: 500px) {
      .cpm-card { max-height: calc(100vh - 20px); }
      .cpm-pin-box { width: 42px; height: 46px; font-size: 18px; }
      .cpm-form { padding: 0 16px 16px; }
      .cpm-header { padding: 16px 16px 12px; }
    }
  `;
}
