import './Policy.css'

const sections = [
  {
    title: 'Use of the Platform',
    body: 'By using the VSS website, dashboards, forms, and classroom features, you agree to use them only for lawful purposes and in a way that does not disrupt services for others.',
  },
  {
    title: 'Accounts and Access',
    body: 'You are responsible for the information submitted through your account and for maintaining the confidentiality of your login access. Role-based areas are intended only for authorized users.',
  },
  {
    title: 'Programs, Demos, and Enrollments',
    body: 'Course details, demos, pricing, and access may change over time. Paid access, batch assignment, and live or recorded classroom access are managed according to the workflows configured by VSS.',
  },
  {
    title: 'Employer and Recruitment Use',
    body: 'Employers posting requirements should provide accurate information and only upload documents they are authorized to share. Misuse of candidate or hiring data is not permitted.',
  },
  {
    title: 'Third-Party Tools',
    body: 'Some features may depend on external providers such as payment gateways, live classroom infrastructure, and communication services. Service availability may be affected by those providers.',
  },
  {
    title: 'Updates',
    body: 'These terms may be updated from time to time as the platform evolves. Continued use of the services implies acceptance of the latest published version.',
  },
]

export default function TermsOfService() {
  return (
    <div className="page-enter">
      <section className="policy-hero">
        <div className="container">
          <span className="section-label">Legal</span>
          <h1 className="policy-title">Terms of Service</h1>
          <p className="policy-subtitle">
            These terms describe the general rules for using VSS services, including website access, course enrollment flows, recruitment submissions, and classroom usage.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="policy-card">
            {sections.map((section) => (
              <article key={section.title} className="policy-section">
                <h2>{section.title}</h2>
                <p>{section.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
