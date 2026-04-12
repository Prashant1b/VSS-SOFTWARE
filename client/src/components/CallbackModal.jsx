import { useState } from 'react'
import { FiX, FiPhone } from 'react-icons/fi'
import api from '../api'
import './CallbackModal.css'

export default function CallbackModal({ isOpen, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'Request Callback', message: '' })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    try {
      await api.post('/contact', form)
      setStatus('success')
      setForm({ name: '', email: '', phone: '', subject: 'Request Callback', message: '' })
      setTimeout(() => onClose(), 2000)
    } catch {
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <FiX size={20} />
        </button>
        <div className="modal-header">
          <div className="modal-icon"><FiPhone size={24} /></div>
          <h2>Request a Callback</h2>
          <p>Leave your details and our team will call you within 30 minutes during business hours.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name *</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Your name" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Phone *</label>
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required placeholder="+91 98765 43210" />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="you@email.com" />
            </div>
          </div>
          <div className="form-group">
            <label>What are you interested in?</label>
            <select value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}>
              <option value="">Select an option</option>
              <option value="GenAI Course">GenAI 60-Hour Course</option>
              <option value="Full Stack Training">Full Stack Training</option>
              <option value="Staffing Solutions">Staffing / Hiring</option>
              <option value="AI Solutions">Enterprise AI Solutions</option>
              <option value="College Partnership">College Partnership</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? <><span className="spinner" /> Submitting...</> : 'Request Callback'}
          </button>
          {status === 'success' && <p className="form-success">We'll call you back shortly!</p>}
          {status === 'error' && <p className="form-error">Something went wrong. Try calling us at +91 8147285223.</p>}
        </form>
      </div>
    </div>
  )
}
