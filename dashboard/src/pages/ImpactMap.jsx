import { useState } from 'react'
import { sourceToTest } from '../data/mock.js'

export default function ImpactMap() {
  const [inverted, setInverted] = useState(false)
  const [query, setQuery] = useState('')

  const rows = inverted
    ? Object.entries(
        Object.entries(sourceToTest).reduce((acc, [file, tests]) => {
          for (const t of tests) {
            acc[t] = acc[t] || []
            acc[t].push(file)
          }
          return acc
        }, {}),
      )
    : Object.entries(sourceToTest)

  const filtered = rows.filter(([key, values]) =>
    (key + ' ' + values.join(' ')).toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <>
      <h1 className="page-title">Impact Map</h1>
      <p className="page-subtitle">
        {inverted ? 'Which source files each test executable covers' : 'Which tests cover each source file'}
      </p>

      <div className="section">
        <button className="button" onClick={() => setInverted(!inverted)}>
          {inverted ? 'Show source → tests' : 'Show test → sources'}
        </button>
      </div>

      <input
        className="search-input"
        placeholder="Filter entries..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>{inverted ? 'Test executable' : 'Source file'}</th>
              <th>{inverted ? 'Covers' : 'Covered by'}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(([key, values]) => (
              <tr key={key}>
                <td className="mono">{key}</td>
                <td>
                  {values.map((v) => (
                    <span key={v} className="chip">
                      {v}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={2} style={{ color: '#9ca3af' }}>
                  No entries match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
