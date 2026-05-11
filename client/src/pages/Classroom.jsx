import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { FiCalendar, FiClock, FiExternalLink, FiMapPin, FiPlayCircle, FiRadio, FiRefreshCw, FiVideo, FiX } from 'react-icons/fi'
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

function getLocationHref(location, locationUrl) {
  const trimmedUrl = String(locationUrl || '').trim()
  if (trimmedUrl) {
    try {
      const urlWithProtocol = /^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`
      return new URL(urlWithProtocol).href
    } catch {
      // Fall back to searching the display name when the saved map URL is malformed.
    }
  }

  const trimmedLocation = String(location || '').trim()
  if (!trimmedLocation) return ''
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmedLocation)}`
}

function ClassroomLocation({ location, locationUrl }) {
  const mapsUrl = getLocationHref(location, locationUrl)
  const displayLocation = String(location || '').trim() || 'Open location'

  return (
    <div className="classroom-location-note">
      <FiMapPin size={16} />
      <div>
        <strong>Class Location</strong>
        {mapsUrl ? (
          <a href={mapsUrl} target="_blank" rel="noreferrer">
            {displayLocation} <FiExternalLink size={13} />
          </a>
        ) : (
          <span>Location will be shared soon.</span>
        )}
      </div>
    </div>
  )
}

function getPendingClassroomCopy(enrollment) {
  if (enrollment?.classMode === 'offline') {
    return {
      title: 'Offline class details',
      hero: 'Your payment is complete. Offline class location is listed below.',
      message: 'Your payment has been completed. Your offline classroom schedule will appear here once your batch is ready.',
      showLocation: true,
    }
  }

  if (enrollment?.classMode === 'hybrid') {
    return {
      title: 'Hybrid class details',
      hero: 'Your payment is complete. Hybrid class location is listed below.',
      message: 'Your payment has been completed. Your hybrid class schedule and online sessions will appear here once your batch is ready.',
      showLocation: true,
    }
  }

  return {
    title: 'Batch assignment pending',
    hero: 'Your payment is complete, but batch assignment is still pending.',
    message: 'Your payment has been completed, but your enrollment has not yet been mapped to a batch. Once that is done, live and recorded classes will appear here.',
    showLocation: false,
  }
}

export default function Classroom() {
  const { courseSlug } = useParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [openRecordingId, setOpenRecordingId] = useState('')
  const recordingOverlayRef = useRef(null)

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

  useEffect(() => {
    setOpenRecordingId('')
  }, [courseSlug, data?.recordedClasses?.length])

  useEffect(() => {
    if (!openRecordingId) {
      document.body.style.overflow = ''
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      }
      return
    }

    document.body.style.overflow = 'hidden'
    const element = recordingOverlayRef.current
    if (element?.requestFullscreen && !document.fullscreenElement) {
      element.requestFullscreen().catch(() => {})
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [openRecordingId])

  if (!user) return null
  if (user.role === 'teacher') return <Navigate to="/teacher" replace />

  if (loading) {
    return <div className="loading-page"><span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
  }

  const openRecording = data?.recordedClasses?.find((item) => item._id === openRecordingId) || null
  const pendingCopy = getPendingClassroomCopy(data?.enrollment)
  const classLocation = data?.course?.classLocation || data?.batch?.classLocation || data?.enrollment?.classLocation || ''
  const classLocationUrl = data?.course?.classLocationUrl || data?.batch?.classLocationUrl || data?.enrollment?.classLocationUrl || ''

  return (
    <div className="classroom-page page-enter">
      {openRecording && (
        <div className="classroom-recording-overlay" ref={recordingOverlayRef}>
          <div className="classroom-recording-modal">
            <div className="classroom-recording-header">
              <div>
                <span className="section-label">Recorded Session</span>
                <h2>{openRecording.title}</h2>
                <p>{openRecording.description || 'Recorded lesson details will appear here.'}</p>
              </div>
              <button type="button" className="btn btn-outline classroom-recording-close" onClick={() => setOpenRecordingId('')}>
                <FiX size={16} /> Close
              </button>
            </div>
            <div className="classroom-player classroom-player-modal">
              {isDirectVideo(openRecording.recordingUrl) ? (
                <video
                  controls
                  autoPlay
                  controlsList="nodownload noplaybackrate noremoteplayback"
                  disablePictureInPicture
                  disableRemotePlayback
                  playsInline
                  preload="metadata"
                  src={openRecording.recordingUrl}
                  onContextMenu={(event) => event.preventDefault()}
                />
              ) : (
                <iframe
                  src={getEmbedUrl(openRecording.recordingUrl)}
                  title={`${openRecording.title} recording`}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>
      )}
      <div className="container">
        <div className="classroom-hero">
          <div>
            <span className="section-label">My Classroom</span>
            <h1>{data?.enrollment?.course || 'Course Access'}</h1>
            <p>
              {data?.batch
                ? `Batch: ${data.batch.title}. Access live classes, recordings, and notes from this page.`
                : pendingCopy.hero}
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
            <h2>{pendingCopy.title}</h2>
            <p>{pendingCopy.message}</p>
            {pendingCopy.showLocation && <ClassroomLocation location={classLocation} locationUrl={classLocationUrl} />}
          </div>
        )}

        {data?.batch && (
          <>
            {(classLocation || classLocationUrl) && <ClassroomLocation location={classLocation} locationUrl={classLocationUrl} />}

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
                      {item.notesUrl && <a href={item.notesUrl} target="_blank" rel="noreferrer">Notes <FiExternalLink size={14} /></a>}
                    </div>
                    {item.recordingUrl && (
                      <>
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ marginTop: 16 }}
                          onClick={() => setOpenRecordingId(item._id)}
                        >
                          View Now
                        </button>
                      </>
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
