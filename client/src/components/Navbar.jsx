import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiMenu, FiX, FiArrowRight, FiUser, FiLogOut, FiPhone, FiSettings } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import CallbackModal from './CallbackModal'
import BrandLogo from './BrandLogo'
import './Navbar.css'

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/edtech', label: 'EdTech' },
  { path: '/staffing', label: 'Staffing' },
  { path: '/ai-solutions', label: 'AI Solutions' },
  { path: '/about', label: 'About' },
  { path: '/resources', label: 'Resources' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showCallback, setShowCallback] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = ''
      return
    }

    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container navbar-inner">
          <BrandLogo variant="default" to="/" />

          <ul className={`navbar-links ${isOpen ? 'active' : ''}`}>
            {navLinks.map(({ path, label }) => (
              <li key={path}>
                <Link
                  to={path}
                  className={`nav-link ${location.pathname === path ? 'active' : ''}`}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li className="nav-cta-mobile">
              <button className="btn btn-primary" onClick={() => { setShowCallback(true); setIsOpen(false) }} style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}>
                <FiPhone size={16} /> Request Callback
              </button>
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}>
                      <FiSettings size={16} /> Admin Panel
                    </Link>
                  )}
                  <Link to="/dashboard" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}>
                    <FiUser size={16} /> Dashboard
                  </Link>
                  <button className="btn btn-outline" onClick={logout} style={{ width: '100%', justifyContent: 'center' }}>
                    <FiLogOut size={16} /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}>
                    Sign In
                  </Link>
                  <Link to="/signup" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                    Create Account
                  </Link>
                </>
              )}
            </li>
          </ul>

          <div className="nav-right-desktop">
            <button className="btn btn-primary nav-callback-btn" onClick={() => setShowCallback(true)}>
              <FiPhone size={14} /> Request Callback
            </button>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin" className="nav-link" title="Admin Panel" style={{ fontSize: 13, fontWeight: 600 }}>
                    <FiSettings size={14} /> Admin
                  </Link>
                )}
                <Link to="/dashboard" className="nav-avatar-btn" title="Dashboard">
                  {user.name.charAt(0).toUpperCase()}
                </Link>
              </>
            ) : (
              <Link to="/login" className="nav-link nav-login-link">Sign In</Link>
            )}
          </div>

          <button
            className="navbar-toggle"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </nav>
      {isOpen && <button className="navbar-overlay" aria-label="Close menu" onClick={() => setIsOpen(false)} />}
      <CallbackModal isOpen={showCallback} onClose={() => setShowCallback(false)} />
    </>
  )
}
