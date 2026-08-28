import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';

/**
 * AddDirectoryStudentModal — Quick-add form for a new student.
 *
 * Props:
 *   onClose — () => void
 *   onAdd   — ({ name, last, phone, cls }) => void
 */
export default function AddDirectoryStudentModal({ onClose, onAdd }) {
  const [name, setName] = useState('');
  const [last, setLast] = useState('');
  const [phone, setPhone] = useState('');
  const [cls, setCls] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd?.({ name: name.trim(), last: last.trim(), phone: phone.trim(), cls: cls.trim() });
  }

  return (
    <div className="overlay show" onClick={onClose}>
      <div className="modal glass" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3 className="modal-title"><UserPlus size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />Add student</h3>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field-row">
            <div className="field-group">
              <label className="field-label">First name *</label>
              <input
                className="field-input"
                type="text"
                placeholder="First name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div className="field-group">
              <label className="field-label">Last name</label>
              <input
                className="field-input"
                type="text"
                placeholder="Last name"
                value={last}
                onChange={(e) => setLast(e.target.value)}
              />
            </div>
          </div>

          <div className="field-row">
            <div className="field-group">
              <label className="field-label">Phone</label>
              <input
                className="field-input"
                type="tel"
                placeholder="0555 00 00 00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="field-group">
              <label className="field-label">Class</label>
              <input
                className="field-input"
                type="text"
                placeholder="e.g. 3ème A"
                value={cls}
                onChange={(e) => setCls(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="confirm-btn">
            Add student
          </button>
        </form>
      </div>
    </div>
  );
}
