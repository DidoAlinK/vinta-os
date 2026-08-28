import React, { useState, useMemo } from 'react';
import EmptyState from '../shared/EmptyState';

const CHART_PROPERTIES = [
  { key: 'income', label: 'Total Income' },
  { key: 'paid_vs_overdue', label: 'Paid vs Overdue' },
  { key: 'enrollments', label: 'Enrollments vs Cancellations' },
  { key: 'hours', label: 'Teacher Hours Logged' },
  { key: 'studentsPerTeacher', label: 'Students per Teacher' },
  { key: 'avgRevenue', label: 'Avg Revenue per Student' },
  { key: 'overdueCount', label: 'Overdue Accounts' },
  { key: 'subjectIncome', label: 'Income by Subject' },
];

function DonutRing({ data, size = 160, stroke = 18, colors, labels }) {
  const total = data.reduce((s, v) => s + v, 0) || 1;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--border)" strokeWidth={stroke} />
      {data.map((val, i) => {
        const pct = val / total;
        const dash = pct * circumference;
        const el = (
          <circle key={i} cx={size/2} cy={size/2} r={radius} fill="none"
                  stroke={colors[i]} strokeWidth={stroke}
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="round" style={{ transition: 'all 0.5s' }} />
        );
        offset += dash;
        return el;
      })}
      <text x={size/2} y={size/2 - 6} textAnchor="middle" fill="var(--text)" fontFamily="'Space Grotesk'" fontSize="20" fontWeight="700">{total}</text>
      <text x={size/2} y={size/2 + 14} textAnchor="middle" fill="var(--text-muted)" fontFamily="'Inter'" fontSize="11">total</text>
    </svg>
  );
}

