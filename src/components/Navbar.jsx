import { NavLink } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <span className="brand-icon">📡</span>
          <span className="brand-name">TeleCheck<span className="brand-ai">AI</span></span>
          <span className="brand-tag">SITE VALIDATOR</span>
        </div>
        <div className="navbar-links">
          <NavLink to="/"        className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Validate</NavLink>
          <NavLink to="/history" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>History</NavLink>
        </div>
      </div>
    </nav>
  )
}
