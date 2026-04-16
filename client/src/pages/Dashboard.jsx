import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiArrowRight,
  FiAward,
  FiBook,
  FiCalendar,
  FiCheck,
  FiEdit2,
  FiLogOut,
  FiMail,
  FiPhone,
  FiPlayCircle,
  FiSettings,
  FiUser,
} from 'react-icons/fi'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import './Dashboard.css'

const quickLinks = [
  { icon: <FiBook size={20} />, title: 'Browse Courses', desc: 'Explore our training programs', link: '/edtech' },
  { icon: <FiUser size={20} />, title: 'Career Opportunities', desc: 'View open positions', link: '/staffing' },
  { icon: <FiAward size={20} />, title: 'Resources', desc: 'Guides, templates and more', link: '/resources' },
]

export default function Dashboard() {
  const { user, logout, updateProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', institution: '' })
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [enrollments, setEnrollments] = useState([])
  const [loadingEnrollments, setLoadingEnrollments] = useState(true)

  useEffect(() => {
    if (!user) return
    setProfileForm({
      name: user.name || '',
      phone: user.phone || '',
      institution: user.institution || '',
    })
  }, [user])

  useEffect(() => {
    if (!user) return

    setLoadingEnrollments(true)
    api.get('/course-enrollment/my', { withCredentials: true })
      .then((res) => setEnrollments(res.data.data || []))
      .catch(() => setEnrollments([]))
      .finally(() => setLoadingEnrollments(false))
  }, [user])

  const paidEnrollments = useMemo(
    () => enrollments.filter((item) => item.status === 'paid'),
    [enrollments]
  )
  const demoBookings = useMemo(
    () => enrollments.filter((item) => item.demoSlotAt && item.status !== 'paid'),
    [enrollments]
  )

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await updateProfile(profileForm)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="dashboard page-enter">
      <div className="container">
        <div className="dash-header">
          <div className="dash-welcome">
            <div className="dash-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1>Welcome, {user.name.split(' ')[0]}</h1>
              <p>{user.role === 'employer' ? 'Employer Account' : 'Student Account'} · {user.email}</p>
            </div>
          </div>
          <button className="btn btn-outline dash-logout" onClick={logout}>
            <FiLogOut size={16} /> Sign Out
          </button>
        </div>

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

        {activeTab === 'overview' && (
          <div className="dash-content">
            <div className="dash-stats">
              <div className="dash-stat-card">
                <div className="dash-stat-icon"><FiBook size={22} /></div>
                <div className="dash-stat-value">{paidEnrollments.length}</div>
                <div className="dash-stat-label">Enrolled Courses</div>
              </div>
              <div className="dash-stat-card">
                <div className="dash-stat-icon"><FiCalendar size={22} /></div>
                <div className="dash-stat-value">{demoBookings.length}</div>
                <div className="dash-stat-label">Demo Bookings</div>
              </div>
              <div className="dash-stat-card">
                <div className="dash-stat-icon"><FiCheck size={22} /></div>
                <div className="dash-stat-value">{paidEnrollments.length ? 'Active' : '0'}</div>
                <div className="dash-stat-label">Learning Status</div>
              </div>
            </div>

            <h2 className="dash-section-title">My Learning Access</h2>
            {loadingEnrollments ? (
              <div className="dash-placeholder-card">Loading your course access...</div>
            ) : paidEnrollments.length > 0 ? (
              <div className="dash-enrolled-grid">
                {paidEnrollments.map((item) => (
                  <div key={item._id} className="dash-enrolled-card">
                    <div>
                      <span className="status-badge available">Enrolled</span>
                      <h3>{item.course}</h3>
                      <p>Payment verified and access is active on your account.</p>
                    </div>
                    <div className="dash-enrolled-actions">
                      {item.demoVideoUrl && (
                        <a href={item.demoVideoUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                          <FiPlayCircle size={15} /> Demo Video
                        </a>
                      )}
                      <span className="dash-meta-text">Paid on {new Date(item.paidAt || item.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dash-placeholder-card">
                No paid courses yet. Use the EdTech page to book a demo or complete enrollment.
              </div>
            )}

            {demoBookings.length > 0 && (
              <>
                <h2 className="dash-section-title">Upcoming Demo Classes</h2>
                <div className="dash-demo-list">
                  {demoBookings.map((item) => (
                    <div key={item._id} className="dash-demo-card">
                      <div>
                        <h3>{item.course}</h3>
                        <p>{new Date(item.demoSlotAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                      </div>
                      <Link to="/edtech#enroll" className="btn btn-outline btn-sm">Complete Enrollment</Link>
                    </div>
                  ))}
                </div>
              </>
            )}

            <h2 className="dash-section-title">Quick Actions</h2>
            <div className="dash-quick-links">
              {quickLinks.map((item) => (
                <Link to={item.link} key={item.title} className="dash-quick-card card">
                  <div className="dash-quick-icon">{item.icon}</div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                  <FiArrowRight size={16} className="dash-quick-arrow" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="dash-content">
            <h2 className="dash-section-title">Courses and Enrollment Status</h2>
            {loadingEnrollments ? (
              <div className="dash-placeholder-card">Loading your courses...</div>
            ) : enrollments.length > 0 ? (
              <div className="dash-courses">
                {enrollments.map((item) => {
                  const isPaid = item.status === 'paid'
                  return (
                    <div key={item._id} className="dash-course-card card">
                      <div className="dash-course-info">
                        <h3>{item.course}</h3>
                        <p>{isPaid ? 'Enrolled and unlocked' : 'Demo booked, waiting for payment'}</p>
                      </div>
                      <div className="dash-course-status">
                        <span className={`status-badge ${isPaid ? 'available' : 'coming'}`}>
                          {isPaid ? 'Enrolled' : 'Demo Booked'}
                        </span>
                        {isPaid ? (
                          item.demoVideoUrl ? (
                            <a href={item.demoVideoUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                              <FiPlayCircle size={14} /> Watch Video
                            </a>
                          ) : null
                        ) : (
                          <Link to="/edtech#enroll" className="btn btn-primary btn-sm">
                            Complete Payment
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="dash-placeholder-card">
                No active course records yet. Book a demo or pay for a course from the EdTech page.
              </div>
            )}
          </div>
        )}

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
                    <input type="text" value={profileForm.name} onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input type="tel" value={profileForm.phone} onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Institution / Company</label>
                    <input type="text" value={profileForm.institution} onChange={(event) => setProfileForm({ ...profileForm, institution: event.target.value })} />
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
