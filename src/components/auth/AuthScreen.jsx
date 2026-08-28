import React, { useState, useCallback } from 'react';
import { RADIUS, FONT } from '../../styles/design-tokens';

/**
 * AuthScreen — Login / Signup form for Vinta School OS.
 *
 * Props:
 *   onLogin(email, password)          — called on login submit
 *   onSignup(name, email, phone, password, academyName) — called on signup submit
 *
 * All data is prop-driven; zero hardcoded values.
 */
export default function AuthScreen({ onLogin, onSignup }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /* ── Field state ──────────────────────────────────────────────── */
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [academyName, setAcademyName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const resetFields = useCallback(() => {
    setName('');
    setEmail('');
    setPhone('');
    setAcademyName('');
    setPassword('');
    setError('');
  }, []);

  const switchMode = useCallback(
    (next) => {
      setMode(next);
      resetFields();
    },
    [resetFields],
  );

  /* ── Validation ───────────────────────────────────────────────── */
  const validate = useCallback(() => {
    if (mode === 'login') {
      if (!email.trim()) return 'Email is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
      if (!password) return 'Password is required.';
      if (password.length < 6) return 'Password must be at least 6 characters.';
    } else {
      if (!name.trim()) return 'Full name is required.';
      if (!email.trim()) return 'Email is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
      if (!phone.trim()) return 'Phone number is required.';
      if (!academyName.trim()) return 'Academy name is required.';
      if (!password) return 'Password is required.';
      if (password.length < 6) return 'Password must be at least 6 characters.';
    }
    return '';
  }, [mode, name, email, phone, academyName, password]);

  /* ── Submit ───────────────────────────────────────────────────── */
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const validationError = validate();
      if (validationError) {
        setError(validationError);
        return;
      }
      setError('');
      setLoading(true);
      try {
        if (mode === 'login') {
          onLogin(email.trim(), password);
        } else {
          onSignup(name.trim(), email.trim(), phone.trim(), password, academyName.trim());
        }
      } catch (err) {
        setError(err.message || 'Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [mode, name, email, phone, academyName, password, validate, onLogin, onSignup],
  );

  return (
    <div className="auth-screen">
      <div className="auth-card glass">
        {/* ── Logo / Brand ──────────────────────────────────────── */}
        <div className="auth-brand">
          <div className="auth-logo">
            <svg viewBox="0 0 32 32" width="32" height="32" fill="none">
              <rect width="32" height="32" rx="10" fill="url(#logo-grad)" />
              <path d="M9 22V10l7 6-7 6z" fill="#fff" opacity="0.95" />
              <path d="M17 22V10l7 6-7 6z" fill="#fff" opacity="0.6" />
              <defs>
                <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32">
                  <stop offset="0%" stopColor="var(--gold, #b3872a)" />
                  <stop offset="100%" stopColor="var(--emerald, #0f6b4d)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="auth-title">Vinta School OS</h1>
          <p className="auth-subtitle">
            {mode === 'login' ? 'Sign in to your account' : 'Create your academy account'}
          </p>
        </div>

        {/* ── Mode Toggle ───────────────────────────────────────── */}
        <div className="auth-toggle">
          <button
            className={`toggle-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}
            type="button"
          >
            Log In
          </button>
          <button
            className={`toggle-btn ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => switchMode('signup')}
            type="button"
          >
            Sign Up
          </button>
        </div>

        {/* ── Error ─────────────────────────────────────────────── */}
        {error && (
          <div className="auth-error" role="alert">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* ── Form ──────────────────────────────────────────────── */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {mode === 'signup' && (
            <div className="field-group">
              <label className="field-label" htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name"
                className="field-input"
                type="text"
                placeholder="e.g. Ahmed Benali"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          )}

          <div className="field-group">
            <label className="field-label" htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email"
              className="field-input"
              type="email"
              placeholder="you@academy.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          {mode === 'signup' && (
            <div className="field-group">
              <label className="field-label" htmlFor="auth-phone">Phone Number</label>
              <input
                id="auth-phone"
                className="field-input"
                type="tel"
                placeholder="+213 555 00 00 00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </div>
          )}

          {mode === 'signup' && (
            <div className="field-group">
              <label className="field-label" htmlFor="auth-academy">Academy Name</label>
              <input
                id="auth-academy"
                className="field-input"
                type="text"
                placeholder="e.g. Excellence Academy"
                value={academyName}
                onChange={(e) => setAcademyName(e.target.value)}
                autoComplete="organization"
              />
            </div>
          )}

          <div className="field-group">
            <label className="field-label" htmlFor="auth-password">Password</label>
            <div className="password-wrap">
              <input
                id="auth-password"
                className="field-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner" />
            ) : mode === 'login' ? (
              'Log In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>
      </div>

      <style>{`
        .auth-screen {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 24px;
          animation: authFadeIn 0.5s ease both;
        }
        @keyframes authFadeIn {
          from { opacity: 0; transform: scale(0.97) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        .auth-card {
          width: 100%;
          max-width: 420px;
          padding: 36px 32px 32px;
          border-radius: ${RADIUS.xl};
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* ── Brand ─────────────────────────────────────────────── */
        .auth-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 24px;
        }
        .auth-logo {
          width: 52px; height: 52px;
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          background: var(--glass);
          border: 1px solid var(--glass-border);
          margin-bottom: 14px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }
        .auth-title {
          font-family: ${FONT.heading};
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 4px;
        }
        .auth-subtitle {
          font-size: 13px;
          color: var(--muted);
        }

        /* ── Toggle ────────────────────────────────────────────── */
        .auth-toggle {
          display: flex;
          gap: 3px;
          padding: 3px;
          background: var(--input-bg);
          border: 1px solid var(--glass-border);
          border-radius: 100px;
          margin-bottom: 20px;
        }
        .toggle-btn {
          flex: 1;
          border: none;
          background: transparent;
          color: var(--muted);
          font-size: 12.5px;
          font-weight: 600;
          padding: 8px 0;
          border-radius: 100px;
          cursor: pointer;
          transition: 0.2s ease;
          font-family: ${FONT.body};
        }
        .toggle-btn.active {
          background: linear-gradient(150deg, var(--gold), var(--emerald));
          color: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }
        .toggle-btn:not(.active):hover {
          color: var(--text);
          background: var(--slot-hover);
        }

        /* ── Error ─────────────────────────────────────────────── */
        .auth-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          margin-bottom: 16px;
          background: var(--red-soft);
          color: var(--red);
          border-radius: ${RADIUS.sm};
          border: 1px solid var(--red);
          border-color: color-mix(in srgb, var(--red) 25%, transparent);
          font-size: 12.5px;
          font-weight: 500;
          animation: errorShake 0.35s ease;
        }
        @keyframes errorShake {
          0%, 100% { transform: translateX(0); }
          20%      { transform: translateX(-6px); }
          40%      { transform: translateX(6px); }
          60%      { transform: translateX(-4px); }
          80%      { transform: translateX(4px); }
        }

        /* ── Form ──────────────────────────────────────────────── */
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .auth-form .field-group {
          margin-bottom: 14px;
        }
        .auth-form .field-input {
          width: 100%;
          background: var(--input-bg);
          border: 1px solid var(--glass-border);
          border-radius: ${RADIUS.sm};
          padding: 11px 14px;
          color: var(--text);
          font-family: ${FONT.body};
          font-size: 13.5px;
          outline: none;
          transition: 0.15s ease;
        }
        .auth-form .field-input::placeholder {
          color: var(--muted);
          opacity: 0.6;
        }
        .auth-form .field-input:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px var(--gold-soft);
        }
        .auth-form .field-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 6px;
        }

        /* ── Password ──────────────────────────────────────────── */
        .password-wrap {
          position: relative;
        }
        .password-wrap .field-input {
          padding-right: 40px;
        }
        .password-toggle {
          position: absolute;
          right: 4px;
          top: 50%;
          transform: translateY(-50%);
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          border: none;
          background: transparent;
          color: var(--muted);
          cursor: pointer;
          border-radius: 8px;
          transition: 0.15s;
        }
        .password-toggle:hover {
          color: var(--text);
          background: var(--slot-hover);
        }

        /* ── Submit ────────────────────────────────────────────── */
        .auth-submit {
          width: 100%;
          margin-top: 6px;
          padding: 13px 0;
          background: linear-gradient(150deg, var(--gold), var(--emerald));
          color: #fff;
          border: none;
          border-radius: ${RADIUS.md};
          font-family: ${FONT.body};
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 46px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }
        .auth-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 22px rgba(0,0,0,0.18);
        }
        .auth-submit:active:not(:disabled) {
          transform: translateY(0);
        }
        .auth-submit:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        /* ── Spinner ───────────────────────────────────────────── */
        .spinner {
          width: 20px; height: 20px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
