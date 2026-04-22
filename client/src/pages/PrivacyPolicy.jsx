import './Policy.css'

const sections = [
  {
    title: 'Information We Collect',
    body: 'We may collect contact details, account information, enrollment details, demo booking preferences, payment references, and communications submitted through forms, dashboards, or support channels.',
  },
  {
    title: 'How We Use Information',
    body: 'We use your information to create and manage accounts, process enrollments, schedule demos, provide classroom access, support hiring workflows, respond to inquiries, and improve our services.',
  },
  {
    title: 'Payments and Third-Party Services',
    body: 'Payments and live classroom features may rely on third-party providers such as Razorpay, LiveKit, email delivery services, and infrastructure partners. Their own policies may also apply.',
  },
  {
    title: 'Data Sharing',
    body: 'We do not sell personal data. We may share limited information with service providers, mentors, recruiters, or internal teams only when required to deliver the requested service or fulfill operational needs.',
  },
  {
    title: 'Data Retention',
    body: 'We retain account, course, and inquiry records for operational, support, compliance, and reporting purposes for as long as reasonably necessary.',
  },
  {
    title: 'Your Choices',
    body: 'You can contact us to request updates to your profile information or ask questions about how your data is handled through our support channels.',
  },
]

export default function PrivacyPolicy() {
  return (
    <div className="page-enter">
      <section className="policy-hero">
        <div className="container">
          <span className="section-label">Legal</span>
          <h1 className="policy-title">Privacy Policy</h1>
          <p className="policy-subtitle">
            This page explains, at a high level, how VSS collects, uses, and protects information across the website, dashboards, enrollments, and classroom features.
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
