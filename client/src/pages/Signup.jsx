import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiUser, FiMail, FiLock, FiPhone, FiArrowRight } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import BrandLogo from '../components/BrandLogo'
import './Auth.css'

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'student' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
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
            <h1>Create Account</h1>
            <p>Join VSS to start your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Full Name *</label>
              <div className="input-icon-wrapper">
                <FiUser size={16} className="input-icon" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Email Address *</label>
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
              <label>Password * (min 6 characters)</label>
              <div className="input-icon-wrapper">
                <FiLock size={16} className="input-icon" />
                <input
                  type="password"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Phone</label>
              <div className="input-icon-wrapper">
                <FiPhone size={16} className="input-icon" />
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>I am a...</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="student">Student / Learner</option>
                <option value="employer">Employer / Recruiter</option>
              </select>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? <><span className="spinner" /> Creating Account...</> : <>Create Account <FiArrowRight size={16} /></>}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Sign In</Link></p>
          </div>
        </div>

        <div className="auth-side">
          <div className="auth-side-content">
            <h2>Start Your AI Journey</h2>
            <p>Join hundreds of students and professionals building their future with VSS.</p>
            <ul className="auth-features">
              <li>60-hour GenAI flagship course</li>
              <li>Industry certification</li>
              <li>Direct placement pipeline</li>
              <li>Enterprise AI projects</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
