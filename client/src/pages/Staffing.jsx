import { useState } from 'react'
import { FiUsers, FiMonitor, FiUserCheck, FiUpload, FiCheck, FiClock, FiThumbsUp, FiShield, FiRefreshCw } from 'react-icons/fi'
import api from '../api'
import './Staffing.css'

const specializations = [
  { icon: <FiMonitor size={22} />, title: 'IT Staffing', desc: 'Software developers, data scientists, cloud architects, and DevOps engineers.' },
  { icon: <FiUsers size={22} />, title: 'Non-IT Staffing', desc: 'HR professionals, operations leads, sales executives, and management roles.' },
  { icon: <FiUserCheck size={22} />, title: 'Campus Hiring', desc: 'Direct pipeline from trained student cohorts to your organization.' },
  { icon: <FiRefreshCw size={22} />, title: 'Hire-Train-Deploy', desc: 'We train candidates on your tech stack before deployment.' },
  { icon: <FiUsers size={22} />, title: 'Staff Augmentation', desc: 'Flexible scaling with pre-vetted professionals for project needs.' },
]

const processSteps = [
  { num: '01', title: 'Intake', desc: 'Understand your requirements, culture, and technical needs.' },
  { num: '02', title: 'Sourcing', desc: 'Tap into our trained talent pool and professional networks.' },
  { num: '03', title: 'Screening', desc: 'Technical assessments, soft skill evaluation, and background checks.' },
  { num: '04', title: 'Shortlist', desc: 'Present top candidates with detailed profiles and assessments.' },
  { num: '05', title: 'Interviews', desc: 'Coordinate and facilitate the interview process.' },
  { num: '06', title: 'Onboarding', desc: 'Support smooth integration into your team.' },
]

const differentiators = [
  { icon: <FiClock size={26} />, title: 'Industry-Leading Speed', desc: 'Fastest time-to-submit metrics in the staffing industry.' },
  { icon: <FiThumbsUp size={26} />, title: 'High Conversion', desc: 'Exceptional offer-to-join conversion rates through quality matching.' },
  { icon: <FiShield size={26} />, title: 'Strong Retention', desc: 'Quality placements that lead to long-term employee retention.' },
  { icon: <FiRefreshCw size={26} />, title: 'Replacement Guarantee', desc: 'Risk-free replacement guarantee for all placements.' },
]

const roles = [
  'Software Developers', 'Data Scientists', 'Cloud Architects', 'DevOps Engineers',
  'HR Professionals', 'Operations Leads', 'Sales Executives', 'Product Managers',
  'UI/UX Designers', 'QA Engineers', 'Business Analysts', 'Project Managers'
]

export default function Staffing() {
  const [form, setForm] = useState({ companyName: '', role: '', headcount: '', location: '', email: '', phone: '' })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSubmitStatus(null)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([key, val]) => formData.append(key, val))
      if (file) formData.append('jdFile', file)
      await api.post('/recruitment', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setSubmitStatus('success')
      setForm({ companyName: '', role: '', headcount: '', location: '', email: '', phone: '' })
      setFile(null)
    } catch {
      setSubmitStatus('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-enter">
      <section className="staffing-hero">
        <div className="container">
          <span className="section-label">Staffing Solutions</span>
          <h1 className="staffing-hero-title">
            Hire Trained, Screened Talent<br />
            <span className="hero-highlight">Not Just Resumes</span>
          </h1>
          <p className="staffing-hero-sub">
            From campus hiring to enterprise-scale staff augmentation — we deliver
            pre-vetted, job-ready candidates matched to your requirements.
          </p>
          <div className="hero-actions" style={{ justifyContent: 'center' }}>
            <a href="#submit-requirement" className="btn btn-primary">Submit Requirement</a>
            <a href="#submit-requirement" className="btn btn-outline">Talk to Recruiter</a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Our Services</span>
            <h2 className="section-title">Staffing Specializations</h2>
          </div>
          <div className="grid-3">
            {specializations.map((s, i) => (
              <div key={i} className="card staffing-spec-card">
                <div className="staffing-spec-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Our Process</span>
            <h2 className="section-title">How We Hire</h2>
            <p className="section-subtitle">A proven six-step process that delivers quality talent, fast.</p>
          </div>
          <div className="process-grid">
            {processSteps.map((s, i) => (
              <div key={i} className="process-step">
                <div className="process-num">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Why VSS</span>
            <h2 className="section-title">Our Competitive Edge</h2>
          </div>
          <div className="grid-4">
            {differentiators.map((d, i) => (
              <div key={i} className="diff-card card">
                <div className="diff-icon">{d.icon}</div>
                <h3>{d.title}</h3>
                <p>{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Hiring Scope</span>
            <h2 className="section-title">Roles We Fill</h2>
          </div>
          <div className="roles-grid">
            {roles.map((r, i) => (
              <div key={i} className="role-chip">{r}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="submit-requirement">
        <div className="container">
          <div className="hiring-form-wrapper">
            <div className="hiring-form-info">
              <span className="section-label">Submit Requirement</span>
              <h2 className="section-title" style={{ textAlign: 'left' }}>Find Your Next Hire</h2>
              <p>Share your hiring needs and we'll match pre-screened candidates within 48 hours.</p>
              <div className="hiring-stats">
                <div className="hiring-stat">
                  <strong>48hrs</strong>
                  <span>Avg. Time to Submit</span>
                </div>
                <div className="hiring-stat">
                  <strong>92%</strong>
                  <span>Offer-Join Ratio</span>
                </div>
                <div className="hiring-stat">
                  <strong>100%</strong>
                  <span>Replacement Guarantee</span>
                </div>
              </div>
            </div>
            <form className="hiring-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Company Name *</label>
                <input type="text" value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Role to Hire *</label>
                  <input type="text" value={form.role} onChange={e => setForm({...form, role: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Headcount *</label>
                  <input type="number" min="1" value={form.headcount} onChange={e => setForm({...form, headcount: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Location *</label>
                <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Upload JD (PDF/DOC, max 5MB)</label>
                <div className="file-upload">
                  <input type="file" accept=".pdf,.doc,.docx" onChange={e => setFile(e.target.files[0])} id="jd-upload" />
                  <label htmlFor="jd-upload" className="file-upload-label">
                    <FiUpload size={18} />
                    {file ? file.name : 'Choose file...'}
                  </label>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading ? <><span className="spinner" /> Submitting...</> : 'Send Requirements'}
              </button>
              {submitStatus === 'success' && <p className="form-success">Requirement submitted! Our team will reach out within 48 hours.</p>}
              {submitStatus === 'error' && <p className="form-error">Something went wrong. Please try again or email us at vatedigital@gmail.com.</p>}
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
