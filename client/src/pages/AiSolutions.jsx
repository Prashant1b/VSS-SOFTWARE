import { useState } from 'react'
import { FiCpu, FiDatabase, FiLayers, FiZap, FiShield, FiTrendingUp, FiCheck, FiArrowRight, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import api from '../api'
import './AiSolutions.css'

const solutions = [
  { icon: <FiCpu size={26} />, title: 'Custom LLM Development', desc: 'Build domain-specific large language models tailored to your industry and use cases.',
    features: ['Fine-tuned models for your domain', 'Custom training pipelines', 'Model evaluation & benchmarking'] },
  { icon: <FiDatabase size={26} />, title: 'Enterprise RAG Systems', desc: 'Production-grade retrieval-augmented generation for knowledge management.',
    features: ['Document ingestion pipelines', 'Vector search at scale', 'Semantic retrieval optimization'] },
  { icon: <FiLayers size={26} />, title: 'GenAI Copilots', desc: 'Custom AI assistants integrated into your workflows and business processes.',
    features: ['Workflow automation', 'Natural language interfaces', 'Multi-modal capabilities'] },
  { icon: <FiZap size={26} />, title: 'Multi-Agent Systems', desc: 'Orchestrated AI agent networks for complex, autonomous business operations.',
    features: ['Agent orchestration', 'Task decomposition', 'Autonomous decision-making'] },
  { icon: <FiShield size={26} />, title: 'LLM Guardrails & Safety', desc: 'Ensure responsible AI deployment with comprehensive safety frameworks.',
    features: ['Content filtering', 'Bias detection', 'Compliance monitoring'] },
  { icon: <FiTrendingUp size={26} />, title: 'LLM-Ops & Monitoring', desc: 'End-to-end operations and monitoring for deployed AI systems.',
    features: ['Performance monitoring', 'Cost optimization', 'Continuous improvement'] },
]

const process = [
  { num: '01', title: 'Discovery', desc: 'We assess your workflows, data assets, and AI readiness to identify high-impact opportunities.' },
  { num: '02', title: 'Proof of Concept', desc: 'Rapid prototyping to validate feasibility, measure ROI potential, and refine requirements.' },
  { num: '03', title: 'Development', desc: 'Agile development with your team, building production-grade solutions with full testing.' },
  { num: '04', title: 'Deploy & Scale', desc: 'Cloud deployment, monitoring setup, and team training for sustainable AI operations.' },
]

const faqs = [
  { q: 'What industries do you serve?', a: 'We work across healthcare, finance, e-commerce, manufacturing, education, and technology sectors. Our solutions are customized for each domain.' },
  { q: 'How long does a typical AI project take?', a: 'POC phase typically takes 2-4 weeks. Full production deployment ranges from 2-6 months depending on complexity and integration requirements.' },
  { q: 'Do you provide ongoing support?', a: 'Yes, we offer comprehensive LLM-Ops support including monitoring, maintenance, optimization, and model updates.' },
  { q: 'What about data privacy and security?', a: 'All solutions follow enterprise security standards. We support on-premise deployment, data encryption, and compliance with GDPR, HIPAA, and SOC2.' },
]

export default function AiSolutions() {
  const [openFaq, setOpenFaq] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'AI Solutions', message: '' })
  const [loading, setLoading] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSubmitStatus(null)
    try {
      await api.post('/contact', form)
      setSubmitStatus('success')
      setForm({ name: '', email: '', phone: '', subject: 'AI Solutions', message: '' })
    } catch {
      setSubmitStatus('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-enter">
      <section className="ai-hero">
        <div className="container">
          <span className="section-label">AI Solutions</span>
          <h1 className="ai-hero-title">
            Generative AI<br />
            <span className="hero-highlight">Engineering</span>
          </h1>
          <p className="ai-hero-sub">
            From proof of concept to enterprise scale — custom GenAI copilots, RAG applications,
            and LLM-driven automation built for your business.
          </p>
          <div className="hero-actions" style={{ justifyContent: 'center' }}>
            <a href="#ai-contact" className="btn btn-primary">Book Discovery Call</a>
            <a href="#solutions" className="btn btn-outline">View Solutions</a>
          </div>
        </div>
      </section>

      <section className="section" id="solutions">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Solutions</span>
            <h2 className="section-title">Enterprise AI Capabilities</h2>
            <p className="section-subtitle">End-to-end AI solutions from model development to deployment and monitoring.</p>
          </div>
          <div className="grid-3">
            {solutions.map((s, i) => (
              <div key={i} className="ai-solution-card card">
                <div className="ai-solution-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <ul className="ai-solution-features">
                  {s.features.map((f, j) => (
                    <li key={j}><FiCheck size={14} /> {f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Our Approach</span>
            <h2 className="section-title">From Idea to Production</h2>
            <p className="section-subtitle">A proven methodology that reduces risk and accelerates time-to-value.</p>
          </div>
          <div className="ai-process-grid">
            {process.map((p, i) => (
              <div key={i} className="ai-process-card">
                <div className="ai-process-num">{p.num}</div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ai-trust-section">
        <div className="container">
          <div className="ai-trust-grid">
            <div className="ai-trust-item">
              <div className="ai-trust-value">99%</div>
              <div className="ai-trust-label">SLA Adherence</div>
            </div>
            <div className="ai-trust-item">
              <div className="ai-trust-value">100%</div>
              <div className="ai-trust-label">Secure Workflows</div>
            </div>
            <div className="ai-trust-item">
              <div className="ai-trust-value">4-6x</div>
              <div className="ai-trust-label">Avg. ROI</div>
            </div>
            <div className="ai-trust-item">
              <div className="ai-trust-value">2-4 Wks</div>
              <div className="ai-trust-label">POC Delivery</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">FAQ</span>
            <h2 className="section-title">Common Questions</h2>
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

      {/* AI Discovery Call Form */}
      <section className="section-alt" id="ai-contact">
        <div className="container">
          <div className="ai-contact-wrapper">
            <div className="ai-contact-info">
              <span className="section-label">Get Started</span>
              <h2 className="section-title" style={{ textAlign: 'left' }}>Book an AI Discovery Call</h2>
              <p>Tell us about your challenge and our AI engineers will assess how GenAI can transform your operations.</p>
              <ul className="ai-contact-benefits">
                <li><FiCheck size={16} /> Free initial consultation</li>
                <li><FiCheck size={16} /> Technical feasibility assessment</li>
                <li><FiCheck size={16} /> ROI estimation for your use case</li>
                <li><FiCheck size={16} /> Custom solution architecture</li>
                <li><FiCheck size={16} /> 2-4 week POC delivery</li>
              </ul>
            </div>
            <form className="ai-contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Describe your AI use case *</label>
                <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} required placeholder="E.g., We want to build a document Q&A system for our legal team..." />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading ? <><span className="spinner" /> Submitting...</> : <>Book Discovery Call <FiArrowRight size={16} /></>}
              </button>
              {submitStatus === 'success' && <p className="form-success">Request submitted! Our AI team will reach out within 24 hours.</p>}
              {submitStatus === 'error' && <p className="form-error">Something went wrong. Please try again or email us at sales@vatedigi.com.</p>}
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
