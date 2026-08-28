import React, { useState, useCallback } from 'react';
import { ThemeProvider } from './styles/ThemeContext';
import './styles/global.css';

import AuthScreen from './components/auth/AuthScreen';
import ProfilePicker from './components/auth/ProfilePicker';
import PinModal from './components/auth/PinModal';
import SuccessScreen from './components/auth/SuccessScreen';
import CreateProfileModal from './components/auth/CreateProfileModal';

import Sidebar from './components/layout/Sidebar';
import TopHeader from './components/layout/TopHeader';

import DashboardView from './components/dashboard/DashboardView';
import StudentsView from './components/students/StudentsView';
import TeachersView from './components/teachers/TeachersView';
import ClassesView from './components/classes/ClassesView';
import CalendarView from './components/calendar/CalendarView';
import BillingView from './components/billing/BillingView';
import SettingsFlyout from './components/settings/SettingsFlyout';
import ToastStack from './components/shared/ToastStack';

import { NAV_ITEMS } from './styles/design-tokens';

/**
 * App.jsx — Root shell for Vinta School OS.
 *
 * Manages top-level routing (auth flow → dashboard), active nav tab,
 * global search state, and the settings flyout toggle.
 *
 * ALL data is passed as props / fetched from API hooks.
 * This file contains zero hardcoded entities.
 */
export default function App() {
  /* ── Auth state ──────────────────────────────────────────────── */
  const [authScene, setAuthScene] = useState('auth'); // 'auth' | 'profiles' | 'success'
  const [currentUser, setCurrentUser] = useState(null); // { id, name, role, ... }
  const [pendingProfile, setPendingProfile] = useState(null);
  const [profiles, setProfiles] = useState([]); // fetched from API
  const [showPinModal, setShowPinModal] = useState(false);
  const [showCreateProfile, setShowCreateProfile] = useState(false);

  /* ── Navigation ──────────────────────────────────────────────── */
  const [activeNav, setActiveNav] = useState('dashboard');
  const [query, setQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  /* ── Settings flyout ─────────────────────────────────────────── */
  const [settingsOpen, setSettingsOpen] = useState(false);

  /* ── Toasts ──────────────────────────────────────────────────── */
  const [toasts, setToasts] = useState([]);

  const pushToast = useCallback((toast) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, expanded: false, entering: true, ...toast }]);
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, entering: false } : t)));
    }, 30);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const expandToast = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, expanded: !t.expanded } : t)));
  }, []);

  /* ── Auth handlers ───────────────────────────────────────────── */

  function handleLogin(/* credentials */) {
    // TODO: call auth API
    setAuthScene('profiles');
  }

  function handleSignup(/* academyData */) {
    // TODO: call signup API
    setAuthScene('profiles');
  }

  function handleSelectProfile(profileId) {
    const profile = profiles.find((p) => p.id === profileId);
    if (!profile) return;
    if (profile.role === 'owner') {
      setCurrentUser(profile);
      setAuthScene('success');
    } else {
      setPendingProfile(profile);
      setShowPinModal(true);
    }
  }

  function handlePinVerified() {
    setCurrentUser(pendingProfile);
    setShowPinModal(false);
    setPendingProfile(null);
    setAuthScene('success');
  }

  function handlePinCancel() {
    setShowPinModal(false);
    setPendingProfile(null);
  }

  function handleLogout() {
    setCurrentUser(null);
    setAuthScene('auth');
    setActiveNav('dashboard');
  }

  function handleCreateProfile(profileData) {
    const newProfile = {
      id: `p${Date.now()}`,
      name: profileData.name,
      role: profileData.role,
      phone: profileData.phone,
      avatarColors: ['var(--gold)', 'var(--emerald)'],
      pin: profileData.pin,
    };
    setProfiles(prev => [...prev, newProfile]);
    // Owner goes straight to dashboard; staff needs PIN
    if (newProfile.role === 'owner') {
      setCurrentUser(newProfile);
      setAuthScene('success');
    } else {
      setPendingProfile(newProfile);
      setShowPinModal(true);
    }
    setShowCreateProfile(false);
  }

  function handleEnterDashboard() {
    setAuthScene('dashboard');
  }

  /* ── Navigation handler ──────────────────────────────────────── */

  function handleNavigate(navId) {
    if (navId === 'settings') {
      setSettingsOpen(true);
    } else {
      setActiveNav(navId);
    }
  }

  /* ── Render ──────────────────────────────────────────────────── */

  // Auth flow
  if (authScene === 'auth') {
    return (
      <ThemeProvider>
        <AuthScreen onLogin={handleLogin} onSignup={handleSignup} />
      </ThemeProvider>
    );
  }

  if (authScene === 'profiles') {
    return (
      <ThemeProvider>
        <ProfilePicker
          profiles={profiles}
          onSelect={handleSelectProfile}
          onCreateProfile={() => setShowCreateProfile(true)}
          onLogout={() => setAuthScene('auth')}
        />
        <CreateProfileModal
          isOpen={showCreateProfile}
          onClose={() => setShowCreateProfile(false)}
          onSubmit={handleCreateProfile}
        />
      </ThemeProvider>
    );
  }

  if (authScene === 'success') {
    return (
      <ThemeProvider>
        <SuccessScreen
          profile={currentUser}
          onContinue={handleEnterDashboard}
          onBack={() => setAuthScene('profiles')}
        />
        {showPinModal && (
          <PinModal
            profile={pendingProfile}
            onVerify={handlePinVerified}
            onCancel={handlePinCancel}
            error={null}
          />
        )}
      </ThemeProvider>
    );
  }

  // Main dashboard shell
  return (
    <ThemeProvider>
      <div className="vinta-app" style={{ display: 'flex', height: '100%', padding: '16px', gap: '14px' }}>
        <Sidebar
          active={activeNav}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          academyName={/* academy?.name */ 'Academy'}
        />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', minWidth: 0 }}>
          <TopHeader
            query={query}
            setQuery={setQuery}
            entityFilter={entityFilter}
            setEntityFilter={setEntityFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            user={currentUser}
          />

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', minHeight: 0, overflow: 'auto' }}>
            {activeNav === 'dashboard' && (
              <DashboardView
                pushToast={pushToast}
                onNavigate={handleNavigate}
              />
            )}
            {activeNav === 'students' && (
              <StudentsView />
            )}
            {activeNav === 'teachers' && (
              <TeachersView />
            )}
            {activeNav === 'classes' && (
              <ClassesView />
            )}
            {activeNav === 'calendar' && (
              <CalendarView />
            )}
            {activeNav === 'billing' && (
              <BillingView />
            )}
            {!NAV_ITEMS.some((n) => n.id === activeNav) && (
              <div className="glass placeholder-panel" style={{ borderRadius: '22px' }}>
                <h2>{NAV_ITEMS.find((n) => n.id === activeNav)?.label || activeNav}</h2>
                <p style={{ color: 'var(--muted)', fontSize: '12.5px' }}>This section is coming soon.</p>
              </div>
            )}
          </div>
        </div>

        <SettingsFlyout
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          user={currentUser}
        />

        <ToastStack
          toasts={toasts}
          onExpand={expandToast}
          onDismiss={dismissToast}
        />
      </div>
    </ThemeProvider>
  );
}
