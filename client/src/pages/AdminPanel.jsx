import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiHome, FiUsers, FiBookOpen, FiMessageSquare, FiBriefcase,
  FiBarChart2, FiStar, FiMail, FiFileText, FiArrowLeft,
  FiPlus, FiEdit2, FiTrash2, FiX, FiMenu, FiCheckCircle,
  FiAlertCircle, FiLogOut
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

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <h2>VSS ADMIN</h2>
          <p>VATE SOFTWARE SYSTEMS</p>
        </div>
        <nav className="admin-nav">
          {SECTIONS.map((s, i) => (
            <div key={s.key}>
              {s.section && <div className="admin-nav-section">{s.section}</div>}
              {i === 0 && <div className="admin-nav-section">Overview</div>}
              <button
                className={`admin-nav-item ${activeSection === s.key ? 'active' : ''}`}
                onClick={() => handleNav(s.key)}
              >
                {s.icon} {s.label}
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
          <h1>{SECTIONS.find(s => s.key === activeSection)?.label}</h1>
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

// ==================== Field Definitions ====================

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
  { key: 'slug', label: 'Slug', required: true, placeholder: 'e.g. full-stack-development' },
  { key: 'duration', label: 'Duration', required: true, placeholder: 'e.g. 8 Months' },
  { key: 'price', label: 'Price', required: true, placeholder: 'e.g. ₹65,000' },
  { key: 'students', label: 'Students Count', placeholder: 'e.g. 300+' },
  { key: 'rating', label: 'Rating', placeholder: 'e.g. 4.8' },
  { key: 'description', label: 'Description', type: 'textarea' },
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
  { key: 'suffix', label: 'Suffix', placeholder: 'e.g. +, LPA, %' },
  { key: 'order', label: 'Display Order', type: 'number' },
]

const partnerFields = [
  { key: 'name', label: 'Company Name', required: true },
  { key: 'order', label: 'Display Order', type: 'number' },
  { key: 'isActive', label: 'Active', type: 'checkbox' },
]

// ==================== Column Definitions for Read-Only ====================

const userColumns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role', render: (v) => <span className={`admin-badge admin-badge-${v}`}>{v}</span> },
  { key: 'phone', label: 'Phone' },
  { key: 'createdAt', label: 'Joined', render: (v) => new Date(v).toLocaleDateString() },
]

const contactColumns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'subject', label: 'Subject' },
  { key: 'message', label: 'Message' },
  { key: 'createdAt', label: 'Date', render: (v) => new Date(v).toLocaleDateString() },
]

const enrollmentColumns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'course', label: 'Course' },
  { key: 'institution', label: 'Institution' },
  { key: 'createdAt', label: 'Date', render: (v) => new Date(v).toLocaleDateString() },
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
    render: (v) => v ? (
      <a href={`${uploadsBaseUrl}/uploads/${v}`} target="_blank" rel="noreferrer">
        View File
      </a>
    ) : '—',
  },
  { key: 'createdAt', label: 'Date', render: (v) => new Date(v).toLocaleDateString() },
]

// ==================== Dashboard Section ====================

function DashboardSection() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('vss_token')
    api.get('/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setStats(res.data.stats))
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
    <div>
      <div className="admin-stats-grid">
        {cards.map(c => (
          <div key={c.label} className="admin-stat-card">
            <div className="stat-icon" style={{ background: c.color, color: c.iconColor }}>{c.icon}</div>
            <div className="stat-value">{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ==================== CRUD Section (Reusable) ====================

function CrudSection({ endpoint, fields }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  const token = localStorage.getItem('vss_token')
  const headers = { Authorization: `Bearer ${token}` }

  const fetchData = useCallback(() => {
    setLoading(true)
    api.get(`/admin/${endpoint}`, { headers })
      .then(res => setData(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [endpoint])

  useEffect(() => { fetchData() }, [fetchData])

  const openAdd = () => {
    const initial = {}
    fields.forEach(f => {
      if (f.type === 'checkbox') initial[f.key] = true
      else if (f.type === 'number') initial[f.key] = f.key === 'rating' ? 5 : 0
      else initial[f.key] = ''
    })
    setForm(initial)
    setEditing(null)
    setShowModal(true)
  }

  const openEdit = (item) => {
    const formData = {}
    fields.forEach(f => { formData[f.key] = item[f.key] ?? '' })
    setForm(formData)
    setEditing(item._id)
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/admin/${endpoint}/${editing}`, form, { headers })
      } else {
        await api.post(`/admin/${endpoint}`, form, { headers })
      }
      setShowModal(false)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return
    try {
      await api.delete(`/admin/${endpoint}/${id}`, { headers })
      fetchData()
    } catch {
      alert('Error deleting')
    }
  }

  const displayColumns = fields.filter(f => f.type !== 'textarea' && f.key !== 'order')

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
          <table className="admin-table">
            <thead>
              <tr>
                {displayColumns.map(f => <th key={f.key}>{f.label}</th>)}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item._id}>
                  {displayColumns.map(f => (
                    <td key={f.key}>
                      {f.type === 'checkbox' ? (
                        <span className={`admin-badge ${item[f.key] ? 'admin-badge-active' : 'admin-badge-inactive'}`}>
                          {item[f.key] ? 'Active' : 'Inactive'}
                        </span>
                      ) : (
                        String(item[f.key] ?? '')
                      )}
                    </td>
                  ))}
                  <td>
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
        )}
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editing ? 'Edit Item' : 'Add New Item'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <FiX size={20} />
              </button>
            </div>
            <div className="admin-modal-body">
              {fields.map(f => (
                <div key={f.key} className="admin-form-group">
                  <label>{f.label} {f.required && <span style={{ color: 'var(--brand-red)' }}>*</span>}</label>
                  {f.type === 'textarea' ? (
                    <textarea
                      value={form[f.key] || ''}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                    />
                  ) : f.type === 'select' ? (
                    <select value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })}>
                      <option value="">Select...</option>
                      {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : f.type === 'checkbox' ? (
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={!!form[f.key]}
                        onChange={e => setForm({ ...form, [f.key]: e.target.checked })}
                        style={{ width: 'auto' }}
                      />
                      <span style={{ fontSize: 14 }}>{form[f.key] ? 'Active' : 'Inactive'}</span>
                    </label>
                  ) : (
                    <input
                      type={f.type || 'text'}
                      value={form[f.key] ?? ''}
                      onChange={e => setForm({ ...form, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value })}
                      placeholder={f.placeholder}
                      required={f.required}
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

// ==================== Read-Only Section ====================

function ReadOnlySection({ endpoint, columns, canDelete }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('vss_token')
  const headers = { Authorization: `Bearer ${token}` }

  const fetchData = useCallback(() => {
    setLoading(true)
    api.get(`/admin/${endpoint}`, { headers })
      .then(res => setData(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [endpoint])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return
    try {
      await api.delete(`/admin/${endpoint}/${id}`, { headers })
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
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map(c => <th key={c.key}>{c.label}</th>)}
              {canDelete && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item._id}>
                {columns.map(c => (
                  <td key={c.key}>
                    {c.render ? c.render(item[c.key]) : (item[c.key] ?? '—')}
                  </td>
                ))}
                {canDelete && (
                  <td>
                    <button className="btn-admin btn-admin-danger btn-admin-sm" onClick={() => handleDelete(item._id)}>
                      <FiTrash2 size={12} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