export default function BillingView({
  tuitionData = { paid: 0, due: 0, overdue: 0, total: 0 },
  payrollData = { pending: 0, settled: 0, overdue: 0, total: 0 },
  chartData = [],
  chartProperty = 'income',
  onChartPropertyChange,
  breakdownData = [],
  onOpenBreakdown,
  onExportCSV,
}) {
  const [expandedStat, setExpandedStat] = useState(null);

  const hasData = tuitionData.total > 0 || payrollData.total > 0;

  if (!hasData) {
    return <EmptyState icon="💰" title="No billing data yet" subtitle="Start enrolling students and tracking payments to see financial insights here." />;
  }

  return (
    <>
      <div className="billing-view">
        {/* Donut Ring Cards */}
        <div className="billing-rings">
          <div className="ring-card glass" onClick={() => onOpenBreakdown?.('student')}>
            <h4>Student Tuition</h4>
            <DonutRing data={[tuitionData.paid, tuitionData.due, tuitionData.overdue]}
                       colors={['var(--emerald)', 'var(--gold)', 'var(--red)']} />
            <div className="ring-legend">
              <span><i style={{background:'var(--emerald)'}} /> Paid ({tuitionData.paid})</span>
              <span><i style={{background:'var(--gold)'}} /> Due ({tuitionData.due})</span>
              <span><i style={{background:'var(--red)'}} /> Overdue ({tuitionData.overdue})</span>
            </div>
          </div>
          <div className="ring-card glass" onClick={() => onOpenBreakdown?.('teacher')}>
            <h4>Teacher Payroll</h4>
            <DonutRing data={[payrollData.settled, payrollData.pending, payrollData.overdue]}
                       colors={['var(--emerald)', 'var(--sky)', 'var(--red)']} />
            <div className="ring-legend">
              <span><i style={{background:'var(--emerald)'}} /> Settled ({payrollData.settled})</span>
              <span><i style={{background:'var(--sky)'}} /> Pending ({payrollData.pending})</span>
              <span><i style={{background:'var(--red)'}} /> Overdue ({payrollData.overdue})</span>
            </div>
          </div>
        </div>

        {/* Stat Buttons */}
        <div className="billing-stats">
          <button className={`stat-btn glass ${expandedStat === 'income' ? 'active' : ''}`}
                  onClick={() => setExpandedStat(expandedStat === 'income' ? null : 'income')}>
            <span className="stat-label">This Month's Income</span>
            <span className="stat-value">{tuitionData.total?.toLocaleString() || 0} DA</span>
          </button>
          <button className={`stat-btn glass ${expandedStat === 'enrolled' ? 'active' : ''}`}
                  onClick={() => setExpandedStat(expandedStat === 'enrolled' ? null : 'enrolled')}>
            <span className="stat-label">Total Enrolled</span>
            <span className="stat-value">{tuitionData.paid + tuitionData.due + tuitionData.overdue}</span>
          </button>
          <button className="stat-btn glass" onClick={() => onOpenBreakdown?.('student')}>
            <span className="stat-label">View Breakdown</span>
            <span className="stat-value">→</span>
          </button>
        </div>

        {/* Chart */}
        <div className="chart-section glass">
          <div className="chart-header">
            <h4>Revenue & Activity</h4>
            <select value={chartProperty} onChange={e => onChartPropertyChange?.(e.target.value)}>
              {CHART_PROPERTIES.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
            </select>
          </div>
          <div className="chart-area">
            {chartData.length === 0 ? (
              <p className="chart-empty">No chart data available</p>
            ) : (
              <div className="chart-bars">
                {chartData.map((d, i) => {
                  const val = d[chartProperty] || 0;
                  const max = Math.max(...chartData.map(x => x[chartProperty] || 0), 1);
                  const height = (val / max) * 180;
                  return (
                    <div key={i} className="chart-col">
                      <div className="chart-bar" style={{ height: `${height}px` }} title={`${d.month}: ${val}`} />
                      <span className="chart-label">{d.month?.slice(0, 3)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {onExportCSV && (
            <button className="ghost-btn" onClick={onExportCSV}>⬇ Export CSV</button>
          )}
        </div>
      </div>
      <style>{`
        .billing-view { display: flex; flex-direction: column; gap: 24px; }
        .billing-rings { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .ring-card { padding: 24px; border-radius: var(--radius-lg); text-align: center; cursor: pointer; }
        .ring-card h4 { font-family: 'Space Grotesk'; font-size: 14px; font-weight: 600; margin-bottom: 16px; color: var(--text); }
        .ring-legend { display: flex; gap: 12px; justify-content: center; margin-top: 12px; flex-wrap: wrap; }
        .ring-legend span { display: flex; align-items: center; gap: 6px; font-family: 'Inter'; font-size: 12px; color: var(--text-muted); }
        .ring-legend i { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
        .billing-stats { display: flex; gap: 12px; }
        .stat-btn { flex: 1; padding: 16px 20px; border-radius: var(--radius-md); text-align: left; cursor: pointer; border: 1px solid transparent; }
        .stat-btn.active { border-color: var(--gold); }
        .stat-label { display: block; font-family: 'Inter'; font-size: 12px; color: var(--text-muted); margin-bottom: 6px; }
        .stat-value { display: block; font-family: 'Space Grotesk'; font-size: 20px; font-weight: 700; color: var(--text); }
        .chart-section { padding: 24px; border-radius: var(--radius-lg); }
        .chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .chart-header h4 { font-family: 'Space Grotesk'; font-size: 15px; font-weight: 600; color: var(--text); }
        .chart-header select { background: var(--card); color: var(--text); border: 1px solid var(--border); border-radius: var(--radius-xs); padding: 6px 10px; font-family: 'Inter'; font-size: 12px; }
        .chart-area { min-height: 220px; display: flex; align-items: flex-end; justify-content: center; }
        .chart-bars { display: flex; align-items: flex-end; gap: 8px; height: 200px; }
        .chart-col { display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .chart-bar { width: 32px; background: linear-gradient(180deg, var(--gold), var(--emerald)); border-radius: 6px 6px 0 0; min-height: 4px; transition: height 0.4s ease; }
        .chart-label { font-family: 'Inter'; font-size: 10px; color: var(--text-muted); }
        .chart-empty { font-family: 'Inter'; font-size: 13px; color: var(--text-muted); text-align: center; padding: 40px; }
      `}</style>
    </>
  );
}
