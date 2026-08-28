import React, { useState } from 'react';
import { X, LayoutGrid } from 'lucide-react';

/**
 * AddClassModal — Form to create a new class.
 *
 * Props:
 *   onClose — () => void
 *   onAdd   — ({ name, teacher, capacity }) => void
 */
export default function AddClassModal({ onClose, onAdd }) {
  const [name, setName] = useState('');
  const [teacher, setTeacher] = useState('');
  const [capacity, setCapacity] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd?.({
      name: name.trim(),
      teacher: teacher.trim(),
      capacity: parseInt(capacity, 10) || 0,
    });
  }

  return (
    <div className="overlay show" onClick={onClose}>
      <div className="modal glass" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3 className="modal-title">
            <LayoutGrid size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            New class
          </h3>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="field-label">Class name *</label>
            <input
              className="field-input"
              type="text"
              placeholder="e.g. 3ème A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="field-group">
            <label className="field-label">Teacher</label>
            <input
              className="field-input"
              type="text"
              placeholder="Teacher name"
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
            />
          </div>

          <div className="field-group">
            <label className="field-label">Capacity</label>
            <input
              className="field-input"
              type="number"
              min="0"
              placeholder="Maximum students"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </div>

          <button type="submit" className="confirm-btn">
            Create class
          </button>
        </form>
      </div>
    </div>
  );
}
