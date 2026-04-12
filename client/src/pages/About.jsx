import { useEffect, useState } from 'react'
import { FiTarget, FiEye, FiHeart, FiUsers, FiBookOpen, FiCpu, FiArrowRight, FiTrendingUp, FiAward, FiBriefcase, FiMapPin } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import AnimatedCounter from '../components/AnimatedCounter'
import api from '../api'
import './About.css'

const pillars = [
  { icon: <FiBookOpen size={26} />, title: 'EdTech & Training', desc: 'GenAI, Full Stack, Cloud — industry-ready curriculum and college partnerships across 50+ institutions.', color: '#1B4DFF' },
  { icon: <FiUsers size={26} />, title: 'Staffing Solutions', desc: 'IT and Non-IT hiring with campus-to-corporate placement pipeline for top-tier firms.', color: '#00875A' },
  { icon: <FiCpu size={26} />, title: 'AI Solutions', desc: 'From proof of concept to scale — custom GenAI copilots, RAG apps, and LLM-driven automation.', color: '#6554C0' },
]

const values = [
  { icon: <FiTarget size={22} />, title: 'Impact-Driven', desc: 'Every solution we build is measured by the real-world impact it creates for students, companies, and communities.' },
  { icon: <FiEye size={22} />, title: 'Transparency', desc: 'Open communication, honest assessments, and clear expectations throughout every engagement.' },
  { icon: <FiHeart size={22} />, title: 'Quality First', desc: 'We never compromise on the quality of training, talent, or technology solutions we deliver.' },
  { icon: <FiUsers size={22} />, title: 'Partnership', desc: 'We invest in long-term relationships, acting as an extension of our clients\' teams.' },
]

const leadership = {
  name: 'Sumitra', title: 'CEO & Founder', experience: '18+ years',
  desc: 'With over 18 years in technology, training, and project management, Sumitra leads VSS with a vision to democratize AI education and bridge the gap between academic learning and industry requirements.',
  areas: ['Technology Strategy', 'Training & Development', 'Project Management', 'Enterprise AI']
}

const milestones = [
  { year: '2020', title: 'Founded', desc: 'VATE Software Systems established with a vision to bridge education and industry.' },
  { year: '2021', title: 'Training Launch', desc: 'First batch of students trained in Full Stack development.' },
  { year: '2022', title: 'Staffing Services', desc: 'Expanded into IT and Non-IT staffing solutions.' },
  { year: '2023', title: '50+ College Partners', desc: 'Established partnerships with colleges across India.' },
  { year: '2024', title: 'AI Solutions', desc: 'Launched enterprise GenAI solutions and consulting.' },
  { year: '2025', title: 'GenAI Flagship', desc: '60-hour GenAI course launched with industry certification.' },
]

const placementCategories = [
  { label: 'Freshers', avg: '7.3 LPA', max: '12 LPA', icon: <FiUsers size={22} /> },
  { label: 'Working Professionals', avg: '8.4 LPA', max: '18 LPA', icon: <FiBriefcase size={22} /> },
  { label: 'Career Gap Candidates', avg: '6.7 LPA', max: '10 LPA', icon: <FiTrendingUp size={22} /> },
]

const centers = [
  { city: 'Bangalore', state: 'Karnataka' },
  { city: 'Hyderabad', state: 'Telangana' },
  { city: 'Pune', state: 'Maharashtra' },
  { city: 'Noida', state: 'Uttar Pradesh' },
  { city: 'Chennai', state: 'Tamil Nadu' },
]

