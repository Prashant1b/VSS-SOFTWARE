import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiUser, FiMail, FiLock, FiPhone, FiArrowRight } from 'react-icons/fi'
import api from "../api.js"
import BrandLogo from '../components/BrandLogo'
import './Auth.css'

export default function Signup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'student',
    otp: ''
  })

  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)

  const navigate = useNavigate()

  // SEND OTP
  const handleSendOtp = async () => {
    try {
      setOtpLoading(true)
      setError('')
      setSuccess('')

      await api.post('/auth/send-otp', {
        email: form.email,
        purpose: 'signup'
      })

      setOtpSent(true)
      setSuccess(`OTP sent successfully to ${form.email}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setOtpLoading(false)
    }
  }

  // REGISTER
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await api.post('/auth/register', form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page page-enter">
      <div className="auth-container">
        <div className="auth-card">

          <div className="auth-header">
            <BrandLogo variant="default" to="/" />
            <h1>Create Account</h1>
            <p>Join VSS to start your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">

            {/* NAME */}
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

            {/* EMAIL + OTP */}
            <div className="form-group">
              <label>Email Address *</label>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="input-icon-wrapper" style={{ flex: 1 }}>
                  <FiMail size={16} className="input-icon" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpLoading || !form.email}
                  className="btn"
                >
                  {otpLoading
                    ? 'Sending...'
                    : otpSent
                      ? 'Resend OTP'
                      : 'Send OTP'}
                </button>
              </div>

              <small style={{ color: '#666' }}>
                We will send a 6-digit OTP to your email
              </small>
            </div>

            {/* SUCCESS MESSAGE */}
            {success && <div className="auth-success">{success}</div>}

            {/* OTP FIELD */}
            {otpSent && (
              <div className="form-group">
                <label>Enter OTP *</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={form.otp}
                  onChange={e => setForm({ ...form, otp: e.target.value })}
                  required
                />
              </div>
            )}

            {/* PASSWORD */}
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

            {/* PHONE */}
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

            {/* ROLE */}
            <div className="form-group">
              <label>I am a...</label>
              <select
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
              >
                <option value="student">Student / Learner</option>
                <option value="employer">Employer / Recruiter</option>
              </select>
            </div>

            {/* ERROR */}
            {error && <div className="auth-error">{error}</div>}

            {/* SUBMIT */}
            <button
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={loading || !otpSent}
            >
              {loading ? 'Creating Account...' : (
                <>Create Account <FiArrowRight size={16} /></>
              )}
            </button>

          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Sign In</Link></p>
          </div>

        </div>

        {/* SIDE PANEL */}
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