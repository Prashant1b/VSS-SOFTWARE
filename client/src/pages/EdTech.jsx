import { useState } from 'react'
import { FiChevronDown, FiChevronUp, FiCheck, FiCode, FiDatabase, FiCpu, FiCloud, FiGitBranch, FiLayers, FiClock, FiUsers, FiAward, FiArrowRight, FiBookOpen, FiBarChart2 } from 'react-icons/fi'
import api from '../api'
import './EdTech.css'

const courses = {
  fullstack: {
    title: 'Full Stack Development',
    desc: 'Master MERN stack and Java with Spring Boot. Build production-grade web apps.',
    icon: <FiCode size={28} />,
    duration: '8 Months',
    mode: 'Online / Offline / Self-Paced',
    price: '₹65,000',
    originalPrice: '₹80,000',
    students: '300+',
    rating: '4.8',
    features: [
      'JavaScript, React, Node.js, MongoDB',
      'Java with Spring Boot fundamentals',
      'Live lectures + lifetime recordings',
      'Daily assignments and projects',
      '4 capstone projects in portfolio',
      'Mock interviews & placement support',
    ],
    tech: ['React', 'Node.js', 'MongoDB', 'Express', 'Java', 'Spring Boot']
  },
  genai: {
    title: 'Generative AI & LLMs',
    desc: 'Master LLMs, RAG systems, fine-tuning, and multi-agent autonomous systems.',
    icon: <FiCpu size={28} />,
    duration: '60 Hours',
    mode: 'Online / Self-Paced',
    price: '₹45,000',
    originalPrice: '₹60,000',
    students: '150+',
    rating: '4.9',
    features: [
      'Transformer architecture from scratch',
      'RAG pipelines with vector databases',
      'LoRA, QLoRA fine-tuning techniques',
      'LangGraph multi-agent systems',
      'H100 GPU compute credits included',
      'Industry blockchain certification',
    ],
    tech: ['Python', 'PyTorch', 'LangChain', 'Hugging Face', 'FastAPI', 'Docker']
  },
  data: {
    title: 'Data Analytics & Science',
    desc: 'Become a data professional with Python, SQL, Power BI, and ML fundamentals.',
    icon: <FiBarChart2 size={28} />,
    duration: '7 Months',
    mode: 'Online / Offline',
    price: '₹50,000',
    originalPrice: '₹65,000',
    students: '200+',
    rating: '4.7',
    features: [
      'Python for data analysis',
      'SQL & advanced query optimization',
      'Power BI / Tableau dashboards',
      'Statistical modeling fundamentals',
      'Real business case studies',
      'Direct placement pipeline',
    ],
    tech: ['Python', 'Pandas', 'SQL', 'Power BI', 'Tableau', 'NumPy']
  },
}

const techStack = [
  'Python 3.11', 'PyTorch 2.x', 'Transformers', 'LangChain', 'LangGraph',
  'Hugging Face', 'LlamaIndex', 'FAISS / Chroma', 'Pinecone', 'WandB',
  'FastAPI', 'Docker', 'Google Colab', 'AWS / GCP'
]

const curriculum = [
  {
    phase: 'Phase 1', title: 'Transformers & LLM Architecture', hours: '15 hours',
    icon: <FiCode size={20} />,
    units: ['LLM architectures and tokenization fundamentals', 'Prompt design patterns and engineering', 'API integration with OpenAI and Anthropic', 'Build your own GPT-2 from scratch'],
    project: 'GPT-2 Build Project'
  },
  {
    phase: 'Phase 2', title: 'RAG & Knowledge Retrieval', hours: '20 hours',
    icon: <FiDatabase size={20} />,
    units: ['Document chunking and embedding strategies', 'Vector databases: FAISS, Pinecone, ChromaDB', 'Semantic search pipelines', 'Enterprise PDF ingestion and retrieval'],
    project: 'Enterprise PDF Ingestion Lab'
  },
  {
    phase: 'Phase 3', title: 'Fine-Tuning & Model Alignment', hours: '15 hours',
    icon: <FiCpu size={20} />,
    units: ['PEFT, LoRA, and QLoRA techniques', 'Full fine-tuning labs with H100 GPU credits', 'Model alignment and LLM guardrails', 'LLM-Ops and monitoring with WandB'],
    project: 'Mistral Medical Extraction Lab'
  },
  {
    phase: 'Phase 4', title: 'Multi-Agent Systems & Deployment', hours: '10 hours',
    icon: <FiCloud size={20} />,
    units: ['LangGraph agent workflows', 'Multi-agent orchestration patterns', 'Containerization with Docker', 'Cloud deployment on AWS / GCP'],
    project: '24/7 AI Support Swarm Capstone'
  },
]

