import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  FiBookOpen,
  FiCalendar,
  FiClock,
  FiEdit2,
  FiLogOut,
  FiMonitor,
  FiExternalLink,
  FiPlus,
  FiRadio,
  FiTrash2,
  FiUsers,
  FiVideo,
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import './TeacherPanel.css'

const emptyClassForm = {
  batchId: '',
  title: '',
  description: '',
  sessionType: 'live',
  scheduledFor: '',
  durationMinutes: 60,
  liveRoomName: '',
  recordingUrl: '',
  notesUrl: '',
  isPublished: true,
}

export default function TeacherPanel() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [batches, setBatches] = useState([])
  const [classes, setClasses] = useState([])
  const [selectedBatchId, setSelectedBatchId] = useState('')
  const [classForm, setClassForm] = useState(emptyClassForm)
  const [editingClassId, setEditingClassId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savingClass, setSavingClass] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', message: '' })
  const [batchSearch, setBatchSearch] = useState('')

  const loadDashboard = async (batchToKeep = '') => {
    setLoading(true)
    try {
      const [overviewRes, batchesRes] = await Promise.all([
        api.get('/teacher/overview', { withCredentials: true }),
        api.get('/teacher/batches', { withCredentials: true }),
      ])

      const fetchedBatches = batchesRes.data.data || []
      const nextBatchId = batchToKeep || selectedBatchId || fetchedBatches[0]?._id || ''

      setStats(overviewRes.data.stats)
      setBatches(fetchedBatches)
      setSelectedBatchId(nextBatchId)

      if (nextBatchId) {
        const classesRes = await api.get(`/teacher/batches/${nextBatchId}/classes`, { withCredentials: true })
        setClasses(classesRes.data.data || [])
      } else {
        setClasses([])
      }
    } catch (error) {
      setFeedback({ type: 'error', message: error.response?.data?.message || 'Unable to load teacher panel right now.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  useEffect(() => {
    if (!selectedBatchId) {
      setClasses([])
      setClassForm((prev) => ({ ...prev, batchId: '' }))
      return
    }

    api.get(`/teacher/batches/${selectedBatchId}/classes`, { withCredentials: true })
      .then((res) => setClasses(res.data.data || []))
      .catch(() => setClasses([]))
  }, [selectedBatchId])

  const selectedBatch = useMemo(
    () => batches.find((batch) => batch._id === selectedBatchId) || null,
    [batches, selectedBatchId]
  )

  const visibleBatches = useMemo(() => {
    const query = batchSearch.trim().toLowerCase()
    if (!query) return batches

    return batches.filter((batch) =>
      batch.title.toLowerCase().includes(query)
      || batch.courseTitle.toLowerCase().includes(query)
      || batch.courseSlug.toLowerCase().includes(query)
      || String(batch._id).toLowerCase().includes(query)
    )
  }, [batches, batchSearch])

  if (!user) return null
  if (user.role !== 'teacher' && user.role !== 'admin') return <Navigate to="/dashboard" replace />

  const handleClassSubmit = async (event) => {
    event.preventDefault()
    setSavingClass(true)
    setFeedback({ type: '', message: '' })

    try {
      if (editingClassId) {
        await api.put(`/teacher/classes/${editingClassId}`, classForm, { withCredentials: true })
      } else {
        await api.post('/teacher/classes', { ...classForm, batchId: classForm.batchId || selectedBatchId }, { withCredentials: true })
      }

      setClassForm({ ...emptyClassForm, batchId: selectedBatchId || '' })
      setEditingClassId(null)
      setFeedback({ type: 'success', message: 'Class saved successfully.' })
      await loadDashboard(selectedBatchId)
    } catch (error) {
      setFeedback({ type: 'error', message: error.response?.data?.message || 'Unable to save class.' })
    } finally {
      setSavingClass(false)
    }
  }

  const handleEditClass = (item) => {
    setEditingClassId(item._id)
    setClassForm({
      batchId: item.batch || selectedBatchId,
      title: item.title || '',
      description: item.description || '',
      sessionType: item.sessionType || 'live',
      scheduledFor: item.scheduledFor ? new Date(item.scheduledFor).toISOString().slice(0, 16) : '',
      durationMinutes: item.durationMinutes || 60,
      liveRoomName: item.liveRoomName || '',
      recordingUrl: item.recordingUrl || '',
      notesUrl: item.notesUrl || '',
      isPublished: Boolean(item.isPublished),
    })
  }

  const handleDeleteClass = async (classId) => {
    if (!window.confirm('Delete this class?')) return
    try {
      await api.delete(`/teacher/classes/${classId}`, { withCredentials: true })
      setClassForm({ ...emptyClassForm, batchId: selectedBatchId || '' })
      setEditingClassId(null)
      await loadDashboard(selectedBatchId)
    } catch (error) {
      setFeedback({ type: 'error', message: error.response?.data?.message || 'Unable to delete class.' })
    }
  }

  const handleStartLiveClass = async (classId) => {
    try {
      await api.post(`/teacher/classes/${classId}/live/start`, {}, { withCredentials: true })
      await loadDashboard(selectedBatchId)
      navigate(`/live-class/${classId}`)
    } catch (error) {
      setFeedback({ type: 'error', message: error.response?.data?.message || 'Unable to start live class.' })
    }
  }

  const handleEndLiveClass = async (classId) => {
    try {
      await api.post(`/teacher/classes/${classId}/live/end`, {}, { withCredentials: true })
      await loadDashboard(selectedBatchId)
    } catch (error) {
      setFeedback({ type: 'error', message: error.response?.data?.message || 'Unable to end live class.' })
    }
  }

  return (
    <div className="teacher-layout page-enter">
      <div className="teacher-shell">
        <div className="teacher-topbar">
          <div>
            <p className="teacher-eyebrow">Teacher Workspace</p>
            <h1>{user.name}</h1>
            <span>Schedule classes for your assigned batches and start live sessions when class time arrives.</span>
          </div>
          <div className="teacher-top-actions">
            <Link to="/" className="btn btn-outline">Website</Link>
            <button className="btn btn-primary" onClick={logout}><FiLogOut size={15} /> Logout</button>
          </div>
        </div>

        {loading ? (
          <div className="loading-page"><span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
        ) : (
          <>
            <div className="teacher-stats">
              <div className="teacher-stat-card"><FiBookOpen size={18} /><strong>{stats?.batches || 0}</strong><span>Batches</span></div>
              <div className="teacher-stat-card"><FiVideo size={18} /><strong>{stats?.classes || 0}</strong><span>Total Classes</span></div>
              <div className="teacher-stat-card"><FiMonitor size={18} /><strong>{stats?.liveClasses || 0}</strong><span>Live Sessions</span></div>
              <div className="teacher-stat-card"><FiUsers size={18} /><strong>{stats?.students || 0}</strong><span>Paid Students</span></div>
            </div>

            {feedback.type === 'success' && <p className="form-success">{feedback.message}</p>}
            {feedback.type === 'error' && <p className="form-error">{feedback.message}</p>}

            <div className="teacher-grid">
              <div className="teacher-card">
                <div className="teacher-card-header">
                  <div>
                    <h2>Assigned Batches</h2>
                    <p>Yahan sirf admin-created batches aayenge. Teacher naya course nahi banata, sirf assigned batch ke liye class schedule karta hai.</p>
                  </div>
                </div>
                <div className="form-group">
                  <label>Search Batch / Course / ID</label>
                  <input
                    value={batchSearch}
                    onChange={(event) => setBatchSearch(event.target.value)}
                    placeholder="e.g. full-stack, genai, or paste batch id"
                  />
                </div>
                <div className="teacher-list">
                  {visibleBatches.length === 0 ? (
                    <div className="teacher-empty">No active batches assigned yet. Ask admin to create and assign one from the admin panel.</div>
                  ) : visibleBatches.map((batch) => (
                    <div key={batch._id} className={`teacher-list-item ${selectedBatchId === batch._id ? 'active' : ''}`}>
                      <button className="teacher-list-button" onClick={() => { setSelectedBatchId(batch._id); setClassForm({ ...emptyClassForm, batchId: batch._id }) }}>
                        <strong>{batch.title}</strong>
                        <span>{batch.courseTitle}</span>
                        <small>{batch.startDate ? new Date(batch.startDate).toLocaleDateString('en-IN') : 'No start date'} - {batch.isActive ? 'Active' : 'Inactive'}</small>
                        <small>Tutor: {batch.teacherName}</small>
                        <small>Batch ID: {batch._id}</small>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="teacher-card">
                <div className="teacher-card-header">
                  <div>
                    <h2>{editingClassId ? 'Edit Class' : 'Schedule Class'}</h2>
                    <p>Only students who are paid and assigned to the selected batch will see this class in their classroom. A live session can be started by the teacher or an admin.</p>
                  </div>
                </div>
                <form className="teacher-form" onSubmit={handleClassSubmit}>
                  <div className="form-group">
                    <label>Batch</label>
                    <select value={classForm.batchId || selectedBatchId} onChange={(event) => setClassForm({ ...classForm, batchId: event.target.value })} required>
                      <option value="">Select batch</option>
                      {batches.map((batch) => (
                        <option key={batch._id} value={batch._id}>{batch.title} - {batch.courseTitle}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Class Title</label>
                      <input value={classForm.title} onChange={(event) => setClassForm({ ...classForm, title: event.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Session Type</label>
                      <select value={classForm.sessionType} onChange={(event) => setClassForm({ ...classForm, sessionType: event.target.value })}>
                        <option value="live">Live</option>
                        <option value="recorded">Recorded</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>{classForm.sessionType === 'live' ? 'Schedule Time' : 'Publish Time'}</label>
                      <input type="datetime-local" value={classForm.scheduledFor} onChange={(event) => setClassForm({ ...classForm, scheduledFor: event.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Duration (minutes)</label>
                      <input type="number" min="0" value={classForm.durationMinutes} onChange={(event) => setClassForm({ ...classForm, durationMinutes: event.target.value })} />
                    </div>
                  </div>
                  {classForm.sessionType === 'live' && (
                    <div className="form-group">
                      <label>Custom Room Code (optional)</label>
                      <input value={classForm.liveRoomName} onChange={(event) => setClassForm({ ...classForm, liveRoomName: event.target.value })} placeholder="genai-batch-apr-live" />
                    </div>
                  )}
                  <div className="form-group">
                    <label>Description</label>
                    <textarea value={classForm.description} onChange={(event) => setClassForm({ ...classForm, description: event.target.value })} />
                  </div>
                  {classForm.sessionType === 'recorded' && (
                    <div className="form-group">
                      <label>Recorded Video URL</label>
                      <input value={classForm.recordingUrl} onChange={(event) => setClassForm({ ...classForm, recordingUrl: event.target.value })} placeholder="https://youtube.com/... or direct mp4/hls" />
                    </div>
                  )}
                  <div className="form-group">
                    <label>Notes / Docs URL</label>
                    <input value={classForm.notesUrl} onChange={(event) => setClassForm({ ...classForm, notesUrl: event.target.value })} placeholder="https://drive.google.com/..." />
                  </div>
                  <label className="teacher-checkbox">
                    <input type="checkbox" checked={classForm.isPublished} onChange={(event) => setClassForm({ ...classForm, isPublished: event.target.checked })} />
                    <span>Publish for students</span>
                  </label>
                  <div className="teacher-actions">
                    <button className="btn btn-primary" type="submit" disabled={savingClass}>
                      {savingClass ? 'Saving...' : <><FiPlus size={16} /> {editingClassId ? 'Update Class' : 'Create Class'}</>}
                    </button>
                    {editingClassId && (
                      <button className="btn btn-outline" type="button" onClick={() => { setEditingClassId(null); setClassForm({ ...emptyClassForm, batchId: selectedBatchId || '' }) }}>
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            <div className="teacher-grid teacher-grid-single">
              <div className="teacher-card">
                <div className="teacher-card-header">
                  <div>
                    <h2>{selectedBatch ? `${selectedBatch.title} Classes` : 'Classes'}</h2>
                    <p>{selectedBatch ? 'Students assigned to this batch will see these classes in View Details.' : 'Select a batch to inspect its classes.'}</p>
                  </div>
                </div>
                <div className="teacher-list">
                  {classes.length === 0 ? (
                    <div className="teacher-empty">No classes created for this batch yet.</div>
                  ) : classes.map((item) => (
                    <div key={item._id} className="teacher-class-card">
                      <div>
                        <div className="teacher-class-tags">
                          <span className={`teacher-pill ${item.sessionType}`}>{item.sessionType}</span>
                          <span className={`teacher-pill ${item.isPublished ? 'published' : 'draft'}`}>{item.isPublished ? 'Published' : 'Draft'}</span>
                          {item.sessionType === 'live' && <span className={`teacher-pill ${item.liveStatus === 'live' ? 'live-now' : 'scheduled'}`}>{item.liveStatus || 'scheduled'}</span>}
                        </div>
                        <h3>{item.title}</h3>
                        <p>{item.description || 'No description added.'}</p>
                        <div className="teacher-class-meta">
                          {item.scheduledFor && <span><FiCalendar size={14} /> {new Date(item.scheduledFor).toLocaleString('en-IN')}</span>}
                          <span><FiClock size={14} /> {item.durationMinutes || 0} mins</span>
                        </div>
                        <div className="teacher-class-links">
                          {item.recordingUrl && <a href={item.recordingUrl} target="_blank" rel="noreferrer">Recording</a>}
                          {item.notesUrl && <a href={item.notesUrl} target="_blank" rel="noreferrer">Notes</a>}
                          {item.liveRoomName && <span>Room: {item.liveRoomName}</span>}
                          {item.sessionType === 'live' && <span>Students join inside website when you start the class.</span>}
                        </div>
                      </div>
                      <div className="teacher-inline-actions">
                        {item.sessionType === 'live' && item.liveStatus !== 'live' && (
                          <button className="btn btn-primary btn-sm" type="button" onClick={() => handleStartLiveClass(item._id)}>
                            <FiRadio size={14} /> Start Live
                          </button>
                        )}
                        {item.sessionType === 'live' && item.liveStatus === 'live' && (
                          <>
                            <button className="btn btn-primary btn-sm" type="button" onClick={() => navigate(`/live-class/${item._id}`)}>
                              <FiExternalLink size={14} /> Open Room
                            </button>
                            <button className="btn btn-outline btn-sm" type="button" onClick={() => handleEndLiveClass(item._id)}>
                              End Live
                            </button>
                          </>
                        )}
                        <button className="btn btn-outline btn-sm" type="button" onClick={() => handleEditClass(item)}><FiEdit2 size={14} /></button>
                        <button className="btn btn-outline btn-sm" type="button" onClick={() => handleDeleteClass(item._id)}><FiTrash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
