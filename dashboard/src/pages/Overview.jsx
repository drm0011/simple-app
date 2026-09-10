import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import StatCard from '../components/StatCard.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { runs, files, sourceToTest, allTests } from '../data/mock.js'

const failures = runs.filter((r) => r.status === 'failure').length
const avgSmart = Math.round(
  runs.filter((r) => r.job === 'smart-test').reduce((acc, r) => acc + r.duration, 0) /
    Math.max(1, runs.filter((r) => r.job === 'smart-test').length),
)

const chartData = [
  { day: 'Aug 28', runs: 1, failures: 0 },
  { day: 'Aug 29', runs: 2, failures: 0 },
  { day: 'Aug 30', runs: 0, failures: 0 },
  { day: 'Aug 31', runs: 3, failures: 1 },
  { day: 'Sep 1', runs: 2, failures: 1 },
  { day: 'Sep 2', runs: 1, failures: 0 },
  { day: 'Sep 3', runs: 4, failures: 0 },
]

export default function Overview() {
  return (
    <>
      <h1 className="page-title">Overview</h1>
      <p className="page-subtitle">Automated test impact analysis — PoC status at a glance</p>

      <div className="stat-grid">
        <StatCard label="Tests" value={allTests.length} sub={`${files.length} mapped source files`} />
        <StatCard label="Mapping entries" value={Object.keys(sourceToTest).length} sub="source → tests" />
        <StatCard label="Smart runs" value={runs.filter((r) => r.job === 'smart-test').length} sub={`avg ${avgSmart}s`} />
        <StatCard label="Failures" value={failures} red={failures > 0} sub="last 7 days" />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Runs per day</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#161616', border: '1px solid #2a2a2a', fontSize: 12 }}
                labelStyle={{ color: '#ffffff' }}
              />
              <Bar dataKey="runs" fill="#9ca3af" radius={[3, 3, 0, 0]} />
              <Bar dataKey="failures" fill="#cf142b" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-title">Recent runs</div>
          <table className="table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Dur</th>
              </tr>
            </thead>
            <tbody>
              {runs.slice(0, 5).map((run) => (
                <tr key={run.id}>
                  <td className="mono">{run.job}</td>
                  <td className="mono">{run.branch}</td>
                  <td>
                    <StatusBadge status={run.status} />
                  </td>
                  <td className="mono">{run.duration}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
