import React, { useEffect } from 'react';

export default function SuccessScreen({ profile = {}, onContinue }) {
  useEffect(() => {
    const timer = setTimeout(() => onContinue?.(), 3000);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <>
      <div className="success-screen">
        <div className="success-check">✓</div>
        <h2>Welcome, {profile.name || 'User'}!</h2>
        <span className="role-pill">{profile.role || 'staff'}</span>
        <button className="confirm-btn" onClick={onContinue}>Continue to Dashboard</button>
      </div>
      <style>{`
        .success-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; gap: 16px; animation: fadeIn 0.4s ease; }
        .success-check { width: 80px; height: 80px; border-radius: 50%; background: var(--emerald); color: #fff; font-size: 36px; font-weight: 700; display: flex; align-items: center; justify-content: center; animation: scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1); }
        .success-screen h2 { font-family: 'Space Grotesk'; font-size: 24px; font-weight: 700; color: var(--text); }
        .role-pill { font-family: 'Inter'; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; background: rgba(179,135,42,0.12); color: var(--gold); text-transform: capitalize; }
        .success-screen .confirm-btn { margin-top: 16px; }
        @keyframes scaleIn { from { transform: scale(0); } to { transform: scale(1); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </>
  );
}
