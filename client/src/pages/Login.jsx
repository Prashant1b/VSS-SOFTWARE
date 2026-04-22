import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import BrandLogo from '../components/BrandLogo'
import './Auth.css'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const getHomeByRole = (user) => {
    if (user.role === 'admin') return '/admin'
    if (user.role === 'teacher') return '/teacher'
    return '/dashboard'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(form.email, form.password)
      navigate(getHomeByRole(data.user))
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page page-enter">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <BrandLogo variant="default" to="/" />
            </div>
            <h1>Welcome back</h1>
            <p>Sign in to your VSS account</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-icon-wrapper">
                <FiMail size={16} className="input-icon" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="input-icon-wrapper">
                <FiLock size={16} className="input-icon" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? <><span className="spinner" /> Signing in...</> : <>Sign In <FiArrowRight size={16} /></>}
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/signup">Create Account</Link></p>
          </div>
        </div>

        <div className="auth-side">
          <div className="auth-side-content">
            <h2>Learn. Get Hired. Build with AI.</h2>
            <p>Access your personalized dashboard, track enrolled courses, and manage your career journey with VSS.</p>
            <ul className="auth-features">
              <li>Track your enrolled courses</li>
              <li>Access learning resources</li>
              <li>Connect with hiring partners</li>
              <li>Manage your profile</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
