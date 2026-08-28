import React from 'react';
import { ArrowLeft, Phone, MessageSquare, Trash2, Calendar, CreditCard, BookOpen, Clock, Users } from 'lucide-react';
import { colorFor, initialsOf, DAYS } from '../../styles/design-tokens';

/**
 * TeacherDrawer — Slide-in panel showing a teacher's profile and schedule.
 *
 * Props:
 *   teacher  — { id, name, last, phone, subject, classes, contract, rate,
 *                notes, schedule: [{ day, start, end, label }] }
 *   onClose  — () => void
 *   onDelete — (id) => void
 */
export default function TeacherDrawer({ teacher, onClose, onDelete }) {
  if (!teacher) return null;

  const [c1, c2] = colorFor(teacher.id);

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const schedule = teacher.schedule || [];

  /* Build schedule map for quick lookup: day → blocks[] */
  const schedMap = {};
  schedule.forEach((b) => {
    if (!schedMap[b.day]) schedMap[b.day] = [];
    schedMap[b.day].push(b);
  });

  const hours = Array.from({ length: 10 }, (_, i) => i + 8); // 8–17

  function handleCall() {
    if (teacher.phone) window.location.href = `tel:${teacher.phone}`;
  }

  function handleMessage() {
    if (teacher.phone) window.open(`sms:${teacher.phone}`, '_blank');
  }

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* ── Left: Profile ─────────────────────────────────────── */}
        <div className="drawer-left">
          <button className="icon-btn" onClick={onClose} title="Close">
            <ArrowLeft size={16} />
          </button>

          <div className="profile-card">
            <div className="drawer-avatar" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
              {initialsOf(teacher.name, teacher.last)}
            </div>
            <h3 className="drawer-name">{teacher.name} {teacher.last}</h3>
            <span className="drawer-subject">{teacher.subject || 'No subject'}</span>
            <span className={`badge ${teacher.contract === 'per-student' ? 'per-student' : 'hourly'}`}>
              {teacher.contract === 'per-student' ? 'Per-student' : 'Hourly'}
            </span>
          </div>

          <div className="quick-actions">
            <button className="quick-btn" onClick={handleCall}>
              <Phone size={15} /> Call
            </button>
            <button className="quick-btn" onClick={handleMessage}>
              <MessageSquare size={15} /> Message
            </button>
            <button className="quick-btn danger" onClick={() => onDelete?.(teacher.id)}>
              <Trash2 size={15} /> Delete
            </button>
          </div>

          <div className="field-groups">
            <div className="field-group">
              <label className="field-label">Full name</label>
              <div className="field-value">{teacher.name} {teacher.last}</div>
            </div>
            <div className="field-group">
              <label className="field-label">Phone</label>
              <div className="field-value">{teacher.phone || '—'}</div>
            </div>
            <div className="field-group">
              <label className="field-label">Subject</label>
              <div className="field-value">{teacher.subject || '—'}</div>
            </div>
            <div className="field-group">
              <label className="field-label">Classes</label>
              <div className="field-value">{teacher.classes || '—'}</div>
            </div>
            <div className="field-group">
              <label className="field-label">Notes</label>
              <div className="field-value" style={{ minHeight: 56, whiteSpace: 'pre-wrap' }}>{teacher.notes || '—'}</div>
            </div>
          </div>
        </div>

        {/* ── Right: Schedule + billing ─────────────────────────── */}
        <div className="drawer-right">
          <div className="schedule-card glass">
            <h4 className="card-title"><Calendar size={15} /> Class schedule</h4>
            <div className="block-cal">
              <div className="cal-grid">
                <div className="cal-corner" />
                {weekdays.map((d) => (
                  <div key={d} className="cal-col-header">{d}</div>
                ))}
                {hours.map((h) => (
                  <React.Fragment key={h}>
                    <div className="cal-hour">{String(h).padStart(2, '0')}:00</div>
                    {weekdays.map((d) => {
                      const block = schedMap[d]?.find(
                        (b) => parseInt(b.start, 10) === h
                      );
                      return (
                        <div key={`${d}-${h}`} className={`day-seg ${block ? 'has-block' : ''}`}>
                          {block && (
                            <div className="block-tag" title={block.label || ''}>
                              {block.label || ''}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          <div className="billing-summary glass">
            <h4 className="card-title"><CreditCard size={15} /> Billing summary</h4>
            <div className="billing-row">
              <span className="billing-key">Contract</span>
              <span className={`badge ${teacher.contract === 'per-student' ? 'per-student' : 'hourly'}`}>
                {teacher.contract === 'per-student' ? 'Per-student' : 'Hourly'}
              </span>
            </div>
            <div className="billing-row">
              <span className="billing-key">Rate</span>
              <span className="billing-val">{teacher.rate ? `${teacher.rate}` : '—'}</span>
            </div>
            <div className="billing-row">
              <span className="billing-key">
                {teacher.contract === 'per-student' ? 'Students' : 'Hours / week'}
              </span>
              <span className="billing-val">
                {teacher.contract === 'per-student'
                  ? (teacher.studentCount ?? '—')
                  : (teacher.hoursPerWeek ?? '—')}
              </span>
            </div>
            <div className="billing-row">
              <span className="billing-key">Payroll</span>
              <span className="billing-val">{teacher.payroll ?? '—'}</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .drawer-overlay {
          position: fixed; inset: 0;
          background: rgba(10,10,10,0.4);
          backdrop-filter: blur(6px);
          display: flex; align-items: stretch; justify-content: flex-end;
          z-index: 70;
          animation: fadeIn 0.18s ease;
        }
        .drawer-panel {
          width: 720px; max-width: 92vw;
          display: flex; gap: 0;
          background: var(--bg);
          border-left: 1px solid var(--glass-border);
          box-shadow: -20px 0 60px rgba(0,0,0,0.25);
          z-index: 71;
          overflow-y: auto;
        }
        .drawer-left {
          flex: 1; padding: 22px;
          display: flex; flex-direction: column; gap: 14px;
          border-right: 1px solid var(--divider);
          min-width: 0;
        }
        .drawer-right {
          width: 300px; flex-shrink: 0;
          padding: 22px;
          display: flex; flex-direction: column; gap: 16px;
          overflow-y: auto;
        }

        /* ── Profile card ──────────────────────────────────────── */
        .profile-card {
          display: flex; flex-direction: column;
          align-items: center; gap: 8px; padding: 16px 0;
        }
        .drawer-avatar {
          width: 64px; height: 64px;
          border-radius: var(--r-md, 16px);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 700; font-size: 20px;
          letter-spacing: 1px;
        }
        .drawer-name {
          font-family: 'Space Grotesk'; font-weight: 600;
          font-size: 17px; text-align: center;
        }
        .drawer-subject { font-size: 12.5px; color: var(--muted); }

        /* ── Quick actions ─────────────────────────────────────── */
        .quick-actions {
          display: flex; gap: 8px;
        }
        .quick-btn {
          flex: 1; display: flex; align-items: center; justify-content: center;
          gap: 6px; padding: 10px 0;
          background: var(--glass);
          border: 1px solid var(--glass-border);
          border-radius: var(--r-sm, 12px);
          color: var(--text); font-size: 12px; font-weight: 600;
          cursor: pointer; transition: 0.15s;
        }
        .quick-btn:hover { background: var(--glass-strong); }
        .quick-btn.danger { color: var(--red); border-color: var(--red-soft); }
        .quick-btn.danger:hover { background: var(--red-soft); }

        /* ── Field groups ──────────────────────────────────────── */
        .field-groups { display: flex; flex-direction: column; }

        /* ── Schedule card ─────────────────────────────────────── */
        .schedule-card { padding: 18px; border-radius: var(--r-md, 16px); }
        .card-title {
          font-family: 'Space Grotesk'; font-size: 13.5px;
          font-weight: 600; display: flex; align-items: center;
          gap: 8px; margin-bottom: 14px;
        }
        .block-cal { overflow-x: auto; }
        .cal-grid {
          display: grid;
          grid-template-columns: 44px repeat(5, 1fr);
          gap: 1px;
          min-width: 0;
        }
        .cal-corner {
          background: transparent;
        }
        .cal-col-header {
          text-align: center; font-size: 10.5px; font-weight: 600;
          color: var(--muted); text-transform: uppercase;
          padding: 4px 0;
        }
        .cal-hour {
          font-size: 10px; color: var(--muted);
          display: flex; align-items: center; justify-content: flex-end;
          padding-right: 6px;
        }
        .day-seg {
          min-height: 22px;
          background: var(--slot-bg);
          border-radius: 3px;
          transition: 0.12s;
        }
        .day-seg.has-block {
          background: var(--gold-soft);
        }
        .block-tag {
          font-size: 9px; font-weight: 600;
          color: var(--gold); padding: 2px 4px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        /* ── Billing summary ───────────────────────────────────── */
        .billing-summary {
          padding: 18px; border-radius: var(--r-md, 16px);
          display: flex; flex-direction: column; gap: 10px;
        }
        .billing-row {
          display: flex; align-items: center;
          justify-content: space-between; gap: 8px;
        }
        .billing-key {
          font-size: 12px; color: var(--muted);
        }
        .billing-val {
          font-size: 12.5px; font-weight: 600;
          text-align: right;
        }

        @media (max-width: 640px) {
          .drawer-panel { flex-direction: column; }
          .drawer-right { width: 100%; border-left: none; border-top: 1px solid var(--divider); }
        }
      `}</style>
    </div>
  );
}