const outcomes = [
  { icon: <FiGitBranch size={22} />, title: 'GitHub Portfolio', desc: 'Verified project samples showcasing production-grade work' },
  { icon: <FiLayers size={22} />, title: 'Industry Certification', desc: 'Blockchain-verified certification upon completion' },
  { icon: <FiCode size={22} />, title: '4 Capstone Projects', desc: 'Real-world applications built during the course' },
  { icon: <FiCheck size={22} />, title: 'Career Support', desc: 'Resume coaching, interview prep, and placement assistance' },
]

const competencies = ['Custom Attention Heads', 'Vector Search @ Scale', 'Full Fine-Tuning Labs', 'LangGraph Workflows', 'LLM Guardrails', 'LLM-Ops & Monitoring']

const faqs = [
  { q: 'Who is eligible for this course?', a: 'Final-year students or working professionals with Python fundamentals. No prior ML experience required.' },
  { q: 'What is the time commitment?', a: 'Approximately 8-10 hours per week over the course duration. All sessions are recorded for flexible learning.' },
  { q: 'Do I get GPU access?', a: 'Yes! All students receive H100 GPU compute credits for hands-on labs and projects.' },
  { q: 'What certification do I receive?', a: 'A blockchain-verified industry certification recognized by our hiring partners.' },
  { q: 'Is placement support included?', a: 'Yes — resume coaching, interview preparation, and direct placement pipeline to partner companies.' },
]

