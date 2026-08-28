import React, { useState } from 'react';

export default function CreateProfileModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', role: 'owner', phone: '', pin: '' });
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.name.trim() && (form.role === 'owner' || form.pin.length === 4);

  if (!isOpen) return null;

  return (
    <>
      <div className="overlay" onClick={onClose}>
        <div className="modal glass" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Create your profile</h2>
            <button className="icon-btn" onClick={onClose}>✕</button>
          </div>
          <div className="modal-body">
            <div className="field-row">
              <label className="field-label">Full Name</label>
              <input className="field-input" placeholder="e.g. Ali Bensalem" value={form.name}
                     onChange={e => update('name', e.target.value)} autoFocus />
            </div>
            <div className="field-row">
              <label className="field-label">Role</label>
              <div className="role-toggle">
                <button className={form.role === 'owner' ? 'active' : ''} onClick={() => update('role', 'owner')}>
                  Owner
                </button>
                <button className={form.role === 'staff' ? 'active' : ''} onClick={() => update('role', 'staff')}>
                  Staff
                </button>
              </div>
            </div>
            <div className="field-row">
              <label className="field-label">Phone</label>
              <input className="field-input" placeholder="+213 6•• •• •• ••" value={form.phone}
                     onChange={e => update('phone', e.target.value)} />
            </div>
            {form.role === 'staff' && (
              <div className="field-row">
                <label className="field-label">4-Digit PIN</label>
                <input className="field-input" type="password" maxLength={4} placeholder="••••"
                       value={form.pin} onChange={e => update('pin', e.target.value.replace(/\D/g, '').slice(0, 4))} />
              </div>
            )}
            <p className="role-hint">
              {form.role === 'owner'
                ? 'Owners have full access to all features and settings.'
                : 'Staff use a 4-digit PIN for action attribution.'}
            </p>
          </div>
          <div className="modal-footer">
            <button className="ghost-btn" onClick={onClose}>Cancel</button>
            <button className="confirm-btn" disabled={!valid}
                    onClick={() => { onSubmit?.({ name: form.name.trim(), role: form.role, phone: form.phone.trim(), pin: form.pin }); onClose(); }}>
              Create Profile
            </button>
          </div>
        </div>
      </div>
      <style>{`
        .role-toggle { display: flex; gap: 4px; background: var(--card, rgba(255,255,255,0.45)); border-radius: var(--radius-xs, 9px); padding: 3px; }
        .role-toggle button { flex: 1; padding: 8px 12px; border: none; border-radius: 7px; background: transparent; font-family: 'Inter', sans-serif; font-size: 12px; color: var(--text-muted, #75726a); cursor: pointer; transition: all 0.15s; }
        .role-toggle button.active { background: var(--gold, #b3872a); color: #fff; font-weight: 600; }
        .role-hint { font-family: 'Inter', sans-serif; font-size: 12px; color: var(--text-muted, #75726a); margin-top: 8px; line-height: 1.5; }
      `}</style>
    </>
  );
}
