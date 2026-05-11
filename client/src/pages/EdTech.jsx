import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiBookOpen,
  FiCalendar,
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiCloud,
  FiCode,
  FiCpu,
  FiDatabase,
  FiGitBranch,
  FiLayers,
  FiUsers,
  FiClock,
  FiFileText,
} from 'react-icons/fi'
import api from '../api'
import { courseVisuals } from '../data/coursePresentation'
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

function getDiscountPercent(current, original) {
  const cur = Number(String(current || '').replace(/[^0-9.]/g, ''))
  const ori = Number(String(original || '').replace(/[^0-9.]/g, ''))
  if (!cur || !ori || ori <= cur) return null
  return Math.round(((ori - cur) / ori) * 100)
}

function getClassOptions(course) {
  if (!course) return []

  return [
    { value: 'online', title: 'Online Classes', amount: Number(course.onlineAmount || 0), desc: 'Live online learning with mentor support and dashboard access.' },
    { value: 'hybrid', title: 'Hybrid Classes', amount: Number(course.hybridAmount || 0), desc: 'Online learning plus scheduled in-person support sessions.' },
    { value: 'offline', title: 'Offline Classes', amount: Number(course.offlineAmount || 0), desc: 'Classroom-based training with direct faculty interaction.' },
  ].map((option) => ({
    ...option,
    price: option.amount > 0 ? formatCurrency(option.amount) : 'Not set',
    available: option.amount > 0,
  }))
}

function getStartingPrice(course) {
  const amounts = getClassOptions(course)
    .map((option) => option.amount)
    .filter((amount) => amount > 0)

  if (!amounts.length) return course.price || formatCurrency(course.amount)
  return `Starts at ${formatCurrency(Math.min(...amounts))}`
}

function normalizeCourse(course) {
  const preset = courseVisuals[course.slug] || courseVisuals.default
  const dbFeatures = Array.isArray(course.features) && course.features.length ? course.features : []
  const dbTechStack = Array.isArray(course.techStack) && course.techStack.length ? course.techStack : []
  const legacyHighlights = Array.isArray(course.highlights) && course.highlights.length ? course.highlights : []
  const fallbackNextBatch = course.isActive ? 'Admissions Open' : 'Coming Soon'

  return {
    ...course,
    icon: preset.icon,
    categoryLabel: course.categoryLabel || course.title,
    cardHeadline: course.cardHeadline || 'Course',
    mode: course.mode || 'Online / Offline',
    originalPrice: course.originalPrice || '',
    durationLabel: course.durationLabel || course.duration,
    projects: course.projectsCount || String(dbFeatures.length || legacyHighlights.length || 0),
    nextBatch: course.nextBatchLabel || fallbackNextBatch,
    accent: course.accentTone || 'violet',
    features: dbFeatures.length ? dbFeatures : legacyHighlights,
    tech: dbTechStack.length ? dbTechStack : legacyHighlights.slice(0, 6),
    displayPrice: getStartingPrice(course),
    displayOriginalPrice: '',
    isFree: !course.amount || course.amount === 0,
  }
}

