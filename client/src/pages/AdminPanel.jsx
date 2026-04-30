import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiHome, FiUsers, FiBookOpen, FiMessageSquare, FiBriefcase,
  FiAward, FiBarChart2, FiStar, FiMail, FiFileText, FiArrowLeft, FiCalendar,
  FiPlus, FiEdit2, FiTrash2, FiX, FiMenu, FiCheckCircle, FiMonitor,
  FiAlertCircle, FiLogOut, FiShield, FiUserPlus,
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import './AdminPanel.css'

const SECTIONS = [
  { key: 'dashboard', label: 'Dashboard', icon: <FiHome size={18} /> },
  { key: 'placements', label: 'Placements', icon: <FiStar size={18} />, section: 'Content' },
  { key: 'courses', label: 'Courses', icon: <FiBookOpen size={18} /> },
  { key: 'batches', label: 'Batches', icon: <FiCalendar size={18} /> },
  { key: 'live-control', label: 'Live Classes', icon: <FiMonitor size={18} /> },
  { key: 'internship-domains', label: 'Internship Domains', icon: <FiAward size={18} /> },
  { key: 'testimonials', label: 'Testimonials', icon: <FiMessageSquare size={18} /> },
  { key: 'hiring', label: 'Hiring Drives', icon: <FiBriefcase size={18} /> },
  { key: 'stats', label: 'Site Stats', icon: <FiBarChart2 size={18} /> },
  { key: 'partners', label: 'Partners', icon: <FiCheckCircle size={18} /> },
  { key: 'users', label: 'Users', icon: <FiUsers size={18} />, section: 'Submissions' },
  { key: 'contacts', label: 'Contacts', icon: <FiMail size={18} /> },
  { key: 'enrollments', label: 'Enrollments', icon: <FiFileText size={18} /> },
  { key: 'internships', label: 'Internships', icon: <FiAward size={18} /> },
  { key: 'recruitments', label: 'Recruitments', icon: <FiBriefcase size={18} /> },
]

const placementFields = [
  { key: 'name', label: 'Student Name', required: true },
  { key: 'initials', label: 'Initials', required: true, placeholder: 'e.g. AS' },
  { key: 'before', label: 'Before (Background)', required: true },
  { key: 'after', label: 'After (Position)', required: true },
  { key: 'salary', label: 'Salary Package', required: true, placeholder: 'e.g. 7.2 LPA' },
  { key: 'order', label: 'Display Order', type: 'number' },
  { key: 'isActive', label: 'Active', type: 'checkbox' },
]

const courseFields = [
  { key: 'title', label: 'Course Title', required: true },
  { key: 'slug', label: 'Slug', required: true, placeholder: 'e.g. genai' },
  { key: 'categoryLabel', label: 'Card Category', placeholder: 'e.g. Full Stack Development' },
  { key: 'cardHeadline', label: 'Card Headline', placeholder: 'e.g. With GenAI' },
  { key: 'duration', label: 'Duration', required: true, placeholder: 'e.g. 60 Hours' },
  { key: 'durationLabel', label: 'Card Duration Label', placeholder: 'e.g. 8 Months' },
  { key: 'price', label: 'Price', required: true, placeholder: 'e.g. Rs 45,000' },
  { key: 'amount', label: 'Amount (INR)', required: true, type: 'number', placeholder: 'e.g. 45000' },
  { key: 'originalPrice', label: 'Original Price', placeholder: 'e.g. Rs 60,000' },
  { key: 'mode', label: 'Mode', placeholder: 'e.g. Online / Self-Paced' },
  { key: 'students', label: 'Students Count', placeholder: 'e.g. 150+' },
  { key: 'projectsCount', label: 'Projects Count', placeholder: 'e.g. 12' },
  { key: 'nextBatchLabel', label: 'Next Batch Label', placeholder: 'e.g. 15 May 2026' },
  { key: 'accentTone', label: 'Card Accent', type: 'select', options: ['violet', 'blue', 'sky'] },
  { key: 'rating', label: 'Rating', placeholder: 'e.g. 4.9' },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'features', label: 'Features', type: 'textarea', placeholder: 'One feature per line or comma separated' },
  { key: 'techStack', label: 'Tech Stack', type: 'textarea', placeholder: 'One tech item per line or comma separated' },
  { key: 'demoVideoUrl', label: 'Demo Video URL', placeholder: 'https://...' },
  { key: 'order', label: 'Display Order', type: 'number' },
  { key: 'isActive', label: 'Active', type: 'checkbox' },
]

