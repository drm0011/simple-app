import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import CoverageBar from '../components/CoverageBar.jsx'
import { files } from '../data/mock.js'

const chartData = files.map((f) => ({
  name: f.path.replace('src/', ''),
  coverage: f.coverage,
}))

export default function Coverage() {
  return (
    <>
      <h1 className="page-title">Coverage</h1>
      <p className="page-subtitle">Line coverage per source file (dummy data)</p>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">By file</div>
          {files.map((f) => (
            <CoverageBar key={f.path} label={f.path} pct={f.coverage} />
          ))}
        </div>

        <div className="card">
          <div className="card-title">Chart</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis type="category" dataKey="name" width={120} />
              <Tooltip
                contentStyle={{ background: '#161616', border: '1px solid #2a2a2a', fontSize: 12 }}
                labelStyle={{ color: '#ffffff' }}
                formatter={(value) => [`${value}%`, 'coverage']}
              />
              <Bar dataKey="coverage" fill="#cf142b" radius={[0, 3, 3, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  )
}
