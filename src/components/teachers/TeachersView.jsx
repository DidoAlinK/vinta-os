import React, { useState, useMemo } from 'react';
import { Phone, MessageSquare, Trash2, Plus, Search, BookOpen, Users, Clock, UserCheck } from 'lucide-react';
import { colorFor, initialsOf } from '../../styles/design-tokens';
import TeacherDrawer from './TeacherDrawer';
import AddTeacherModal from './AddTeacherModal';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'hourly', label: 'Hourly' },
  { id: 'per-student', label: 'Per-student' },
];

/**
 * TeachersView — Directory page for browsing, searching, and managing teachers.
 *
 * Props:
 *   teachers — Array of teacher objects:
 *     { id, name, last, phone, subject, classes, contract: 'hourly'|'per-student',
 *       rate, schedule: [...] }
 */
export default function TeachersView({ teachers = [] }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [drawerTeacher, setDrawerTeacher] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const stats = useMemo(() => {
    const total = teachers.length;
    const hourly = teachers.filter((t) => t.contract === 'hourly').length;
    const perStudent = teachers.filter((t) => t.contract === 'per-student').length;
    return { total, hourly, perStudent };
  }, [teachers]);

  const filtered = useMemo(() => {
    let list = teachers;
    if (filter !== 'all') {
      list = list.filter((t) => t.contract === filter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (t) =>
          (t.name || '').toLowerCase().includes(q) ||
          (t.last || '').toLowerCase().includes(q) ||
          (t.subject || '').toLowerCase().includes(q) ||
          (t.phone || '').includes(q) ||
          (t.classes || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [teachers, filter, search]);

  function handleDelete(e, id) {
    e.stopPropagation();
    /* parent wiring via callback — placeholder */
  }

  function handleCall(e, phone) {
    e.stopPropagation();
    if (phone) window.location.href = `tel:${phone}`;
  }

  function handleMessage(e, phone) {
    e.stopPropagation();
    if (phone) window.open(`sms:${phone}`, '_blank');
  }

  function handleAdd(data) {
    setShowAdd(false);
    /* parent wiring via callback — placeholder */
  }

  return (
    <div className="teachers-view glass" style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* ── Stats rail ──────────────────────────────────────────── */}
      <div className="stats-rail">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--gold-soft)', color: 'var(--gold)' }}>
            <Users size={18} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total teachers</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--gold-soft)', color: 'var(--gold)' }}>
            <Clock size={18} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.hourly}</span>
            <span className="stat-label">Hourly contracts</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--emerald-soft)', color: 'var(--emerald)' }}>
            <UserCheck size={18} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.perStudent}</span>
            <span className="stat-label">Per-student</span>
          </div>
        </div>
      </div>

      {/* ── Search + filter ─────────────────────────────────────── */}
      <div className="directory-toolbar">
        <div className="search-box">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search teachers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-chips">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              className={`chip ${filter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Teacher list ────────────────────────────────────────── */}
      <div className="teacher-list">
        {filtered.length === 0 && (
          <div className="empty-state">
            <BookOpen size={34} />
            <span className="empty-title">No teachers match this view</span>
            <span className="empty-sub">Try adjusting your search or filter.</span>
          </div>
        )}
        {filtered.map((t) => {
          const [c1, c2] = colorFor(t.id);
          return (
            <div
              key={t.id}
              className="teacher-row"
              onClick={() => setDrawerTeacher(t)}
            >
              <div className="teacher-avatar" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                {initialsOf(t.name, t.last)}
              </div>
              <div className="teacher-info">
                <span className="teacher-name">{t.name} {t.last}</span>
                <span className="teacher-subject">
                  {t.subject || '—'}
                  {t.classes ? ` · ${t.classes}` : ''}
                </span>
              </div>
              <span className={`badge ${t.contract === 'per-student' ? 'per-student' : 'hourly'}`}>
                {t.contract === 'per-student' ? 'Per-student' : 'Hourly'}
              </span>
              <span className="teacher-phone">{t.phone || '—'}</span>
              <div className="teacher-actions" onClick={(e) => e.stopPropagation()}>
                <button className="icon-btn" title="Call" onClick={(e) => handleCall(e, t.phone)}>
                  <Phone size={16} />
                </button>
                <button className="icon-btn" title="Message" onClick={(e) => handleMessage(e, t.phone)}>
                  <MessageSquare size={16} />
                </button>
                <button className="icon-btn danger" title="Delete" onClick={(e) => handleDelete(e, t.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── FAB ─────────────────────────────────────────────────── */}
      <button className="fab" onClick={() => setShowAdd(true)} title="Add teacher">
        <Plus size={22} />
      </button>

      {/* ── Modals & drawers ────────────────────────────────────── */}
      {showAdd && (
        <AddTeacherModal
          onClose={() => setShowAdd(false)}
          onAdd={handleAdd}
        />
      )}
      {drawerTeacher && (
        <TeacherDrawer
          teacher={drawerTeacher}
          onClose={() => setDrawerTeacher(null)}
          onDelete={(id) => { setDrawerTeacher(null); handleDelete(new Event('click'), id); }}
        />
      )}

      <style>{`
        .teachers-view { border-radius: var(--r-lg, 22px); padding: 0; gap: 0; }

        /* ── Stats rail ───────────────────────────────────────── */
        .stats-rail {
          display: flex; gap: 12px; padding: 18px 22px 0;
        }
        .stat-card {
          flex: 1; display: flex; align-items: center; gap: 12px;
          padding: 14px 16px;
          background: var(--glass);
          border: 1px solid var(--glass-border);
          border-radius: var(--r-md, 16px);
        }
        .stat-card .stat-icon {
          width: 36px; height: 36px; border-radius: var(--r-sm, 12px);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .stat-card .stat-info { display: flex; flex-direction: column; }
        .stat-card .stat-value { font-family: 'Space Grotesk'; font-weight: 700; font-size: 18px; line-height: 1.1; }
        .stat-card .stat-label { font-size: 11.5px; color: var(--muted); margin-top: 2px; }

        /* ── Toolbar ──────────────────────────────────────────── */
        .directory-toolbar {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 22px;
          flex-wrap: wrap;
        }
        .search-box {
          display: flex; align-items: center; gap: 8px;
          background: var(--input-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--r-sm, 12px);
          padding: 8px 14px; flex: 1; min-width: 180px;
          transition: 0.15s;
        }
        .search-box:focus-within { box-shadow: 0 0 0 2px var(--gold-soft); }
        .search-box svg { color: var(--muted); flex-shrink: 0; }
        .search-box input {
          border: none; background: none; outline: none;
          color: var(--text); font-size: 13px; width: 100%;
          font-family: 'Inter';
        }
        .filter-chips { display: flex; gap: 6px; flex-shrink: 0; }
        .chip {
          border: 1px solid var(--glass-border);
          background: var(--glass);
          color: var(--muted);
          font-size: 12px; font-weight: 600;
          padding: 7px 14px; border-radius: 100px;
          cursor: pointer; transition: 0.15s;
        }
        .chip:hover { background: var(--glass-strong); color: var(--text); }
        .chip.active {
          background: linear-gradient(150deg, var(--gold), var(--emerald));
          color: #fff; border-color: transparent;
        }

        /* ── Teacher list ─────────────────────────────────────── */
        .teacher-list {
          flex: 1; overflow-y: auto; padding: 0 14px 14px;
        }
        .teacher-row {
          display: flex; align-items: center; gap: 14px;
          padding: 12px 14px;
          border-radius: var(--r-md, 16px);
          cursor: pointer; transition: 0.12s;
          border-bottom: 1px solid var(--divider);
        }
        .teacher-row:last-child { border-bottom: none; }
        .teacher-row:hover { background: var(--slot-hover); }

        .teacher-avatar {
          width: 40px; height: 40px;
          border-radius: var(--r-sm, 12px);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 700; font-size: 13px;
          flex-shrink: 0; letter-spacing: 0.5px;
        }
        .teacher-info {
          display: flex; flex-direction: column;
          min-width: 0; flex: 1;
        }
        .teacher-name {
          font-weight: 600; font-size: 13.5px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .teacher-subject {
          font-size: 12px; color: var(--muted); margin-top: 1px;
        }
        .teacher-phone {
          font-size: 12.5px; color: var(--muted);
          flex-shrink: 0;
        }
        @media (max-width: 1150px) {
          .teacher-phone { display: none; }
        }
        .teacher-actions {
          display: flex; gap: 5px; flex-shrink: 0;
        }

        /* ── Empty state ──────────────────────────────────────── */
        .empty-state {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 50px 20px; gap: 6px; color: var(--muted);
        }
        .empty-title {
          font-family: 'Space Grotesk'; font-weight: 600;
          font-size: 14.5px; color: var(--text);
        }
        .empty-sub { font-size: 12.5px; }
      `}</style>
    </div>
  );
}
