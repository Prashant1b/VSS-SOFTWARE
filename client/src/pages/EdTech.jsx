import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiCalendar,
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiCloud,
  FiCode,
  FiCpu,
  FiDatabase,
  FiGitBranch,
  FiLayers,
  FiPlayCircle,
  FiUsers,
} from 'react-icons/fi'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { courseVisuals, demoTimeSlots } from '../data/coursePresentation'
import './EdTech.css'

const techStack = [
  'Python 3.11', 'PyTorch 2.x', 'Transformers', 'LangChain', 'LangGraph',
  'Hugging Face', 'LlamaIndex', 'FAISS / Chroma', 'Pinecone', 'WandB',
  'FastAPI', 'Docker', 'Google Colab', 'AWS / GCP',
]

const curriculum = [
  {
    phase: 'Phase 1', title: 'Transformers and LLM Architecture', hours: '15 hours',
    icon: <FiCode size={20} />,
    units: ['LLM architectures and tokenization fundamentals', 'Prompt design patterns and engineering', 'API integration with OpenAI and Anthropic', 'Build your own GPT-2 from scratch'],
    project: 'GPT-2 Build Project',
  },
  {
    phase: 'Phase 2', title: 'RAG and Knowledge Retrieval', hours: '20 hours',
    icon: <FiDatabase size={20} />,
    units: ['Document chunking and embedding strategies', 'Vector databases such as FAISS, Pinecone, and ChromaDB', 'Semantic search pipelines', 'Enterprise PDF ingestion and retrieval'],
    project: 'Enterprise PDF Ingestion Lab',
  },
  {
    phase: 'Phase 3', title: 'Fine-Tuning and Model Alignment', hours: '15 hours',
    icon: <FiCpu size={20} />,
    units: ['PEFT, LoRA, and QLoRA techniques', 'Full fine-tuning labs with GPU credits', 'Model alignment and LLM guardrails', 'LLM Ops and monitoring with WandB'],
    project: 'Mistral Medical Extraction Lab',
  },
  {
    phase: 'Phase 4', title: 'Multi-Agent Systems and Deployment', hours: '10 hours',
    icon: <FiCloud size={20} />,
    units: ['LangGraph agent workflows', 'Multi-agent orchestration patterns', 'Containerization with Docker', 'Cloud deployment on AWS or GCP'],
    project: '24/7 AI Support Swarm Capstone',
  },
]

const outcomes = [
  { icon: <FiGitBranch size={22} />, title: 'GitHub Portfolio', desc: 'Verified project samples showcasing production-grade work' },
  { icon: <FiLayers size={22} />, title: 'Industry Certification', desc: 'Professional certification aligned to current industry expectations' },
  { icon: <FiCode size={22} />, title: 'Capstone Projects', desc: 'Real-world applications built throughout the course journey' },
  { icon: <FiCheck size={22} />, title: 'Career Support', desc: 'Resume coaching, interview prep, and placement assistance' },
]

const competencies = ['Custom Attention Heads', 'Vector Search at Scale', 'Fine-Tuning Labs', 'LangGraph Workflows', 'LLM Guardrails', 'LLM Ops and Monitoring']

const faqs = [
  { q: 'Who is eligible for this course?', a: 'Final-year students or working professionals with basic programming familiarity. We guide you from fundamentals to project delivery.' },
  { q: 'What is the time commitment?', a: 'Most learners spend 8 to 10 hours per week. Live sessions are supported by recordings and mentor check-ins.' },
  { q: 'Do I get demo access before paying?', a: 'Yes. You can schedule a live demo class slot first, then decide whether to complete payment through Razorpay.' },
  { q: 'What happens after payment?', a: 'The course is marked as enrolled on your dashboard, the pay and demo actions are hidden on the course page, and your video access link becomes available.' },
  { q: 'Is placement support included?', a: 'Yes. We include resume support, interview preparation, and placement-focused guidance for active learners.' },
]

const emptyCourseState = {
  status: 'not_started',
  enrolled: false,
  demoBooked: false,
  enrollment: null,
}

