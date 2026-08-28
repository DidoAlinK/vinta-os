import React, { useState, useCallback } from 'react';

const SECTIONS = [
  { group: 'General', items: [
    { id: 'appearance', label: 'Appearance', ownerOnly: false },
    { id: 'account', label: 'My Account', ownerOnly: false },
  ]},
  { group: 'Academy', items: [
    { id: 'academy', label: 'Academy Profile', ownerOnly: true },
    { id: 'staff', label: 'Staff & Roles', ownerOnly: true },
    { id: 'billing-config', label: 'Billing Configuration', ownerOnly: true },
    { id: 'automations', label: 'Automations', ownerOnly: true },
  ]},
  { group: 'Other', items: [
    { id: 'export', label: 'Data & Export', ownerOnly: false },
    { id: 'subscription', label: 'Subscription', ownerOnly: true },
    { id: 'danger', label: 'Danger Zone', ownerOnly: true },
  ]},
];

function Field({ label, children }) {
  return <div className="field-row"><label className="field-label">{label}</label>{children}</div>;
}

export default function SettingsFlyout({
  isOpen, onClose, activeSection, onSectionChange,
  user = {}, academySettings = {}, subscription = {}, staffList = [], isOwner = false,
  onUpdateProfile, onUpdateAcademy, onUpdateBillingConfig, onUpdateAutomations,
  onChangePin, onAddStaff, onRemoveStaff, onDeleteAcademy, onChangePassword,
  onExportStudents, onExportBilling, onExportHours,
}) {
  const [pinForm, setPinForm] = useState({ old: '', new1: '', new2: '' });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const section = activeSection || 'appearance';

  if (!isOpen) return null;

  const renderSection = () => {
    switch (section) {
      case 'appearance':
        return (
          <div className="settings-section">
            <h3>Appearance</h3>
            <Field label="Theme">
              <select className="field-input" defaultValue={academySettings.defaultTheme || 'light'}
                      onChange={e => onUpdateAcademy?.({ defaultTheme: e.target.value })}>
                <option value="light">Light</option><option value="dark">Dark</option>
              </select>
            </Field>
            <Field label="Font Size">
              <select className="field-input" defaultValue={academySettings.defaultFontSize || 'normal'}
                      onChange={e => onUpdateAcademy?.({ defaultFontSize: e.target.value })}>
                <option value="normal">Normal</option><option value="large">Large</option>
              </select>
            </Field>
            <Field label="Language">
              <select className="field-input" defaultValue={academySettings.defaultLanguage || 'fr'}
                      onChange={e => onUpdateAcademy?.({ defaultLanguage: e.target.value })}>
                <option value="fr">Français</option><option value="ar">العربية</option>
              </select>
            </Field>
          </div>
        );
      case 'account':
        return (
          <div className="settings-section">
            <h3>My Account</h3>
            <div className="profile-badge">
              <div className="profile-avatar" style={{ background: `linear-gradient(135deg, ${user.avatarColors?.[0] || 'var(--gold)'}, ${user.avatarColors?.[1] || 'var(--emerald)'})` }}>
                {user.name?.[0]}
              </div>
              <div><strong>{user.name}</strong><span className="role-pill">{user.role}</span></div>
            </div>
            <Field label="Name"><input className="field-input" defaultValue={user.name} /></Field>
            <Field label="Phone"><input className="field-input" defaultValue={user.phone} /></Field>
            <Field label="Email"><input className="field-input" defaultValue={user.email} type="email" /></Field>
            <button className="save-btn" onClick={() => onUpdateProfile?.({})}>Save Changes</button>
            {user.role === 'staff' && (
              <div className="pin-section">
                <h4>Change PIN</h4>
                <Field label="Current PIN"><input className="field-input" type="password" maxLength={4} value={pinForm.old} onChange={e => setPinForm({...pinForm, old: e.target.value})} /></Field>
                <Field label="New PIN"><input className="field-input" type="password" maxLength={4} value={pinForm.new1} onChange={e => setPinForm({...pinForm, new1: e.target.value})} /></Field>
                <Field label="Confirm PIN"><input className="field-input" type="password" maxLength={4} value={pinForm.new2} onChange={e => setPinForm({...pinForm, new2: e.target.value})} /></Field>
                <button className="save-btn" onClick={() => onChangePin?.(pinForm.old, pinForm.new1)}>Update PIN</button>
              </div>
            )}
          </div>
        );
      case 'academy':
        return (
          <div className="settings-section">
            <h3>Academy Profile</h3>
            <Field label="Academy Name"><input className="field-input" defaultValue={academySettings.name} /></Field>
            <Field label="Phone"><input className="field-input" defaultValue={academySettings.phone} /></Field>
            <Field label="Email"><input className="field-input" defaultValue={academySettings.email} type="email" /></Field>
            <Field label="Address"><input className="field-input" defaultValue={academySettings.address} /></Field>
            <Field label="Weekend Day">
              <select className="field-input" defaultValue={academySettings.weekendDay || 5}>
                <option value={5}>Friday</option><option value={6}>Saturday</option>
              </select>
            </Field>
            <Field label="Current Term"><input className="field-input" defaultValue={academySettings.currentTerm} /></Field>
            <button className="save-btn" onClick={() => onUpdateAcademy?.({})}>Save</button>
          </div>
        );
      case 'staff':
        return (
          <div className="settings-section">
            <h3>Staff & Roles</h3>
            {staffList.map(s => (
              <div key={s.id} className="staff-row">
                <div className="staff-info">
                  <strong>{s.name}</strong>
                  <span className="role-pill">{s.role}</span>
                  <span className="staff-email">{s.email}</span>
                </div>
                <div className="staff-actions">
                  {isOwner && s.role !== 'owner' && (
                    <button className="ghost-btn danger-btn" onClick={() => onRemoveStaff?.(s.id)}>Remove</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      case 'billing-config':
        return (
          <div className="settings-section">
            <h3>Billing Configuration</h3>
            <Field label="Currency"><input className="field-input" defaultValue={academySettings.currency || 'DZD'} readOnly /></Field>
            <Field label="Default Plan Duration">
              <select className="field-input" defaultValue={academySettings.defaultPlanDuration || 30}>
                <option value={30}>30 days (Monthly)</option><option value={90}>90 days (Term)</option>
              </select>
            </Field>
            <Field label="Billing Reminder">
              <select className="field-input" defaultValue={academySettings.billingReminderDays || 3}>
                <option value={3}>3 days before</option><option value={5}>5 days before</option><option value={7}>7 days before</option>
              </select>
            </Field>
            <Field label="Due Date Reminder">
              <select className="field-input" defaultValue={academySettings.dueDateReminderTiming || 'same_day'}>
                <option value="same_day">Same day</option><option value="custom">Custom</option>
              </select>
            </Field>
            <Field label="WhatsApp Template">
              <textarea className="field-input" rows={3} defaultValue={academySettings.whatsappTemplate} placeholder="Use {student_name}, {amount}, {due_date}" />
            </Field>
            <button className="save-btn" onClick={() => onUpdateBillingConfig?.({})}>Save</button>
          </div>
        );
      case 'automations':
        return (
          <div className="settings-section">
            <h3>Automations</h3>
            {subscription.tier !== 'scaler' && (
              <div className="upgrade-notice glass">
                <p>⚡ Automations are available on the <strong>Scaler</strong> plan.</p>
              </div>
            )}
            <div className="toggle-row">
              <div><strong>Auto Check-out</strong><span>Automatically check out students when class ends</span></div>
              <label className="toggle"><input type="checkbox" checked={academySettings.autoCheckoutEnabled || false}
                onChange={e => onUpdateAutomations?.({ autoCheckoutEnabled: e.target.checked })}
                disabled={subscription.tier !== 'scaler'} /><span className="toggle-slider" /></label>
            </div>
            <div className="toggle-row">
              <div><strong>Class End Popup</strong><span>Show "Is the class done?" when session time ends</span></div>
              <label className="toggle"><input type="checkbox" checked={academySettings.endClassPopupEnabled || false}
                onChange={e => onUpdateAutomations?.({ endClassPopupEnabled: e.target.checked })}
                disabled={subscription.tier !== 'scaler'} /><span className="toggle-slider" /></label>
            </div>
          </div>
        );
      case 'export':
        return (
          <div className="settings-section">
            <h3>Data & Export</h3>
            <p className="section-desc">Download your academy data as CSV files.</p>
            <div className="export-list">
              <button className="ghost-btn" onClick={onExportStudents}>📥 Export Students</button>
              <button className="ghost-btn" onClick={onExportBilling}>📥 Export Billing History</button>
              <button className="ghost-btn" onClick={onExportHours}>📥 Export Teacher Hours</button>
            </div>
          </div>
        );
      case 'subscription':
        return (
          <div className="settings-section">
            <h3>Subscription</h3>
            <div className="sub-card glass">
              <span className="sub-tier">{subscription.tier || 'starter'}</span>
              <span className={`sub-status ${subscription.status}`}>{subscription.status || 'active'}</span>
            </div>
            <p className="section-desc">Invoicing method: {subscription.invoicingMethod || 'Manual'}</p>
          </div>
        );
      case 'danger':
        return (
          <div className="settings-section danger-section">
            <h3>Danger Zone</h3>
            <div className="danger-card">
              <div><strong>Delete Academy</strong><span>This will permanently delete all data. This cannot be undone.</span></div>
              {!confirmDelete ? (
                <button className="danger-btn" onClick={() => setConfirmDelete(true)}>Delete Academy</button>
              ) : (
                <div className="confirm-delete">
                  <span>Type "DELETE" to confirm:</span>
                  <button className="danger-btn" onClick={() => { onDeleteAcademy?.(); setConfirmDelete(false); }}>Confirm</button>
                  <button className="ghost-btn" onClick={() => setConfirmDelete(false)}>Cancel</button>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return <div className="settings-section"><p>Select a section.</p></div>;
    }
  };

  return (
    <>
      <div className={`overlay ${isOpen ? 'show' : ''}`} onClick={onClose}>
        <div className="settings-flyout glass" onClick={e => e.stopPropagation()}>
          <div className="settings-rail">
            <div className="rail-header">
              <h2>Settings</h2>
              <button className="icon-btn" onClick={onClose}>✕</button>
            </div>
            {SECTIONS.map(g => (
              <div key={g.group} className="rail-group">
                <span className="rail-group-label">{g.group}</span>
                {g.items.filter(it => !it.ownerOnly || isOwner).map(it => (
                  <button key={it.id} className={`rail-item ${section === it.id ? 'active' : ''}`}
                          onClick={() => onSectionChange?.(it.id)}>{it.label}</button>
                ))}
              </div>
            ))}
            <div className="role-preview">
              <span className="role-pill">{isOwner ? 'owner' : 'staff'}</span>
            </div>
          </div>
          <div className="settings-content">
            {renderSection()}
          </div>
        </div>
      </div>
      <style>{`
        .settings-flyout { position: fixed; top: 0; right: 0; bottom: 0; width: 720px; max-width: 90vw; display: flex; z-index: 8000; border-radius: var(--radius-xl) 0 0 var(--radius-xl); }
        .settings-rail { width: 220px; border-right: 1px solid var(--border); padding: 24px; display: flex; flex-direction: column; gap: 4px; overflow-y: auto; }
        .rail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .rail-header h2 { font-family: 'Space Grotesk'; font-size: 20px; font-weight: 700; color: var(--text); }
        .rail-group { margin-bottom: 12px; }
        .rail-group-label { font-family: 'Inter'; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); padding: 0 8px; margin-bottom: 4px; display: block; }
        .rail-item { display: block; width: 100%; text-align: left; padding: 8px 12px; border: none; border-radius: var(--radius-xs); background: transparent; font-family: 'Inter'; font-size: 13px; color: var(--text-muted); cursor: pointer; transition: all 0.15s; }
        .rail-item:hover { background: var(--card); color: var(--text); }
        .rail-item.active { background: rgba(179,135,42,0.12); color: var(--gold); font-weight: 600; }
        .settings-content { flex: 1; padding: 28px 32px; overflow-y: auto; }
        .settings-section h3 { font-family: 'Space Grotesk'; font-size: 18px; font-weight: 700; color: var(--text); margin-bottom: 20px; }
        .settings-section h4 { font-family: 'Space Grotesk'; font-size: 14px; font-weight: 600; color: var(--text); margin: 16px 0 10px; }
        .section-desc { font-family: 'Inter'; font-size: 13px; color: var(--text-muted); margin-bottom: 16px; }
        .profile-badge { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding: 12px; background: var(--card); border-radius: var(--radius-md); }
        .profile-avatar { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; font-family: 'Space Grotesk'; font-weight: 700; font-size: 16px; }
        .profile-badge strong { display: block; font-family: 'Space Grotesk'; font-size: 14px; color: var(--text); }
        .role-pill { display: inline-block; font-family: 'Inter'; font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 20px; background: rgba(179,135,42,0.12); color: var(--gold); margin-left: 6px; text-transform: capitalize; }
        .pin-section { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); }
        .staff-row { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--card); border-radius: var(--radius-sm); margin-bottom: 8px; }
        .staff-info { display: flex; align-items: center; gap: 8px; }
        .staff-info strong { font-family: 'Space Grotesk'; font-size: 13px; color: var(--text); }
        .staff-email { font-family: 'Inter'; font-size: 12px; color: var(--text-muted); }
        .toggle-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid var(--border); }
        .toggle-row div { display: flex; flex-direction: column; gap: 2px; }
        .toggle-row strong { font-family: 'Space Grotesk'; font-size: 13px; color: var(--text); }
        .toggle-row span { font-family: 'Inter'; font-size: 12px; color: var(--text-muted); }
        .export-list { display: flex; flex-direction: column; gap: 8px; }
        .sub-card { display: flex; align-items: center; gap: 12px; padding: 16px; border-radius: var(--radius-md); margin-bottom: 12px; }
        .sub-tier { font-family: 'Space Grotesk'; font-size: 16px; font-weight: 700; color: var(--text); text-transform: capitalize; }
        .sub-status { font-family: 'Inter'; font-size: 12px; padding: 2px 8px; border-radius: 20px; }
        .sub-status.active { background: rgba(15,107,77,0.12); color: var(--emerald); }
        .danger-section h3 { color: var(--red); }
        .danger-card { display: flex; justify-content: space-between; align-items: center; padding: 16px; border: 1px solid var(--red); border-radius: var(--radius-md); }
        .danger-card div { display: flex; flex-direction: column; gap: 2px; }
        .danger-card strong { font-family: 'Space Grotesk'; font-size: 14px; color: var(--text); }
        .danger-card span { font-family: 'Inter'; font-size: 12px; color: var(--text-muted); }
        .confirm-delete { display: flex; align-items: center; gap: 8px; }
        .confirm-delete span { font-family: 'Inter'; font-size: 12px; color: var(--text-muted); }
        .upgrade-notice { padding: 12px 16px; border-radius: var(--radius-md); margin-bottom: 16px; }
        .upgrade-notice p { font-family: 'Inter'; font-size: 13px; color: var(--text); margin: 0; }
      `}</style>
    </>
  );
}
