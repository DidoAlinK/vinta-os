/**
 * Vinta School OS — Design Tokens
 *
 * Central source of truth for the glassmorphic design system.
 * Gold (#b3872a) + Emerald (#0f6b4d) palette, Space Grotesk (headings)
 * + Inter (body), squircle shapes, light/dark theme support.
 */

export const RADIUS = {
  xl: '28px',
  lg: '22px',
  md: '16px',
  sm: '12px',
  xs: '9px',
};

export const FONT = {
  heading: "'Space Grotesk', sans-serif",
  body: "'Inter', sans-serif",
};

export const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap';

/* ── Theme palettes ─────────────────────────────────────────────────── */

export const LIGHT = {
  bg: '#efece4',
  bgGrad: `radial-gradient(1100px 550px at 15% -10%, rgba(255,255,255,0.9), transparent 60%),
           radial-gradient(900px 500px at 100% 0%, rgba(201,162,39,0.10), transparent 55%),
           linear-gradient(180deg, #f4f1ea, #e9e5db)`,
  glass: 'rgba(255,255,255,0.55)',
  glassStrong: 'rgba(255,255,255,0.82)',
  glassBorder: 'rgba(255,255,255,0.75)',
  glassShadow:
    '0 1px 0 rgba(255,255,255,0.9) inset, 0 18px 40px rgba(120,105,80,0.16)',
  sheen:
    'linear-gradient(115deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.12) 30%, rgba(255,255,255,0) 55%)',
  text: '#23241f',
  muted: '#75726a',
  gold: '#b3872a',
  emerald: '#0f6b4d',
  violet: '#7a5a95',
  goldSoft: 'rgba(179,135,42,0.14)',
  emeraldSoft: 'rgba(15,107,77,0.13)',
  violetSoft: 'rgba(122,90,149,0.14)',
  red: '#b3423a',
  redSoft: 'rgba(179,66,58,0.13)',
  divider: 'rgba(35,36,31,0.09)',
  inputBg: 'rgba(255,255,255,0.6)',
  slotHover: 'rgba(179,135,42,0.10)',
  dangerHover: 'rgba(179,66,58,0.12)',
  slotBg: 'rgba(35,36,31,0.035)',
};

export const DARK = {
  bg: '#1a1a1c',
  bgGrad: `radial-gradient(1100px 550px at 15% -10%, rgba(255,255,255,0.05), transparent 60%),
           radial-gradient(900px 500px at 100% 10%, rgba(31,174,124,0.07), transparent 55%),
           linear-gradient(180deg, #1d1d20, #131315)`,
  glass: 'rgba(255,255,255,0.055)',
  glassStrong: 'rgba(255,255,255,0.10)',
  glassBorder: 'rgba(255,255,255,0.10)',
  glassShadow:
    '0 1px 0 rgba(255,255,255,0.08) inset, 0 20px 50px rgba(0,0,0,0.55)',
  sheen:
    'linear-gradient(115deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.02) 30%, rgba(255,255,255,0) 55%)',
  text: '#eceef0',
  muted: '#9497a1',
  gold: '#e0b93f',
  emerald: '#1fae7c',
  violet: '#a07cc5',
  goldSoft: 'rgba(224,185,63,0.15)',
  emeraldSoft: 'rgba(31,174,124,0.15)',
  violetSoft: 'rgba(160,124,197,0.15)',
  red: '#e07a6f',
  redSoft: 'rgba(224,122,111,0.15)',
  divider: 'rgba(255,255,255,0.08)',
  inputBg: 'rgba(255,255,255,0.05)',
  slotHover: 'rgba(224,185,63,0.10)',
  dangerHover: 'rgba(224,122,111,0.12)',
  slotBg: 'rgba(255,255,255,0.03)',
};

/* ── Status helpers ─────────────────────────────────────────────────── */

export const STATUS_META = {
  paid: { label: 'Paid', cls: 'paid', dotKey: 'emerald' },
  due: { label: 'Due soon', cls: 'due', dotKey: 'gold' },
  overdue: { label: 'Overdue', cls: 'overdue', dotKey: 'red' },
};

/* ── Subject colour map ─────────────────────────────────────────────── */

export const SUBJECT_STYLE = {
  Math: { key: 'gold' },
  French: { key: 'violet' },
  Science: { key: 'emerald' },
  English: { key: 'red' },
};

/* ── Avatar palette ─────────────────────────────────────────────────── */

export const AVATAR_PAIRS = [
  ['var(--gold)', 'var(--emerald)'],
  ['var(--emerald)', 'var(--gold)'],
  ['var(--violet)', 'var(--gold)'],
  ['var(--emerald)', 'var(--violet)'],
  ['var(--red)', 'var(--gold)'],
  ['var(--gold)', 'var(--violet)'],
];

export function colorFor(id) {
  return AVATAR_PAIRS[id % AVATAR_PAIRS.length];
}

export function initialsOf(name, last) {
  return ((name || '?')[0] + (last || '?')[0]).toUpperCase();
}

/* ── Navigation items ───────────────────────────────────────────────── */

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'students', label: 'Students' },
  { id: 'teachers', label: 'Teachers' },
  { id: 'classes', label: 'Classrooms' },
  { id: 'calendar', label: 'Week Calendar' },
  { id: 'billing', label: 'Billing' },
  { id: 'settings', label: 'Settings' },
];

/* ── Week days (Algeria: Friday is weekend) ─────────────────────────── */

export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const FULL_DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/* ── Calendar grid constants ────────────────────────────────────────── */

export const CAL_START_HOUR = 8;
export const CAL_END_HOUR = 21;
export const HOUR_PX = 60;
export const SNAP_MIN = 5;
export const MIN_DURATION_MIN = 15;
