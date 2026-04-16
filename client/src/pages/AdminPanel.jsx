import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiHome, FiUsers, FiBookOpen, FiMessageSquare, FiBriefcase,
  FiBarChart2, FiStar, FiMail, FiFileText, FiArrowLeft,
  FiPlus, FiEdit2, FiTrash2, FiX, FiMenu, FiCheckCircle,
  FiAlertCircle, FiLogOut,
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import './AdminPanel.css'

const SECTIONS = [
  { key: 'dashboard', label: 'Dashboard', icon: <FiHome size={18} /> },
  { key: 'placements', label: 'Placements', icon: <FiStar size={18} />, section: 'Content' },
  { key: 'courses', label: 'Courses', icon: <FiBookOpen size={18} /> },
  { key: 'testimonials', label: 'Testimonials', icon: <FiMessageSquare size={18} /> },
  { key: 'hiring', label: 'Hiring Drives', icon: <FiBriefcase size={18} /> },
  { key: 'stats', label: 'Site Stats', icon: <FiBarChart2 size={18} /> },
  { key: 'partners', label: 'Partners', icon: <FiCheckCircle size={18} /> },
  { key: 'users', label: 'Users', icon: <FiUsers size={18} />, section: 'Submissions' },
  { key: 'contacts', label: 'Contacts', icon: <FiMail size={18} /> },
  { key: 'enrollments', label: 'Enrollments', icon: <FiFileText size={18} /> },
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
  { key: 'duration', label: 'Duration', required: true, placeholder: 'e.g. 60 Hours' },
  { key: 'price', label: 'Price', required: true, placeholder: 'e.g. Rs 45,000' },
  { key: 'amount', label: 'Amount (INR)', required: true, type: 'number', placeholder: 'e.g. 45000' },
  { key: 'originalPrice', label: 'Original Price', placeholder: 'e.g. Rs 60,000' },
  { key: 'mode', label: 'Mode', placeholder: 'e.g. Online / Self-Paced' },
  { key: 'students', label: 'Students Count', placeholder: 'e.g. 150+' },
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
  { key: 'status', label: 'Status', render: (value) => <span className={`admin-badge ${value === 'paid' ? 'admin-badge-active' : 'admin-badge-student'}`}>{value || 'lead'}</span> },
  { key: 'institution', label: 'Institution' },
  { key: 'demoSlotAt', label: 'Demo Slot', render: (value) => value ? new Date(value).toLocaleString() : '-' },
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
          {activeSection === 'testimonials' && <CrudSection endpoint="testimonials" fields={testimonialFields} />}
          {activeSection === 'hiring' && <CrudSection endpoint="hiring-drives" fields={hiringFields} />}
          {activeSection === 'stats' && <CrudSection endpoint="stats" fields={statFields} />}
          {activeSection === 'partners' && <CrudSection endpoint="partners" fields={partnerFields} />}
          {activeSection === 'users' && <ReadOnlySection endpoint="users" columns={userColumns} canDelete />}
          {activeSection === 'contacts' && <ReadOnlySection endpoint="contacts" columns={contactColumns} canDelete />}
          {activeSection === 'enrollments' && <ReadOnlySection endpoint="enrollments" columns={enrollmentColumns} canDelete />}
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
    fetchData()
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
      formData[field.key] = item[field.key] ?? ''
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

  const displayColumns = fields.filter((field) => field.type !== 'textarea' && field.key !== 'order')

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
                        ) : String(item[field.key] ?? '')}
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

function ReadOnlySection({ endpoint, columns, canDelete }) {
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
    fetchData()
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
                {canDelete && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item._id}>
                  {columns.map((column) => (
                    <td key={column.key} data-label={column.label}>
                      {column.render ? column.render(item[column.key]) : (item[column.key] ?? '-')}
                    </td>
                  ))}
                  {canDelete && (
                    <td data-label="Actions">
                      <button className="btn-admin btn-admin-danger btn-admin-sm" onClick={() => handleDelete(item._id)}>
                        <FiTrash2 size={12} />
                      </button>
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
