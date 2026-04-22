import { FiArrowRight, FiAward, FiBriefcase, FiCode, FiCpu, FiMail, FiTarget, FiUsers } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import './Team.css'

const leadership = [
  {
    name: 'Sumitra',
    role: 'CEO & Founder',
    experience: '18+ years',
    summary: 'Leads VSS across training, delivery, and strategic partnerships with a strong focus on industry-ready education and applied AI transformation.',
    focus: ['Technology Strategy', 'Training Leadership', 'Enterprise Delivery'],
    accent: 'blue',
  },
  {
    name: 'Program Office',
    role: 'Curriculum & Operations',
    experience: 'Multi-domain',
    summary: 'Designs hands-on course pathways, aligns mentor schedules, and keeps batches, demos, and student operations running smoothly.',
    focus: ['Curriculum Design', 'Batch Operations', 'Student Success'],
    accent: 'green',
  },
  {
    name: 'Placement Team',
    role: 'Hiring & Career Enablement',
    experience: 'Industry network',
    summary: 'Works with employers, mentors, and learners to convert training into interviews, hiring pipelines, and measurable placement outcomes.',
    focus: ['Hiring Drives', 'Career Coaching', 'Employer Partnerships'],
    accent: 'violet',
  },
]

const teamPillars = [
  {
    icon: <FiCpu size={22} />,
    title: 'AI + Product Thinking',
    desc: 'We combine practical engineering, modern AI workflows, and business use-cases instead of theory-only learning.',
  },
  {
    icon: <FiUsers size={22} />,
    title: 'Student-First Delivery',
    desc: 'Our team is structured around learner outcomes, mentor support, and clean transition from classroom to hiring.',
  },
  {
    icon: <FiBriefcase size={22} />,
    title: 'Placement Alignment',
    desc: 'Training, staffing, and hiring outreach are connected so the team can support the full journey end-to-end.',
  },
]

const values = [
  { icon: <FiTarget size={18} />, label: 'Outcome Focused' },
  { icon: <FiCode size={18} />, label: 'Hands-On by Default' },
  { icon: <FiAward size={18} />, label: 'Quality Driven' },
  { icon: <FiMail size={18} />, label: 'Responsive Support' },
]

export default function Team() {
  return (
    <div className="page-enter">
      <section className="team-hero">
        <div className="container">
          <span className="section-label">Our Team</span>
          <h1 className="team-hero-title">
            The People Behind<br />
            <span className="hero-highlight">VSS Growth</span>
          </h1>
          <p className="team-hero-sub">
            Meet the team shaping our training programs, employer partnerships, and AI solution delivery across the VSS ecosystem.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Core Team</span>
            <h2 className="section-title">Built Around Delivery, Learning, and Hiring</h2>
            <p className="section-subtitle">A compact leadership structure focused on execution, outcomes, and learner support.</p>
          </div>

          <div className="team-grid">
            {leadership.map((member) => (
              <article key={member.name} className={`team-card team-card-${member.accent}`}>
                <div className="team-card-top">
                  <div className="team-avatar">{member.name.charAt(0)}</div>
                  <span className="team-exp">{member.experience}</span>
                </div>
                <h3>{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-summary">{member.summary}</p>
                <div className="team-focus-list">
                  {member.focus.map((item) => (
                    <span key={item} className="team-focus-chip">{item}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-label">How We Work</span>
            <h2 className="section-title">Three Team Pillars</h2>
          </div>
          <div className="grid-3">
            {teamPillars.map((pillar) => (
              <div key={pillar.title} className="team-pillar-card card">
                <div className="team-pillar-icon">{pillar.icon}</div>
                <h3>{pillar.title}</h3>
                <p>{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="team-values-strip">
            {values.map((value) => (
              <div key={value.label} className="team-value-chip">
                {value.icon}
                <span>{value.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-inner">
          <h2>Work With the VSS Team</h2>
          <p>Explore our programs, partnerships, and AI solution offerings from the people building them every day.</p>
          <div className="cta-actions">
            <Link to="/edtech" className="btn btn-white">Explore Courses <FiArrowRight size={16} /></Link>
            <Link to="/resources#contact" className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white' }}>Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