const testimonialFields = [
  { key: 'name', label: 'Name', required: true },
  { key: 'initials', label: 'Initials', required: true },
  { key: 'role', label: 'Role & Company', required: true, placeholder: 'e.g. ML Engineer, TechCorp' },
  { key: 'quote', label: 'Quote', required: true, type: 'textarea' },
  { key: 'rating', label: 'Rating (1-5)', type: 'number' },
  { key: 'order', label: 'Display Order', type: 'number' },
  { key: 'isActive', label: 'Active', type: 'checkbox' },
]

const hiringFields = [
  { key: 'company', label: 'Company Name', required: true },
  { key: 'role', label: 'Role', required: true },
  { key: 'location', label: 'Location', required: true },
  { key: 'type', label: 'Type', required: true, type: 'select', options: ['Full-Time', 'Part-Time', 'Contract', 'Internship'] },
  { key: 'order', label: 'Display Order', type: 'number' },
  { key: 'isActive', label: 'Active', type: 'checkbox' },
]

const internshipDomainFields = [
  { key: 'name', label: 'Domain Name', required: true, placeholder: 'e.g. AI and Machine Learning' },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'order', label: 'Display Order', type: 'number' },
  { key: 'isActive', label: 'Active', type: 'checkbox' },
]

const statFields = [
  { key: 'key', label: 'Key (unique ID)', required: true, placeholder: 'e.g. students_placed' },
  { key: 'label', label: 'Display Label', required: true, placeholder: 'e.g. Students Placed' },
  { key: 'value', label: 'Value', required: true, type: 'number' },
  { key: 'suffix', label: 'Suffix', placeholder: 'e.g. +' },
  { key: 'order', label: 'Display Order', type: 'number' },
]

const partnerFields = [
  { key: 'name', label: 'Company Name', required: true },
  { key: 'order', label: 'Display Order', type: 'number' },
  { key: 'isActive', label: 'Active', type: 'checkbox' },
]

const userColumns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role', render: (value) => <span className={`admin-badge admin-badge-${value}`}>{value}</span> },
  { key: 'phone', label: 'Phone' },
  { key: 'createdAt', label: 'Joined', render: (value) => new Date(value).toLocaleDateString() },
]

const contactColumns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'subject', label: 'Subject' },
  { key: 'message', label: 'Message' },
  { key: 'createdAt', label: 'Date', render: (value) => new Date(value).toLocaleDateString() },
]

const enrollmentColumns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'course', label: 'Course' },
  { key: 'batchName', label: 'Batch', render: (value) => value || 'Not assigned' },
  { key: 'status', label: 'Status', render: (value) => <span className={`admin-badge ${value === 'paid' ? 'admin-badge-active' : 'admin-badge-student'}`}>{value || 'lead'}</span> },
  { key: 'institution', label: 'Institution' },
  { key: 'demoSlotAt', label: 'Demo Slot', render: (value) => value ? new Date(value).toLocaleString() : '-' },
  { key: 'createdAt', label: 'Date', render: (value) => new Date(value).toLocaleDateString() },
]

const internshipColumns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'college', label: 'College' },
  { key: 'track', label: 'Track' },
  { key: 'duration', label: 'Duration' },
  {
    key: 'planType',
    label: 'Plan',
    render: (value) => {
      const label = value === 'talent_free_review' ? 'Free after interview' : value
      return <span className="admin-badge admin-badge-student">{label}</span>
    },
  },
  {
    key: 'status',
    label: 'Status',
    render: (value) => <span className={`admin-badge ${value === 'paid' || value === 'interview_cleared' ? 'admin-badge-active' : 'admin-badge-student'}`}>{value}</span>,
  },
  {
    key: 'amount',
    label: 'Amount',
    render: (value, item) => item.planType === 'paid' ? `Rs ${value || 699}` : 'Free',
  },
  {
    key: 'interviewStatus',
    label: 'Interview',
    render: (value) => <span className={`admin-badge ${value === 'cleared' ? 'admin-badge-active' : value === 'rejected' ? 'admin-badge-inactive' : 'admin-badge-student'}`}>{value}</span>,
  },
  { key: 'createdAt', label: 'Date', render: (value) => new Date(value).toLocaleDateString() },
]

const uploadsBaseUrl = api.defaults.baseURL.replace(/\/api\/?$/, '')

