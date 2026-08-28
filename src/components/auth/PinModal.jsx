import React, { useState, useCallback, useEffect, useRef } from 'react';
import { RADIUS, FONT } from '../../styles/design-tokens';

const PIN_LENGTH = 4;

const KEYPAD_KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['backspace', '0', 'confirm'],
];

/**
 * PinModal — 4-digit PIN entry modal for non-owner profiles.
 *
 * Props:
 *   profile    — { name, role }  (displayed at top)
 *   onVerify(pin) — Called with the 4-digit PIN string when submitted
 *   onCancel() — Called when the user cancels / closes the modal
 *   error      — string | null — error message to display (e.g. "Incorrect PIN")
 *
 * Features:
 *   - 4 circular digit displays that fill as digits are entered
 *   - Numeric keypad (1–9, 0, backspace, confirm)
 *   - Loading state while verifying
 *   - Error shake animation on wrong PIN
 *   - Auto-focus on keyboard input
 *   - All data is prop-driven; zero hardcoded values.
 */
export default function PinModal({ profile, onVerify, onCancel, error }) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);
  const prevErrorRef = useRef(error);
  const pinRef = useRef(pin);

  // Keep ref in sync
  pinRef.current = pin;

  /* ── Shake on new error ───────────────────────────────────────── */
  useEffect(() => {
    if (error && error !== prevErrorRef.current) {
      setShaking(true);
      const timer = setTimeout(() => setShaking(false), 420);
      prevErrorRef.current = error;
      return () => clearTimeout(timer);
    }
    if (!error) {
      prevErrorRef.current = error;
    }
  }, [error]);

  /* ── Auto-submit when PIN is complete ─────────────────────────── */
  useEffect(() => {
    if (pin.length === PIN_LENGTH && !loading) {
      setLoading(true);
      // Brief delay to show loading state, then verify
      const timer = setTimeout(() => {
        onVerify(pin);
        setLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pin, loading, onVerify]);

  /* ── Reset pin when error changes (parent signals wrong PIN) ──── */
  useEffect(() => {
    if (error) {
      setPin('');
    }
  }, [error]);

  /* ── Physical keyboard support ────────────────────────────────── */
  useEffect(() => {
    function handleKey(e) {
      if (loading) return;
      if (e.key >= '0' && e.key <= '9') {
        setPin((prev) => (prev.length < PIN_LENGTH ? prev + e.key : prev));
      } else if (e.key === 'Backspace') {
        setPin((prev) => prev.slice(0, -1));
      } else if (e.key === 'Escape') {
        onCancel();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [loading, onCancel]);

  /* ── Keypad handler ───────────────────────────────────────────── */
  const handleKeyPad = useCallback(
    (key) => {
      if (loading) return;

      if (key === 'backspace') {
        setPin((prev) => prev.slice(0, -1));
      } else if (key === 'confirm') {
        if (pin.length === PIN_LENGTH) {
          setLoading(true);
          onVerify(pin);
        }
      } else {
        // Digit
        setPin((prev) => (prev.length < PIN_LENGTH ? prev + key : prev));
      }
    },
    [loading, pin, onVerify],
  );

  /* ── Render helpers ───────────────────────────────────────────── */
  function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function roleLabel(role) {
    if (!role) return '';
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }

  return (
    <div className="pin-overlay" onClick={onCancel}>
      <div
        className={`pin-modal glass ${shaking ? 'shake' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="PIN entry"
        aria-modal="true"
      >
        {/* ── Close button ────────────────────────────────────── */}
        <button className="pin-close" onClick={onCancel} type="button" aria-label="Cancel">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* ── Profile info ────────────────────────────────────── */}
        <div className="pin-profile">
          {profile?.avatarColors ? (
            <div
              className="pin-avatar"
              style={{ background: `linear-gradient(135deg, ${profile.avatarColors[0]}, ${profile.avatarColors[1]})` }}
            >
              <span>{getInitials(profile.name)}</span>
            </div>
          ) : (
            <div className="pin-avatar pin-avatar-fallback">
              <span>{getInitials(profile?.name)}</span>
            </div>
          )}
          <span className="pin-name">{profile?.name}</span>
          {profile?.role && (
            <span className={`pin-role role-${profile.role}`}>{roleLabel(profile.role)}</span>
          )}
        </div>

        {/* ── Prompt ──────────────────────────────────────────── */}
        <p className="pin-prompt">Enter your 4-digit PIN</p>

        {/* ── PIN dots ────────────────────────────────────────── */}
        <div className="pin-dots" aria-live="polite">
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <div
              key={i}
              className={`pin-dot ${i < pin.length ? 'filled' : ''} ${loading ? 'loading' : ''}`}
            >
              {i < pin.length && !loading && (
                <span className="pin-dot-inner" />
              )}
              {loading && (
                <span className="pin-dot-loading" />
              )}
            </div>
          ))}
        </div>

        {/* ── Error ───────────────────────────────────────────── */}
        {error && (
          <p className="pin-error" role="alert">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {error}
          </p>
        )}

        {/* ── Keypad ──────────────────────────────────────────── */}
        <div className="pin-keypad">
          {KEYPAD_KEYS.map((row, ri) => (
            <div key={ri} className="pin-keypad-row">
              {row.map((key) => {
                if (key === 'backspace') {
                  return (
                    <button
                      key={key}
                      className="pin-key pin-key-action"
                      onClick={() => handleKeyPad('backspace')}
                      type="button"
                      aria-label="Backspace"
                      disabled={loading}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z" />
                        <line x1="18" y1="9" x2="12" y2="15" />
                        <line x1="12" y1="9" x2="18" y2="15" />
                      </svg>
                    </button>
                  );
                }
                if (key === 'confirm') {
                  return (
                    <button
                      key={key}
                      className="pin-key pin-key-confirm"
                      onClick={() => handleKeyPad('confirm')}
                      type="button"
                      aria-label="Confirm PIN"
                      disabled={loading || pin.length !== PIN_LENGTH}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </button>
                  );
                }
                return (
                  <button
                    key={key}
                    className="pin-key pin-key-digit"
                    onClick={() => handleKeyPad(key)}
                    type="button"
                    disabled={loading}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        /* ── Overlay ───────────────────────────────────────────── */
        .pin-overlay {
          position: fixed;
          inset: 0;
          background: rgba(10, 10, 10, 0.45);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 20px;
          animation: overlayFadeIn 0.2s ease;
        }
        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* ── Modal ────────────────────────────────────────────── */
        .pin-modal {
          width: 100%;
          max-width: 340px;
          padding: 32px 28px 24px;
          border-radius: ${RADIUS.xl};
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          position: relative;
          animation: modalPopIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes modalPopIn {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* ── Shake ────────────────────────────────────────────── */
        .pin-modal.shake {
          animation: pinShake 0.4s ease;
        }
        @keyframes pinShake {
          0%, 100% { transform: translateX(0); }
          10%      { transform: translateX(-10px); }
          20%      { transform: translateX(10px); }
          30%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          50%      { transform: translateX(-5px); }
          60%      { transform: translateX(5px); }
          70%      { transform: translateX(-3px); }
          80%      { transform: translateX(3px); }
        }

        /* ── Close ────────────────────────────────────────────── */
        .pin-close {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 32px; height: 32px;
          border-radius: ${RADIUS.xs};
          border: 1px solid var(--glass-border);
          background: var(--glass);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--muted);
          cursor: pointer;
          transition: 0.15s;
          z-index: 2;
        }
        .pin-close:hover {
          color: var(--text);
          background: var(--glass-strong);
        }

        /* ── Profile info ─────────────────────────────────────── */
        .pin-profile {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          margin-bottom: 14px;
        }
        .pin-avatar {
          width: 56px; height: 56px;
          border-radius: ${RADIUS.md};
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-family: ${FONT.heading};
          font-weight: 700;
          font-size: 18px;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.12);
        }
        .pin-avatar-fallback {
          background: linear-gradient(150deg, var(--gold), var(--emerald));
        }
        .pin-name {
          font-family: ${FONT.heading};
          font-weight: 600;
          font-size: 15px;
          color: var(--text);
        }
        .pin-role {
          font-size: 10.5px;
          font-weight: 600;
          padding: 2px 10px;
          border-radius: 100px;
        }
        .pin-role.role-owner {
          color: var(--gold);
          background: var(--gold-soft);
        }
        .pin-role.role-admin {
          color: var(--violet);
          background: var(--violet-soft);
        }
        .pin-role.role-teacher {
          color: var(--emerald);
          background: var(--emerald-soft);
        }
        .pin-role.role-student {
          color: var(--text);
          background: var(--slot-bg);
        }

        /* ── Prompt ───────────────────────────────────────────── */
        .pin-prompt {
          font-size: 13px;
          color: var(--muted);
          margin: 0 0 16px;
        }

        /* ── PIN dots ─────────────────────────────────────────── */
        .pin-dots {
          display: flex;
          gap: 14px;
          margin-bottom: 10px;
        }
        .pin-dot {
          width: 48px; height: 48px;
          border-radius: 50%;
          border: 2px solid var(--glass-border);
          background: var(--input-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: 0.2s ease;
        }
        .pin-dot.filled {
          border-color: var(--gold);
          background: var(--gold-soft);
        }
        .pin-dot-inner {
          width: 14px; height: 14px;
          border-radius: 50%;
          background: var(--gold);
          animation: dotAppear 0.15s ease;
        }
        @keyframes dotAppear {
          from { transform: scale(0); }
          to   { transform: scale(1); }
        }
        .pin-dot.loading {
          border-color: var(--muted);
        }
        .pin-dot-loading {
          width: 10px; height: 10px;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: var(--gold);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ── Error ────────────────────────────────────────────── */
        .pin-error {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 500;
          color: var(--red);
          background: var(--red-soft);
          padding: 8px 14px;
          border-radius: ${RADIUS.sm};
          border: 1px solid color-mix(in srgb, var(--red) 25%, transparent);
          margin: 4px 0 8px;
          animation: errorShake 0.35s ease;
        }
        @keyframes errorShake {
          0%, 100% { transform: translateX(0); }
          20%      { transform: translateX(-5px); }
          40%      { transform: translateX(5px); }
          60%      { transform: translateX(-3px); }
          80%      { transform: translateX(3px); }
        }

        /* ── Keypad ───────────────────────────────────────────── */
        .pin-keypad {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
          max-width: 260px;
          margin-top: 12px;
        }
        .pin-keypad-row {
          display: flex;
          justify-content: center;
          gap: 12px;
        }
        .pin-key {
          width: 64px; height: 52px;
          border-radius: ${RADIUS.sm};
          border: 1px solid var(--glass-border);
          background: var(--glass);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: 0.12s ease;
          color: var(--text);
          font-family: ${FONT.heading};
          -webkit-tap-highlight-color: transparent;
        }
        .pin-key:hover:not(:disabled) {
          background: var(--glass-strong);
          transform: translateY(-1px);
        }
        .pin-key:active:not(:disabled) {
          transform: translateY(0) scale(0.96);
        }
        .pin-key:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .pin-key-digit {
          font-size: 20px;
          font-weight: 600;
        }

        .pin-key-action {
          color: var(--muted);
          background: transparent;
          border-color: transparent;
        }
        .pin-key-action:hover:not(:disabled) {
          color: var(--text);
          background: var(--slot-hover);
        }

        .pin-key-confirm {
          background: linear-gradient(150deg, var(--gold), var(--emerald));
          border-color: transparent;
          color: #fff;
        }
        .pin-key-confirm:hover:not(:disabled) {
          box-shadow: 0 4px 14px rgba(0,0,0,0.15);
        }
        .pin-key-confirm:disabled {
          background: var(--glass);
          color: var(--muted);
          border: 1px solid var(--glass-border);
        }
      `}</style>
    </div>
  );
}
