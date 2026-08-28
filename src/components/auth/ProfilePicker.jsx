import React, { useState, useCallback, useEffect, useRef } from 'react';
import { RADIUS, FONT } from '../../styles/design-tokens';

/**
 * ProfilePicker — Profile selection screen after authentication.
 *
 * Props:
 *   profiles — Array of { id, name, role, avatarColors: [color1, color2] }
 *   onSelect(profileId) — Called when a profile card is clicked
 *   onLogout()          — Called when "Login as different user" is clicked
 *
 * Renders squircle avatars with gradient, name, and role badge.
 * Features staggered fade-in entrance animation.
 * All data is prop-driven; zero hardcoded values.
 */
export default function ProfilePicker({ profiles = [], onSelect, onLogout }) {
  const [entered, setEntered] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!hasAnimated.current) {
      hasAnimated.current = true;
      const raf = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(raf);
    }
  }, []);

  const handleClick = useCallback(
    (id) => {
      onSelect(id);
    },
    [onSelect],
  );

  const handleKeyDown = useCallback(
    (e, id) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(id);
      }
    },
    [onSelect],
  );

  /**
   * Derive initials from the profile name.
   * Takes first letter of first + last word.
   */
  function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  /**
   * Map role strings to display-friendly labels.
   * Only transforms if a value exists — nothing hardcoded.
   */
  function roleLabel(role) {
    if (!role) return '';
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }

  return (
    <div className="profile-screen">
      <div className="profile-container">
        {/* ── Header ────────────────────────────────────────────── */}
        <div className="profile-header">
          <h1 className="profile-title">Who's logging in?</h1>
          <p className="profile-subtitle">Select your profile to continue</p>
        </div>

        {/* ── Profile grid ──────────────────────────────────────── */}
        <div className="profile-grid">
          {profiles.map((profile, idx) => {
            const initials = getInitials(profile.name);
            const [c1, c2] = profile.avatarColors || ['var(--gold)', 'var(--emerald)'];
            const delay = idx * 80; // staggered entrance

            return (
              <button
                key={profile.id}
                className={`profile-card ${entered ? 'visible' : ''} ${hoveredId === profile.id ? 'hovered' : ''}`}
                style={{ transitionDelay: `${delay}ms` }}
                onClick={() => handleClick(profile.id)}
                onKeyDown={(e) => handleKeyDown(e, profile.id)}
                onMouseEnter={() => setHoveredId(profile.id)}
                onMouseLeave={() => setHoveredId(null)}
                type="button"
                aria-label={`Log in as ${profile.name}, ${roleLabel(profile.role)}`}
              >
                {/* Squircle avatar */}
                <div
                  className="profile-avatar"
                  style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                >
                  <span className="profile-initials">{initials}</span>
                </div>

                {/* Name */}
                <span className="profile-name">{profile.name}</span>

                {/* Role badge */}
                {profile.role && (
                  <span className={`profile-role role-${profile.role}`}>
                    {roleLabel(profile.role)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Logout link ───────────────────────────────────────── */}
        <button className="profile-logout" onClick={onLogout} type="button">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Login as different user
        </button>
      </div>

      <style>{`
        .profile-screen {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 24px;
        }

        .profile-container {
          width: 100%;
          max-width: 560px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* ── Header ────────────────────────────────────────────── */
        .profile-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .profile-title {
          font-family: ${FONT.heading};
          font-size: 24px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 6px;
        }
        .profile-subtitle {
          font-size: 14px;
          color: var(--muted);
        }

        /* ── Grid ──────────────────────────────────────────────── */
        .profile-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 16px;
          width: 100%;
          margin-bottom: 28px;
        }

        /* ── Card ──────────────────────────────────────────────── */
        .profile-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 22px 16px 18px;
          background: var(--glass);
          border: 1px solid var(--glass-border);
          border-radius: ${RADIUS.lg};
          box-shadow: var(--glass-shadow);
          backdrop-filter: blur(40px) saturate(180%);
          -webkit-backdrop-filter: blur(40px) saturate(180%);
          cursor: pointer;
          transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;

          /* entrance: hidden by default */
          opacity: 0;
          transform: translateY(16px) scale(0.96);
        }
        .profile-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: var(--sheen);
          pointer-events: none;
        }
        .profile-card > * {
          position: relative;
          z-index: 1;
        }

        /* staggered entrance */
        .profile-card.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .profile-card.hovered,
        .profile-card:hover {
          transform: translateY(-4px) scale(1.03);
          box-shadow: 0 12px 32px rgba(0,0,0,0.15), var(--glass-shadow);
          border-color: var(--gold);
        }
        .profile-card:focus-visible {
          outline: 2px solid var(--gold);
          outline-offset: 2px;
        }
        .profile-card:active {
          transform: translateY(-1px) scale(1.01);
        }

        /* ── Avatar (squircle) ─────────────────────────────────── */
        .profile-avatar {
          width: 64px;
          height: 64px;
          border-radius: ${RADIUS.md};
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.12);
        }
        .profile-initials {
          color: #fff;
          font-family: ${FONT.heading};
          font-weight: 700;
          font-size: 20px;
          letter-spacing: 1px;
          text-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }

        /* ── Name ──────────────────────────────────────────────── */
        .profile-name {
          font-family: ${FONT.body};
          font-weight: 600;
          font-size: 13.5px;
          color: var(--text);
          text-align: center;
          line-height: 1.2;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ── Role badge ────────────────────────────────────────── */
        .profile-role {
          font-size: 10.5px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 100px;
          text-transform: capitalize;
          letter-spacing: 0.03em;
        }
        .role-owner {
          color: var(--gold);
          background: var(--gold-soft);
        }
        .role-admin {
          color: var(--violet);
          background: var(--violet-soft);
        }
        .role-teacher {
          color: var(--emerald);
          background: var(--emerald-soft);
        }
        .role-student {
          color: var(--text);
          background: var(--slot-bg);
        }
        /* fallback for any other role */
        .profile-role:not(.role-owner):not(.role-admin):not(.role-teacher):not(.role-student) {
          color: var(--muted);
          background: var(--slot-bg);
        }

        /* ── Logout link ───────────────────────────────────────── */
        .profile-logout {
          display: flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          color: var(--muted);
          font-family: ${FONT.body};
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          padding: 8px 14px;
          border-radius: 100px;
          transition: 0.15s ease;
        }
        .profile-logout:hover {
          color: var(--text);
          background: var(--slot-hover);
        }
        .profile-logout svg {
          opacity: 0.7;
          transition: 0.15s;
        }
        .profile-logout:hover svg {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