const recruitmentColumns = [
  { key: 'companyName', label: 'Company' },
  { key: 'role', label: 'Role' },
  { key: 'headcount', label: 'Headcount' },
  { key: 'location', label: 'Location' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  {
    key: 'jdFile',
    label: 'Resume/JD',
    render: (value) => value ? (
      <a href={`${uploadsBaseUrl}/uploads/${value}`} target="_blank" rel="noreferrer">
        View File
      </a>
    ) : '-',
  },
  { key: 'createdAt', label: 'Date', render: (value) => new Date(value).toLocaleDateString() },
]

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handleNav = (key) => {
    setActiveSection(key)
    setSidebarOpen(false)
  }

  return (
    <div className="admin-layout">
      <button className="admin-mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <FiMenu size={20} />
      </button>
      {sidebarOpen && <button className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-label="Close admin sidebar" />}

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <h2>VSS ADMIN</h2>
          <p>VATE SOFTWARE SYSTEMS</p>
        </div>
        <nav className="admin-nav">
          {SECTIONS.map((section, index) => (
            <div key={section.key}>
              {section.section && <div className="admin-nav-section">{section.section}</div>}
              {index === 0 && <div className="admin-nav-section">Overview</div>}
              <button
                className={`admin-nav-item ${activeSection === section.key ? 'active' : ''}`}
                onClick={() => handleNav(section.key)}
              >
                {section.icon} {section.label}
              </button>
            </div>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-back-btn"><FiArrowLeft size={14} /> Back to Website</Link>
        </div>
      </aside>

      <div className="admin-main">
        <div className="admin-topbar">
          <h1>{SECTIONS.find((section) => section.key === activeSection)?.label}</h1>
          <div className="admin-topbar-actions">
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user?.name}</span>
            <button className="btn-admin btn-admin-danger btn-admin-sm" onClick={logout}>
              <FiLogOut size={14} /> Logout
            </button>
          </div>
        </div>
        <div className="admin-content">
          {activeSection === 'dashboard' && <DashboardSection />}
          {activeSection === 'placements' && <CrudSection endpoint="placements" fields={placementFields} />}
          {activeSection === 'courses' && <CrudSection endpoint="courses" fields={courseFields} />}
          {activeSection === 'batches' && <BatchSection />}
          {activeSection === 'live-control' && <LiveClassesSection />}
          {activeSection === 'internship-domains' && <CrudSection endpoint="internship-domains" fields={internshipDomainFields} />}
          {activeSection === 'testimonials' && <CrudSection endpoint="testimonials" fields={testimonialFields} />}
          {activeSection === 'hiring' && <CrudSection endpoint="hiring-drives" fields={hiringFields} />}
          {activeSection === 'stats' && <CrudSection endpoint="stats" fields={statFields} />}
          {activeSection === 'partners' && <CrudSection endpoint="partners" fields={partnerFields} />}
          {activeSection === 'users' && <UsersSection />}
          {activeSection === 'contacts' && <ReadOnlySection endpoint="contacts" columns={contactColumns} canDelete />}
          {activeSection === 'enrollments' && <EnrollmentSection />}
          {activeSection === 'internships' && <InternshipSection />}
          {activeSection === 'recruitments' && <ReadOnlySection endpoint="recruitments" columns={recruitmentColumns} canDelete />}
        </div>
      </div>
    </div>
  )
}

function DashboardSection() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard')
      .then((res) => setStats(res.data.stats))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="admin-loading"><span className="spinner" /></div>

  const cards = [
    { label: 'Total Users', value: stats?.users || 0, color: '#EFF6FF', iconColor: '#2563EB', icon: <FiUsers size={20} /> },
    { label: 'Contacts', value: stats?.contacts || 0, color: '#F0FDF4', iconColor: '#16A34A', icon: <FiMail size={20} /> },
    { label: 'Enrollments', value: stats?.enrollments || 0, color: '#FEF3C7', iconColor: '#D97706', icon: <FiFileText size={20} /> },
    { label: 'Recruitments', value: stats?.recruitments || 0, color: '#FDE2E2', iconColor: '#DC2626', icon: <FiBriefcase size={20} /> },
    { label: 'Internships', value: stats?.internships || 0, color: '#ECFDF5', iconColor: '#00875A', icon: <FiAward size={20} /> },
    { label: 'Internship Domains', value: stats?.internshipDomains || 0, color: '#EEF2FF', iconColor: '#0A2540', icon: <FiAward size={20} /> },
    { label: 'Placements', value: stats?.placements || 0, color: '#EDE9FE', iconColor: '#7C3AED', icon: <FiStar size={20} /> },
    { label: 'Courses', value: stats?.courses || 0, color: '#E0F2FE', iconColor: '#0284C7', icon: <FiBookOpen size={20} /> },
  ]

  return (
    <div className="admin-stats-grid">
      {cards.map((card) => (
        <div key={card.label} className="admin-stat-card">
          <div className="stat-icon" style={{ background: card.color, color: card.iconColor }}>{card.icon}</div>
          <div className="stat-value">{card.value}</div>
          <div className="stat-label">{card.label}</div>
        </div>
      ))}
    </div>
  )
}

function CrudSection({ endpoint, fields }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(() => {
    setLoading(true)
    api.get(`/admin/${endpoint}`, { withCredentials: true })
      .then((res) => setData(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [endpoint])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchData()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [fetchData])

  const openAdd = () => {
    const initial = {}
    fields.forEach((field) => {
      if (field.type === 'checkbox') initial[field.key] = true
      else if (field.type === 'number') initial[field.key] = 0
      else initial[field.key] = ''
    })
    setForm(initial)
    setEditing(null)
    setShowModal(true)
  }

  const openEdit = (item) => {
    const formData = {}
    fields.forEach((field) => {
      const value = item[field.key]
      formData[field.key] = field.type === 'textarea' && Array.isArray(value)
        ? value.join('\n')
        : (value ?? '')
    })
    setForm(formData)
    setEditing(item._id)
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/admin/${endpoint}/${editing}`, form, { withCredentials: true })
      } else {
        await api.post(`/admin/${endpoint}`, form, { withCredentials: true })
      }
      setShowModal(false)
      fetchData()
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return
    try {
      await api.delete(`/admin/${endpoint}/${id}`, { withCredentials: true })
      fetchData()
    } catch {
      alert('Error deleting')
    }
  }

  const displayColumns = endpoint === 'courses'
    ? [
        { key: 'title', label: 'Course Title' },
        { key: 'slug', label: 'Slug' },
        { key: 'duration', label: 'Duration' },
        { key: 'projectsCount', label: 'Projects' },
        {
          key: 'techStack',
          label: 'Tech Stack',
          render: (value) => Array.isArray(value) ? value.join(', ') : String(value || ''),
        },
        { key: 'price', label: 'Price' },
        { key: 'students', label: 'Students Count' },
        { key: 'isActive', label: 'Active', type: 'checkbox' },
      ]
    : fields.filter((field) => field.type !== 'textarea' && field.key !== 'order')

  if (loading) return <div className="admin-loading"><span className="spinner" /></div>

  return (
    <div>
      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h3>{data.length} items</h3>
          <button className="btn-admin btn-admin-primary" onClick={openAdd}>
            <FiPlus size={14} /> Add New
          </button>
        </div>

        {data.length === 0 ? (
          <div className="admin-empty">
            <FiAlertCircle size={32} />
            <p>No items yet. Click "Add New" to create one.</p>
          </div>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  {displayColumns.map((field) => <th key={field.key}>{field.label}</th>)}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item._id}>
                    {displayColumns.map((field) => (
                      <td key={field.key} data-label={field.label}>
                        {field.type === 'checkbox' ? (
                          <span className={`admin-badge ${item[field.key] ? 'admin-badge-active' : 'admin-badge-inactive'}`}>
                            {item[field.key] ? 'Active' : 'Inactive'}
                          </span>
                        ) : field.render ? field.render(item[field.key], item) : String(item[field.key] ?? '')}
                      </td>
                    ))}
                    <td data-label="Actions">
                      <div className="actions">
                        <button className="btn-admin btn-admin-edit btn-admin-sm" onClick={() => openEdit(item)}>
                          <FiEdit2 size={12} />
                        </button>
                        <button className="btn-admin btn-admin-danger btn-admin-sm" onClick={() => handleDelete(item._id)}>
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editing ? 'Edit Item' : 'Add New Item'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <FiX size={20} />
              </button>
            </div>
            <div className="admin-modal-body">
              {fields.map((field) => (
                <div key={field.key} className="admin-form-group">
                  <label>{field.label} {field.required && <span style={{ color: 'var(--brand-red)' }}>*</span>}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={form[field.key] || ''}
                      onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}
                      placeholder={field.placeholder}
                    />
                  ) : field.type === 'select' ? (
                    <select value={form[field.key] || ''} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}>
                      <option value="">Select...</option>
                      {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={!!form[field.key]}
                        onChange={(event) => setForm({ ...form, [field.key]: event.target.checked })}
                        style={{ width: 'auto' }}
                      />
                      <span style={{ fontSize: 14 }}>{form[field.key] ? 'Active' : 'Inactive'}</span>
                    </label>
                  ) : (
                    <input
                      type={field.type || 'text'}
                      value={form[field.key] ?? ''}
                      onChange={(event) => setForm({ ...form, [field.key]: field.type === 'number' ? Number(event.target.value) : event.target.value })}
                      placeholder={field.placeholder}
                      required={field.required}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="admin-modal-footer">
              <button className="btn-admin" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-admin btn-admin-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ReadOnlySection({ endpoint, columns, canDelete, renderActions }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(() => {
    setLoading(true)
    api.get(`/admin/${endpoint}`, { withCredentials: true })
      .then((res) => setData(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [endpoint])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchData()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [fetchData])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return
    try {
      await api.delete(`/admin/${endpoint}/${id}`, { withCredentials: true })
      fetchData()
    } catch {
      alert('Error deleting')
    }
  }

  if (loading) return <div className="admin-loading"><span className="spinner" /></div>

  return (
    <div className="admin-table-wrapper">
      <div className="admin-table-header">
        <h3>{data.length} records</h3>
      </div>
      {data.length === 0 ? (
        <div className="admin-empty">
          <FiAlertCircle size={32} />
          <p>No records found.</p>
        </div>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                {columns.map((column) => <th key={column.key}>{column.label}</th>)}
                {(canDelete || renderActions) && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item._id}>
                  {columns.map((column) => (
                    <td key={column.key} data-label={column.label}>
                      {column.render ? column.render(item[column.key], item) : (item[column.key] ?? '-')}
                    </td>
                  ))}
                  {(canDelete || renderActions) && (
                    <td data-label="Actions">
                      <div className="actions">
                        {renderActions ? renderActions(item, fetchData) : null}
                        {canDelete ? (
                          <button className="btn-admin btn-admin-danger btn-admin-sm" onClick={() => handleDelete(item._id)}>
                            <FiTrash2 size={12} />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function UsersSection() {
  const { user: currentUser } = useAuth()
  const [updatingId, setUpdatingId] = useState(null)

  const handleRoleChange = async (user, role, refresh) => {
    if (role === user.role) return
    if (!window.confirm(`Are you sure you want to change ${user.name}'s role to ${role}?`)) return

    setUpdatingId(user._id)
    try {
      await api.patch(`/admin/users/${user._id}/role`, { role }, { withCredentials: true })
      refresh()
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating user role')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <ReadOnlySection
      endpoint="users"
      columns={userColumns}
      canDelete
      renderActions={(item, refresh) => {
        const isCurrentAdmin = currentUser?._id === item._id

        return (
          <>
            <button
              className="btn-admin btn-admin-primary btn-admin-sm"
              disabled={isCurrentAdmin}
              title="Current admin cannot edit own role from here"
            >
              <FiShield size={12} />
              {isCurrentAdmin ? 'Current Admin' : 'Role'}
            </button>

            {!isCurrentAdmin && (
              <select
                className="admin-inline-select"
                value={item.role}
                disabled={updatingId === item._id}
                onChange={(event) => handleRoleChange(item, event.target.value, refresh)}
              >
                <option value="student">Student</option>
                <option value="employer">Employer</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            )}
          </>
        )
      }}
    />
  )
}

function InternshipSection() {
  const [updatingId, setUpdatingId] = useState(null)

  const handleInterviewChange = async (item, interviewStatus, refresh) => {
    if (interviewStatus === item.interviewStatus) return
    setUpdatingId(item._id)
    try {
      await api.patch(`/admin/internships/${item._id}`, { interviewStatus }, { withCredentials: true })
      refresh()
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating interview status')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <ReadOnlySection
      endpoint="internships"
      columns={internshipColumns}
      canDelete
      renderActions={(item, refresh) => (
        item.planType === 'talent_free_review' ? (
          <select
            className="admin-inline-select"
            value={item.interviewStatus || 'pending'}
            disabled={updatingId === item._id}
            onChange={(event) => handleInterviewChange(item, event.target.value, refresh)}
          >
            <option value="pending">Interview Pending</option>
            <option value="cleared">Cleared - Free Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        ) : (
          <span className="admin-helper-text">No interview action</span>
        )
      )}
    />
  )
}

function LiveClassesSection() {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState('')

  const fetchData = useCallback(() => {
    setLoading(true)
    api.get('/teacher/classes', { withCredentials: true })
      .then((res) => setData(res.data.data || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleStart = async (item) => {
    setBusyId(item._id)
    try {
      await api.post(`/teacher/classes/${item._id}/live/start`, {}, { withCredentials: true })
      fetchData()
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to start live class')
    } finally {
      setBusyId('')
    }
  }

  const handleEnd = async (item) => {
    setBusyId(item._id)
    try {
      await api.post(`/teacher/classes/${item._id}/live/end`, {}, { withCredentials: true })
      fetchData()
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to end live class')
    } finally {
      setBusyId('')
    }
  }

  if (loading) return <div className="admin-loading"><span className="spinner" /></div>

  const liveFirst = [...data].sort((a, b) => {
    if (a.liveStatus === 'live' && b.liveStatus !== 'live') return -1
    if (a.liveStatus !== 'live' && b.liveStatus === 'live') return 1
    return new Date(a.scheduledFor || a.createdAt).getTime() - new Date(b.scheduledFor || b.createdAt).getTime()
  })

  return (
    <div className="admin-table-wrapper">
      <div className="admin-table-header">
        <div>
          <h3>{liveFirst.length} classes</h3>
          <p className="admin-helper-text">Admin can monitor, start, open, and end any teacher live class from this section.</p>
        </div>
        <button className="btn-admin" onClick={fetchData}>Refresh</button>
      </div>

      {liveFirst.length === 0 ? (
        <div className="admin-empty">
          <FiAlertCircle size={32} />
          <p>No classes found yet.</p>
        </div>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Class</th>
                <th>Batch</th>
                <th>Teacher</th>
                <th>Type</th>
                <th>Schedule</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {liveFirst.map((item) => (
                <tr key={item._id}>
                  <td data-label="Class">
                    <strong>{item.title}</strong>
                    <div className="admin-helper-text">{item.description || 'No description'}</div>
                  </td>
                  <td data-label="Batch">
                    {item.batchDetails?.title || item.batchName || '-'}
                    <div className="admin-helper-text">{item.batchDetails?.courseTitle || item.courseSlug}</div>
                  </td>
                  <td data-label="Teacher">{item.batchDetails?.teacherName || '-'}</td>
                  <td data-label="Type" style={{ textTransform: 'capitalize' }}>{item.sessionType}</td>
                  <td data-label="Schedule">
                    {item.scheduledFor ? new Date(item.scheduledFor).toLocaleString('en-IN') : '-'}
                  </td>
                  <td data-label="Status">
                    <span className={`admin-badge ${item.liveStatus === 'live' ? 'admin-badge-active' : 'admin-badge-student'}`}>
                      {item.sessionType === 'live' ? (item.liveStatus || 'scheduled') : (item.isPublished ? 'published' : 'draft')}
                    </span>
                  </td>
                  <td data-label="Actions">
                    <div className="actions actions-stack">
                      {item.sessionType === 'live' && item.liveStatus !== 'live' && (
                        <button
                          className="btn-admin btn-admin-primary btn-admin-sm"
                          disabled={busyId === item._id}
                          onClick={() => handleStart(item)}
                        >
                          Start
                        </button>
                      )}
                      {item.sessionType === 'live' && item.liveStatus === 'live' && (
                        <>
                          <button
                            className="btn-admin btn-admin-primary btn-admin-sm"
                            onClick={() => navigate(`/live-class/${item._id}`)}
                          >
                            Open
                          </button>
                          <button
                            className="btn-admin btn-admin-danger btn-admin-sm"
                            disabled={busyId === item._id}
                            onClick={() => handleEnd(item)}
                          >
                            End
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function BatchSection() {
  const [data, setData] = useState([])
  const [courses, setCourses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [managingBatch, setManagingBatch] = useState(null)
  const [studentActionId, setStudentActionId] = useState('')
  const [form, setForm] = useState({
    title: '',
    courseSlug: '',
    teacherId: '',
    description: '',
    startDate: '',
    isActive: true,
  })

  const fetchData = useCallback(() => {
    setLoading(true)
    Promise.all([
      api.get('/admin/batches', { withCredentials: true }),
      api.get('/admin/courses', { withCredentials: true }),
      api.get('/admin/users', { withCredentials: true }),
      api.get('/admin/enrollments', { withCredentials: true }),
    ])
      .then(([batchesRes, coursesRes, usersRes, enrollmentsRes]) => {
        setData(batchesRes.data.data || [])
        setCourses((coursesRes.data.data || []).filter((course) => course.isActive))
        setTeachers((usersRes.data.data || []).filter((item) => ['teacher', 'admin'].includes(item.role)))
        setEnrollments(enrollmentsRes.data.data || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const resetForm = () => {
    setForm({
      title: '',
      courseSlug: '',
      teacherId: '',
      description: '',
      startDate: '',
      isActive: true,
    })
    setEditingId(null)
  }

  const openAdd = () => {
    resetForm()
    setShowModal(true)
  }

  const openEdit = (batch) => {
    setForm({
      title: batch.title || '',
      courseSlug: batch.courseSlug || '',
      teacherId: typeof batch.teacher === 'string' ? batch.teacher : batch.teacher?._id || '',
      description: batch.description || '',
      startDate: batch.startDate ? new Date(batch.startDate).toISOString().split('T')[0] : '',
      isActive: Boolean(batch.isActive),
    })
    setEditingId(batch._id)
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editingId) {
        await api.put(`/admin/batches/${editingId}`, form, { withCredentials: true })
      } else {
        await api.post('/admin/batches', form, { withCredentials: true })
      }
      setShowModal(false)
      resetForm()
      fetchData()
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving batch')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) return
    try {
      await api.delete(`/admin/batches/${id}`, { withCredentials: true })
      fetchData()
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting batch')
    }
  }

  const openStudentManager = (batch) => {
    setManagingBatch(batch)
  }

  const handleStudentBatchUpdate = async (enrollmentId, batchId) => {
    setStudentActionId(enrollmentId)
    try {
      await api.patch(`/admin/enrollments/${enrollmentId}`, { batchId }, { withCredentials: true })
      await fetchData()
      setManagingBatch((current) => {
        if (!current) return current
        return data.find((item) => item._id === current._id) || current
      })
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to update student batch')
    } finally {
      setStudentActionId('')
    }
  }

  if (loading) return <div className="admin-loading"><span className="spinner" /></div>

  const assignedStudentCount = (batchId) => enrollments.filter((item) => String(item.batchId || '') === String(batchId)).length
  const batchStudents = managingBatch
    ? enrollments.filter((item) => String(item.batchId || '') === String(managingBatch._id))
    : []
  const availableStudents = managingBatch
    ? enrollments.filter((item) => item.status === 'paid' && item.courseSlug === managingBatch.courseSlug && String(item.batchId || '') !== String(managingBatch._id))
    : []

  return (
    <div>
      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <div>
            <h3>{data.length} batches</h3>
            <p className="admin-helper-text">Create batches here, then teachers can schedule live classes only for their assigned batches.</p>
          </div>
          <button className="btn-admin btn-admin-primary" onClick={openAdd}>
            <FiPlus size={14} /> Add Batch
          </button>
        </div>

        {data.length === 0 ? (
          <div className="admin-empty">
            <FiAlertCircle size={32} />
            <p>No batches created yet.</p>
          </div>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Course</th>
                  <th>Teacher</th>
                  <th>Students</th>
                  <th>Start Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((batch) => (
                  <tr key={batch._id}>
                    <td data-label="Batch">{batch.title}</td>
                    <td data-label="Course">{batch.courseTitle}</td>
                    <td data-label="Teacher">{batch.teacherName}</td>
                    <td data-label="Students">{assignedStudentCount(batch._id)}</td>
                    <td data-label="Start Date">{batch.startDate ? new Date(batch.startDate).toLocaleDateString('en-IN') : '-'}</td>
                    <td data-label="Status">
                      <span className={`admin-badge ${batch.isActive ? 'admin-badge-active' : 'admin-badge-inactive'}`}>
                        {batch.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td data-label="Actions">
                      <div className="actions">
                        <button className="btn-admin btn-admin-primary btn-admin-sm" onClick={() => openStudentManager(batch)}>
                          <FiUserPlus size={12} />
                          Students
                        </button>
                        <button className="btn-admin btn-admin-edit btn-admin-sm" onClick={() => openEdit(batch)}>
                          <FiEdit2 size={12} />
                        </button>
                        <button className="btn-admin btn-admin-danger btn-admin-sm" onClick={() => handleDelete(batch._id)}>
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingId ? 'Edit Batch' : 'Create Batch'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <FiX size={20} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-group">
                <label>Batch Title</label>
                <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
              </div>
              <div className="admin-form-group">
                <label>Course</label>
                <select value={form.courseSlug} onChange={(event) => setForm({ ...form, courseSlug: event.target.value })}>
                  <option value="">Select course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course.slug}>{course.title}</option>
                  ))}
                </select>
              </div>
              <div className="admin-form-group">
                <label>Teacher</label>
                <select value={form.teacherId} onChange={(event) => setForm({ ...form, teacherId: event.target.value })}>
                  <option value="">Select teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>{teacher.name} ({teacher.role})</option>
                  ))}
                </select>
              </div>
              <div className="admin-form-group">
                <label>Start Date</label>
                <input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} />
              </div>
              <div className="admin-form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
              </div>
              <div className="admin-form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
                    style={{ width: 'auto' }}
                  />
                  <span>Batch active</span>
                </label>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="btn-admin" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-admin btn-admin-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update Batch' : 'Create Batch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {managingBatch && (
        <div className="admin-modal-overlay" onClick={() => setManagingBatch(null)}>
          <div className="admin-modal admin-student-manager-modal" onClick={(event) => event.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3>Manage Students</h3>
                <p className="admin-helper-text">{managingBatch.title} - {managingBatch.courseTitle}</p>
              </div>
              <button onClick={() => setManagingBatch(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <FiX size={20} />
              </button>
            </div>
            <div className="admin-modal-body admin-student-manager-grid">
              <div className="admin-student-list-card">
                <h4>Students In This Batch</h4>
                <p className="admin-helper-text">Remove a student from this batch if needed.</p>
                {batchStudents.length === 0 ? (
                  <div className="admin-empty admin-compact-empty">
                    <p>No students assigned yet.</p>
                  </div>
                ) : (
                  <div className="admin-student-list">
                    {batchStudents.map((student) => (
                      <div key={student._id} className="admin-student-row">
                        <div>
                          <strong>{student.name}</strong>
                          <div className="admin-helper-text">{student.email}</div>
                        </div>
                        <button
                          className="btn-admin btn-admin-danger btn-admin-sm"
                          disabled={studentActionId === student._id}
                          onClick={() => handleStudentBatchUpdate(student._id, '')}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="admin-student-list-card">
                <h4>Add Paid Students</h4>
                <p className="admin-helper-text">Only paid students from the same course can be added.</p>
                {availableStudents.length === 0 ? (
                  <div className="admin-empty admin-compact-empty">
                    <p>No eligible students available.</p>
                  </div>
                ) : (
                  <div className="admin-student-list">
                    {availableStudents.map((student) => (
                      <div key={student._id} className="admin-student-row">
                        <div>
                          <strong>{student.name}</strong>
                          <div className="admin-helper-text">
                            {student.email}
                            {student.batchName ? ` - currently in ${student.batchName}` : ''}
                          </div>
                        </div>
                        <button
                          className="btn-admin btn-admin-primary btn-admin-sm"
                          disabled={studentActionId === student._id}
                          onClick={() => handleStudentBatchUpdate(student._id, managingBatch._id)}
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="btn-admin" onClick={() => setManagingBatch(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EnrollmentSection() {
  const [data, setData] = useState([])
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  const fetchData = useCallback(() => {
    setLoading(true)
    Promise.all([
      api.get('/admin/enrollments', { withCredentials: true }),
      api.get('/admin/batches', { withCredentials: true }),
    ])
      .then(([enrollmentsRes, batchesRes]) => {
        setData(enrollmentsRes.data.data || [])
        setBatches(batchesRes.data.data || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this enrollment?')) return
    try {
      await api.delete(`/admin/enrollments/${id}`, { withCredentials: true })
      fetchData()
    } catch {
      alert('Error deleting')
    }
  }

  const handleBatchChange = async (item, batchId) => {
    setUpdatingId(item._id)
    try {
      await api.patch(`/admin/enrollments/${item._id}`, { batchId }, { withCredentials: true })
      fetchData()
    } catch (error) {
      alert(error.response?.data?.message || 'Error assigning batch')
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) return <div className="admin-loading"><span className="spinner" /></div>

  return (
    <div className="admin-table-wrapper">
      <div className="admin-table-header">
        <div>
          <h3>{data.length} records</h3>
         </div>
      </div>
      {data.length === 0 ? (
        <div className="admin-empty">
          <FiAlertCircle size={32} />
          <p>No records found.</p>
        </div>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                {enrollmentColumns.map((column) => <th key={column.key}>{column.label}</th>)}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => {
                const matchingBatches = batches.filter((batch) => !item.courseSlug || batch.courseSlug === item.courseSlug)

                return (
                  <tr key={item._id}>
                    {enrollmentColumns.map((column) => (
                      <td key={column.key} data-label={column.label}>
                        {column.render ? column.render(item[column.key]) : (item[column.key] ?? '-')}
                      </td>
                    ))}
                    <td data-label="Actions">
                      <div className="actions actions-stack">
                        {item.status === 'paid' && (
                          <select
                            className="admin-inline-select"
                            value={item.batchId || ''}
                            disabled={updatingId === item._id}
                            onChange={(event) => handleBatchChange(item, event.target.value)}
                          >
                            <option value="">No Batch</option>
                            {matchingBatches.map((batch) => (
                              <option key={batch._id} value={batch._id}>
                                {batch.title}
                              </option>
                            ))}
                          </select>
                        )}
                        <button className="btn-admin btn-admin-danger btn-admin-sm" onClick={() => handleDelete(item._id)}>
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
