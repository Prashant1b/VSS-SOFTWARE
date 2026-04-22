import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { FiCalendar, FiClock, FiExternalLink, FiPlayCircle, FiRadio, FiRefreshCw, FiVideo } from 'react-icons/fi'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import './Classroom.css'

function getEmbedUrl(rawUrl) {
  if (!rawUrl) return ''

  try {
    const url = new URL(rawUrl)

    if (url.hostname.includes('youtube.com')) {
      if (url.pathname === '/watch') {
        const id = url.searchParams.get('v')
        return id ? `https://www.youtube.com/embed/${id}` : rawUrl
      }
      if (url.pathname.startsWith('/embed/')) return rawUrl
      if (url.pathname.startsWith('/live/')) {
        const id = url.pathname.split('/').filter(Boolean).pop()
        return id ? `https://www.youtube.com/embed/${id}` : rawUrl
      }
    }

    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.split('/').filter(Boolean).pop()
      return id ? `https://www.youtube.com/embed/${id}` : rawUrl
    }

    if (url.hostname.includes('vimeo.com')) {
      const id = url.pathname.split('/').filter(Boolean).pop()
      return id ? `https://player.vimeo.com/video/${id}` : rawUrl
    }

    return rawUrl
  } catch {
    return rawUrl
  }
}

function isDirectVideo(rawUrl) {
  return /\.(mp4|m3u8|webm|ogg)(\?|$)/i.test(rawUrl || '')
}

export default function Classroom() {
  const { courseSlug } = useParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const loadClassroom = async (silent = false) => {
    if (!silent) {
      setLoading(true)
    } else {
      setRefreshing(true)
    }

    setError('')

    return api.get(`/classroom/course/${courseSlug}`, { withCredentials: true })
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load classroom details right now.'))
      .finally(() => {
        setLoading(false)
        setRefreshing(false)
      })
  }

  useEffect(() => {
    loadClassroom()

    const intervalId = window.setInterval(() => {
      loadClassroom(true)
    }, 15000)

    return () => window.clearInterval(intervalId)
  }, [courseSlug])

  if (!user) return null
  if (user.role === 'teacher') return <Navigate to="/teacher" replace />

  if (loading) {
    return <div className="loading-page"><span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
  }

  return (
    <div className="classroom-page page-enter">
      <div className="container">
        <div className="classroom-hero">
          <div>
            <span className="section-label">My Classroom</span>
            <h1>{data?.enrollment?.course || 'Course Access'}</h1>
            <p>
              {data?.batch
                ? `Batch: ${data.batch.title}. Access live classes, recordings, and notes from this page.`
                : 'Your payment is complete, but batch assignment is still pending.'}
            </p>
          </div>
          <div className="classroom-hero-actions">
            <button type="button" className="btn btn-outline" onClick={() => loadClassroom(true)}>
              <FiRefreshCw size={15} /> {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <Link to="/dashboard" className="btn btn-outline">Back to Dashboard</Link>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        {data && !data.batch && !error && (
          <div className="classroom-empty-card">
            <h2>Batch assignment pending</h2>
            <p>
              Your payment has been completed, but your enrollment has not yet been mapped to a batch.
              To fix this, an admin must open <code>Admin Panel -&gt; Enrollments</code> and assign your paid enrollment
              to the correct batch for this course. Once that is done, live and recorded classes will appear here.
            </p>
          </div>
        )}

        {data?.batch && (
          <>
            <div className="classroom-section">
              <h2>Upcoming Live Classes</h2>
              <div className="classroom-grid">
                {data.liveClasses.length === 0 ? (
                  <div className="classroom-empty-card">No live classes scheduled yet.</div>
                ) : data.liveClasses.map((item) => (
                  <div key={item._id} className="classroom-card">
                    <div className="classroom-card-top">
                      <span className="classroom-pill live"><FiVideo size={13} /> Live Class</span>
                      <span className={`classroom-live-state ${item.liveStatus === 'live' ? 'is-live' : ''}`}>
                        {item.liveStatus === 'live' ? 'Live Now' : 'Scheduled'}
                      </span>
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.description || 'Live session details will appear here.'}</p>
                    <div className="classroom-meta">
                      {item.scheduledFor && <span><FiCalendar size={14} /> {new Date(item.scheduledFor).toLocaleString('en-IN')}</span>}
                      <span><FiClock size={14} /> {item.durationMinutes || 0} mins</span>
                    </div>
                    <div className="classroom-links">
                      {item.liveStatus === 'live' && <Link to={`/live-class/${item._id}`}>Join In Website <FiRadio size={14} /></Link>}
                      {item.notesUrl && <a href={item.notesUrl} target="_blank" rel="noreferrer">Class Notes <FiExternalLink size={14} /></a>}
                    </div>
                    {item.liveStatus !== 'live' && (
                      <p className="classroom-status-note">The join button will appear here as soon as the teacher or admin starts the live session. This page refreshes automatically.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="classroom-section">
              <h2>Recorded Classes</h2>
              <div className="classroom-grid">
                {data.recordedClasses.length === 0 ? (
                  <div className="classroom-empty-card">No recorded classes uploaded yet.</div>
                ) : data.recordedClasses.map((item) => (
                  <div key={item._id} className="classroom-card">
                    <div className="classroom-card-top">
                      <span className="classroom-pill recorded"><FiPlayCircle size={13} /> Recorded</span>
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.description || 'Recorded lesson details will appear here.'}</p>
                    <div className="classroom-meta">
                      {item.scheduledFor && <span><FiCalendar size={14} /> {new Date(item.scheduledFor).toLocaleDateString('en-IN')}</span>}
                      <span><FiClock size={14} /> {item.durationMinutes || 0} mins</span>
                    </div>
                    <div className="classroom-links">
                      {item.recordingUrl && <a href={item.recordingUrl} target="_blank" rel="noreferrer">Watch Recording <FiExternalLink size={14} /></a>}
                      {item.notesUrl && <a href={item.notesUrl} target="_blank" rel="noreferrer">Notes <FiExternalLink size={14} /></a>}
                    </div>
                    {item.recordingUrl && (
                      <div className="classroom-player">
                        {isDirectVideo(item.recordingUrl) ? (
                          <video controls playsInline src={item.recordingUrl} />
                        ) : (
                          <iframe
                            src={getEmbedUrl(item.recordingUrl)}
                            title={`${item.title} recording`}
                            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                            allowFullScreen
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
