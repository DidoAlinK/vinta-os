import React, { useState, useMemo } from 'react';
import { Users, Phone, MessageSquare, Trash2, Plus, Search, GraduationCap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { colorFor, initialsOf, STATUS_META } from '../../styles/design-tokens';
import StudentDrawer from './StudentDrawer';
import AddDirectoryStudentModal from './AddDirectoryStudentModal';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'paid', label: 'Paid' },
  { id: 'due', label: 'Due soon' },
  { id: 'overdue', label: 'Overdue' },
];

/**
 * StudentsView — Directory page for browsing, searching, and managing students.
 *
 * Props:
 *   students — Array of student objects:
 *     { id, name, last, phone, cls, status: 'paid'|'due'|'overdue' }
 */
export default function StudentsView({ students = [], onAddStudent }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [drawerStudent, setDrawerStudent] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const stats = useMemo(() => {
    const total = students.length;
    const paid = students.filter((s) => s.status === 'paid').length;
    const overdue = students.filter((s) => s.status === 'overdue').length;
    return { total, paid, overdue };
  }, [students]);

  const filtered = useMemo(() => {
    let list = students;
    if (filter !== 'all') {
      list = list.filter((s) => s.status === filter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          (s.name || '').toLowerCase().includes(q) ||
          (s.last || '').toLowerCase().includes(q) ||
          (s.phone || '').includes(q) ||
          (s.cls || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [students, filter, search]);

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
    onAddStudent?.(data);
    setShowAdd(false);
  }

  return (
    <div className="students-view glass" style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* ── Stats rail ──────────────────────────────────────────── */}
      <div className="stats-rail">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--gold-soft)', color: 'var(--gold)' }}>
            <Users size={18} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total students</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--emerald-soft)', color: 'var(--emerald)' }}>
            <CheckCircle2 size={18} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.paid}</span>
            <span className="stat-label">Paid</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--red-soft)', color: 'var(--red)' }}>
            <AlertCircle size={18} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.overdue}</span>
            <span className="stat-label">Overdue</span>
          </div>
        </div>
      </div>

      {/* ── Search + filter ─────────────────────────────────────── */}
      <div className="directory-toolbar">
        <div className="search-box">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search students…"
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

      {/* ── Student list ────────────────────────────────────────── */}
      <div className="student-list">
        {filtered.length === 0 && (
          <div className="empty-state">
            <GraduationCap size={34} />
            <span className="empty-title">No students match this view</span>
            <span className="empty-sub">Try adjusting your search or filter.</span>
          </div>
        )}
        {filtered.map((s) => {
          const [c1, c2] = colorFor(s.id);
          const meta = STATUS_META[s.status] || STATUS_META.paid;
          return (
            <div
              key={s.id}
              className="student-row"
              onClick={() => setDrawerStudent(s)}
            >
              <div className="student-avatar" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                {initialsOf(s.name, s.last)}
              </div>
              <div className="student-info">
                <span className="student-name">{s.name} {s.last}</span>
                <span className="student-meta">{s.cls || '—'}</span>
              </div>
              <span className="student-phone">{s.phone || '—'}</span>
              <span className={`badge ${meta.cls}`}>{meta.label}</span>
              <div className="student-actions" onClick={(e) => e.stopPropagation()}>
                <button className="icon-btn" title="Call" onClick={(e) => handleCall(e, s.phone)}>
                  <Phone size={16} />
                </button>
                <button className="icon-btn" title="Message" onClick={(e) => handleMessage(e, s.phone)}>
                  <MessageSquare size={16} />
                </button>
                <button className="icon-btn danger" title="Delete" onClick={(e) => handleDelete(e, s.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── FAB ─────────────────────────────────────────────────── */}
      <button className="fab" onClick={() => setShowAdd(true)} title="Add student">
        <Plus size={22} />
      </button>

      {/* ── Modals & drawers ────────────────────────────────────── */}
      <AddDirectoryStudentModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={handleAdd}
      />
      {drawerStudent && (
        <StudentDrawer
          student={drawerStudent}
          onClose={() => setDrawerStudent(null)}
          onDelete={(id) => { setDrawerStudent(null); handleDelete(new Event('click'), id); }}
        />
      )}

      <style>{`
        .students-view { border-radius: var(--r-lg, 22px); padding: 0; gap: 0; }

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

        /* ── Student list ─────────────────────────────────────── */
        .student-list {
          flex: 1; overflow-y: auto; padding: 0 14px 14px;
        }
        .student-row {
          display: flex; align-items: center; gap: 14px;
          padding: 12px 14px;
          border-radius: var(--r-md, 16px);
          cursor: pointer; transition: 0.12s;
          border-bottom: 1px solid var(--divider);
        }
        .student-row:last-child { border-bottom: none; }
        .student-row:hover { background: var(--slot-hover); }

        .student-avatar {
          width: 40px; height: 40px;
          border-radius: var(--r-sm, 12px);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 700; font-size: 13px;
          flex-shrink: 0; letter-spacing: 0.5px;
        }
        .student-info {
          display: flex; flex-direction: column;
          min-width: 0; flex: 1;
        }
        .student-name {
          font-weight: 600; font-size: 13.5px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .student-meta {
          font-size: 12px; color: var(--muted); margin-top: 1px;
        }
        .student-phone {
          font-size: 12.5px; color: var(--muted);
          flex-shrink: 0;
        }
        @media (max-width: 1150px) {
          .student-phone { display: none; }
        }
        .student-actions {
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
