import React from 'react';

export default function EmptyState({ icon = '📭', title, subtitle, actionLabel, onAction }) {
  return (
    <>
      <div className="empty-state">
        <span className="empty-icon">{icon}</span>
        <h3 className="empty-title">{title}</h3>
        {subtitle && <p className="empty-subtitle">{subtitle}</p>}
        {actionLabel && onAction && (
          <button className="confirm-btn" onClick={onAction}>{actionLabel}</button>
        )}
      </div>
      <style>{`
        .empty-state {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 64px 24px; text-align: center; gap: 12px;
        }
        .empty-icon { font-size: 48px; opacity: 0.6; }
        .empty-title { font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 600; color: var(--text); }
        .empty-subtitle { font-family: 'Inter', sans-serif; font-size: 14px; color: var(--text-muted); max-width: 320px; }
      `}</style>
    </>
  );
}
