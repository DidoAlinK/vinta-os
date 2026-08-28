import React, { useState, useMemo } from 'react';
import { ArrowLeft, Trash2, Save, Plus, X, Calendar } from 'lucide-react';
import { colorFor } from '../../styles/design-tokens';

const DAY_FILTERS = [
  { id: 'week', label: 'Week' },
  { id: 'Mon', label: 'Mon' },
  { id: 'Tue', label: 'Tue' },
  { id: 'Wed', label: 'Wed' },
  { id: 'Thu', label: 'Thu' },
  { id: 'Fri', label: 'Fri' },
];

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const HOURS = Array.from({ length: 10 }, (_, i) => i + 8); // 8–17

/**
 * ClassDetail — Detailed view for a single class with editable fields
 * and a block calendar for scheduling.
 *
 * Props:
 *   classData — { id, name, teacher, enrolled, capacity, notes,
 *                 schedule: [{ day, start, end, label }] }
 *   onBack    — () => void
 *   onDelete  — (id) => void
 *   onUpdate  — (data) => void
 */
export default function ClassDetail({ classData, onBack, onDelete, onUpdate }) {
  const [name, setName] = useState(classData.name || '');
  const [teacher, setTeacher] = useState(classData.teacher || '');
  const [capacity, setCapacity] = useState(classData.capacity ?? '');
  const [notes, setNotes] = useState(classData.notes || '');
  const [dayFilter, setDayFilter] = useState('week');
  const [blocks, setBlocks] = useState(classData.schedule || []);
  const [addingBlock, setAddingBlock] = useState(null); // { day, start } when placing new block
  const [newBlockLabel, setNewBlockLabel] = useState('');

  const enrolled = classData.enrolled ?? 0;
  const cap = parseInt(capacity, 10) || 0;
  const ratio = cap > 0 ? enrolled / cap : 0;

  const visibleDays = dayFilter === 'week' ? WEEKDAYS : [dayFilter];

  /* Map schedule to lookup: `${day}-${hour}` → block */
  const blockMap = useMemo(() => {
    const m = {};
    blocks.forEach((b) => {
      for (let h = parseInt(b.start, 10); h < parseInt(b.end, 10); h++) {
        m[`${b.day}-${h}`] = b;
      }
    });
    return m;
  }, [blocks]);

  function handleSave() {
    onUpdate?.({
      ...classData,
      name: name.trim(),
      teacher: teacher.trim(),
      capacity: parseInt(capacity, 10) || 0,
      notes: notes.trim(),
      schedule: blocks,
    });
  }

  function startAddBlock(day, hour) {
    setAddingBlock({ day, start: hour });
    setNewBlockLabel('');
  }

  function confirmAddBlock() {
    if (!addingBlock) return;
    const newBlock = {
      day: addingBlock.day,
      start: String(addingBlock.start),
      end: String(addingBlock.start + 1),
      label: newBlockLabel.trim() || 'Class',
    };
    setBlocks((prev) => [...prev, newBlock]);
    setAddingBlock(null);
    setNewBlockLabel('');
  }

  function cancelAddBlock() {
    setAddingBlock(null);
    setNewBlockLabel('');
  }

  function deleteBlock(day, start) {
    setBlocks((prev) =>
      prev.filter((b) => !(b.day === day && parseInt(b.start, 10) === parseInt(start, 10)))
    );
  }

  return (
    <div className="class-detail glass" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="detail-content">
        {/* ── Left: Header card ────────────────────────────────── */}
        <div className="detail-left">
          <button className="icon-btn" onClick={onBack} title="Back">
            <ArrowLeft size={16} />
          </button>

          <div className="class-header-card" style={{ position: 'relative' }}>
            <div className="header-gradient" />
            <div className="header-body">
              <div className="field-group">
                <label className="field-label">Class name</label>
                <input
                  className="field-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Class name"
                />
              </div>
              <div className="field-group">
                <label className="field-label">Teacher</label>
                <input
                  className="field-input"
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  placeholder="Teacher name"
                />
              </div>
              <div className="field-row">
                <div className="field-group">
                  <label className="field-label">Enrolled</label>
                  <div className="field-value">{enrolled}</div>
                </div>
                <div className="field-group">
                  <label className="field-label">Capacity</label>
                  <input
                    className="field-input"
                    type="number"
                    min="0"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Capacity bar */}
              <div className="capacity-bar">
                <div className="capacity-track">
                  <div
                    className="capacity-fill"
                    style={{
                      width: `${Math.min(ratio * 100, 100)}%`,
                      background: ratio >= 1
                        ? 'var(--red)'
                        : 'linear-gradient(150deg, var(--gold), var(--emerald))',
                    }}
                  />
                </div>
                <span className="capacity-text">
                  {enrolled}/{cap || '—'}
                </span>
              </div>

              <div className="field-group">
                <label className="field-label">Notes</label>
                <textarea
                  className="field-input"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes about this class…"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="header-actions">
                <button className="save-btn" onClick={handleSave}>
                  <Save size={13} style={{ marginRight: 6, verticalAlign: 'middle' }} />Save
                </button>
                <button className="danger-btn" onClick={() => onDelete?.(classData.id)}>
                  <Trash2 size={13} style={{ marginRight: 6, verticalAlign: 'middle' }} />Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Block calendar ────────────────────────────── */}
        <div className="detail-right">
          <div className="calendar-card glass">
            <h4 className="card-title"><Calendar size={15} /> Schedule</h4>

            <div className="seg" style={{ marginBottom: 14 }}>
              {DAY_FILTERS.map((f) => (
                <button
                  key={f.id}
                  className={dayFilter === f.id ? 'active' : ''}
                  onClick={() => setDayFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="block-cal">
              <div className="cal-grid" style={{ gridTemplateColumns: `44px repeat(${visibleDays.length}, 1fr)` }}>
                <div className="cal-corner" />
                {visibleDays.map((d) => (
                  <div key={d} className="cal-col-header">{d}</div>
                ))}

                {HOURS.map((h) => (
                  <React.Fragment key={h}>
                    <div className="cal-hour">{String(h).padStart(2, '0')}:00</div>
                    {visibleDays.map((d) => {
                      const key = `${d}-${h}`;
                      const block = blockMap[key];
                      const isAddingHere =
                        addingBlock && addingBlock.day === d && addingBlock.start === h;

                      return (
                        <div
                          key={key}
                          className={`day-seg ${block ? 'has-block' : ''} ${isAddingHere ? 'adding' : ''}`}
                          onClick={() => {
                            if (!block && !addingBlock) startAddBlock(d, h);
                          }}
                        >
                          {block && (
                            <div className="block-tag">
                              <span>{block.label || ''}</span>
                              <button
                                className="block-del"
                                onClick={(e) => { e.stopPropagation(); deleteBlock(d, h); }}
                                title="Remove block"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          )}
                          {isAddingHere && (
                            <div className="block-add-form" onClick={(e) => e.stopPropagation()}>
                              <input
                                className="block-add-input"
                                placeholder="Label…"
                                value={newBlockLabel}
                                onChange={(e) => setNewBlockLabel(e.target.value)}
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') confirmAddBlock();
                                  if (e.key === 'Escape') cancelAddBlock();
                                }}
                              />
                              <div className="block-add-btns">
                                <button className="block-add-confirm" onClick={confirmAddBlock}>
                                  <Save size={10} />
                                </button>
                                <button className="block-add-cancel" onClick={cancelAddBlock}>
                                  <X size={10} />
                                </button>
                              </div>
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
        </div>
      </div>

      <style>{`
        .class-detail { border-radius: var(--r-lg, 22px); }

        .detail-content {
          display: flex; gap: 0; flex: 1; overflow: hidden;
        }
        .detail-left {
          width: 360px; flex-shrink: 0;
          padding: 22px;
          display: flex; flex-direction: column; gap: 14px;
          border-right: 1px solid var(--divider);
          overflow-y: auto;
        }
        .detail-right {
          flex: 1; padding: 22px;
          overflow-y: auto;
        }

        /* ── Header card ───────────────────────────────────────── */
        .class-header-card {
          background: var(--glass);
          border: 1px solid var(--glass-border);
          border-radius: var(--r-md, 16px);
          overflow: hidden; position: relative;
        }
        .header-gradient {
          height: 72px;
          background: linear-gradient(135deg, var(--gold), var(--emerald));
          opacity: 0.25;
        }
        .header-body {
          padding: 0 18px 18px;
          display: flex; flex-direction: column; gap: 12px;
          margin-top: -18px; position: relative; z-index: 1;
        }
        .header-actions {
          display: flex; gap: 8px; margin-top: 4px;
        }

        /* ── Capacity bar ──────────────────────────────────────── */
        .capacity-bar {
          display: flex; align-items: center; gap: 10px;
        }
        .capacity-track {
          flex: 1; height: 6px; border-radius: 100px;
          background: var(--input-bg); overflow: hidden;
        }
        .capacity-fill {
          height: 100%; border-radius: 100px;
          transition: width 0.3s ease;
        }
        .capacity-text {
          font-size: 11px; font-weight: 600; color: var(--muted);
          flex-shrink: 0;
        }

        /* ── Calendar card ─────────────────────────────────────── */
        .calendar-card { padding: 18px; border-radius: var(--r-md, 16px); }
        .card-title {
          font-family: 'Space Grotesk'; font-size: 13.5px;
          font-weight: 600; display: flex; align-items: center;
          gap: 8px; margin-bottom: 14px;
        }

        /* ── Block calendar ────────────────────────────────────── */
        .block-cal { overflow-x: auto; }
        .cal-grid {
          display: grid;
          gap: 1px;
          min-width: 0;
        }
        .cal-corner { background: transparent; }
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
          min-height: 26px;
          background: var(--slot-bg);
          border-radius: 3px;
          transition: 0.12s;
          cursor: pointer;
        }
        .day-seg:hover:not(.has-block):not(.adding) {
          background: var(--gold-soft);
        }
        .day-seg.has-block {
          background: var(--gold-soft);
          cursor: default;
        }
        .day-seg.adding {
          background: var(--emerald-soft);
        }
        .block-tag {
          font-size: 9px; font-weight: 600;
          color: var(--gold);
          padding: 3px 5px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 4px;
        }
        .block-tag span {
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .block-del {
          background: none; border: none; color: var(--red);
          cursor: pointer; display: flex; padding: 0;
          opacity: 0; transition: 0.12s;
        }
        .day-seg:hover .block-del { opacity: 1; }

        /* ── Inline add form ───────────────────────────────────── */
        .block-add-form {
          display: flex; align-items: center; gap: 3px;
          padding: 2px 4px;
        }
        .block-add-input {
          flex: 1; min-width: 0;
          border: 1px solid var(--glass-border);
          border-radius: 4px; padding: 2px 4px;
          font-size: 9px; background: var(--input-bg);
          color: var(--text); outline: none;
        }
        .block-add-input:focus { box-shadow: 0 0 0 1px var(--gold-soft); }
        .block-add-btns { display: flex; gap: 2px; }
        .block-add-confirm, .block-add-cancel {
          width: 18px; height: 18px;
          border-radius: 4px; border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: 0.12s;
        }
        .block-add-confirm {
          background: var(--emerald); color: #fff;
        }
        .block-add-cancel {
          background: var(--glass); color: var(--muted);
          border: 1px solid var(--glass-border);
        }

        @media (max-width: 768px) {
          .detail-content { flex-direction: column; }
          .detail-left { width: 100%; border-right: none; border-bottom: 1px solid var(--divider); }
        }
      `}</style>
    </div>
  );
}
