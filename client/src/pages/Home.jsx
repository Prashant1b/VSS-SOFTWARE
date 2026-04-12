import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FiBookOpen, FiUsers, FiCpu, FiArrowRight,
  FiTarget, FiAward, FiShield, FiClock,
  FiBook, FiMic, FiFileText, FiTrendingUp,
  FiPlay, FiStar, FiCheckCircle, FiDownload, FiBriefcase
} from 'react-icons/fi'
import { FaGraduationCap, FaBriefcase, FaRobot, FaLinkedinIn } from 'react-icons/fa'
import AnimatedCounter from '../components/AnimatedCounter'
import PartnerLogos from '../components/PartnerLogos'
import api from '../api'
import './Home.css'

const audiences = [
  { icon: <FaGraduationCap size={28} />, title: 'For Students & Colleges', desc: 'Industry-ready training in GenAI, Full Stack, and Cloud technologies with placement support.', link: '/edtech', color: '#1B4DFF' },
  { icon: <FaBriefcase size={28} />, title: 'For Hiring', desc: 'Hire trained, screened talent — not just resumes. IT, Non-IT, campus, and contract staffing.', link: '/staffing', color: '#00875A' },
  { icon: <FaRobot size={28} />, title: 'For AI Buyers', desc: 'Custom GenAI copilots, RAG applications, and LLM-driven automation for your enterprise.', link: '/ai-solutions', color: '#6554C0' },
]

const services = [
  { icon: <FiBookOpen size={22} />, title: 'EdTech & Training', desc: 'GenAI, Full Stack, Cloud — industry-ready curriculum and college partnerships across 50+ institutions.' },
  { icon: <FiUsers size={22} />, title: 'Staffing Solutions', desc: 'IT and Non-IT hiring with campus-to-corporate placement pipeline for top-tier firms.' },
  { icon: <FiCpu size={22} />, title: 'AI Solutions', desc: 'From proof of concept to scale — custom GenAI copilots, RAG apps, and LLM-driven automation.' },
  { icon: <FiTarget size={22} />, title: 'Job Matching', desc: 'Tailored opportunities aligned with your skills, connecting top talent with leading companies.' },
  { icon: <FiAward size={22} />, title: 'Career Growth', desc: 'Elevate your career with reputable organizations and personalized professional guidance.' },
  { icon: <FiShield size={22} />, title: 'Verified Companies', desc: 'We connect you with trustworthy, vetted employers ensuring safe and rewarding placements.' },
]

const initiatives = [
  { icon: <FiCpu size={20} />, title: 'GenAI 60-Hour Flagship', desc: 'Master LLM architecture, RAG systems, and autonomous agents.', link: '/edtech' },
  { icon: <FiUsers size={20} />, title: 'College Partnership', desc: 'Institutional MOUs for curriculum delivery and campus placements.', link: '/about' },
  { icon: <FiFileText size={20} />, title: 'Submit Hiring Requirement', desc: 'Send your JD and get pre-screened candidates matched.', link: '/staffing' },
  { icon: <FiMic size={20} />, title: 'Book AI Discovery Call', desc: 'Explore enterprise GenAI solutions with our experts.', link: '/ai-solutions' },
  { icon: <FiBook size={20} />, title: 'Case Studies', desc: 'Real-world success stories and downloadable frameworks.', link: '/resources' },
  { icon: <FiTrendingUp size={20} />, title: 'Workshop Registration', desc: 'Register for upcoming technical workshops and events.', link: '/resources' },
]

const defaultResources = [
  { icon: <FiBook size={18} />, type: 'E-Book', title: 'Resume Tips', desc: 'Craft a resume that stands out to recruiters.' },
  { icon: <FiFileText size={18} />, type: 'Guide', title: 'Interview Prep', desc: 'Ace technical and behavioral interviews.' },
  { icon: <FiMic size={18} />, type: 'Webinar', title: 'Career Strategies', desc: 'Sessions on accelerating your career trajectory.' },
]



