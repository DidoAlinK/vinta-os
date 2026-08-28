import React, { useState } from 'react';
import { Plus, LayoutGrid, Users, BookOpen } from 'lucide-react';
import ClassDetail from './ClassDetail';
import AddClassModal from './AddClassModal';

/**
 * ClassesView — Grid of classroom cards with status indicators.
 *
 * Props:
 *   classes — Array of class objects:
 *     { id, name, teacher, enrolled, capacity, notes,
 *       schedule: [{ day, start, end, label }] }
 */
export default function ClassesView({ classes = [] }) {
  const [selectedClass, setSelectedClass] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  /* Keep selectedClass in sync with the updated list */
  const activeClass = selectedClass
    ? classes.find((c) => c.id === selectedClass.id) || null
    : null;

  function handleAdd(data) {
    setShowAdd(false);
    /* parent wiring via callback — placeholder */
  }

  function handleUpdate(data) {
    /* parent wiring via callback — placeholder */
  }

  function handleDelete(id) {
    setSelectedClass(null);
    /* parent wiring via callback — placeholder */
  }

  /* ── Detail view ──────────────────────────────────────────── */
  if (activeClass) {
    return (
      <ClassDetail
        classData={activeClass}
        onBack={() => setSelectedClass(null)}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
      />
    );
  }

  /* ── Grid view ────────────────────────────────────────────── */
  return (
    <div className="classes-view glass" style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="classes-header">
        <h2 className="classes-title"><LayoutGrid size={18} /> Classrooms</h2>
        <span className="classes-count">{classes.length} classes</span>
      </div>

      <div className="class-grid">
        {classes.map((c) => {
          const enrolled = c.enrolled ?? 0;
          const capacity = c.capacity ?? 0;
          const ratio = capacity > 0 ? enrolled / capacity : 0;
          const isEmpty = enrolled === 0;
          const isFull = capacity > 0 && enrolled >= capacity;
          const dotColor = isFull ? 'var(--red)' : isEmpty ? 'var(--muted)' : 'var(--emerald)';

          return (
            <div
              key={c.id}
              className="class-card"
              onClick={() => setSelectedClass(c)}
            >
              <div className="card-top">
                <div className="card-dot" style={{ background: dotColor }} />
                <span className="card-enrolled">
                  {enrolled}/{capacity}
                </span>
              </div>
              <h3 className="card-name">{c.name}</h3>
              <span className="card-teacher">{c.teacher || '—'}</span>

              {/* Capacity bar */}
              <div className="card-bar-track">
                <div
                  className="card-bar-fill"
                  style={{
                    width: `${Math.min(ratio * 100, 100)}%`,
                    background: isFull
                      ? 'var(--red)'
                      : 'linear-gradient(150deg, var(--gold), var(--emerald))',
                  }}
                />
              </div>
            </div>
          );
        })}

        {/* Add-new card */}
        <div className="class-card add-card" onClick={() => setShowAdd(true)}>
          <Plus size={28} style={{ color: 'var(--muted)', opacity: 0.6 }} />
          <span className="add-label">Add new class</span>
        </div>
      </div>

      {classes.length === 0 && (
        <div className="empty-state">
          <BookOpen size={34} />
          <span className="empty-title">No classes yet</span>
          <span className="empty-sub">Create your first class to get started.</span>
        </div>
      )}

      {showAdd && (
        <AddClassModal
          onClose={() => setShowAdd(false)}
          onAdd={handleAdd}
        />
      )}

      <style>{`
        .classes-view {
          border-radius: var(--r-lg, 22px); padding: 0; gap: 0;
        }

        /* ── Header ────────────────────────────────────────────── */
        .classes-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 22px 0;
        }
        .classes-title {
          font-family: 'Space Grotesk'; font-size: 16px; font-weight: 600;
          display: flex; align-items: center; gap: 8px;
        }
        .classes-count {
          font-size: 12px; color: var(--muted);
        }

        /* ── Grid ──────────────────────────────────────────────── */
        .class-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 14px;
          padding: 18px 22px 80px;
          overflow-y: auto;
        }
        .class-card {
          padding: 18px;
          background: var(--glass);
          border: 1px solid var(--glass-border);
          border-radius: var(--r-md, 16px);
          cursor: pointer;
          transition: 0.15s;
          display: flex; flex-direction: column; gap: 6px;
        }
        .class-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }
        .card-top {
          display: flex; align-items: center; justify-content: space-between;
        }
        .card-dot {
          width: 8px; height: 8px; border-radius: 50%;
        }
        .card-enrolled {
          font-size: 12px; font-weight: 600; color: var(--muted);
        }
        .card-name {
          font-family: 'Space Grotesk'; font-size: 14.5px;
          font-weight: 600;
        }
        .card-teacher {
          font-size: 12px; color: var(--muted); margin-bottom: 6px;
        }
        .card-bar-track {
          height: 4px; border-radius: 100px;
          background: var(--input-bg);
          overflow: hidden; margin-top: auto;
        }
        .card-bar-fill {
          height: 100%; border-radius: 100px;
          transition: width 0.3s ease;
        }

        /* ── Add-new card ──────────────────────────────────────── */
        .add-card {
          border-style: dashed;
          border-color: var(--glass-border);
          background: transparent;
          align-items: center; justify-content: center;
          min-height: 140px; gap: 8px;
        }
        .add-card:hover {
          background: var(--slot-hover);
          border-color: var(--gold);
        }
        .add-label {
          font-size: 12.5px; color: var(--muted); font-weight: 600;
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

        @media (max-width: 600px) {
          .class-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
        }
      `}</style>
    </div>
  );
}
