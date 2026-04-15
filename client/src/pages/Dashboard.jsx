import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FiUser, FiBook, FiAward, FiSettings,
  FiLogOut, FiArrowRight, FiMail,
  FiPhone, FiEdit2, FiCheck
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import './Dashboard.css'

const courses = [
  { id: 1, title: 'Generative AI & LLMs', duration: '60 hours', status: 'Available', progress: 0 },
  { id: 2, title: 'Full Stack Development (MERN)', duration: '120 hours', status: 'Coming Soon', progress: 0 },
  { id: 3, title: 'Cloud & DevOps', duration: '80 hours', status: 'Coming Soon', progress: 0 },
]

const quickLinks = [
  { icon: <FiBook size={20} />, title: 'Browse Courses', desc: 'Explore our training programs', link: '/edtech' },
  { icon: <FiUser size={20} />, title: 'Career Opportunities', desc: 'View open positions', link: '/staffing' },
  { icon: <FiAward size={20} />, title: 'Resources', desc: 'Guides, templates & more', link: '/resources' },
]

export default function Dashboard() {
  const { user, logout, updateProfile } = useAuth()

  const [editing, setEditing] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    institution: ''
  })
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // ✅ FIX: sync form when user loads
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        institution: user.institution || ''
      })
    }
  }, [user])

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      console.log("Sending:", profileForm) // debug
      await updateProfile(profileForm)
      setEditing(false)
    } catch (err) {
      console.log("Update error:", err)
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="dashboard page-enter">
      <div className="container">
        {/* Header */}
        <div className="dash-header">
          <div className="dash-welcome">
            <div className="dash-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1>Welcome, {user.name.split(' ')[0]}</h1>
              <p>{user.role === 'employer' ? 'Employer Account' : 'Student Account'} &middot; {user.email}</p>
            </div>
          </div>
          <button className="btn btn-outline dash-logout" onClick={logout}>
            <FiLogOut size={16} /> Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div className="dash-tabs">
          <button className={`dash-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            Overview
          </button>
          <button className={`dash-tab ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>
            Courses
          </button>
          <button className={`dash-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            Profile
          </button>
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="dash-content">
            <div className="dash-stats">
              <div className="dash-stat-card">
                <div className="dash-stat-icon"><FiBook size={22} /></div>
                <div className="dash-stat-value">0</div>
                <div className="dash-stat-label">Enrolled Courses</div>
              </div>
              <div className="dash-stat-card">
                <div className="dash-stat-icon"><FiAward size={22} /></div>
                <div className="dash-stat-value">0</div>
                <div className="dash-stat-label">Certificates</div>
              </div>
              <div className="dash-stat-card">
                <div className="dash-stat-icon"><FiCheck size={22} /></div>
                <div className="dash-stat-value">0%</div>
                <div className="dash-stat-label">Completion</div>
              </div>
            </div>

            <h2 className="dash-section-title">Quick Actions</h2>
            <div className="dash-quick-links">
              {quickLinks.map((q, i) => (
                <Link to={q.link} key={i} className="dash-quick-card card">
                  <div className="dash-quick-icon">{q.icon}</div>
                  <div>
                    <h3>{q.title}</h3>
                    <p>{q.desc}</p>
                  </div>
                  <FiArrowRight size={16} className="dash-quick-arrow" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Courses */}
        {activeTab === 'courses' && (
          <div className="dash-content">
            <h2 className="dash-section-title">Available Courses</h2>
            <div className="dash-courses">
              {courses.map(c => (
                <div key={c.id} className="dash-course-card card">
                  <div className="dash-course-info">
                    <h3>{c.title}</h3>
                    <p>{c.duration}</p>
                  </div>
                  <div className="dash-course-status">
                    <span className={`status-badge ${c.status === 'Available' ? 'available' : 'coming'}`}>
                      {c.status}
                    </span>
                    {c.status === 'Available' && (
                      <Link to="/edtech#enroll" className="btn btn-primary btn-sm">
                        Enroll Now
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile */}
        {activeTab === 'profile' && (
          <div className="dash-content">
            <div className="dash-profile-card">
              <div className="dash-profile-header">
                <h2>Profile Information</h2>
                {!editing && (
                  <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>
                    <FiEdit2 size={14} /> Edit
                  </button>
                )}
              </div>

              {editing ? (
                <div className="dash-profile-form">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input type="tel" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Institution / Company</label>
                    <input type="text" value={profileForm.institution} onChange={e => setProfileForm({...profileForm, institution: e.target.value})} />
                  </div>
                  <div className="dash-profile-actions">
                    <button className="btn btn-primary btn-sm" onClick={handleSaveProfile} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="dash-profile-info">
                  <div className="dash-profile-row">
                    <span className="dash-profile-label"><FiUser size={14} /> Name</span>
                    <span className="dash-profile-value">{user.name}</span>
                  </div>
                  <div className="dash-profile-row">
                    <span className="dash-profile-label"><FiMail size={14} /> Email</span>
                    <span className="dash-profile-value">{user.email}</span>
                  </div>
                  <div className="dash-profile-row">
                    <span className="dash-profile-label"><FiPhone size={14} /> Phone</span>
                    <span className="dash-profile-value">{user.phone || 'Not provided'}</span>
                  </div>
                  <div className="dash-profile-row">
                    <span className="dash-profile-label"><FiSettings size={14} /> Role</span>
                    <span className="dash-profile-value" style={{ textTransform: 'capitalize' }}>{user.role}</span>
                  </div>
                  <div className="dash-profile-row">
                    <span className="dash-profile-label"><FiBook size={14} /> Institution</span>
                    <span className="dash-profile-value">{user.institution || 'Not provided'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