export default function Home() {
  const [transformations, setTransformations] = useState([])
  const [videoTestimonials, setVideoTestimonials] = useState([])
  const [hiringDrives, setHiringDrives] = useState([])
  const [impactStats, setImpactStats] = useState([])

  useEffect(() => {
    api.get('/public/placements').then(res => {
      if (res.data.data?.length) setTransformations(res.data.data)
    }).catch(() => {})

    api.get('/public/testimonials').then(res => {
      if (res.data.data?.length) setVideoTestimonials(res.data.data)
    }).catch(() => {})

    api.get('/public/hiring-drives').then(res => {
      if (res.data.data?.length) setHiringDrives(res.data.data)
    }).catch(() => {})

    api.get('/public/stats').then(res => {
      if (res.data.data?.length) setImpactStats(res.data.data)
    }).catch(() => {})

    api.get('/public/testimonials').then(res => {
      if (res.data.data?.length) setVideoTestimonials(res.data.data)
    }).catch(() => {})
  }, [])

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg-shapes">
          <div className="hero-shape hero-shape-1" />
          <div className="hero-shape hero-shape-2" />
          <div className="hero-shape hero-shape-3" />
        </div>
        <div className="container hero-inner">
          <div className="hero-content">
            <div className="hero-social-proof">
              <div className="hero-avatars">
                <span>A</span><span>R</span><span>S</span><span>P</span>
              </div>
              <span className="hero-social-text">500+ Happy Students</span>
            </div>
            <h1 className="hero-title">
              The Training & Placement<br />
              Platform for Your <span className="hero-highlight">Career</span>
            </h1>
            <p className="hero-subtitle">
              Get job-ready with expert-led courses, participate in free hiring drives,
              or build enterprise AI solutions — all with VSS.
            </p>
            <div className="hero-actions">
              <Link to="/edtech" className="btn btn-primary">
                Explore Programs <FiArrowRight size={16} />
              </Link>
              <Link to="/resources" className="btn btn-outline">
                View Resources
              </Link>
            </div>
            <div className="hero-trust-badges">
              <div className="trust-badge">
                <FaLinkedinIn size={14} />
                <span>Top EdTech Startup</span>
              </div>
              <div className="trust-badge">
                <FiAward size={14} />
                <span>IIT Alumni Founded</span>
              </div>
              <div className="trust-badge">
                <FiShield size={14} />
                <span>ISO Certified</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card-stack">
              <Link to="/edtech" className="hero-mega-card hero-card-courses">
                <div className="mega-card-icons">
                  <span className="mega-icon mega-icon-1"><FiBookOpen size={20} /></span>
                  <span className="mega-icon mega-icon-2"><FiCpu size={18} /></span>
                  <span className="mega-icon mega-icon-3"><FiAward size={16} /></span>
                </div>
                <h3>COURSES</h3>
                <p>GenAI, Full Stack, Cloud</p>
              </Link>
              <Link to="/staffing" className="hero-mega-card hero-card-jobs">
                <div className="mega-card-icons">
                  <span className="mega-icon mega-icon-1"><FiBriefcase size={20} /></span>
                  <span className="mega-icon mega-icon-2"><FiUsers size={18} /></span>
                  <span className="mega-icon mega-icon-3"><FiTarget size={16} /></span>
                </div>
                <h3>JOBS</h3>
                <p>60+ Hiring Drives Monthly</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Logos */}
      <PartnerLogos />

      {/* Impact Stats */}
      <section className="impact-section">
        <div className="container">
          <div className="impact-grid">
            {impactStats.map((stat, i) => (
              <React.Fragment key={stat.key || i}>
                {i > 0 && <div className="impact-divider" />}
                <div className="impact-item">
                  <div className="impact-value"><AnimatedCounter end={stat.value} suffix={stat.suffix} /></div>
                  <div className="impact-label">{stat.label}</div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Who Are You */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Who Are You?</span>
            <h2 className="section-title">Choose Your Path</h2>
            <p className="section-subtitle">Whether you're a student, employer, or enterprise — we have the right solution.</p>
          </div>
          <div className="grid-3">
            {audiences.map((a, i) => (
              <Link to={a.link} key={i} className="audience-card card" style={{ '--card-accent': a.color }}>
                <div className="audience-icon">{a.icon}</div>
                <h3>{a.title}</h3>
                <p>{a.desc}</p>
                <span className="audience-cta">Explore <FiArrowRight size={14} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-label">What We Do</span>
            <h2 className="section-title">Our Core Solutions</h2>
            <p className="section-subtitle">A comprehensive ecosystem for education, talent acquisition, and AI transformation.</p>
          </div>
          <div className="grid-3">
            {services.map((s, i) => (
              <div key={i} className="service-card card">
                <div className="service-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transformation Stories */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Success Stories</span>
            <h2 className="section-title">Those Who Acted & Transformed</h2>
            <p className="section-subtitle">Real stories of career transformation through VSS programs.</p>
          </div>
          <div className="transform-carousel">
            {transformations.map((t, i) => (
              <div key={t._id || i} className="transform-card">
                <div className="transform-avatar">{t.initials}</div>
                <h3>{t.name}</h3>
                <div className="transform-journey">
                  <div className="transform-before">
                    <span className="transform-tag">Before</span>
                    <p>{t.before}</p>
                  </div>
                  <div className="transform-arrow"><FiArrowRight size={16} /></div>
                  <div className="transform-after">
                    <span className="transform-tag tag-after">After</span>
                    <p>{t.after}</p>
                  </div>
                </div>
                <div className="transform-salary">
                  <FiTrendingUp size={14} />
                  <strong>{t.salary}</strong>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link to="/about" className="btn btn-outline">
              <FiDownload size={16} /> Download Placement Report
            </Link>
          </div>
        </div>
      </section>

      {/* Hiring Drives */}
      <section className="section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Hiring Drives</span>
            <h2 className="section-title">Hiring Drives with Industry Leaders</h2>
            <p className="section-subtitle">Participate in free hiring drives — 60+ opportunities every month.</p>
          </div>
          <div className="grid-2">
            {hiringDrives.map((h, i) => (
              <div key={h._id || i} className="hiring-card card">
                <div className="hiring-company-avatar">{h.company[0]}</div>
                <div className="hiring-details">
                  <h3>{h.role}</h3>
                  <p>{h.company} &middot; {h.location}</p>
                </div>
                <span className="hiring-type">{h.type}</span>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link to="/staffing" className="btn btn-primary">View All Opportunities <FiArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* Video Testimonials */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Student Reviews</span>
            <h2 className="section-title">Transformation Stories from Our Students</h2>
            <p className="section-subtitle">Hear directly from students who transformed their careers with VSS.</p>
          </div>
          <div className="video-testimonials-grid">
            {videoTestimonials.map((v, i) => (
              <div key={v._id || i} className="video-card card">
                <div className="video-thumb">
                  <div className="video-play"><FiPlay size={20} /></div>
                </div>
                <div className="video-info">
                  <div className="video-avatar">{v.initials}</div>
                  <div>
                    <strong>{v.name}</strong>
                    <span>{v.role}</span>
                  </div>
                </div>
                <p className="video-quote">"{v.quote}"</p>
                <div className="video-stars">
                  {[...Array(v.rating || 5)].map((_, j) => <FiStar key={j} size={14} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Quick Actions</span>
            <h2 className="section-title">Get Started Today</h2>
            <p className="section-subtitle">Jump right in — explore our programs, submit requirements, or book a call.</p>
          </div>
          <div className="grid-3">
            {initiatives.map((item, i) => (
              <Link to={item.link} key={i} className="initiative-card card">
                <div className="initiative-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <span className="initiative-link">Learn More <FiArrowRight size={14} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">How It Works</span>
            <h2 className="section-title">Three Simple Steps</h2>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <h3>Learn</h3>
              <p>Intensive, industry-aligned training modules designed for the modern tech stack.</p>
            </div>
            <div className="step-connector" />
            <div className="step-card">
              <div className="step-number">02</div>
              <h3>Prove</h3>
              <p>Build a verifiable portfolio by solving real-world challenges and capstone projects.</p>
            </div>
            <div className="step-connector" />
            <div className="step-card">
              <div className="step-number">03</div>
              <h3>Deploy</h3>
              <p>Direct placement into partner networks or AI system integration for enterprises.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Preview */}
      <section className="section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Resources</span>
            <h2 className="section-title">Helpful Resources</h2>
          </div>
          <div className="grid-3">
            {defaultResources.map((r, i) => (
              <div key={i} className="resource-card card">
                <div className="resource-type">{r.icon}<span>{r.type}</span></div>
                <h3>{r.title}</h3>
                <p>{r.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link to="/resources" className="btn btn-outline">View All Resources <FiArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container cta-inner">
          <h2>Ready to Transform Your Future?</h2>
          <p>Join hundreds of students, companies, and enterprises already working with VSS.</p>
          <div className="cta-actions">
            <Link to="/edtech" className="btn btn-white">Start Training</Link>
            <Link to="/staffing" className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white' }}>Hire Talent</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
