import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  FiArrowLeft,
  FiAward,
  FiBookOpen,
  FiCalendar,
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiPlayCircle,
  FiUsers,
  FiGlobe,
} from 'react-icons/fi'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { courseVisuals, demoTimeSlots } from '../data/coursePresentation'
import './CourseDetails.css'

function formatCurrency(amount, fallback) {
  if (!amount) return fallback || '₹0'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function normalizeCourse(course) {
  const preset = courseVisuals[course.slug] || courseVisuals.default
  const dbFeatures = Array.isArray(course.features) && course.features.length ? course.features : []
  const legacyHighlights = Array.isArray(course.highlights) && course.highlights.length ? course.highlights : []
  const dbTechStack = Array.isArray(course.techStack) && course.techStack.length ? course.techStack : []

  return {
    ...course,
    icon: preset?.icon,
    features: dbFeatures.length ? dbFeatures : legacyHighlights,
    tech: dbTechStack.length ? dbTechStack : legacyHighlights.slice(0, 6),
    displayPrice: course.price || formatCurrency(course.amount),
    displayOriginalPrice: course.originalPrice || '',
    isFree: !course.amount || course.amount === 0,
  }
}

const emptyCourseState = {
  status: 'not_started',
  enrolled: false,
  demoBooked: false,
  enrollment: null,
}

function getClassOptions(course) {
  if (!course) return []

  return [
    { value: 'online', label: 'Online Classes', amount: Number(course.onlineAmount || 0) },
    { value: 'hybrid', label: 'Hybrid Classes', amount: Number(course.hybridAmount || 0) },
    { value: 'offline', label: 'Offline Classes', amount: Number(course.offlineAmount || 0) },
  ].map((option) => ({
    ...option,
    displayPrice: option.amount > 0 ? formatCurrency(option.amount) : 'Not set',
    available: option.amount > 0,
  }))
}

export default function CourseDetail() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [courseState, setCourseState] = useState(emptyCourseState)
  const [statusLoading, setStatusLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState('')
  const [feedback, setFeedback] = useState({ type: '', message: '' })
  const [activeTab, setActiveTab] = useState('overview')
  const [openFaq, setOpenFaq] = useState(null)
  const [selectedClassMode, setSelectedClassMode] = useState('online')

  // Demo form
  const [demoForm, setDemoForm] = useState({
    slotDate: '',
    slotTime: demoTimeSlots[0],
    notes: '',
  })
  const [showDemoForm, setShowDemoForm] = useState(false)
  const minDate = new Date().toISOString().split('T')[0]

  // Load course
  useEffect(() => {
    setLoading(true)
    api.get('/public/courses')
      .then((res) => {
        const all = (res.data.data || []).map(normalizeCourse)
        const found = all.find((c) => c.slug === slug)
        if (!found) {
          navigate('/courses', { replace: true })
          return
        }
        setCourse(found)
      })
      .catch(() => navigate('/courses', { replace: true }))
      .finally(() => setLoading(false))
  }, [slug, navigate])

  // Load enrollment status
  useEffect(() => {
    if (!user || !course) {
      setCourseState(emptyCourseState)
      return
    }
    setStatusLoading(true)
    api.get(`/course-enrollment/status/${course.slug}`, { withCredentials: true })
      .then((res) => {
        setCourseState({
          status: res.data.status,
          enrolled: res.data.enrolled,
          demoBooked: res.data.demoBooked,
          enrollment: res.data.enrollment,
        })
      })
      .catch(() => setCourseState(emptyCourseState))
      .finally(() => setStatusLoading(false))
  }, [course, user])

  useEffect(() => {
    if (!course) return

    const availableOption = getClassOptions(course).find((option) => option.available)
    if (availableOption && !getClassOptions(course).some((option) => option.value === selectedClassMode && option.available)) {
      setSelectedClassMode(availableOption.value)
    }
  }, [course, selectedClassMode])

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return }
      const s = document.createElement('script')
      s.src = 'https://checkout.razorpay.com/v1/checkout.js'
      s.onload = () => resolve(true)
      s.onerror = () => resolve(false)
      document.body.appendChild(s)
    })

  const handleEnrollNow = async () => {
    if (!user) { navigate('/login'); return }
    setActionLoading('payment')
    setFeedback({ type: '', message: '' })
    try {
      const loaded = await loadRazorpayScript()
      if (!loaded) throw new Error('Razorpay could not be loaded')

      const orderRes = await api.post('/course-enrollment/create-order', {
        courseSlug: course.slug,
        classMode: selectedClassMode,
      }, { withCredentials: true })

      const { key, order } = orderRes.data
      const selectedOption = getClassOptions(course).find((option) => option.value === selectedClassMode)
      if (!selectedOption?.available) {
        throw new Error('Selected class mode price is not set in admin.')
      }
      const checkout = new window.Razorpay({
        key,
        amount: order.amount,
        currency: order.currency,
        name: 'VSS SOFTWARE',
        description: `${course.title} - ${selectedOption.label}`,
        order_id: order.id,
        prefill: { name: user.name, email: user.email, contact: user.phone || '' },
        theme: { color: '#0A2540' },
        handler: async (response) => {
          try {
            const verifyRes = await api.post('/course-enrollment/verify-payment', {
              courseSlug: course.slug,
              classMode: selectedClassMode,
              ...response,
            }, { withCredentials: true })
            setCourseState({
              status: verifyRes.data.data.status,
              enrolled: true,
              demoBooked: Boolean(verifyRes.data.data.demoSlotAt),
              enrollment: verifyRes.data.data,
            })
            setFeedback({ type: 'success', message: 'Payment successful! Your course is now active.' })
          } catch (err) {
            setFeedback({ type: 'error', message: err.response?.data?.message || 'Payment verification failed.' })
          } finally {
            setActionLoading('')
          }
        },
        modal: { ondismiss: () => setActionLoading('') },
      })
      checkout.open()
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || err.message || 'Could not start payment.' })
      setActionLoading('')
    }
  }

  const handleBookDemo = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    setActionLoading('demo')
    setFeedback({ type: '', message: '' })
    try {
      const res = await api.post('/course-enrollment/demo-slot', {
        courseSlug: course.slug,
        slotDate: demoForm.slotDate,
        slotTime: demoForm.slotTime,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
        notes: demoForm.notes,
      }, { withCredentials: true })
      setCourseState({
        status: res.data.data.status,
        enrolled: false,
        demoBooked: true,
        enrollment: res.data.data,
      })
      setFeedback({ type: 'success', message: 'Demo class booked! We will connect with you at your chosen slot.' })
      setShowDemoForm(false)
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Unable to book demo right now.' })
    } finally {
      setActionLoading('')
    }
  }

  const formatDemoSlot = (slot) => {
    if (!slot) return ''
    return new Date(slot).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  }

  if (loading) {
    return (
      <div className="cd-loading">
        <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
      </div>
    )
  }

  if (!course) return null

  const CourseIcon = course.icon || FiBookOpen
  const classOptions = getClassOptions(course)
  const selectedClassOption = classOptions.find((option) => option.value === selectedClassMode) || classOptions.find((option) => option.available) || classOptions[0]
  const hasClassPrice = Boolean(selectedClassOption?.available)

  return (
    <div className="cd-page">

      {/* ── Top Hero Bar ── */}
      <div className="cd-hero-bar">
        <div className="cd-hero-bar__inner">
         <Link to="/edtech" className="cd-back-link">
  <FiArrowLeft size={16} /> Courses
</Link>
          <h1 className="cd-hero-title">{course.title}</h1>
        </div>

        {/* Thumbnail floated right inside hero */}
        {course.thumbnailUrl && (
          <div className="cd-hero-thumb">
            <img src={course.thumbnailUrl} alt={course.title} />
          </div>
        )}
      </div>

      <div className="cd-body">
        <div className="cd-container">

          {/* ── Left / Main Content ── */}
          <main className="cd-main">

            {/* Tab nav */}
            <nav className="cd-tabs">
              {['overview', 'curriculum', 'faq'].map((tab) => (
                <button
                  key={tab}
                  className={`cd-tab ${activeTab === tab ? 'cd-tab--active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="cd-section">
                <h2 className="cd-section-title">Description</h2>
                <p className="cd-desc">{course.description || 'Industry-focused training designed for practical delivery and hiring readiness.'}</p>

                {course.features && course.features.length > 0 && (
                  <ul className="cd-feature-list">
                    {course.features.map((f, i) => (
                      <li key={i}>
                        <FiCheck size={15} className="cd-feature-icon" />
                        <span dangerouslySetInnerHTML={{ __html: f }} />
                      </li>
                    ))}
                  </ul>
                )}

                {/* Meta info */}
                <div className="cd-meta-grid">
                  <div className="cd-meta-item">
                    <FiClock size={18} />
                    <div>
                      <span>Duration</span>
                      <strong>{course.duration || course.durationLabel || 'Flexible'}</strong>
                    </div>
                  </div>
                  <div className="cd-meta-item">
                    <FiGlobe size={18} />
                    <div>
                      <span>Mode</span>
                      <strong>{course.mode || 'Online / Offline'}</strong>
                    </div>
                  </div>
                  <div className="cd-meta-item">
                    <FiUsers size={18} />
                    <div>
                      <span>Students</span>
                      <strong>{course.students || '0'}</strong>
                    </div>
                  </div>
                  <div className="cd-meta-item">
                    <FiAward size={18} />
                    <div>
                      <span>Rating</span>
                      <strong>{course.rating || '–'}</strong>
                    </div>
                  </div>
                  <div className="cd-meta-item">
                    <FiCalendar size={18} />
                    <div>
                      <span>Next Batch</span>
                      <strong>{course.nextBatchLabel || (course.isActive ? 'Admissions Open' : 'Coming Soon')}</strong>
                    </div>
                  </div>
                  <div className="cd-meta-item">
                    <FiBookOpen size={18} />
                    <div>
                      <span>Projects</span>
                      <strong>{course.projectsCount || course.projects || '–'}</strong>
                    </div>
                  </div>
                </div>

                {/* Tech Stack */}
                {course.tech && course.tech.length > 0 && (
                  <>
                    <h2 className="cd-section-title" style={{ marginTop: 32 }}>Tech Stack</h2>
                    <div className="cd-tech-wrap">
                      {course.tech.map((t, i) => (
                        <span key={i} className="cd-tech-chip">{t}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Curriculum Tab */}
            {activeTab === 'curriculum' && (
              <div className="cd-section">
                <h2 className="cd-section-title">Course Curriculum</h2>
                {course.curriculum && course.curriculum.length > 0 ? (
                  <div className="cd-accordion">
                    {course.curriculum.map((item, i) => (
                      <div key={i} className={`cd-acc-item ${openFaq === i ? 'open' : ''}`}>
                        <button
                          className="cd-acc-header"
                          onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        >
                          <span>{item.title || item.phase || `Module ${i + 1}`}</span>
                          {openFaq === i ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                        </button>
                        {openFaq === i && (
                          <div className="cd-acc-body">
                            {item.units && item.units.map((u, j) => (
                              <div key={j} className="cd-acc-row">
                                <FiPlayCircle size={14} />
                                <span>{u}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="cd-empty">Curriculum details will be available shortly.</p>
                )}
              </div>
            )}

            {/* FAQ Tab */}
            {activeTab === 'faq' && (
              <div className="cd-section">
                <h2 className="cd-section-title">Frequently Asked Questions</h2>
                <div className="cd-accordion">
                  {(course.faqs || [
                    { q: 'Who is eligible?', a: 'Final-year students or professionals with basic programming familiarity.' },
                    { q: 'What is the time commitment?', a: 'Most learners spend 8–10 hours per week.' },
                    { q: 'Is placement support included?', a: 'Yes — resume coaching, mock interviews, and guidance.' },
                    { q: 'Do I get a certificate?', a: 'Yes, a professional certificate is issued upon completion.' },
                  ]).map((faq, i) => (
                    <div key={i} className={`cd-acc-item ${openFaq === `faq-${i}` ? 'open' : ''}`}>
                      <button
                        className="cd-acc-header"
                        onClick={() => setOpenFaq(openFaq === `faq-${i}` ? null : `faq-${i}`)}
                      >
                        <span>{faq.q}</span>
                        {openFaq === `faq-${i}` ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                      </button>
                      {openFaq === `faq-${i}` && (
                        <div className="cd-acc-body">
                          <p>{faq.a}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* ── Right Sidebar ── */}
          <aside className="cd-sidebar">
            <div className="cd-sidebar-card">

              {/* Thumbnail */}
              <div className="cd-sidebar-thumb">
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt={course.title} />
                ) : (
                  <div className="cd-sidebar-thumb-placeholder">
                    <CourseIcon size={36} />
                    <span>{course.categoryLabel || course.title}</span>
                  </div>
                )}
              </div>

              {/* Enrolled state */}
              {courseState.enrolled ? (
                <div className="cd-enrolled-state">
                  <span className="cd-badge cd-badge--enrolled">Enrolled</span>
                  <p>Your access is active. Open the classroom to continue learning.</p>
                  {courseState.enrollment?.classModeLabel && (
                    <div className="cd-selected-class-summary">
                      <span>Class Mode</span>
                      <strong>{courseState.enrollment.classModeLabel}</strong>
                    </div>
                  )}
                  {courseState.enrollment?.demoVideoUrl && (
                    <a className="cd-btn cd-btn--primary" href={courseState.enrollment.demoVideoUrl} target="_blank" rel="noreferrer">
                      <FiPlayCircle size={16} /> Watch Demo Video
                    </a>
                  )}
                  <Link to={`/my-learning/${course.slug}`} className="cd-btn cd-btn--primary">
                    Open Classroom
                  </Link>
                  <Link to="/dashboard" className="cd-btn cd-btn--outline">
                    View Dashboard
                  </Link>
                </div>
              ) : (
                <>
                  {/* Price block */}
                  {!course.isFree && (
                    <div className="cd-price-block">
                      <span className="cd-price-label">PRICE</span>
                      <div className="cd-price-row">
                        <span className="cd-price-main">{selectedClassOption.displayPrice}</span>
                      </div>
                    </div>
                  )}

                  {!course.isFree && (
                    <div className="cd-class-options">
                      <span className="cd-class-options-label">Choose class mode</span>
                      {classOptions.map((option) => (
                        <label
                          key={option.value}
                          className={`cd-class-option ${selectedClassMode === option.value ? 'active' : ''}`}
                        >
                          <input
                            type="radio"
                            name="classMode"
                            value={option.value}
                            checked={selectedClassMode === option.value}
                            onChange={() => setSelectedClassMode(option.value)}
                            disabled={!option.available}
                          />
                          <span>{option.label}</span>
                          <strong>{option.displayPrice}</strong>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Feedback messages */}
                  {feedback.type === 'success' && (
                    <p className="cd-feedback cd-feedback--success">{feedback.message}</p>
                  )}
                  {feedback.type === 'error' && (
                    <p className="cd-feedback cd-feedback--error">{feedback.message}</p>
                  )}

                  {/* Demo booked notice */}
                  {courseState.demoBooked && courseState.enrollment?.demoSlotAt && (
                    <div className="cd-demo-notice">
                      <strong>Demo scheduled:</strong>
                      <span>{formatDemoSlot(courseState.enrollment.demoSlotAt)}</span>
                    </div>
                  )}

                  {/* Buy Now */}
                  {!course.isFree && (
                    <button
                      className="cd-btn cd-btn--buy"
                      onClick={handleEnrollNow}
                      disabled={actionLoading === 'payment' || statusLoading || !hasClassPrice}
                    >
                      {actionLoading === 'payment'
                        ? <><span className="spinner spinner--white" /> Processing...</>
                        : hasClassPrice ? `Pay ${selectedClassOption.displayPrice}` : 'Price Not Set'}
                    </button>
                  )}

                  {/* Free course access */}
                  {course.isFree && (
                    <Link to={`/my-learning/${course.slug}`} className="cd-btn cd-btn--buy">
                      View Content
                    </Link>
                  )}

                  {/* Demo toggle */}
                  {!courseState.demoBooked && !course.isFree && (
                    <button
                      className="cd-btn cd-btn--outline"
                      onClick={() => setShowDemoForm((v) => !v)}
                    >
                      <FiCalendar size={15} />
                      {showDemoForm ? 'Cancel Demo' : 'Book Free Demo Class'}
                    </button>
                  )}

                  {/* Demo Form */}
                  {showDemoForm && (
                    <form className="cd-demo-form" onSubmit={handleBookDemo}>
                      <div className="cd-form-group">
                        <label>Preferred Date *</label>
                        <input
                          type="date"
                          min={minDate}
                          value={demoForm.slotDate}
                          onChange={(e) => setDemoForm({ ...demoForm, slotDate: e.target.value })}
                          required
                        />
                      </div>
                      <div className="cd-form-group">
                        <label>Preferred Time *</label>
                        <select
                          value={demoForm.slotTime}
                          onChange={(e) => setDemoForm({ ...demoForm, slotTime: e.target.value })}
                          required
                        >
                          {demoTimeSlots.map((slot) => (
                            <option key={slot} value={slot}>{slot}</option>
                          ))}
                        </select>
                      </div>
                      <div className="cd-form-group">
                        <label>Notes (optional)</label>
                        <textarea
                          value={demoForm.notes}
                          onChange={(e) => setDemoForm({ ...demoForm, notes: e.target.value })}
                          placeholder="Your background or topics to cover..."
                          rows={3}
                        />
                      </div>
                      <button
                        type="submit"
                        className="cd-btn cd-btn--primary"
                        disabled={actionLoading === 'demo'}
                      >
                        {actionLoading === 'demo'
                          ? <><span className="spinner spinner--white" /> Booking...</>
                          : 'Confirm Demo Slot'}
                      </button>
                    </form>
                  )}

                  {!user && (
                    <p className="cd-login-note">
                      <Link to="/login">Sign in</Link> to enroll or book a demo.
                    </p>
                  )}
                </>
              )}

              {/* Included features */}
              {course.features && course.features.length > 0 && (
                <div className="cd-includes">
                  <p className="cd-includes-title">What's Included</p>
                  {course.features.slice(0, 6).map((f, i) => (
                    <div key={i} className="cd-includes-row">
                      <FiCheck size={13} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>

        </div>
      </div>
    </div>
  )
}
