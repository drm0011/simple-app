import { useState } from 'react'
import StatusBadge from '../components/StatusBadge.jsx'
import { runs } from '../data/mock.js'

export default function Runs() {
  const [expanded, setExpanded] = useState(null)

  return (
    <>
      <h1 className="page-title">Runs</h1>
      <p className="page-subtitle">CI history — full matrix, map builds, and smart selection runs</p>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Job</th>
              <th>Event</th>
              <th>Branch</th>
              <th>Commit</th>
              <th>Status</th>
              <th>Dur</th>
              <th>Tests</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <>
                <tr key={run.id} className="expand-row" onClick={() => setExpanded(expanded === run.id ? null : run.id)}>
                  <td className="mono">{run.job}</td>
                  <td className="mono">{run.event}</td>
                  <td className="mono">{run.branch}</td>
                  <td className="mono">{run.commit}</td>
                  <td>
                    <StatusBadge status={run.status} />
                  </td>
                  <td className="mono">{run.duration}s</td>
                  <td className="mono">
                    {run.job === 'smart-test' ? `${run.selectedTests.length}/${run.totalTests}` : `${run.totalTests} total`}
                  </td>
                </tr>
                {expanded === run.id && (
                  <tr className="run-detail" key={run.id + '-detail'}>
                    <td colSpan={7}>
                      {run.job === 'smart-test' ? (
                        <>
                          <div className="reason-line">
                            <strong>Smart selection:</strong>{' '}
                            {run.selectedTests.length > 0
                              ? `only ${run.selectedTests.length} of ${run.totalTests} tests ran`
                              : 'impact map missing — fell back to full suite'}
                          </div>
                          {run.selectedTests.map((t) => (
                            <span key={t} className="chip red">
                              {t}
                            </span>
                          ))}
                        </>
                      ) : (
                        <div className="reason-line">
                          Full run — all {run.totalTests} tests executed.
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
