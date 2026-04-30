import { useEffect, useMemo, useState } from 'react'
import {
  FiArrowRight,
  FiAward,
  FiBriefcase,
  FiCheck,
  FiClock,
  FiCode,
  FiFileText,
  FiMail,
  FiTarget,
  FiTrendingUp,
  FiUser,
} from 'react-icons/fi'
import api from '../api'
import './Internship.css'

const fallbackTracks = [
  'AI and Machine Learning',
  'Full Stack Development',
  'Frontend Development',
  'Backend Development',
  'Data Analytics',
  'Cloud and DevOps',
]

const createInitialForm = (track = fallbackTracks[0]) => ({
  name: '',
  email: '',
  phone: '',
  college: '',
  track,
  duration: '3-month',
  talentScholarship: false,
  portfolio: '',
  message: '',
})

const internshipOptions = [
  {
    value: '1-month',
    title: '1 Month Internship',
    price: 'Free',
    desc: 'Best for beginners who want short practical exposure and guided tasks.',
  },
  {
    value: '3-month',
    title: '3 Month Internship',
    price: 'Free',
    desc: 'Recommended for students who want stronger project experience and mentorship.',
  },
  {
    value: '6-month',
    title: '6 Month Internship',
    price: 'Rs 699',
    desc: 'Advanced internship with deeper project ownership. Pay Rs 699, or apply for a free merit seat after interview clearance.',
  },
]

const outcomes = [
  { icon: <FiCode size={22} />, title: 'Live Projects', desc: 'Work on practical tasks aligned with modern software and AI workflows.' },
  { icon: <FiBriefcase size={22} />, title: 'Portfolio Ready', desc: 'Build work samples that can support resumes, interviews, and LinkedIn profiles.' },
  { icon: <FiAward size={22} />, title: 'Certificate', desc: 'Receive internship completion recognition after successful performance.' },
  { icon: <FiTrendingUp size={22} />, title: 'Career Support', desc: 'Get guidance on skills, project explanation, and placement readiness.' },
]

const processSteps = [
  { num: '01', title: 'Apply', desc: 'Submit your internship preference, skills, and project interest.' },
  { num: '02', title: 'Review', desc: 'Our team checks your profile and recommends the right track.' },
  { num: '03', title: 'Mentor Call', desc: 'Shortlisted students get onboarding and task guidance.' },
  { num: '04', title: 'Project Work', desc: 'Complete assigned work with regular review and feedback.' },
]

