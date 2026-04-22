import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import BrandLogo from '../components/BrandLogo'
import './Auth.css'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [resetForm, setResetForm] = useState({ email: '', otp: '', newPassword: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetOtpSent, setResetOtpSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [sendingResetOtp, setSendingResetOtp] = useState(false)
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
    setSuccess('')
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

  const handleSendResetOtp = async () => {
    setError('')
    setSuccess('')
    setSendingResetOtp(true)

    try {
      await api.post('/auth/send-otp', {
        email: resetForm.email,
        purpose: 'reset',
      })
      setResetOtpSent(true)
      setSuccess(`Password reset OTP sent to ${resetForm.email}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset OTP')
    } finally {
      setSendingResetOtp(false)
    }
  }

  const handleResetPassword = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (resetForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }

    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setError('New password and confirm password must match')
      return
    }

    setResetLoading(true)
    try {
      await api.post('/auth/reset-password', resetForm)
      setSuccess('Password reset successful. You can now sign in with your new password.')
      setResetForm({ email: '', otp: '', newPassword: '', confirmPassword: '' })
      setResetOtpSent(false)
      setShowForgotPassword(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset password')
    } finally {
      setResetLoading(false)
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

            <button
              type="button"
              className="auth-inline-link"
              onClick={() => {
                setShowForgotPassword((value) => !value)
                setError('')
                setSuccess('')
              }}
            >
              {showForgotPassword ? 'Hide forgot password' : 'Forgot password?'}
            </button>

            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? <><span className="spinner" /> Signing in...</> : <>Sign In <FiArrowRight size={16} /></>}
            </button>
          </form>

          {showForgotPassword && (
            <form className="auth-form auth-reset-box" onSubmit={handleResetPassword}>
              <h3>Reset Password</h3>
              <p className="auth-reset-copy">Enter your email, verify the OTP, then set a new password.</p>

              <div className="form-group">
                <label>Email Address</label>
                <div className="auth-inline-row">
                  <div className="input-icon-wrapper" style={{ flex: 1 }}>
                    <FiMail size={16} className="input-icon" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={resetForm.email}
                      onChange={(e) => setResetForm({ ...resetForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    className="btn"
                    disabled={sendingResetOtp || !resetForm.email}
                    onClick={handleSendResetOtp}
                  >
                    {sendingResetOtp ? 'Sending...' : resetOtpSent ? 'Resend OTP' : 'Send OTP'}
                  </button>
                </div>
              </div>

              {resetOtpSent && (
                <>
                  <div className="form-group">
                    <label>OTP</label>
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={resetForm.otp}
                      onChange={(e) => setResetForm({ ...resetForm, otp: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <div className="input-icon-wrapper">
                      <FiLock size={16} className="input-icon" />
                      <input
                        type="password"
                        placeholder="Enter new password"
                        value={resetForm.newPassword}
                        onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <div className="input-icon-wrapper">
                      <FiLock size={16} className="input-icon" />
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        value={resetForm.confirmPassword}
                        onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-outline auth-submit" disabled={resetLoading}>
                    {resetLoading ? 'Updating Password...' : 'Update Password'}
                  </button>
                </>
              )}
            </form>
          )}

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
