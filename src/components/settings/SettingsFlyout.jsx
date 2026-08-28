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

  const SECTION_META = {
    appearance: { title: 'Appearance', sub: 'How Vinta School OS looks on this device' },
    account: { title: 'My Account', sub: 'Your personal login and contact details' },
    academy: { title: 'Academy Profile', sub: 'Shown on the top nav and in parent messages' },
    staff: { title: 'Staff & Roles', sub: 'Manage who has access and their PINs' },
    'billing-config': { title: 'Billing Configuration', sub: 'Defaults for tuition, alerts, and reminders' },
    automations: { title: 'Automations', sub: 'Check-in/out and class-end behavior' },
    export: { title: 'Data & Export', sub: "Download your academy's records as CSV" },
    subscription: { title: 'Subscription', sub: 'Your current plan and usage' },
    danger: { title: 'Danger Zone', sub: 'Irreversible actions — proceed carefully' },
  };

  const SECTION_ICONS = {
    appearance: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>,
    account: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="3.4"/><path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5"/></svg>,
    academy: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/></svg>,
    staff: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="8" r="3"/><path d="M2.5 19c1.1-3 3.3-4.6 5.5-4.6s4.4 1.6 5.5 4.6"/><circle cx="17" cy="8" r="2.4"/><path d="M14.8 14.6c2-.2 4 1.3 4.9 4.4"/></svg>,
    'billing-config': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="6.5" width="18" height="12" rx="3"/><path d="M3 10h18"/></svg>,
    automations: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M13 2 3 14h7l-1 8 10-12h-7z"/></svg>,
    export: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 19h16"/></svg>,
    subscription: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19"/></svg>,
    danger: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 2.6 18a1.8 1.8 0 0 0 1.6 2.7h15.6a1.8 1.8 0 0 0 1.6-2.7L13.7 3.9a1.8 1.8 0 0 0-3.4 0z"/></svg>,
  };

  const meta = SECTION_META[section] || SECTION_META.appearance;

  return (
    <>
      <div className={`set-overlay ${isOpen ? 'show' : ''}`} onClick={onClose}>
        <div className="set-dim" />
        <div className="set-modal glass" onClick={e => e.stopPropagation()}>
          {/* LEFT RAIL */}
          <div className="set-rail">
            <div className="set-rail-head">
              <h2>Settings</h2>
              <span>{user?.academyName || 'Academy'}</span>
            </div>
            {SECTIONS.map(g => (
              <div key={g.group} className="set-nav-group">
                <div className="set-nav-label">{g.group}</div>
                {g.items.filter(it => !it.ownerOnly || isOwner).map(it => (
                  <button key={it.id} className={`set-nav-item ${section === it.id ? 'active' : ''} ${it.id === 'danger' ? 'danger' : ''}`}
                          onClick={() => onSectionChange?.(it.id)}>
                    <span className="set-nav-icon">{SECTION_ICONS[it.id]}</span>
                    <span>{it.label}</span>
                  </button>
                ))}
              </div>
            ))}
            <div className="role-preview">
              <div className="role-preview-label">Previewing as</div>
              <div className="role-seg">
                <button className={isOwner ? 'active' : ''}>Owner</button>
                <button className={!isOwner ? 'active' : ''}>Staff</button>
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="set-content">
            <div className="set-content-head">
              <div>
                <div className="set-content-title">{meta.title}</div>
                <div className="set-content-sub">{meta.sub}</div>
              </div>
              <button className="icon-btn" onClick={onClose} title="Close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18"/></svg>
              </button>
            </div>
            <div className="set-content-scroll">
              {renderSection()}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        /* ── Overlay ── */
        .set-overlay { position: fixed; inset: 0; z-index: 8000; display: none; align-items: center; justify-content: center; padding: 24px; }
        .set-overlay.show { display: flex; }
        .set-dim { position: absolute; inset: 0; background: rgba(10,10,10,.35); opacity: 0; transition: opacity .35s ease; }
        .set-overlay.show .set-dim { opacity: 1; }

        /* ── Modal ── */
        .set-modal { position: relative; z-index: 1; width: 100%; max-width: 920px; height: min(680px, 88vh); display: flex; overflow: hidden; padding: 0; transform: scale(.94) translateY(8px); opacity: 0; transition: transform .38s cubic-bezier(.2,.9,.25,1.1), opacity .3s ease; }
        .set-overlay.show .set-modal { transform: scale(1) translateY(0); opacity: 1; }

        /* ── Left rail ── */
        .set-rail { width: 230px; flex-shrink: 0; border-right: 1px solid var(--glass-border); padding: 20px 12px; display: flex; flex-direction: column; overflow-y: auto; }
        .set-rail-head { padding: 2px 10px 16px; }
        .set-rail-head h2 { font-family: 'Space Grotesk'; font-size: 16px; font-weight: 600; margin: 0; }
        .set-rail-head span { font-size: 11.5px; color: var(--muted); }
        .set-nav-group { margin-bottom: 14px; }
        .set-nav-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .07em; color: var(--muted); padding: 0 10px 6px; }
        .set-nav-item { display: flex; align-items: center; gap: 11px; padding: 10px 10px; border: none; border-radius: var(--r-md); cursor: pointer; color: var(--muted); font-family: 'Inter'; font-size: 13px; font-weight: 500; transition: .15s; background: transparent; width: 100%; text-align: left; }
        .set-nav-icon { width: 16px; height: 16px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
        .set-nav-icon svg { width: 16px; height: 16px; }
        .set-nav-item:hover { color: var(--text); background: rgba(127,127,127,0.08); }
        .set-nav-item.active { color: var(--text); background: var(--gold-soft); box-shadow: inset 0 0 0 1px var(--glass-border); font-weight: 600; }
        .set-nav-item.danger { color: var(--red); }
        .set-nav-item.danger:hover { background: var(--red-soft); }

        /* ── Role preview ── */
        .role-preview { margin-top: auto; padding: 12px 10px 2px; border-top: 1px solid var(--divider); }
        .role-preview-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); margin-bottom: 8px; }
        .role-seg { display: flex; gap: 3px; padding: 3px; background: var(--input-bg); border: 1px solid var(--glass-border); border-radius: 100px; }
        .role-seg button { flex: 1; border: none; background: transparent; color: var(--muted); font-size: 11.5px; font-weight: 600; padding: 7px 0; border-radius: 100px; cursor: pointer; transition: .15s; font-family: 'Inter'; }
        .role-seg button.active { background: linear-gradient(150deg, var(--gold), var(--emerald)); color: #fff; }

        /* ── Right content ── */
        .set-content { flex: 1; min-width: 0; display: flex; flex-direction: column; min-height: 0; }
        .set-content-head { display: flex; align-items: flex-start; justify-content: space-between; padding: 22px 26px 14px; border-bottom: 1px solid var(--divider); flex-shrink: 0; }
        .set-content-title { font-family: 'Space Grotesk'; font-size: 18px; font-weight: 600; }
        .set-content-sub { font-size: 12.5px; color: var(--muted); margin-top: 3px; }
        .set-content-scroll { flex: 1; overflow-y: auto; padding: 22px 26px 34px; }

        /* ── Section content ── */
        .settings-section { margin-bottom: 28px; }
        .settings-section:last-child { margin-bottom: 0; }
        .settings-section h3 { font-family: 'Space Grotesk'; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); margin: 0 0 12px; }
        .settings-section h4 { font-family: 'Space Grotesk'; font-size: 14px; font-weight: 600; color: var(--text); margin: 16px 0 10px; }
        .section-desc { font-size: 12.5px; color: var(--muted); margin-bottom: 16px; }

        /* ── Shared form elements ── */
        .field-label { font-size: 10.5px; color: var(--muted); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 6px; display: block; }
        .field-input { width: 100%; background: var(--input-bg); border: 1px solid var(--glass-border); border-radius: var(--r-sm); padding: 10px 12px; color: var(--text); font-family: 'Inter'; font-size: 13px; outline: none; }
        .field-input:focus { box-shadow: 0 0 0 2px var(--gold-soft); }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .field-group { margin-bottom: 14px; }
        .field-group:last-child { margin-bottom: 0; }
        textarea.field-input { resize: vertical; min-height: 64px; }

        /* ── Cards & rows ── */
        .set-card { background: var(--glass); border: 1px solid var(--glass-border); border-radius: var(--r-md); padding: 4px 16px; }
        .set-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 0; border-top: 1px solid var(--divider); }
        .set-row:first-child { border-top: none; }
        .set-row-label { font-size: 13.5px; font-weight: 500; }
        .set-row-desc { font-size: 11.5px; color: var(--muted); margin-top: 2px; }
        .set-row-control { flex-shrink: 0; display: flex; align-items: center; gap: 10px; }

        /* ── Buttons ── */
        .save-btn { background: linear-gradient(150deg, var(--gold), var(--emerald)); color: #fff; border: none; border-radius: var(--r-sm); padding: 10px 18px; font-weight: 600; font-size: 12.5px; cursor: pointer; transition: .15s; font-family: 'Inter'; }
        .save-btn:hover { transform: translateY(-1px); }
        .ghost-btn { background: var(--glass); border: 1px solid var(--glass-border); color: var(--text); border-radius: var(--r-sm); padding: 10px 16px; font-weight: 600; font-size: 12.5px; cursor: pointer; transition: .15s; font-family: 'Inter'; }
        .ghost-btn:hover { background: var(--glass-strong); }
        .danger-btn { background: transparent; border: 1px solid var(--red-soft); color: var(--red); border-radius: var(--r-sm); padding: 10px 16px; font-weight: 600; font-size: 12.5px; cursor: pointer; transition: .15s; font-family: 'Inter'; }
        .danger-btn:hover { background: var(--red-soft); }

        /* ── Toggle switch ── */
        .switch { width: 42px; height: 24px; border-radius: 100px; background: var(--input-bg); border: 1px solid var(--glass-border); position: relative; cursor: pointer; flex-shrink: 0; transition: .2s; }
        .switch .knob { width: 18px; height: 18px; border-radius: 50%; background: var(--muted); position: absolute; top: 2px; left: 2px; transition: .2s cubic-bezier(.4,0,.2,1); }
        .switch.on { background: linear-gradient(150deg, var(--gold), var(--emerald)); border-color: transparent; }
        .switch.on .knob { left: 20px; background: #fff; }

        /* ── Segmented control ── */
        .seg { display: flex; gap: 3px; padding: 3px; background: var(--input-bg); border: 1px solid var(--glass-border); border-radius: 100px; }
        .seg button { border: none; background: transparent; color: var(--muted); font-size: 12px; font-weight: 600; padding: 7px 14px; border-radius: 100px; cursor: pointer; transition: .15s; font-family: 'Inter'; display: flex; align-items: center; gap: 6px; }
        .seg button.active { background: linear-gradient(150deg, var(--gold), var(--emerald)); color: #fff; }
        .seg svg { width: 13px; height: 13px; }

        /* ── Profile badge ── */
        .profile-badge { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding: 16px; background: var(--glass); border: 1px solid var(--glass-border); border-radius: var(--r-md); }
        .profile-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-family: 'Space Grotesk'; font-weight: 700; font-size: 16px; }
        .profile-badge strong { display: block; font-family: 'Space Grotesk'; font-size: 14px; color: var(--text); }

        /* ── Role pill ── */
        .role-pill { display: inline-block; font-family: 'Inter'; font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 20px; background: rgba(179,135,42,0.12); color: var(--gold); margin-left: 6px; text-transform: capitalize; }

        /* ── Pin section ── */
        .pin-section { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--divider); }

        /* ── Staff list ── */
        .staff-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-top: 1px solid var(--divider); }
        .staff-row:first-child { border-top: none; }
        .staff-info { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
        .staff-info strong { font-family: 'Space Grotesk'; font-size: 13.5px; font-weight: 600; }
        .staff-email { font-family: 'Inter'; font-size: 12px; color: var(--muted); }
        .staff-actions { display: flex; gap: 6px; flex-shrink: 0; }

        /* ── Toggle rows ── */
        .toggle-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-top: 1px solid var(--divider); }
        .toggle-row:first-child { border-top: none; }
        .toggle-row div { display: flex; flex-direction: column; gap: 2px; }
        .toggle-row strong { font-family: 'Space Grotesk'; font-size: 13px; color: var(--text); }
        .toggle-row span { font-family: 'Inter'; font-size: 11.5px; color: var(--muted); }

        /* ── Export ── */
        .export-list { display: flex; flex-direction: column; gap: 8px; }

        /* ── Subscription ── */
        .sub-card { display: flex; align-items: center; gap: 12px; padding: 16px; border-radius: var(--r-md); background: linear-gradient(150deg, var(--gold-soft), var(--emerald-soft)); border: 1px solid var(--glass-border); }
        .sub-tier { font-family: 'Space Grotesk'; font-size: 16px; font-weight: 700; color: var(--text); text-transform: capitalize; }
        .sub-status { font-family: 'Inter'; font-size: 11px; font-weight: 600; padding: 4px 11px; border-radius: 100px; }
        .sub-status.active { background: var(--emerald); color: #fff; }

        /* ── Danger zone ── */
        .danger-section .set-card { border: 1px solid rgba(179,66,58,.3); }
        .danger-card { display: flex; justify-content: space-between; align-items: center; padding: 16px; }
        .danger-card div { display: flex; flex-direction: column; gap: 2px; }
        .danger-card strong { font-family: 'Space Grotesk'; font-size: 14px; color: var(--text); }
        .danger-card span { font-family: 'Inter'; font-size: 12px; color: var(--muted); }
        .confirm-delete { display: flex; align-items: center; gap: 8px; }
        .confirm-delete span { font-family: 'Inter'; font-size: 12px; color: var(--muted); }

        /* ── Upgrade notice ── */
        .upgrade-notice { padding: 12px 16px; border-radius: var(--r-md); margin-bottom: 16px; background: var(--gold-soft); border: 1px solid var(--glass-border); }
        .upgrade-notice p { font-family: 'Inter'; font-size: 12px; color: var(--text); margin: 0; line-height: 1.5; }
      `}</style>
    </>
  );
}
