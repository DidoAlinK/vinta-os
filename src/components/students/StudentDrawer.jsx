import React, { useMemo } from 'react';
import { ArrowLeft, Phone, MessageSquare, Trash2, Calendar, CreditCard, Clock } from 'lucide-react';
import { colorFor, initialsOf, STATUS_META } from '../../styles/design-tokens';

/**
 * StudentDrawer — Slide-in panel showing a student's profile and billing calendar.
 *
 * Props:
 *   student  — { id, name, last, phone, cls, status, parent, guardians, notes,
 *                billing: { plan, sessions, renewsOn } }
 *   onClose  — () => void
 *   onDelete — (id) => void
 */
export default function StudentDrawer({ student, onClose, onDelete }) {
  if (!student) return null;

  const [c1, c2] = colorFor(student.id);
  const meta = STATUS_META[student.status] || STATUS_META.paid;

  /* ── Billing mini-calendar (4 weeks from today) ──────────── */
  const calWeeks = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay() + 1); // Monday
    const weeks = [];
    for (let w = 0; w < 4; w++) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        const dt = new Date(start);
        dt.setDate(start.getDate() + w * 7 + d);
        days.push({
          label: dt.getDate(),
          isToday: dt.toDateString() === today.toDateString(),
          isPast: dt < today && !dt.toDateString().includes(today.toDateString()),
          month: dt.getMonth(),
        });
      }
      weeks.push(days);
    }
    return weeks;
  }, []);

  function handleCall() {
    if (student.phone) window.location.href = `tel:${student.phone}`;
  }

  function handleMessage() {
    if (student.phone) window.open(`sms:${student.phone}`, '_blank');
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
              {initialsOf(student.name, student.last)}
            </div>
            <h3 className="drawer-name">{student.name} {student.last}</h3>
            <span className="drawer-class">{student.cls || 'No class'}</span>
            <span className={`badge ${meta.cls}`}>{meta.label}</span>
          </div>

          <div className="quick-actions">
            <button className="quick-btn" onClick={handleCall}>
              <Phone size={15} /> Call
            </button>
            <button className="quick-btn" onClick={handleMessage}>
              <MessageSquare size={15} /> Message
            </button>
            <button className="quick-btn danger" onClick={() => onDelete?.(student.id)}>
              <Trash2 size={15} /> Delete
            </button>
          </div>

          <div className="field-groups">
            <div className="field-group">
              <label className="field-label">Full name</label>
              <div className="field-value">{student.name} {student.last}</div>
            </div>
            <div className="field-group">
              <label className="field-label">Phone</label>
              <div className="field-value">{student.phone || '—'}</div>
            </div>
            <div className="field-group">
              <label className="field-label">Parent / guardian</label>
              <div className="field-value">{student.parent || '—'}</div>
            </div>
            <div className="field-group">
              <label className="field-label">Additional guardians</label>
              <div className="field-value">{student.guardians || '—'}</div>
            </div>
            <div className="field-group">
              <label className="field-label">Notes</label>
              <div className="field-value" style={{ minHeight: 56, whiteSpace: 'pre-wrap' }}>{student.notes || '—'}</div>
            </div>
          </div>
        </div>

        {/* ── Right: Calendar + billing ─────────────────────────── */}
        <div className="drawer-right">
          <div className="calendar-card glass">
            <h4 className="card-title"><Calendar size={15} /> Billing calendar</h4>
            <div className="mini-cal">
              <div className="cal-header">
                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
                  <span key={d} className="cal-day-label">{d}</span>
                ))}
              </div>
              {calWeeks.map((week, wi) => (
                <div key={wi} className="cal-week">
                  {week.map((day, di) => (
                    <div
                      key={di}
                      className={`cal-day ${day.isToday ? 'today' : ''} ${day.isPast ? 'past' : ''}`}
                    >
                      {day.label}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="billing-summary glass">
            <h4 className="card-title"><CreditCard size={15} /> Billing summary</h4>
            <div className="billing-row">
              <span className="billing-key">Plan</span>
              <span className="billing-val">{student.billing?.plan || '—'}</span>
            </div>
            <div className="billing-row">
              <span className="billing-key">Sessions / month</span>
              <span className="billing-val">{student.billing?.sessions ?? '—'}</span>
            </div>
            <div className="billing-row">
              <span className="billing-key">Renews on</span>
              <span className="billing-val">
                {student.billing?.renewsOn
                  ? new Date(student.billing.renewsOn).toLocaleDateString()
                  : '—'}
              </span>
            </div>
            <div className="billing-row">
              <span className="billing-key">Status</span>
              <span className={`badge ${meta.cls}`}>{meta.label}</span>
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
        .drawer-class { font-size: 12.5px; color: var(--muted); }

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

        /* ── Calendar card ─────────────────────────────────────── */
        .calendar-card { padding: 18px; border-radius: var(--r-md, 16px); }
        .card-title {
          font-family: 'Space Grotesk'; font-size: 13.5px;
          font-weight: 600; display: flex; align-items: center;
          gap: 8px; margin-bottom: 14px;
        }
        .mini-cal { display: flex; flex-direction: column; gap: 4px; }
        .cal-header {
          display: grid; grid-template-columns: repeat(7, 1fr);
          text-align: center; margin-bottom: 4px;
        }
        .cal-day-label {
          font-size: 10px; font-weight: 600;
          color: var(--muted); text-transform: uppercase;
        }
        .cal-week {
          display: grid; grid-template-columns: repeat(7, 1fr);
          gap: 3px;
        }
        .cal-day {
          text-align: center; padding: 5px 0;
          font-size: 11.5px; border-radius: 8px;
          color: var(--muted); transition: 0.12s;
        }
        .cal-day.today {
          background: linear-gradient(150deg, var(--gold), var(--emerald));
          color: #fff; font-weight: 700;
        }
        .cal-day.past { opacity: 0.45; }

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
