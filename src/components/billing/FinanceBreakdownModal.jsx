import React, { useState, useMemo } from 'react';

export default function FinanceBreakdownModal({ isOpen, onClose, data = [], type = 'student', onExportCSV }) {
  const [filter, setFilter] = useState('all');
  const [aging, setAging] = useState(null);

  const filtered = useMemo(() => {
    let list = [...data];
    if (filter === 'overdue') list = list.filter(d => d.status === 'overdue');
    if (aging === 'recent') list = list.filter(d => d.daysOverdue >= 1 && d.daysOverdue <= 7);
    if (aging === 'aging') list = list.filter(d => d.daysOverdue >= 8 && d.daysOverdue <= 30);
    if (aging === 'critical') list = list.filter(d => d.daysOverdue > 30);
    return list;
  }, [data, filter, aging]);

  const paid = data.filter(d => d.status === 'paid').length;
  const due = data.filter(d => d.status === 'due').length;
  const overdue = data.filter(d => d.status === 'overdue').length;

  if (!isOpen) return null;

  return (
    <>
      <div className="overlay" onClick={onClose}>
        <div className="modal glass breakdown-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{type === 'student' ? 'Student Tuition' : 'Teacher Payroll'} Breakdown</h2>
            <button className="icon-btn" onClick={onClose}>✕</button>
          </div>

          <div className="breakdown-filters">
            <div className="segment-control">
              <button className={filter === 'all' ? 'active' : ''} onClick={() => { setFilter('all'); setAging(null); }}>All accounts</button>
              <button className={filter === 'overdue' ? 'active' : ''} onClick={() => setFilter('overdue')}>Overdue accounts</button>
            </div>
            <div className="aging-buckets">
              {[{ key: 'recent', label: '1-7 days', count: data.filter(d => d.daysOverdue >= 1 && d.daysOverdue <= 7).length },
                { key: 'aging', label: '8-30 days', count: data.filter(d => d.daysOverdue >= 8 && d.daysOverdue <= 30).length },
                { key: 'critical', label: '30+ days', count: data.filter(d => d.daysOverdue > 30).length }
              ].map(b => (
                <button key={b.key} className={`aging-btn ${aging === b.key ? 'active' : ''}`}
                        onClick={() => setAging(aging === b.key ? null : b.key)}>
                  {b.label} <span className="aging-count">{b.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="breakdown-list">
            {filtered.length === 0 ? (
              <p className="breakdown-empty">No accounts match the current filter.</p>
            ) : filtered.map((item, i) => (
              <div key={i} className="breakdown-row">
                <span className={`status-dot ${item.status}`} />
                <span className="breakdown-name">{item.name}</span>
                <span className="breakdown-amount">{item.amount?.toLocaleString()} DA</span>
                {item.status === 'overdue' && (
                  <span className={`aging-tag ${item.daysOverdue > 30 ? 'critical' : item.daysOverdue > 7 ? 'aging' : 'recent'}`}>
                    {item.daysOverdue}d overdue
                  </span>
                )}
                {item.sessions != null && <span className="breakdown-sessions">{item.sessions} sessions</span>}
              </div>
            ))}
          </div>

          <div className="modal-footer">
            {onExportCSV && <button className="ghost-btn" onClick={onExportCSV}>⬇ Export CSV</button>}
            <button className="save-btn" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
      <style>{`
        .breakdown-modal { width: 640px; max-width: 90vw; max-height: 80vh; display: flex; flex-direction: column; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .modal-header h2 { font-family: 'Space Grotesk'; font-size: 20px; font-weight: 700; color: var(--text); }
        .breakdown-filters { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
        .segment-control { display: flex; background: var(--card); border-radius: var(--radius-sm); padding: 3px; gap: 2px; }
        .segment-control button { flex: 1; padding: 8px 12px; border: none; border-radius: var(--radius-xs); background: transparent; font-family: 'Inter'; font-size: 12px; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
        .segment-control button.active { background: var(--gold); color: #fff; font-weight: 600; }
        .aging-buckets { display: flex; gap: 8px; }
        .aging-btn { padding: 6px 12px; border: 1px solid var(--border); border-radius: var(--radius-xs); background: transparent; font-family: 'Inter'; font-size: 12px; color: var(--text-muted); cursor: pointer; }
        .aging-btn.active { border-color: var(--gold); color: var(--gold); }
        .aging-count { margin-left: 4px; font-weight: 600; }
        .breakdown-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; }
        .breakdown-row { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: var(--radius-xs); background: var(--card); }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .status-dot.paid { background: var(--emerald); }
        .status-dot.due { background: var(--gold); }
        .status-dot.overdue { background: var(--red); }
        .breakdown-name { flex: 1; font-family: 'Inter'; font-size: 13px; color: var(--text); }
        .breakdown-amount { font-family: 'Space Grotesk'; font-size: 13px; font-weight: 600; color: var(--text); }
        .aging-tag { font-family: 'Inter'; font-size: 11px; padding: 2px 8px; border-radius: 20px; }
        .aging-tag.recent { background: rgba(179,135,42,0.15); color: var(--gold); }
        .aging-tag.aging { background: rgba(234,88,12,0.15); color: #ea580c; }
        .aging-tag.critical { background: rgba(220,38,38,0.15); color: var(--red); }
        .breakdown-sessions { font-family: 'Inter'; font-size: 11px; color: var(--text-muted); }
        .breakdown-empty { text-align: center; padding: 40px; font-family: 'Inter'; font-size: 13px; color: var(--text-muted); }
        .modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border); }
      `}</style>
    </>
  );
}