function formatCurrency(amount, fallback) {
  if (!amount) return fallback || 'Rs 0'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

function normalizeCourse(course) {
  const preset = courseVisuals[course.slug] || courseVisuals.default
  const dbFeatures = Array.isArray(course.features) && course.features.length ? course.features : null
  const dbTechStack = Array.isArray(course.techStack) && course.techStack.length ? course.techStack : null
  const legacyHighlights = Array.isArray(course.highlights) && course.highlights.length ? course.highlights : null

  return {
    ...course,
    icon: preset.icon,
    mode: course.mode || preset.mode,
    originalPrice: course.originalPrice || preset.originalPrice,
    features: dbFeatures || legacyHighlights || preset.features,
    tech: dbTechStack || legacyHighlights?.slice(0, 6) || preset.tech,
    displayPrice: course.price || formatCurrency(course.amount),
    displayOriginalPrice: course.originalPrice || preset.originalPrice,
  }
}

export default function EdTech() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [openAccordion, setOpenAccordion] = useState(0)
  const [openFaq, setOpenFaq] = useState(null)
  const [courses, setCourses] = useState([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [activeCourseTab, setActiveCourseTab] = useState('')
  const [courseState, setCourseState] = useState(emptyCourseState)
  const [statusLoading, setStatusLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState('')
  const [feedback, setFeedback] = useState({ type: '', message: '' })
  const [demoForm, setDemoForm] = useState({ slotDate: '', slotTime: demoTimeSlots[0], notes: '' })

  useEffect(() => {
    setCoursesLoading(true)
    api.get('/public/courses')
      .then((res) => {
        const data = (res.data.data || []).map(normalizeCourse)
        setCourses(data)
        if (!activeCourseTab && data.length) {
          setActiveCourseTab(data[0].slug)
        }
      })
      .catch(() => setCourses([]))
      .finally(() => setCoursesLoading(false))
  }, [])

  const activeCourse = useMemo(
    () => courses.find((course) => course.slug === activeCourseTab) || courses[0] || null,
    [courses, activeCourseTab]
  )

  useEffect(() => {
    if (!activeCourse) return
    if (!activeCourseTab) setActiveCourseTab(activeCourse.slug)
  }, [activeCourse, activeCourseTab])

  useEffect(() => {
    if (!user || !activeCourse) {
      setCourseState(emptyCourseState)
      return
    }

    setStatusLoading(true)
    api.get(`/course-enrollment/status/${activeCourse.slug}`, { withCredentials: true })
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
  }, [activeCourse, user])

  useEffect(() => {
    setFeedback({ type: '', message: '' })
    setDemoForm({ slotDate: '', slotTime: demoTimeSlots[0], notes: '' })
  }, [activeCourseTab])

  const minDate = new Date().toISOString().split('T')[0]

  const requireLogin = () => navigate('/login')

  const loadRazorpayScript = () => new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

  const formatDemoSlot = (slot) => {
    if (!slot) return ''
    return new Date(slot).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  const handleBookDemo = async (event) => {
    event.preventDefault()
    if (!activeCourse) return
    if (!user) {
      requireLogin()
      return
    }

    setActionLoading('demo')
    setFeedback({ type: '', message: '' })

    try {
      const res = await api.post('/course-enrollment/demo-slot', {
        courseSlug: activeCourse.slug,
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
      setFeedback({ type: 'success', message: 'Demo class booked successfully. We will connect with you at the selected slot.' })
    } catch (error) {
      setFeedback({ type: 'error', message: error.response?.data?.message || 'Unable to schedule the demo slot right now.' })
    } finally {
      setActionLoading('')
    }
  }

  const handleEnrollNow = async () => {
    if (!activeCourse) return
    if (!user) {
      requireLogin()
      return
    }

    setActionLoading('payment')
    setFeedback({ type: '', message: '' })

    try {
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        throw new Error('Razorpay checkout could not be loaded')
      }

      const orderRes = await api.post('/course-enrollment/create-order', {
        courseSlug: activeCourse.slug,
      }, { withCredentials: true })

      const { key, order } = orderRes.data
      const checkout = new window.Razorpay({
        key,
        amount: order.amount,
        currency: order.currency,
        name: 'VSS SOFTWARE',
        description: `${activeCourse.title} enrollment`,
        order_id: order.id,
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || '',
        },
        theme: { color: '#0A2540' },
        handler: async (response) => {
          try {
            const verifyRes = await api.post('/course-enrollment/verify-payment', {
              courseSlug: activeCourse.slug,
              ...response,
            }, { withCredentials: true })

            setCourseState({
              status: verifyRes.data.data.status,
              enrolled: true,
              demoBooked: Boolean(verifyRes.data.data.demoSlotAt),
              enrollment: verifyRes.data.data,
            })
            setFeedback({ type: 'success', message: 'Payment completed successfully. Your course is now visible in your profile dashboard.' })
          } catch (error) {
            setFeedback({ type: 'error', message: error.response?.data?.message || 'Payment verification failed.' })
          } finally {
            setActionLoading('')
          }
        },
        modal: {
          ondismiss: () => setActionLoading(''),
        },
      })

      checkout.open()
    } catch (error) {
      setFeedback({ type: 'error', message: error.response?.data?.message || error.message || 'Unable to start payment right now.' })
      setActionLoading('')
    }
  }

  if (coursesLoading) {
    return <div className="loading-page"><span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
  }

  if (!activeCourse) {
    return (
      <div className="page-enter">
        <section className="section">
          <div className="container">
            <div className="section-header">
              <span className="section-label">EdTech and Training</span>
              <h2 className="section-title">No active courses found</h2>
              <p className="section-subtitle">Add courses from the admin panel and they will appear here automatically.</p>
            </div>
          </div>
        </section>
      </div>
    )
  }

  const CourseIcon = activeCourse.icon || FiBookOpen

  return (
    <div className="page-enter">
      <section className="edtech-hero">
        <div className="container">
          <span className="section-label">EdTech and Training</span>
          <h1 className="edtech-hero-title">
            {activeCourse.title}<br />
            <span className="hero-highlight">Professional Course Enrollment</span>
          </h1>
          <p className="edtech-hero-sub">
            Course data, pricing, and enrollment state now come directly from the database so the public page, Razorpay payment, and dashboard all stay aligned.
          </p>
          <div className="hero-actions" style={{ justifyContent: 'center' }}>
            <a href="#enroll" className="btn btn-primary">Book Demo or Pay</a>
            <a href="#curriculum" className="btn btn-outline">View Curriculum</a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Our Courses</span>
            <h2 className="section-title">Choose Your Learning Path</h2>
            <p className="section-subtitle">These tabs are loaded from MongoDB, so anything you change in admin can appear here.</p>
          </div>

          <div className="course-tabs">
            {courses.map((course) => {
              const Icon = course.icon || FiBookOpen
              return (
                <button
                  key={course.slug}
                  className={`course-tab ${activeCourse.slug === course.slug ? 'active' : ''}`}
                  onClick={() => setActiveCourseTab(course.slug)}
                >
                  <Icon size={28} />
                  <span>{course.title}</span>
                </button>
              )
            })}
          </div>

          <div className="course-detail-card">
            <div className="course-detail-left">
              <div className="course-detail-icon"><CourseIcon size={28} /></div>
              <h3>{activeCourse.title}</h3>
              <p className="course-detail-desc">{activeCourse.description || 'Industry-focused training designed for practical delivery and hiring readiness.'}</p>

              <div className="course-meta">
                <div className="course-meta-item">
                  <FiClock size={16} />
                  <span><strong>{activeCourse.duration}</strong> Duration</span>
                </div>
                <div className="course-meta-item">
                  <FiBookOpen size={16} />
                  <span>{activeCourse.mode}</span>
                </div>
                <div className="course-meta-item">
                  <FiUsers size={16} />
                  <span><strong>{activeCourse.students || '0'}</strong> Learners</span>
                </div>
                <div className="course-meta-item">
                  <FiAward size={16} />
                  <span><strong>{activeCourse.rating || '0'}</strong> Rating</span>
                </div>
              </div>

              <div className="course-tech-stack">
                {activeCourse.tech.map((item, index) => (
                  <span key={`${item}-${index}`} className="course-tech-chip">{item}</span>
                ))}
              </div>

              {courseState.enrolled ? (
                <Link to="/dashboard" className="btn btn-primary">
                  Open Dashboard <FiArrowRight size={16} />
                </Link>
              ) : (
                <a href="#enroll" className="btn btn-primary">
                  Choose Demo or Payment <FiArrowRight size={16} />
                </a>
              )}
            </div>

            <div className="course-detail-right">
              <div className="course-pricing-card">
                {courseState.enrolled ? (
                  <div className="course-access-card">
                    <span className="course-access-badge">Enrolled</span>
                    <h4>Your access is active</h4>
                    <p>This course is already unlocked for your account. Payment, dashboard visibility, and access state are all synced.</p>
                    <div className="course-access-meta">
                      <span><FiAward size={14} /> Paid enrollment confirmed</span>
                      {courseState.enrollment?.paidAt && (
                        <span><FiClock size={14} /> {new Date(courseState.enrollment.paidAt).toLocaleDateString('en-IN')}</span>
                      )}
                    </div>
                    {courseState.enrollment?.demoVideoUrl && (
                      <a className="btn btn-primary" href={courseState.enrollment.demoVideoUrl} target="_blank" rel="noreferrer" style={{ width: '100%', justifyContent: 'center' }}>
                        <FiPlayCircle size={16} /> Watch Demo Video
                      </a>
                    )}
                    <Link to="/dashboard" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                      View My Courses
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="course-price-header">
                      <span className="course-price-label">Course Fee</span>
                      <div className="course-price-row">
                        <span className="course-price-current">{activeCourse.displayPrice}</span>
                        {activeCourse.displayOriginalPrice && <span className="course-price-original">{activeCourse.displayOriginalPrice}</span>}
                      </div>
                      <span className="course-discount-badge">Managed from admin panel</span>
                    </div>
                    <div className="course-features-list">
                      <p className="course-features-title">What is Included</p>
                      {activeCourse.features.map((feature, index) => (
                        <div key={`${feature}-${index}`} className="course-feature">
                          <FiCheck size={14} />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
                      onClick={handleEnrollNow}
                      disabled={actionLoading === 'payment' || statusLoading}
                    >
                      {actionLoading === 'payment' ? <><span className="spinner" /> Opening Payment...</> : 'Pay and Enroll with Razorpay'}
                    </button>
                    <a href="#enroll" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
                      <FiCalendar size={16} /> Book Free Demo Class
                    </a>
                    {courseState.demoBooked && courseState.enrollment?.demoSlotAt && (
                      <div className="course-scheduled-note">
                        <strong>Demo booked:</strong> {formatDemoSlot(courseState.enrollment.demoSlotAt)}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Core Competencies</span>
            <h2 className="section-title">What You Will Master</h2>
          </div>
          <div className="competency-grid">
            {competencies.map((competency, index) => (
              <div key={`${competency}-${index}`} className="competency-chip">
                <FiCheck size={15} />
                {competency}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Technology Stack</span>
            <h2 className="section-title">Industry-Standard Tools</h2>
          </div>
          <div className="tech-grid">
            {techStack.map((item, index) => (
              <div key={`${item}-${index}`} className="tech-chip">{item}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-alt" id="curriculum">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Curriculum</span>
            <h2 className="section-title">Four-Phase Syllabus</h2>
            <p className="section-subtitle">A structured path from fundamentals to deployment.</p>
          </div>
          <div className="curriculum-list">
            {curriculum.map((item, index) => (
              <div key={item.title} className={`curriculum-item ${openAccordion === index ? 'open' : ''}`}>
                <button
                  className="curriculum-header"
                  onClick={() => setOpenAccordion(openAccordion === index ? -1 : index)}
                  aria-expanded={openAccordion === index}
                >
                  <div className="curriculum-left">
                    <div className="curriculum-icon">{item.icon}</div>
                    <div>
                      <span className="curriculum-phase">{item.phase} - {item.hours}</span>
                      <h3>{item.title}</h3>
                    </div>
                  </div>
                  {openAccordion === index ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                </button>
                {openAccordion === index && (
                  <div className="curriculum-body">
                    <ul>
                      {item.units.map((unit) => (
                        <li key={unit}><FiCheck size={14} /> {unit}</li>
                      ))}
                    </ul>
                    <div className="curriculum-project">
                      <strong>Capstone:</strong> {item.project}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Outcomes</span>
            <h2 className="section-title">What You Will Walk Away With</h2>
          </div>
          <div className="grid-4">
            {outcomes.map((item) => (
              <div key={item.title} className="outcome-card card">
                <div className="outcome-icon">{item.icon}</div>
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
            <span className="section-label">FAQ</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={faq.q} className={`faq-item ${openFaq === index ? 'open' : ''}`}>
                <button className="faq-header" onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index}>
                  <span>{faq.q}</span>
                  {openFaq === index ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                </button>
                {openFaq === index && <div className="faq-body"><p>{faq.a}</p></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-alt" id="enroll">
        <div className="container">
          <div className="enrollment-wrapper">
            <div className="enrollment-info">
              <span className="section-label">{courseState.enrolled ? 'Course Access' : 'Enrollment Hub'}</span>
              <h2 className="section-title" style={{ textAlign: 'left' }}>
                {courseState.enrolled ? 'You are already enrolled' : 'Book a demo or secure your seat'}
              </h2>
              <p>
                {courseState.enrolled
                  ? 'Your seat is confirmed. The dashboard shows the course as enrolled, and the payment and demo actions are hidden here.'
                  : 'Pick a live demo slot first, or complete payment with Razorpay right away. Once payment succeeds, your course appears in the profile dashboard automatically.'}
              </p>
              <ul className="enrollment-benefits">
                <li><FiCheck size={16} /> Database-driven course catalog and pricing</li>
                <li><FiCheck size={16} /> Razorpay order creation and signature verification</li>
                <li><FiCheck size={16} /> Dashboard access after successful payment</li>
                <li><FiCheck size={16} /> Demo scheduling before purchase</li>
                <li><FiCheck size={16} /> Video access link after enrollment</li>
              </ul>
              {courseState.demoBooked && courseState.enrollment?.demoSlotAt && !courseState.enrolled && (
                <div className="enrollment-state-card">
                  <strong>Upcoming demo</strong>
                  <span>{formatDemoSlot(courseState.enrollment.demoSlotAt)}</span>
                </div>
              )}
            </div>

            {courseState.enrolled ? (
              <div className="enrollment-form enrollment-access-panel">
                <div className="enrolled-summary-card">
                  <span className="course-access-badge">Paid</span>
                  <h3>{activeCourse.title}</h3>
                  <p>Your course is already mapped to your profile. Continue from your dashboard whenever you want.</p>
                  <div className="enrolled-summary-grid">
                    <div>
                      <span>Status</span>
                      <strong>Unlocked</strong>
                    </div>
                    <div>
                      <span>Payment</span>
                      <strong>Verified</strong>
                    </div>
                    <div>
                      <span>Dashboard</span>
                      <strong>Updated</strong>
                    </div>
                  </div>
                  {courseState.enrollment?.demoVideoUrl && (
                    <a className="btn btn-primary" href={courseState.enrollment.demoVideoUrl} target="_blank" rel="noreferrer" style={{ width: '100%', justifyContent: 'center' }}>
                      <FiPlayCircle size={16} /> Open Demo Video
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <form className="enrollment-form" onSubmit={handleBookDemo}>
                <div className="professional-pill">Professional enrollment flow</div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Preferred Date *</label>
                    <input
                      type="date"
                      min={minDate}
                      value={demoForm.slotDate}
                      onChange={(event) => setDemoForm({ ...demoForm, slotDate: event.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Preferred Time *</label>
                    <select
                      value={demoForm.slotTime}
                      onChange={(event) => setDemoForm({ ...demoForm, slotTime: event.target.value })}
                      required
                    >
                      {demoTimeSlots.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Notes for our trainer</label>
                  <textarea
                    value={demoForm.notes}
                    onChange={(event) => setDemoForm({ ...demoForm, notes: event.target.value })}
                    placeholder="Tell us your background or what you want covered in the demo."
                  />
                </div>
                <button type="submit" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} disabled={actionLoading === 'demo' || statusLoading}>
                  {actionLoading === 'demo' ? <><span className="spinner" /> Booking Demo...</> : 'Schedule Demo Class'}
                </button>
                <button type="button" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }} onClick={handleEnrollNow} disabled={actionLoading === 'payment' || statusLoading}>
                  {actionLoading === 'payment' ? <><span className="spinner" /> Opening Payment...</> : `Pay ${formatCurrency(activeCourse.amount, activeCourse.displayPrice)} with Razorpay`}
                </button>
                {!user && <p className="form-error">Sign in first to book a demo or complete payment. Your enrolled course then appears in the dashboard profile.</p>}
                {feedback.type === 'success' && <p className="form-success">{feedback.message}</p>}
                {feedback.type === 'error' && <p className="form-error">{feedback.message}</p>}
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
