export default function StatCard({ label, value, sub, red }) {
  return (
    <div className="card stat-card">
      <div className="stat-label">{label}</div>
      <div className={'stat-value' + (red ? ' red' : '')}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}