export default function EdTech() {
  const [openAccordion, setOpenAccordion] = useState(0)
  const [openFaq, setOpenFaq] = useState(null)
  const [courses, setCourses] = useState([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [activeCourseTab, setActiveCourseTab] = useState('')

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

  const handleSelectCourse = (slug) => {
    setActiveCourseTab(slug)
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
              <p className="section-subtitle">No Course available</p>
            </div>
          </div>
        </section>
      </div>
    )
  }

  const CourseIcon = activeCourse.icon || FiBookOpen
  const activeClassOptions = getClassOptions(activeCourse)

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
            Industry-focused training with online, hybrid, and offline class options.
          </p>
          <div className="hero-actions" style={{ justifyContent: 'center' }}>
            <a href="#enroll" className="btn btn-primary">Book Demo or Pay</a>
            <a href="#curriculum" className="btn btn-outline">View Curriculum</a>
          </div>
        </div>
      </section>

      {/* ── Course Cards Grid (Screenshot Style) ── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Our Courses</span>
            <h2 className="section-title">Choose Your Learning Path</h2>
          </div>

          <div className="course-card-grid">
            {courses.map((course) => {
              const Icon = course.icon || FiBookOpen
              const discount = getDiscountPercent(course.displayPrice, course.displayOriginalPrice)
              const isActive = activeCourse.slug === course.slug

              return (
                <div
                  key={course.slug}
                  className={`course-card ${isActive ? 'course-card--active' : ''}`}
                >
                  {/* Thumbnail */}
                  <div className="course-card__thumb">
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.title} />
                    ) : (
                      <div className="course-card__thumb-placeholder">
                        <Icon size={40} />
                        <span>{course.categoryLabel || course.title}</span>
                      </div>
                    )}
                    {course.isFree && <span className="course-card__badge course-card__badge--free">FREE</span>}
                    {!course.isFree && discount && (
                      <span className="course-card__badge course-card__badge--discount">{discount}% off</span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="course-card__body">
                    <h3 className="course-card__title">{course.title}</h3>
                    <p className="course-card__desc">
                      {course.description
                        ? course.description.slice(0, 90) + (course.description.length > 90 ? '...' : '')
                        : 'Industry-focused training designed for practical delivery and hiring readiness.'}
                    </p>

                    {/* Price row */}
                    {!course.isFree && (
                      <div className="course-card__price-row">
                        <span className="course-card__price">{course.displayPrice}</span>
                        {course.displayOriginalPrice && (
                          <span className="course-card__price-original">{course.displayOriginalPrice}</span>
                        )}
                        {discount && (
                          <span className="course-card__discount-badge">{discount}% off</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="course-card__actions">
                    {course.isFree ? (
                      <>
                        <Link
                          to={`/my-learning/${course.slug}`}
                          className="btn btn-primary course-card__btn"
                        >
                          View Content
                        </Link>
                        <Link
                          to={`/courses/${course.slug}`}
                          className="btn btn-outline course-card__btn"
                        >
                          View Details
                        </Link>
                      </>
                    ) : (
                      <Link
                        to={`/courses/${course.slug}`}
                        className="btn btn-primary course-card__btn"
                      >
                        View Details
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </section>

      <section className="section-alt" id="class-options">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Class Options</span>
            <h2 className="section-title">Choose Your Class Mode</h2>
            <p className="section-subtitle">Students can enroll with one of these three options only.</p>
          </div>
          <div className="class-option-grid">
            {activeClassOptions.map((option) => (
              <div key={option.value} className={`class-option-card ${option.value === 'online' ? 'featured' : ''}`}>
                <div className="class-option-head">
                  {option.value === 'online' && <FiCloud size={22} />}
                  {option.value === 'hybrid' && <FiUsers size={22} />}
                  {option.value === 'offline' && <FiBookOpen size={22} />}
                  <span>{option.price}</span>
                </div>
                <h3>{option.title}</h3>
                <p>{option.desc}</p>
                <Link to={activeCourse ? `/courses/${activeCourse.slug}` : '/edtech'} className="class-option-link">
                  Enroll with this option
                </Link>
              </div>
            ))}
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
          <div className="section-header">
            <span className="section-label">Enrollment Hub</span>
            <h2 className="section-title">Ready to get started?</h2>
            <p className="section-subtitle">
              Click <strong>View Details</strong> on any course above to book a free demo or enroll directly with Razorpay.
            </p>
          </div>
          <div className="enroll-cta-row">
            <div className="enroll-cta-benefits">
              <div><FiCheck size={16} /> Razorpay secure payment</div>
              <div><FiCheck size={16} /> Free demo class before you pay</div>
              <div><FiCheck size={16} /> Online, hybrid, and offline prices are managed from admin</div>
              <div><FiCheck size={16} /> Dashboard access after enrollment</div>
              <div><FiCheck size={16} /> Industry certification on completion</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
