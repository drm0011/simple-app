import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Overview from './pages/Overview.jsx'
import ImpactMap from './pages/ImpactMap.jsx'
import Runs from './pages/Runs.jsx'
import SelectionSimulator from './pages/SelectionSimulator.jsx'
import Coverage from './pages/Coverage.jsx'
import './theme.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Overview />} />
          <Route path="map" element={<ImpactMap />} />
          <Route path="runs" element={<Runs />} />
          <Route path="simulator" element={<SelectionSimulator />} />
          <Route path="coverage" element={<Coverage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
