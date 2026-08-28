import React, { useState } from 'react';

const PRESET_COLORS = [
  { name: 'Gold', hex: '#b3872a' },
  { name: 'Emerald', hex: '#0f6b4d' },
  { name: 'Violet', hex: '#7c3aed' },
  { name: 'Red', hex: '#dc2626' },
  { name: 'Sky', hex: '#0ea5e9' },
  { name: 'Orange', hex: '#ea580c' },
  { name: 'Pink', hex: '#db2777' },
  { name: 'Teal', hex: '#0d9488' },
];

export default function AddClassModal({ isOpen, onClose, onSubmit, availableTeachers = [] }) {
  const [form, setForm] = useState({ name: '', subject: '', teacherId: '', capacity: '', notes: '', color: '#b3872a' });
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.name && form.subject;

  if (!isOpen) return null;

  return (
    <>
      <div className="overlay" onClick={onClose}>
        <div className="modal glass" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Add Class</h2>
            <button className="icon-btn" onClick={onClose}>✕</button>
          </div>
          <div className="modal-body">
            <div className="field-row">
              <label className="field-label">Class Name</label>
              <input className="field-input" placeholder="e.g., Math — CM2" value={form.name} onChange={e => update('name', e.target.value)} />
            </div>
            <div className="field-row">
              <label className="field-label">Subject</label>
              <select className="field-input" value={form.subject} onChange={e => update('subject', e.target.value)}>
                <option value="">Select...</option>
                {['Math','French','English','Science'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="field-row">
              <label className="field-label">Teacher</label>
              <select className="field-input" value={form.teacherId} onChange={e => update('teacherId', e.target.value)}>
                <option value="">Unassigned</option>
                {availableTeachers.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
              </select>
            </div>
            <div className="field-row">
              <label className="field-label">Capacity</label>
              <input className="field-input" type="number" placeholder="Max students" value={form.capacity} onChange={e => update('capacity', e.target.value)} />
            </div>

            {/* Color Picker */}
            <div className="field-row">
              <label className="field-label">Class Color</label>
              <div className="color-picker">
                <div className="color-swatches">
                  {PRESET_COLORS.map(c => (
                    <button key={c.hex}
                      className={`color-swatch ${form.color === c.hex ? 'selected' : ''}`}
                      style={{ background: c.hex }}
                      onClick={() => update('color', c.hex)}
                      title={c.name}
                      type="button"
                    />
                  ))}
                  <label className="color-swatch color-custom" title="Custom color">
                    <input type="color" value={form.color} onChange={e => update('color', e.target.value)} className="color-input-hidden" />
                    <span className="color-custom-icon" style={{ background: form.color }}>+</span>
                  </label>
                </div>
                <span className="color-preview" style={{ background: form.color }} />
              </div>
            </div>

            <div className="field-row">
              <label className="field-label">Notes</label>
              <textarea className="field-input" rows={2} value={form.notes} onChange={e => update('notes', e.target.value)} />
            </div>
          </div>
          <div className="modal-footer">
            <button className="ghost-btn" onClick={onClose}>Cancel</button>
            <button className="confirm-btn" disabled={!valid} onClick={() => { onSubmit?.({ ...form, capacity: Number(form.capacity) || 0 }); onClose(); }}>Create Class</button>
          </div>
        </div>
      </div>
      <style>{`
        .color-picker { display: flex; align-items: center; gap: 12px; }
        .color-swatches { display: flex; gap: 6px; flex-wrap: wrap; }
        .color-swatch { width: 28px; height: 28px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; transition: all 0.15s; padding: 0; position: relative; }
        .color-swatch:hover { transform: scale(1.15); }
        .color-swatch.selected { border-color: var(--text, #1f1f22); box-shadow: 0 0 0 2px var(--bg, #efece4); }
        .color-custom { background: transparent !important; border: 2px dashed var(--border, rgba(35,36,31,0.12)); display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .color-input-hidden { position: absolute; width: 0; height: 0; opacity: 0; pointer-events: none; }
        .color-custom-icon { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 14px; font-weight: 700; line-height: 1; }
        .color-preview { width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0; border: 1px solid var(--border, rgba(35,36,31,0.12)); }
      `}</style>
    </>
  );
}
