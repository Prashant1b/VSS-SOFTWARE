import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  FiArrowRight,
  FiAward,
  FiBook,
  FiBriefcase,
  FiCalendar,
  FiCheck,
  FiEdit2,
  FiLogOut,
  FiMail,
  FiPhone,
  FiPlayCircle,
  FiSettings,
  FiUser,
  FiVideo,
} from 'react-icons/fi'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import './Dashboard.css'

const studentQuickLinks = [
  { icon: <FiBook size={20} />, title: 'Browse Courses', desc: 'Explore our training programs', link: '/edtech' },
  { icon: <FiUser size={20} />, title: 'Career Opportunities', desc: 'View open positions', link: '/staffing' },
  { icon: <FiAward size={20} />, title: 'Resources', desc: 'Guides, templates and more', link: '/resources' },
]

const employerQuickLinks = [
  { icon: <FiBriefcase size={20} />, title: 'Hiring Solutions', desc: 'Explore staffing services and recruiter support', link: '/staffing' },
  { icon: <FiBook size={20} />, title: 'Company Profile', desc: 'Keep your organization details up to date', link: '/dashboard' },
  { icon: <FiAward size={20} />, title: 'Resources', desc: 'Review hiring and talent resources', link: '/resources' },
]

export default function Dashboard() {
  const { user, logout, updateProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', institution: '' })
  const [profileFeedback, setProfileFeedback] = useState({ type: '', message: '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordFeedback, setPasswordFeedback] = useState({ type: '', message: '' })
  const [saving, setSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [enrollments, setEnrollments] = useState([])
  const [loadingEnrollments, setLoadingEnrollments] = useState(true)
  const [jobForm, setJobForm] = useState({ companyName: '', role: '', headcount: '', location: '', email: '', phone: '' })
  const [jobFile, setJobFile] = useState(null)
  const [jobPosts, setJobPosts] = useState([])
  const [jobsLoading, setJobsLoading] = useState(true)
  const [jobFeedback, setJobFeedback] = useState({ type: '', message: '' })
  const [postingJob, setPostingJob] = useState(false)

  const isEmployer = user?.role === 'employer'

  useEffect(() => {
    if (!user) return

    setProfileForm({
      name: user.name || '',
      phone: user.phone || '',
      institution: user.institution || '',
    })

    setJobForm({
      companyName: user.institution || '',
      role: '',
      headcount: '',
      location: '',
      email: user.email || '',
      phone: user.phone || '',
    })

    setActiveTab('overview')
  }, [user])

  useEffect(() => {
    if (!user || isEmployer) return

    setLoadingEnrollments(true)
    api.get('/course-enrollment/my', { withCredentials: true })
      .then((res) => setEnrollments(res.data.data || []))
      .catch(() => setEnrollments([]))
      .finally(() => setLoadingEnrollments(false))
  }, [user, isEmployer])

  useEffect(() => {
    if (!user || !isEmployer) return

    setJobsLoading(true)
    api.get('/recruitment/my', { withCredentials: true })
      .then((res) => setJobPosts(res.data.data || []))
      .catch(() => setJobPosts([]))
      .finally(() => setJobsLoading(false))
  }, [user, isEmployer])

  const paidEnrollments = useMemo(
    () => enrollments.filter((item) => item.status === 'paid'),
    [enrollments]
  )
  const demoBookings = useMemo(
    () => enrollments.filter((item) => item.demoSlotAt && item.status !== 'paid'),
    [enrollments]
  )

  const quickLinks = isEmployer ? employerQuickLinks : studentQuickLinks

  const handleSaveProfile = async () => {
    setProfileFeedback({ type: '', message: '' })

    if (profileForm.phone && profileForm.phone.length !== 10) {
      setProfileFeedback({ type: 'error', message: 'Mobile number must be 10 digits' })
      return
    }

    setSaving(true)
    try {
      await updateProfile(profileForm)
      setProfileFeedback({ type: 'success', message: 'Profile updated successfully' })
      setEditing(false)
    } catch (error) {
      setProfileFeedback({
        type: 'error',
        message: error.response?.data?.message || 'Unable to update profile',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleProfilePhoneChange = (event) => {
    const phone = event.target.value.replace(/\D/g, '').slice(0, 10)
    setProfileForm({ ...profileForm, phone })
    setProfileFeedback({ type: '', message: '' })
  }

  const handleEditProfile = () => {
    setProfileFeedback({ type: '', message: '' })
    setEditing(true)
  }

  const handleCancelProfileEdit = () => {
    setProfileForm({
      name: user.name || '',
      phone: user.phone || '',
      institution: user.institution || '',
    })
    setProfileFeedback({ type: '', message: '' })
    setEditing(false)
  }

  const handleJobSubmit = async (event) => {
    event.preventDefault()
    setPostingJob(true)
    setJobFeedback({ type: '', message: '' })

    try {
      const formData = new FormData()
      Object.entries(jobForm).forEach(([key, value]) => formData.append(key, value))
      if (jobFile) formData.append('jdFile', jobFile)

      await api.post('/recruitment/employer', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const refresh = await api.get('/recruitment/my', { withCredentials: true })
      setJobPosts(refresh.data.data || [])
      setJobFeedback({ type: 'success', message: 'Job requirement posted successfully.' })
      setJobForm({
        companyName: user.institution || '',
        role: '',
        headcount: '',
        location: '',
        email: user.email || '',
        phone: user.phone || '',
      })
      setJobFile(null)
    } catch (error) {
      setJobFeedback({ type: 'error', message: error.response?.data?.message || 'Unable to post requirement right now.' })
    } finally {
      setPostingJob(false)
    }
  }

  const handleChangePassword = async (event) => {
    event.preventDefault()
    setPasswordFeedback({ type: '', message: '' })

    if (passwordForm.newPassword.length < 6) {
      setPasswordFeedback({ type: 'error', message: 'New password must be at least 6 characters' })
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFeedback({ type: 'error', message: 'New password and confirm password must match' })
      return
    }

    setPasswordSaving(true)
    try {
      const res = await api.put('/auth/change-password', passwordForm, { withCredentials: true })
      setPasswordFeedback({ type: 'success', message: res.data.message || 'Password updated successfully' })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      setPasswordFeedback({
        type: 'error',
        message: error.response?.data?.message || 'Unable to update password',
      })
    } finally {
      setPasswordSaving(false)
    }
  }

  if (!user) return null
  if (user.role === 'teacher') return <Navigate to="/teacher" replace />

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
              <p>{isEmployer ? 'Employer Account' : 'Student Account'} - {user.email}</p>
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
          {!isEmployer && (
            <button className={`dash-tab ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>
              Courses
            </button>
          )}
          {isEmployer && (
            <button className={`dash-tab ${activeTab === 'jobs' ? 'active' : ''}`} onClick={() => setActiveTab('jobs')}>
              Job Posts
            </button>
          )}
          <button className={`dash-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            Profile
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="dash-content">
            <div className="dash-stats">
              <div className="dash-stat-card">
                <div className="dash-stat-icon"><FiBook size={22} /></div>
                <div className="dash-stat-value">{isEmployer ? jobPosts.length : paidEnrollments.length}</div>
                <div className="dash-stat-label">{isEmployer ? 'Job Posts' : 'Enrolled Courses'}</div>
              </div>
              <div className="dash-stat-card">
                <div className="dash-stat-icon"><FiCalendar size={22} /></div>
                <div className="dash-stat-value">{isEmployer ? jobPosts.filter((item) => item.jdFile).length : demoBookings.length}</div>
                <div className="dash-stat-label">{isEmployer ? 'Posts With JD' : 'Demo Bookings'}</div>
              </div>
              <div className="dash-stat-card">
                <div className="dash-stat-icon">{isEmployer ? <FiBriefcase size={22} /> : <FiCheck size={22} />}</div>
                <div className="dash-stat-value">{isEmployer ? 'Hiring' : (paidEnrollments.length ? 'Active' : '0')}</div>
                <div className="dash-stat-label">{isEmployer ? 'Account Mode' : 'Learning Status'}</div>
              </div>
            </div>

            {!isEmployer && (
              <>
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
                          <Link to={`/my-learning/${item.courseSlug}`} className="btn btn-outline btn-sm">
                            <FiVideo size={15} /> View Details
                          </Link>
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
              </>
            )}

            {isEmployer && (
              <div className="dash-placeholder-card">
                Your account is in employer mode. Use the Job Posts tab to submit hiring requirements directly from your dashboard.
              </div>
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

        {!isEmployer && activeTab === 'courses' && (
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
                          <div className="dash-course-actions">
                            <Link to={`/my-learning/${item.courseSlug}`} className="btn btn-outline btn-sm">
                              <FiVideo size={14} /> View Details
                            </Link>
                            {item.demoVideoUrl ? (
                              <a href={item.demoVideoUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                                <FiPlayCircle size={14} /> Watch Video
                              </a>
                            ) : null}
                          </div>
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

        {isEmployer && activeTab === 'jobs' && (
          <div className="dash-content">
            <div className="dash-jobs-grid">
              <div className="dash-profile-card">
                <div className="dash-profile-header">
                  <h2>Post Hiring Requirement</h2>
                </div>
                <form className="dash-profile-form dash-job-form" onSubmit={handleJobSubmit}>
                  <div className="form-group">
                    <label>Company Name</label>
                    <input value={jobForm.companyName} onChange={(event) => setJobForm({ ...jobForm, companyName: event.target.value })} required />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Role to Hire</label>
                      <input value={jobForm.role} onChange={(event) => setJobForm({ ...jobForm, role: event.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Headcount</label>
                      <input type="number" min="1" value={jobForm.headcount} onChange={(event) => setJobForm({ ...jobForm, headcount: event.target.value })} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input value={jobForm.location} onChange={(event) => setJobForm({ ...jobForm, location: event.target.value })} required />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" value={jobForm.email} onChange={(event) => setJobForm({ ...jobForm, email: event.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input type="tel" value={jobForm.phone} onChange={(event) => setJobForm({ ...jobForm, phone: event.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Upload JD</label>
                    <input type="file" accept=".pdf,.doc,.docx" onChange={(event) => setJobFile(event.target.files?.[0] || null)} />
                  </div>
                  {jobFeedback.type === 'error' && <p className="form-error">{jobFeedback.message}</p>}
                  {jobFeedback.type === 'success' && <p className="form-success">{jobFeedback.message}</p>}
                  <div className="dash-profile-actions">
                    <button className="btn btn-primary btn-sm" type="submit" disabled={postingJob}>
                      {postingJob ? 'Posting...' : 'Post Requirement'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="dash-profile-card">
                <div className="dash-profile-header">
                  <h2>My Job Posts</h2>
                </div>
                {jobsLoading ? (
                  <div className="dash-placeholder-card">Loading job posts...</div>
                ) : jobPosts.length > 0 ? (
                  <div className="dash-courses">
                    {jobPosts.map((item) => (
                      <div key={item._id} className="dash-course-card card">
                        <div className="dash-course-info">
                          <h3>{item.role}</h3>
                          <p>{item.companyName} - {item.location}</p>
                          <p>Headcount: {item.headcount}</p>
                        </div>
                        <div className="dash-course-status">
                          <span className="status-badge available">Posted</span>
                          <span className="dash-meta-text">{new Date(item.createdAt).toLocaleDateString('en-IN')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="dash-placeholder-card">
                    No job posts yet. Submit your first hiring requirement from this tab.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="dash-content">
            <div className="dash-jobs-grid">
              <div className="dash-profile-card">
                <div className="dash-profile-header">
                  <h2>Profile Information</h2>
                  {!editing && (
                    <button className="btn btn-outline btn-sm" onClick={handleEditProfile}>
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
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={handleProfilePhoneChange}
                        maxLength={10}
                        pattern="[0-9]{10}"
                        inputMode="numeric"
                      />
                    </div>
                    <div className="form-group">
                      <label>Institution / Company</label>
                      <input type="text" value={profileForm.institution} onChange={(event) => setProfileForm({ ...profileForm, institution: event.target.value })} />
                    </div>
                    {profileFeedback.type === 'error' && <p className="form-error">{profileFeedback.message}</p>}
                    {profileFeedback.type === 'success' && <p className="form-success">{profileFeedback.message}</p>}
                    <div className="dash-profile-actions">
                      <button className="btn btn-primary btn-sm" onClick={handleSaveProfile} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={handleCancelProfileEdit}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="dash-profile-info">
                    {profileFeedback.type === 'success' && <p className="form-success">{profileFeedback.message}</p>}
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

              <div className="dash-profile-card">
                <div className="dash-profile-header">
                  <h2>Change Password</h2>
                </div>
                <form className="dash-profile-form dash-job-form" onSubmit={handleChangePassword}>
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
                      minLength={6}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })}
                      minLength={6}
                      required
                    />
                  </div>
                  {passwordFeedback.type === 'error' && <p className="form-error">{passwordFeedback.message}</p>}
                  {passwordFeedback.type === 'success' && <p className="form-success">{passwordFeedback.message}</p>}
                  <div className="dash-profile-actions">
                    <button className="btn btn-primary btn-sm" type="submit" disabled={passwordSaving}>
                      {passwordSaving ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
