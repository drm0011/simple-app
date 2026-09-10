export default function CoverageBar({ label, pct }) {
  return (
    <div className="coverage-bar">
      <div className="label mono">{label}</div>
      <div className="coverage-track">
        <div className="coverage-fill" style={{ width: pct + '%' }} />
      </div>
      <div className="pct">{pct}%</div>
    </div>
  )
}
