import React, { useState } from 'react';

export default function ToastStack({ toasts = [], onDismiss, onAction }) {
  const [expandedId, setExpandedId] = useState(null);

  const typeIcon = { payment: '💳', checkin: '✅', student: '👤', alert: '⚠️', general: 'ℹ️' };
  const typeColor = { payment: 'var(--emerald)', checkin: 'var(--gold)', student: 'var(--violet)', alert: 'var(--red)', general: 'var(--sky)' };

  return (
    <>
      <div className="toast-stack">
        {toasts.map(t => (
          <div key={t.id} className={`toast glass ${expandedId === t.id ? 'expanded' : ''}`}
               onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}>
            <div className="toast-header">
              <span className="toast-icon" style={{ color: typeColor[t.type] || 'var(--text-muted)' }}>{typeIcon[t.type] || 'ℹ️'}</span>
              <div className="toast-text">
                <strong>{t.title}</strong>
                <span className="toast-msg">{t.message}</span>
              </div>
              <button className="icon-btn toast-close" onClick={e => { e.stopPropagation(); onDismiss?.(t.id); }}>✕</button>
            </div>
            {expandedId === t.id && t.detail && (
              <div className="toast-detail">
                <p>{t.detail}</p>
                {t.actions?.map(a => (
                  <button key={a.label} className={a.variant === 'danger' ? 'danger-btn' : 'confirm-btn'}
                          onClick={e => { e.stopPropagation(); onAction?.(t.id, a.label); }}>{a.label}</button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <style>{`
        .toast-stack { position: fixed; bottom: 24px; right: 24px; display: flex; flex-direction: column; gap: 10px; z-index: 9000; max-width: 360px; }
        .toast { padding: 14px 16px; border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s; }
        .toast:hover { transform: translateX(-4px); }
        .toast-header { display: flex; align-items: flex-start; gap: 10px; }
        .toast-icon { font-size: 18px; flex-shrink: 0; margin-top: 2px; }
        .toast-text { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .toast-text strong { font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 600; color: var(--text); }
        .toast-msg { font-family: 'Inter', sans-serif; font-size: 12px; color: var(--text-muted); }
        .toast-close { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 14px; padding: 2px; }
        .toast-detail { margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border); }
        .toast-detail p { font-family: 'Inter', sans-serif; font-size: 12px; color: var(--text-muted); margin-bottom: 10px; }
        .toast-detail button { margin-right: 8px; }
      `}</style>
    </>
  );
}
