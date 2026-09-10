import { useState } from 'react'
import { sourceToTest, allTests } from '../data/mock.js'

const selectableFiles = [
  'src/math_utils.cpp',
  'src/string_utils.cpp',
  'src/app_utils.cpp',
  'src/math_utils.h',
  'src/string_utils.h',
  'src/new_file.cpp',
]

function computeSelection(checked) {
  if (checked.size === 0) {
    return { tests: [], reason: 'No files selected.' }
  }
  const headers = [...checked].filter((f) => f.endsWith('.h') || f.endsWith('.hpp'))
  if (headers.length > 0) {
    return {
      tests: allTests,
      reason: `Header file changed (${headers.join(', ')}) — selecting ALL tests (conservative).`,
    }
  }
  const selected = new Set()
  const unknown = []
  for (const file of checked) {
    const tests = sourceToTest[file]
    if (tests === undefined) {
      unknown.push(file)
    } else {
      tests.forEach((t) => selected.add(t))
    }
  }
  if (unknown.length > 0) {
    return {
      tests: allTests,
      reason: `Files not in mapping (${unknown.join(', ')}) — selecting ALL tests (conservative).`,
    }
  }
  return { tests: [...selected].sort(), reason: 'Union of mapped tests for the changed files.' }
}

export default function SelectionSimulator() {
  const [checked, setChecked] = useState(new Set(['src/string_utils.cpp']))
  const { tests, reason } = computeSelection(checked)

  const toggle = (file) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(file)) {
        next.delete(file)
      } else {
        next.add(file)
      }
      return next
    })
  }

  return (
    <>
      <h1 className="page-title">Selection Simulator</h1>
      <p className="page-subtitle">
        Same rules as <span className="mono">select_tests.py</span> — check the files you changed
      </p>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Changed files</div>
          <div className="file-list">
            {selectableFiles.map((file) => (
              <label className="file-row" key={file}>
                <input type="checkbox" checked={checked.has(file)} onChange={() => toggle(file)} />
                <span className="mono">{file}</span>
                <span className="file-kind">{file.endsWith('.h') ? 'header' : 'source'}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Selected tests</div>
          <div className="result-box">
            <div className="reason-line">
              <strong>Reason:</strong> {reason}
            </div>
            {tests.length === 0 ? (
              <div className="reason-line">No tests affected.</div>
            ) : (
              tests.map((t) => (
                <span key={t} className="chip red">
                  {t}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
