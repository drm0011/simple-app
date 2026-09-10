import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Overview', end: true },
  { to: '/map', label: 'Impact Map' },
  { to: '/runs', label: 'Runs' },
  { to: '/simulator', label: 'Selection Simulator' },
  { to: '/coverage', label: 'Coverage' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        TEST<span className="brand-red">IMPACT</span>
      </div>
      <nav className="nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        simple-app · PoC dashboard
        <br />
        dummy data
      </div>
    </aside>
  )
}