export default function Internship() {
  const [tracks, setTracks] = useState(fallbackTracks)
  const [form, setForm] = useState(createInitialForm())
  const [loading, setLoading] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  useEffect(() => {
    api.get('/internship/domains')
      .then((res) => {
        const domainNames = (res.data.data || []).map((item) => item.name).filter(Boolean)
        if (!domainNames.length) return

        setTracks(domainNames)
        setForm((current) => ({
          ...current,
          track: domainNames.includes(current.track) ? current.track : domainNames[0],
        }))
      })
      .catch(() => setTracks(fallbackTracks))
  }, [])

  const selectedOption = useMemo(
    () => internshipOptions.find((option) => option.value === form.duration) || internshipOptions[1],
    [form.duration]
  )

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })

  const handlePhoneChange = (event) => {
    const phone = event.target.value.replace(/\D/g, '').slice(0, 10)
    setForm((current) => ({ ...current, phone }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setSubmitStatus(null)

    try {
      if (form.duration === '6-month' && !form.talentScholarship) {
        const loaded = await loadRazorpayScript()
        if (!loaded) throw new Error('Razorpay could not be loaded')

        const orderRes = await api.post('/internship/create-order', form)
        const { key, order, application } = orderRes.data
        const checkout = new window.Razorpay({
          key,
          amount: order.amount,
          currency: order.currency,
          name: 'VSS SOFTWARE',
          description: '6 Month Internship Application',
          order_id: order.id,
          prefill: { name: form.name, email: form.email, contact: form.phone },
          theme: { color: '#0A2540' },
          handler: async (response) => {
            try {
              await api.post('/internship/verify-payment', {
                applicationId: application._id,
                ...response,
              })
              setSubmitStatus('paid')
              setForm(createInitialForm(tracks[0]))
            } catch (err) {
              setSubmitStatus('payment-error')
            } finally {
              setLoading(false)
            }
          },
          modal: { ondismiss: () => setLoading(false) },
        })
        checkout.open()
        return
      }

      await api.post('/internship/apply', form)

      setSubmitStatus(form.duration === '6-month' ? 'interview' : 'success')
      setForm(createInitialForm(tracks[0]))
    } catch {
      setSubmitStatus('error')
      setLoading(false)
      return
    } finally {
      if (!(form.duration === '6-month' && !form.talentScholarship)) {
        setLoading(false)
      }
    }
  }

  return (
    <div className="page-enter">
      <section className="internship-hero">
        <div className="container">
          <span className="section-label">Internship Program</span>
          <h1 className="internship-hero-title">
            Build Real Skills Through<br />
            <span className="hero-highlight">Guided Project Internship</span>
          </h1>
          <p className="internship-hero-sub">
            Apply for free 1-month or 3-month internships, or choose the 6-month advanced internship with a merit-based free seat option for talented students.
          </p>
          <div className="hero-actions" style={{ justifyContent: 'center' }}>
            <a href="#internship-form" className="btn btn-primary">Apply Now <FiArrowRight size={16} /></a>
            <a href="#conditions" className="btn btn-outline">View Conditions</a>
          </div>
        </div>
      </section>

      <section className="section" id="conditions">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Program Options</span>
            <h2 className="section-title">Choose Your Internship Duration</h2>
            <p className="section-subtitle">Simple conditions for students at different learning stages. Paid 6-month internship is Rs 699.</p>
          </div>
          <div className="internship-option-grid">
            {internshipOptions.map((option) => (
              <div key={option.value} className={`internship-option-card ${option.value === '3-month' ? 'featured' : ''}`}>
                <div className="internship-option-head">
                  <FiClock size={22} />
                  <span>{option.price}</span>
                </div>
                <h3>{option.title}</h3>
                <p>{option.desc}</p>
                <a href="#internship-form" className="internship-card-link">Apply for this option</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Tracks</span>
            <h2 className="section-title">Internship Domains</h2>
          </div>
          <div className="internship-track-grid">
            {tracks.map((track) => (
              <div key={track} className="internship-track-chip">
                <FiTarget size={15} /> {track}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Outcomes</span>
            <h2 className="section-title">What Students Receive</h2>
          </div>
          <div className="grid-4">
            {outcomes.map((item) => (
              <div key={item.title} className="card internship-outcome-card">
                <div className="internship-outcome-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Selection Flow</span>
            <h2 className="section-title">How Applications Work</h2>
          </div>
          <div className="internship-process-grid">
            {processSteps.map((step) => (
              <div key={step.num} className="internship-process-step">
                <div className="internship-process-num">{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="internship-form">
        <div className="container">
          <div className="internship-form-wrapper">
            <div className="internship-form-info">
              <span className="section-label">Application Form</span>
              <h2 className="section-title" style={{ textAlign: 'left' }}>Apply for Internship</h2>
              <p>
                Fill your details and select the duration. The 1-month and 3-month internships are free. The 6-month internship is paid, but talented students can request a merit-based free seat.
              </p>
              <div className="internship-condition-list">
                <div><FiCheck size={16} /> 1-month internship is free.</div>
                <div><FiCheck size={16} /> 3-month internship is free.</div>
                <div><FiCheck size={16} /> 6-month internship payment is Rs 699 through Razorpay.</div>
                <div><FiCheck size={16} /> Talented students can get 6 months free only after interview clearance.</div>
              </div>
            </div>

            <form className="internship-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <div className="internship-input-icon">
                    <FiUser size={16} />
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <div className="internship-input-icon">
                    <FiMail size={16} />
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Mobile Number *</label>
                  <input type="tel" value={form.phone} onChange={handlePhoneChange} maxLength={10} pattern="[0-9]{10}" inputMode="numeric" required />
                </div>
                <div className="form-group">
                  <label>College / Institution *</label>
                  <input type="text" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Internship Track *</label>
                  <select value={form.track} onChange={(e) => setForm({ ...form, track: e.target.value })} required>
                    {tracks.map((track) => <option key={track} value={track}>{track}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Duration *</label>
                  <select value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value, talentScholarship: false })} required>
                    {internshipOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.title} - {option.price}</option>
                    ))}
                  </select>
                </div>
              </div>

              {form.duration === '6-month' && (
                <label className="internship-checkbox">
                  <input
                    type="checkbox"
                    checked={form.talentScholarship}
                    onChange={(e) => setForm({ ...form, talentScholarship: e.target.checked })}
                  />
                  <span>Apply for talented student free-seat review. Free seat is approved only after interview clearance.</span>
                </label>
              )}

              <div className="form-group">
                <label>Portfolio / GitHub / LinkedIn</label>
                <div className="internship-input-icon">
                  <FiFileText size={16} />
                  <input type="url" placeholder="https://..." value={form.portfolio} onChange={(e) => setForm({ ...form, portfolio: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label>Why should we select you?</label>
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Share your skills, projects, or learning goals." />
              </div>

              <div className="internship-selected-plan">
                <strong>{selectedOption.title}</strong>
                <span>{selectedOption.price}{form.duration === '6-month' && form.talentScholarship ? ' after interview clearance' : ''}</span>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading
                  ? <><span className="spinner" /> Processing...</>
                  : form.duration === '6-month' && !form.talentScholarship
                    ? 'Pay Rs 699 and Submit'
                    : 'Submit Internship Application'}
              </button>
              {submitStatus === 'success' && <p className="form-success">Application submitted! Our team will review it and contact you soon.</p>}
              {submitStatus === 'interview' && <p className="form-success">Application submitted! Free 6-month internship will be approved only after interview clearance.</p>}
              {submitStatus === 'paid' && <p className="form-success">Payment successful! Your 6-month internship application is confirmed.</p>}
              {submitStatus === 'payment-error' && <p className="form-error">Payment captured, but verification failed. Please contact support with your payment ID.</p>}
              {submitStatus === 'error' && <p className="form-error">Something went wrong. Please try again or contact vatedigital@gmail.com.</p>}
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