export default function About() {
  const [topCompanies, setTopCompanies] = useState([])

  useEffect(() => {
    api.get('/public/partners')
      .then((res) => {
        if (res.data.data?.length) {
          setTopCompanies(res.data.data)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="page-enter">
      <section className="about-hero">
        <div className="container">
          <span className="section-label">About VSS</span>
          <h1 className="about-hero-title">
            Learn. Get Hired.<br />
            <span className="hero-highlight">Build with AI.</span>
          </h1>
          <p className="about-hero-sub">
            VSS is a 3-in-1 partner for colleges, employers, and AI buyers — bridging the gap
            between technical education and industry-scale implementation.
          </p>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="about-impact">
        <div className="container">
          <div className="about-impact-grid">
            <div className="about-impact-item">
              <div className="about-impact-value"><AnimatedCounter end={500} suffix="+" /></div>
              <div className="about-impact-label">Students Placed</div>
            </div>
            <div className="about-impact-item">
              <div className="about-impact-value"><AnimatedCounter end={50} suffix="+" /></div>
              <div className="about-impact-label">College Partners</div>
            </div>
            <div className="about-impact-item">
              <div className="about-impact-value"><AnimatedCounter end={100} suffix="+" /></div>
              <div className="about-impact-label">Hiring Partners</div>
            </div>
            <div className="about-impact-item">
              <div className="about-impact-value"><AnimatedCounter end={5} suffix=" Cities" /></div>
              <div className="about-impact-label">Training Centers</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="mission-grid">
            <div className="mission-card">
              <div className="mission-icon"><FiTarget size={26} /></div>
              <h3>Our Mission</h3>
              <p>To democratize AI education and bridge the gap between campus learning and industry requirements through hands-on training, quality placements, and enterprise AI solutions.</p>
            </div>
            <div className="mission-card">
              <div className="mission-icon"><FiEye size={26} /></div>
              <h3>Our Vision</h3>
              <p>Building future-ready talent and intelligent AI systems for the next generation of global enterprises — one student, one hire, one solution at a time.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-label">What We Do</span>
            <h2 className="section-title">Three Pillars of VSS</h2>
            <p className="section-subtitle">A comprehensive ecosystem for education, talent acquisition, and AI transformation.</p>
          </div>
          <div className="grid-3">
            {pillars.map((p, i) => (
              <div key={i} className="pillar-card card" style={{ '--pillar-color': p.color }}>
                <div className="pillar-icon">{p.icon}</div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Placement Highlights */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Placement Highlights</span>
            <h2 className="section-title">Our Placement Track Record</h2>
            <p className="section-subtitle">Real outcomes for students across different career stages.</p>
          </div>
          <div className="placement-grid">
            {placementCategories.map((cat, i) => (
              <div key={i} className="placement-category-card">
                <div className="placement-icon">{cat.icon}</div>
                <h3>{cat.label}</h3>
                <div className="placement-stats">
                  <div>
                    <span className="placement-stat-label">Average CTC</span>
                    <strong>{cat.avg}</strong>
                  </div>
                  <div>
                    <span className="placement-stat-label">Highest CTC</span>
                    <strong className="highlight">{cat.max}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hiring Partners */}
      <section className="section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Hiring Partners</span>
            <h2 className="section-title">Top Companies Hiring Our Students</h2>
            <p className="section-subtitle">Our students are placed at leading IT firms and global enterprises.</p>
          </div>
          <div className="hiring-companies-grid">
            {topCompanies.map((company, i) => (
              <div key={company._id || i} className="hiring-company-chip">{company.name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Centers / Locations */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Our Centers</span>
            <h2 className="section-title">Training Centers Across India</h2>
            <p className="section-subtitle">Offline training and live online classes available across 5 cities.</p>
          </div>
          <div className="centers-grid">
            {centers.map((c, i) => (
              <div key={i} className="center-card card">
                <div className="center-icon"><FiMapPin size={24} /></div>
                <h3>{c.city}</h3>
                <p>{c.state}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Our Values</span>
            <h2 className="section-title">What Drives Us</h2>
          </div>
          <div className="grid-4">
            {values.map((v, i) => (
              <div key={i} className="value-card card">
                <div className="value-icon">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Leadership</span>
            <h2 className="section-title">Meet Our Leader</h2>
          </div>
          <div className="leader-card">
            <div className="leader-avatar"><span>{leadership.name[0]}</span></div>
            <div className="leader-info">
              <h3>{leadership.name}</h3>
              <span className="leader-title">{leadership.title} &middot; {leadership.experience} experience</span>
              <p>{leadership.desc}</p>
              <div className="leader-areas">
                {leadership.areas.map((a, i) => (
                  <span key={i} className="leader-area-chip">{a}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Our Journey</span>
            <h2 className="section-title">Milestones</h2>
          </div>
          <div className="timeline">
            {milestones.map((m, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-year">{m.year}</div>
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <h3>{m.title}</h3>
                  <p>{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-inner">
          <h2>Join the VSS Ecosystem</h2>
          <p>Whether you're a student, employer, or enterprise — let's build the future together.</p>
          <div className="cta-actions">
            <Link to="/resources#contact" className="btn btn-white">Partner With Us <FiArrowRight size={16} /></Link>
            <Link to="/edtech" className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white' }}>Start Learning</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
