import React, { useState, useCallback, useEffect, useRef } from 'react';
import { RADIUS, FONT } from '../../styles/design-tokens';

/**
 * ProfilePicker — Profile selection screen after authentication.
 *
 * Props:
 *   profiles — Array of { id, name, role, avatarColors: [color1, color2] }
 *   onSelect(profileId) — Called when a profile card is clicked
 *   onCreateProfile()  — Called when "Create your first profile" is clicked (when profiles is empty)
 *   onLogout()          — Called when "Login as different user" is clicked
 *
 * When profiles is empty, shows a prominent "Create your first profile" CTA
 * instead of an empty grid.
 */
export default function ProfilePicker({ profiles = [], onSelect, onCreateProfile, onLogout }) {
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

  const handleClick = useCallback((id) => { onSelect(id); }, [onSelect]);
  const handleKeyDown = useCallback((e, id) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(id); }
  }, [onSelect]);

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

  const isEmpty = profiles.length === 0;

  return (
    <div className="profile-screen">
      <div className="profile-container">
        <div className="profile-header">
          <h1 className="profile-title">
            {isEmpty ? 'Welcome to Vinta School OS' : "Who's logging in?"}
          </h1>
          <p className="profile-subtitle">
            {isEmpty
              ? 'Create your first profile to get started.'
              : 'Select your profile to continue'}
          </p>
        </div>

        {isEmpty ? (
          /* ── Empty state: Create first profile ──────────────── */
          <div className={`profile-empty ${entered ? 'visible' : ''}`}>
            <div className="empty-icon-wrap">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gold, #b3872a)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <p className="empty-text">No profiles yet. Create the owner or first staff account to begin managing your academy.</p>
            <button className="create-profile-btn" onClick={onCreateProfile}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create your first profile
            </button>
          </div>
        ) : (
          /* ── Profile grid ──────────────────────────────────── */
          <div className="profile-grid">
            {profiles.map((profile, idx) => {
              const initials = getInitials(profile.name);
              const [c1, c2] = profile.avatarColors || ['var(--gold)', 'var(--emerald)'];
              const delay = idx * 80;
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
                  <div className="profile-avatar" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                    <span className="profile-initials">{initials}</span>
                  </div>
                  <span className="profile-name">{profile.name}</span>
                  {profile.role && (
                    <span className={`profile-role role-${profile.role}`}>{roleLabel(profile.role)}</span>
                  )}
                </button>
              );
            })}
            {/* Add another profile card */}
            <button className={`profile-card profile-card--add ${entered ? 'visible' : ''}`}
                    style={{ transitionDelay: `${profiles.length * 80}ms` }}
                    onClick={onCreateProfile} type="button">
              <div className="profile-avatar profile-avatar--add">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <span className="profile-name" style={{ color: 'var(--text-muted)' }}>Add profile</span>
            </button>
          </div>
        )}

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
        .profile-screen { display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
        .profile-container { width: 100%; max-width: 560px; display: flex; flex-direction: column; align-items: center; }
        .profile-header { text-align: center; margin-bottom: 32px; }
        .profile-title { font-family: ${FONT.heading}; font-size: 24px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
        .profile-subtitle { font-size: 14px; color: var(--muted); }

        /* Empty state */
        .profile-empty { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 40px 24px; opacity: 0; transform: translateY(16px); transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        .profile-empty.visible { opacity: 1; transform: translateY(0); }
        .empty-icon-wrap { width: 80px; height: 80px; border-radius: 20px; background: var(--gold-soft, rgba(179,135,42,0.14)); display: flex; align-items: center; justify-content: center; }
        .empty-text { font-family: ${FONT.body}; font-size: 14px; color: var(--muted); text-align: center; max-width: 360px; line-height: 1.6; }
        .create-profile-btn { display: flex; align-items: center; gap: 10px; padding: 14px 28px; border-radius: ${RADIUS.md}; background: linear-gradient(150deg, var(--gold, #b3872a), var(--emerald, #0f6b4d)); color: #fff; border: none; font-family: ${FONT.body}; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 8px 24px rgba(0,0,0,0.18); }
        .create-profile-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,0,0,0.25); }
        .create-profile-btn:active { transform: translateY(0); }

        /* Profile grid */
        .profile-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 16px; width: 100%; margin-bottom: 28px; }

        /* Card */
        .profile-card { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 22px 16px 18px; background: var(--glass); border: 1px solid var(--glass-border); border-radius: ${RADIUS.lg}; box-shadow: var(--glass-shadow); backdrop-filter: blur(40px) saturate(180%); -webkit-backdrop-filter: blur(40px) saturate(180%); cursor: pointer; transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden; opacity: 0; transform: translateY(16px) scale(0.96); }
        .profile-card::before { content: ''; position: absolute; inset: 0; border-radius: inherit; background: var(--sheen); pointer-events: none; }
        .profile-card > * { position: relative; z-index: 1; }
        .profile-card.visible { opacity: 1; transform: translateY(0) scale(1); }
        .profile-card.hovered, .profile-card:hover { transform: translateY(-4px) scale(1.03); box-shadow: 0 12px 32px rgba(0,0,0,0.15), var(--glass-shadow); border-color: var(--gold); }
        .profile-card:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
        .profile-card:active { transform: translateY(-1px) scale(1.01); }

        /* Add profile card */
        .profile-card--add { border-style: dashed; border-color: var(--glass-border); background: transparent; box-shadow: none; }
        .profile-card--add:hover { border-color: var(--gold); background: var(--gold-soft, rgba(179,135,42,0.08)); }

        /* Avatar */
        .profile-avatar { width: 64px; height: 64px; border-radius: ${RADIUS.md}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
        .profile-avatar--add { background: var(--slot-bg, rgba(127,127,127,0.08)); box-shadow: none; }
        .profile-initials { color: #fff; font-family: ${FONT.heading}; font-weight: 700; font-size: 20px; letter-spacing: 1px; text-shadow: 0 1px 3px rgba(0,0,0,0.15); }

        /* Name */
        .profile-name { font-family: ${FONT.body}; font-weight: 600; font-size: 13.5px; color: var(--text); text-align: center; line-height: 1.2; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        /* Role badge */
        .profile-role { font-size: 10.5px; font-weight: 600; padding: 3px 10px; border-radius: 100px; text-transform: capitalize; letter-spacing: 0.03em; }
        .role-owner { color: var(--gold); background: var(--gold-soft); }
        .role-staff { color: var(--emerald); background: var(--emerald-soft); }
        .profile-role:not(.role-owner):not(.role-staff) { color: var(--muted); background: var(--slot-bg); }

        /* Logout */
        .profile-logout { display: flex; align-items: center; gap: 6px; background: transparent; border: none; color: var(--muted); font-family: ${FONT.body}; font-size: 13px; font-weight: 500; cursor: pointer; padding: 8px 14px; border-radius: 100px; transition: 0.15s ease; }
        .profile-logout:hover { color: var(--text); background: var(--slot-hover); }
        .profile-logout svg { opacity: 0.7; transition: 0.15s; }
        .profile-logout:hover svg { opacity: 1; }
      `}</style>
    </div>
  );
}
