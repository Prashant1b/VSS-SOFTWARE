import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiBook, FiFileText, FiMic, FiTrendingUp, FiTarget, FiAward, FiDownload, FiExternalLink, FiMail, FiPhone } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import api from '../api'
import './Resources.css'

const resources = [
  { icon: <FiBook size={22} />, type: 'E-Book', title: 'Resume Tips & Best Practices', desc: 'Craft a resume that stands out to recruiters and beats ATS systems. Covers formatting, keywords, and common pitfalls.', category: 'career', action: 'Download PDF' },
  { icon: <FiFileText size={22} />, type: 'Guide', title: 'Interview Preparation Handbook', desc: 'Comprehensive guide covering technical interviews, behavioral questions, and system design rounds.', category: 'career', action: 'Download PDF' },
  { icon: <FiMic size={22} />, type: 'Webinar', title: 'Career Growth Strategies', desc: 'Expert-led sessions on building your personal brand, negotiating offers, and planning career transitions.', category: 'career', action: 'Watch Recording' },
  { icon: <FiTrendingUp size={22} />, type: 'Case Study', title: 'Enterprise AI Implementation', desc: 'How a Fortune 500 company reduced costs by 40% using our RAG pipeline solution.', category: 'ai', action: 'Read Case Study' },
  { icon: <FiTarget size={22} />, type: 'Report', title: 'Job Market Analytics 2025', desc: 'Data-driven insights into hiring trends, in-demand skills, and salary benchmarks across tech roles.', category: 'hiring', action: 'Download Report' },
  { icon: <FiAward size={22} />, type: 'Tips', title: 'Career Mentorship Insights', desc: 'Curated advice from industry veterans on navigating career growth in tech and AI.', category: 'career', action: 'Read Article' },
  { icon: <FiFileText size={22} />, type: 'Template', title: 'AI Use Case Framework', desc: 'A downloadable template to identify and evaluate GenAI use cases for your organization.', category: 'ai', action: 'Download Template' },
  { icon: <FiBook size={22} />, type: 'Guide', title: 'Hiring Best Practices', desc: 'A comprehensive guide to modern recruitment strategies, candidate experience, and retention.', category: 'hiring', action: 'Download PDF' },
  { icon: <FiMic size={22} />, type: 'Workshop', title: 'LangChain Masterclass', desc: 'Hands-on workshop recording covering RAG pipeline development with LangChain and vector databases.', category: 'ai', action: 'Watch Recording' },
]

const categories = [
  { key: 'all', label: 'All Resources' },
  { key: 'career', label: 'Career' },
  { key: 'ai', label: 'AI & Tech' },
  { key: 'hiring', label: 'Hiring' },
]

export default function Resources() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' })
  const [loading, setLoading] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const filtered = activeCategory === 'all' ? resources : resources.filter(r => r.category === activeCategory)

  const handleContact = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSubmitStatus(null)
    try {
      await api.post('/contact', contactForm)
      setSubmitStatus('success')
      setContactForm({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' })
    } catch {
      setSubmitStatus('error')
    } finally {
      setLoading(false)
    }
  }

  const handleResourceClick = (title) => {
    alert(`"${title}" will be available for download soon. Contact us at sales@vatedigi.com to request early access.`)
  }

  return (
    <div className="page-enter">
      <section className="resources-hero">
        <div className="container">
          <span className="section-label">Resources</span>
          <h1 className="resources-hero-title">
            Knowledge Hub &<br />
            <span className="hero-highlight">Resource Center</span>
          </h1>
          <p className="resources-hero-sub">
            Free guides, case studies, webinars, and tools to accelerate your career,
            improve hiring, and explore AI solutions.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="resource-filters">
            {categories.map(c => (
              <button
                key={c.key}
                className={`filter-btn ${activeCategory === c.key ? 'active' : ''}`}
                onClick={() => setActiveCategory(c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="grid-3">
            {filtered.map((r, i) => (
              <div key={i} className="resource-detail-card card">
                <div className="resource-detail-type">
                  {r.icon}
                  <span>{r.type}</span>
                </div>
                <h3>{r.title}</h3>
                <p>{r.desc}</p>
                <button className="resource-download-btn" onClick={() => handleResourceClick(r.title)}>
                  {r.action.includes('Watch') || r.action.includes('Read') ? <FiExternalLink size={14} /> : <FiDownload size={14} />}
                  {r.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-label">How It Works</span>
            <h2 className="section-title">Programs, Outcomes, Projects</h2>
            <p className="section-subtitle">
              Bridging the gap between campus learning and industry requirements through
              hands-on project work and mentor-led training.
            </p>
          </div>
          <div className="how-grid">
            <div className="how-card">
              <div className="how-num">1</div>
              <h3>Learn</h3>
              <p>Intensive, industry-aligned training modules designed for the modern tech stack.</p>
            </div>
            <div className="how-card">
              <div className="how-num">2</div>
              <h3>Prove</h3>
              <p>Build a verifiable portfolio by solving real-world challenges.</p>
            </div>
            <div className="how-card">
              <div className="how-num">3</div>
              <h3>Deploy</h3>
              <p>Direct placement into partner networks or AI system integration.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="contact">
        <div className="container">
          <div className="contact-wrapper">
            <div className="contact-info-side">
              <span className="section-label">Contact Us</span>
              <h2 className="section-title" style={{ textAlign: 'left' }}>Get In Touch</h2>
              <p>Have questions? Want a custom proposal? Reach out and our team will respond within 24 hours.</p>
              <div className="contact-methods">
                <div className="contact-method">
                  <div className="contact-method-icon"><FiMail size={18} /></div>
                  <div>
                    <strong>Email</strong>
                    <a href="mailto:sales@vatedigi.com">sales@vatedigi.com</a>
                  </div>
                </div>
                <div className="contact-method">
                  <div className="contact-method-icon"><FiPhone size={18} /></div>
                  <div>
                    <strong>Phone</strong>
                    <a href="tel:+918147285223">+91 8147285223</a>
                  </div>
                </div>
                <div className="contact-method">
                  <div className="contact-method-icon"><FaWhatsapp size={18} /></div>
                  <div>
                    <strong>WhatsApp</strong>
                    <a href="https://wa.me/919389329264" target="_blank" rel="noopener noreferrer">+91 9389329264</a>
                  </div>
                </div>
              </div>
            </div>

            <form className="contact-form" onSubmit={handleContact}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input type="tel" value={contactForm.phone} onChange={e => setContactForm({...contactForm, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Subject *</label>
                  <select value={contactForm.subject} onChange={e => setContactForm({...contactForm, subject: e.target.value})} required>
                    <option>General Inquiry</option>
                    <option>EdTech & Training</option>
                    <option>Staffing Solutions</option>
                    <option>AI Solutions</option>
                    <option>College Partnership</option>
                    <option>Career Inquiry</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Message *</label>
                <textarea value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})} required placeholder="Tell us about your requirements..." />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading ? <><span className="spinner" /> Sending...</> : 'Send Message'}
              </button>
              {submitStatus === 'success' && <p className="form-success">Message sent! We'll get back to you within 24 hours.</p>}
              {submitStatus === 'error' && <p className="form-error">Something went wrong. Please try again or email us directly at sales@vatedigi.com.</p>}
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