export default function EdTech() {
  const [openAccordion, setOpenAccordion] = useState(0)
  const [openFaq, setOpenFaq] = useState(null)
  const [activeCourseTab, setActiveCourseTab] = useState('genai')
  const [form, setForm] = useState({ name: '', email: '', phone: '', course: 'GenAI 60-Hour Flagship', institution: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const activeCourse = courses[activeCourseTab]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSubmitStatus(null)
    try {
      await api.post('/enrollment', form)
      setSubmitStatus('success')
      setForm({ name: '', email: '', phone: '', course: 'GenAI 60-Hour Flagship', institution: '', message: '' })
    } catch {
      setSubmitStatus('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="edtech-hero">
        <div className="container">
          <span className="section-label">EdTech & Training</span>
          <h1 className="edtech-hero-title">
            Generative AI & LLMs<br />
            <span className="hero-highlight">60-Hour Flagship Course</span>
          </h1>
          <p className="edtech-hero-sub">
            Master the elite stack: From Transformer math to LLM-Ops and Multi-Agent Autonomy.
            Production-grade RAG systems, LoRA/QLoRA fine-tuning, and cloud deployment.
          </p>
          <div className="hero-actions" style={{ justifyContent: 'center' }}>
            <a href="#enroll" className="btn btn-primary">Enroll Now</a>
            <a href="#curriculum" className="btn btn-outline">View Curriculum</a>
          </div>
        </div>
      </section>

      {/* Course Comparison Tabs */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Our Courses</span>
            <h2 className="section-title">Choose Your Learning Path</h2>
            <p className="section-subtitle">Online, offline, and self-paced courses tailored for your career goals.</p>
          </div>

          <div className="course-tabs">
            {Object.entries(courses).map(([key, course]) => (
              <button
                key={key}
                className={`course-tab ${activeCourseTab === key ? 'active' : ''}`}
                onClick={() => setActiveCourseTab(key)}
              >
                {course.icon}
                <span>{course.title}</span>
              </button>
            ))}
          </div>

          <div className="course-detail-card">
            <div className="course-detail-left">
              <div className="course-detail-icon">{activeCourse.icon}</div>
              <h3>{activeCourse.title}</h3>
              <p className="course-detail-desc">{activeCourse.desc}</p>

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
                  <span><strong>{activeCourse.students}</strong> Enrolled</span>
                </div>
                <div className="course-meta-item">
                  <FiAward size={16} />
                  <span><strong>{activeCourse.rating}</strong> Rating</span>
                </div>
              </div>

              <div className="course-tech-stack">
                {activeCourse.tech.map((t, i) => (
                  <span key={i} className="course-tech-chip">{t}</span>
                ))}
              </div>

              <a href="#enroll" className="btn btn-primary">
                Enroll Now <FiArrowRight size={16} />
              </a>
            </div>

            <div className="course-detail-right">
              <div className="course-pricing-card">
                <div className="course-price-header">
                  <span className="course-price-label">Course Fee</span>
                  <div className="course-price-row">
                    <span className="course-price-current">{activeCourse.price}</span>
                    <span className="course-price-original">{activeCourse.originalPrice}</span>
                  </div>
                  <span className="course-discount-badge">Limited Time Offer</span>
                </div>
                <div className="course-features-list">
                  <p className="course-features-title">What's Included</p>
                  {activeCourse.features.map((f, i) => (
                    <div key={i} className="course-feature">
                      <FiCheck size={14} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <a href="#enroll" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}>
                  Enroll Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Competencies */}
      <section className="section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Core Competencies</span>
            <h2 className="section-title">What You'll Master</h2>
          </div>
          <div className="competency-grid">
            {competencies.map((c, i) => (
              <div key={i} className="competency-chip">
                <FiCheck size={15} />
                {c}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Technology Stack</span>
            <h2 className="section-title">Industry-Standard Tools</h2>
          </div>
          <div className="tech-grid">
            {techStack.map((t, i) => (
              <div key={i} className="tech-chip">{t}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="section-alt" id="curriculum">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Curriculum</span>
            <h2 className="section-title">Four-Phase Syllabus</h2>
            <p className="section-subtitle">60 hours of intensive, project-based learning</p>
          </div>
          <div className="curriculum-list">
            {curriculum.map((item, i) => (
              <div key={i} className={`curriculum-item ${openAccordion === i ? 'open' : ''}`}>
                <button
                  className="curriculum-header"
                  onClick={() => setOpenAccordion(openAccordion === i ? -1 : i)}
                  aria-expanded={openAccordion === i}
                >
                  <div className="curriculum-left">
                    <div className="curriculum-icon">{item.icon}</div>
                    <div>
                      <span className="curriculum-phase">{item.phase} — {item.hours}</span>
                      <h3>{item.title}</h3>
                    </div>
                  </div>
                  {openAccordion === i ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                </button>
                {openAccordion === i && (
                  <div className="curriculum-body">
                    <ul>
                      {item.units.map((u, j) => (
                        <li key={j}><FiCheck size={14} /> {u}</li>
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

      {/* Outcomes */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Outcomes</span>
            <h2 className="section-title">What You'll Walk Away With</h2>
          </div>
          <div className="grid-4">
            {outcomes.map((o, i) => (
              <div key={i} className="outcome-card card">
                <div className="outcome-icon">{o.icon}</div>
                <h3>{o.title}</h3>
                <p>{o.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Testimonials</span>
            <h2 className="section-title">What Our Students Say</h2>
          </div>
          <div className="grid-2">
            <div className="testimonial-card card">
              <p className="testimonial-text">
                "The RAG pipeline project alone was worth the entire course. We reduced our document processing costs by 40% in the first quarter after implementation."
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">RP</div>
                <div>
                  <strong>Rahul P.</strong>
                  <span>ML Engineer, TechCorp</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card card">
              <p className="testimonial-text">
                "The fine-tuning labs gave me hands-on experience that I couldn't get anywhere else. Improved our model accuracy by 25% using techniques learned here."
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">SK</div>
                <div>
                  <strong>Sneha K.</strong>
                  <span>Data Scientist, FinServ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">FAQ</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>
          <div className="faq-list">
            {faqs.map((f, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                <button className="faq-header" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}>
                  <span>{f.q}</span>
                  {openFaq === i ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                </button>
                {openFaq === i && <div className="faq-body"><p>{f.a}</p></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enrollment Form */}
      <section className="section-alt" id="enroll">
        <div className="container">
          <div className="enrollment-wrapper">
            <div className="enrollment-info">
              <span className="section-label">Enroll Now</span>
              <h2 className="section-title" style={{ textAlign: 'left' }}>Start Your AI Journey</h2>
              <p>Fill out the form and our team will get back to you within 24 hours with course details and enrollment options.</p>
              <ul className="enrollment-benefits">
                <li><FiCheck size={16} /> 60 hours of intensive training</li>
                <li><FiCheck size={16} /> H100 GPU compute credits included</li>
                <li><FiCheck size={16} /> Industry certification</li>
                <li><FiCheck size={16} /> Placement assistance</li>
                <li><FiCheck size={16} /> Lifetime access to course materials</li>
              </ul>
            </div>
            <form className="enrollment-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Institution / Company</label>
                <input type="text" value={form.institution} onChange={e => setForm({...form, institution: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="Any questions or requirements..." />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading ? <><span className="spinner" /> Submitting...</> : 'Submit Enrollment'}
              </button>
              {submitStatus === 'success' && <p className="form-success">Enrollment submitted successfully! We'll contact you soon.</p>}
              {submitStatus === 'error' && <p className="form-error">Something went wrong. Please try again or email us at vatedigital@gmail.com.</p>}
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
