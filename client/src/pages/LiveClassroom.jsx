import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Room, RoomEvent, Track } from 'livekit-client'
import { FiMessageSquare, FiMic, FiMicOff, FiMonitor, FiPhoneOff, FiSend, FiUsers, FiVideo, FiVideoOff, FiX } from 'react-icons/fi'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import './LiveClassroom.css'

const CHAT_TOPIC = 'class-chat'

function decodePayload(payload) {
  try {
    return JSON.parse(new TextDecoder().decode(payload))
  } catch {
    return null
  }
}

function encodePayload(message) {
  return new TextEncoder().encode(JSON.stringify(message))
}

function getChatStorageKey(classId) {
  return `vss-live-chat-${classId}`
}

function readStoredMessages(classId) {
  try {
    const raw = window.localStorage.getItem(getChatStorageKey(classId))
    if (!raw) return []

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function getPublishedTrack(publication) {
  return publication?.track || publication?.videoTrack || publication?.audioTrack || null
}

function TrackView({ track, label, muted = false, className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!track || !ref.current) return undefined

    const element = track.attach()
    if (track.kind === Track.Kind.Video) {
      element.className = 'live-media'
    } else {
      element.autoplay = true
      element.muted = muted
    }

    ref.current.innerHTML = ''
    ref.current.appendChild(element)

    return () => {
      track.detach()
      if (ref.current) {
        ref.current.innerHTML = ''
      }
    }
  }, [track, muted])

  return (
    <div className={`live-track-slot ${track?.kind === Track.Kind.Audio ? 'audio-only' : ''} ${className}`}>
      <div ref={ref} className="live-track-mount" />
      {label && track?.kind === Track.Kind.Video && <span className="live-track-label">{label}</span>}
    </div>
  )
}

function collectParticipants(room, isConnected) {
  if (!room || !isConnected) return []

  return [room.localParticipant, ...room.remoteParticipants.values()]
    .map((participant) => {
      const videoTrackPubs = Array.from(participant.videoTrackPublications.values())
      const cameraPublication = videoTrackPubs.find((pub) => pub.source === Track.Source.Camera && getPublishedTrack(pub))
        || videoTrackPubs.find((pub) => pub.source !== Track.Source.ScreenShare && getPublishedTrack(pub))
      const screenPublication = videoTrackPubs.find((pub) => pub.source === Track.Source.ScreenShare && getPublishedTrack(pub))

      return {
        sid: participant.sid || participant.identity,
        identity: participant.identity,
        name: participant.name || participant.identity,
        isLocal: participant.isLocal,
        videoTracks: videoTrackPubs.map((pub) => getPublishedTrack(pub)).filter(Boolean),
        audioTracks: Array.from(participant.audioTrackPublications.values()).map((pub) => getPublishedTrack(pub)).filter(Boolean),
        screenTrack: getPublishedTrack(screenPublication),
        cameraTrack: getPublishedTrack(cameraPublication),
      }
    })
    .filter((participant) => participant.identity)
}

export default function LiveClassroom() {
  const { classId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [room, setRoom] = useState(null)
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)
  const [cameraOn, setCameraOn] = useState(false)
  const [micOn, setMicOn] = useState(false)
  const [screenOn, setScreenOn] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState([])
  const [connectionState, setConnectionState] = useState('disconnected')
  const [hasConnectedOnce, setHasConnectedOnce] = useState(false)
  const roomRef = useRef(null)

  useEffect(() => {
    let activeRoom

    const connect = async () => {
      setLoading(true)
      setError('')
      setConnectionState('connecting')
      setHasConnectedOnce(false)
      setMessages(readStoredMessages(classId))

      try {
        const res = await api.post(`/classroom/live/${classId}/access`, {}, { withCredentials: true })
        const roomInstance = new Room({
          adaptiveStream: true,
          dynacast: true,
        })

        activeRoom = roomInstance
        roomRef.current = roomInstance
        setInfo(res.data)
        setRoom(roomInstance)

        const bump = () => setVersion((value) => value + 1)

        roomInstance
          .on(RoomEvent.ParticipantConnected, bump)
          .on(RoomEvent.ParticipantDisconnected, bump)
          .on(RoomEvent.TrackSubscribed, bump)
          .on(RoomEvent.TrackUnsubscribed, bump)
          .on(RoomEvent.LocalTrackPublished, bump)
          .on(RoomEvent.LocalTrackUnpublished, (publication) => {
            if (publication.source === Track.Source.ScreenShare) {
              setScreenOn(false)
            }
            if (publication.source === Track.Source.Camera) {
              setCameraOn(false)
            }
            bump()
          })
          .on(RoomEvent.ConnectionStateChanged, (state) => {
            setConnectionState(state)
            bump()
          })
          .on(RoomEvent.DataReceived, (payload, participant, _kind, topic) => {
            if (topic !== CHAT_TOPIC) return

            const incoming = decodePayload(payload)
            if (!incoming?.text) return

            setMessages((current) => {
              if (current.some((item) => item.id === incoming.id)) return current

              return [...current, {
                id: incoming.id,
                text: incoming.text,
                senderName: incoming.senderName || participant?.name || participant?.identity || 'Participant',
                senderRole: incoming.senderRole || 'student',
                createdAt: incoming.createdAt || new Date().toISOString(),
                isOwn: participant?.identity === roomInstance.localParticipant.identity,
              }]
            })
          })

        await roomInstance.connect(res.data.livekit.serverUrl, res.data.livekit.token)
        setConnectionState('connected')
        setHasConnectedOnce(true)

        if (res.data.livekit.canPublish) {
          try {
            await roomInstance.localParticipant.setCameraEnabled(true)
            setCameraOn(true)
          } catch {
            setCameraOn(false)
          }

          try {
            await roomInstance.localParticipant.setMicrophoneEnabled(true)
            setMicOn(true)
          } catch {
            setMicOn(false)
          }
        }

        bump()
      } catch (err) {
        setConnectionState('disconnected')
        setError(err.response?.data?.message || err.message || 'Unable to join the live classroom right now.')
      } finally {
        setLoading(false)
      }
    }

    connect()

    return () => {
      if (activeRoom) {
        activeRoom.disconnect()
      }
      roomRef.current = null
      setConnectionState('disconnected')
    }
  }, [classId])

  useEffect(() => {
    try {
      window.localStorage.setItem(getChatStorageKey(classId), JSON.stringify(messages))
    } catch {
      // Ignore storage failures and keep chat in memory.
    }
  }, [classId, messages])

  const isConnected = connectionState === 'connected'
  const hasJoinedRoom = Boolean((isConnected || hasConnectedOnce) && room)
  const participants = useMemo(() => collectParticipants(room, isConnected), [room, isConnected, version])
  const selfParticipant = useMemo(() => participants.find((participant) => participant.isLocal) || null, [participants])
  const remoteParticipants = useMemo(() => participants.filter((participant) => !participant.isLocal), [participants])

  const remoteAudioTracks = useMemo(
    () => remoteParticipants.flatMap((participant) => participant.audioTracks.map((track) => ({ key: `${participant.sid}-${track.sid}`, track }))),
    [remoteParticipants]
  )

  const activeScreenShare = useMemo(() => {
    for (const participant of participants) {
      if (participant.screenTrack) {
        return {
          track: participant.screenTrack,
          name: participant.name,
          isLocal: participant.isLocal,
        }
      }
    }

    return null
  }, [participants])

  const toggleCamera = async () => {
    if (!room || !info?.livekit?.canPublish || !isConnected) return

    const next = !cameraOn
    try {
      await room.localParticipant.setCameraEnabled(next)
      setCameraOn(next)
    } catch {
      setError('Unable to update camera right now.')
    }
  }

  const toggleMic = async () => {
    if (!room || !info?.livekit?.canPublish || !isConnected) return

    const next = !micOn
    try {
      await room.localParticipant.setMicrophoneEnabled(next)
      setMicOn(next)
    } catch {
      setError('Unable to update microphone right now.')
    }
  }

  const toggleScreenShare = async () => {
    if (!room || !info?.livekit?.canPublish || !isConnected) return

    if (screenOn) {
      try {
        await room.localParticipant.setScreenShareEnabled(false)
        setScreenOn(false)
      } catch {
        setError('Unable to stop screen sharing right now.')
      }
      return
    }

    try {
      await room.localParticipant.setScreenShareEnabled(true, {
        audio: true,
        selfBrowserSurface: 'include',
      })
      setScreenOn(true)
    } catch (err) {
      const message = String(err?.message || '')
      if (!message.toLowerCase().includes('permission') && !message.toLowerCase().includes('cancel')) {
        setError('Unable to start screen sharing right now.')
      }
    }
  }

  const sendMessage = async (event) => {
    event.preventDefault()

    if (!room || !isConnected) {
      setError('Chat will be available once the live room finishes connecting.')
      return
    }

    const text = chatInput.trim()
    if (!text) return

    const message = {
      id: `${Date.now()}-${user?._id || 'guest'}`,
      text,
      senderName: user?.name || 'Participant',
      senderRole: user?.role || 'student',
      createdAt: new Date().toISOString(),
    }

    try {
      await room.localParticipant.publishData(encodePayload(message), { reliable: true, topic: CHAT_TOPIC })
      setMessages((current) => [...current, { ...message, isOwn: true }])
      setChatInput('')
    } catch {
      setError('Unable to send the message right now. Please try again in a moment.')
    }
  }

  const handleLeave = () => {
    if (roomRef.current) {
      roomRef.current.disconnect()
    }

    if (user?.role === 'teacher' || user?.role === 'admin') {
      navigate('/teacher')
      return
    }

    navigate(`/my-learning/${info?.classSession?.courseSlug || ''}`)
  }

  if (!user) return null

  const isPresentationMode = !!activeScreenShare
  const hasRemoteParticipants = remoteParticipants.length > 0
  const visibleParticipants = isPresentationMode ? participants : (hasRemoteParticipants ? participants : (selfParticipant ? [selfParticipant] : []))
  const showWaitingNotice = hasJoinedRoom && !hasRemoteParticipants

  return (
    <div className="live-classroom-page page-enter">
      <div className="live-classroom-topbar">
        <div>
          <span className="live-classroom-eyebrow">Live Classroom</span>
          <h1>{info?.classSession?.title || 'Connecting...'}</h1>
          <p>{info?.classSession?.description || 'Join the class directly inside the website.'}</p>
        </div>
        <div className="live-classroom-actions">
          {info?.livekit?.canPublish && (
            <>
              <button className="btn btn-outline" onClick={toggleCamera} disabled={!isConnected}>
                {cameraOn ? <FiVideo size={15} /> : <FiVideoOff size={15} />} {cameraOn ? 'Camera On' : 'Camera Off'}
              </button>
              <button className="btn btn-outline" onClick={toggleMic} disabled={!isConnected}>
                {micOn ? <FiMic size={15} /> : <FiMicOff size={15} />} {micOn ? 'Mic On' : 'Mic Off'}
              </button>
              <button
                className={`btn ${screenOn ? 'btn-primary' : 'btn-outline'} btn-screen-share`}
                onClick={toggleScreenShare}
                disabled={!isConnected}
                title={screenOn ? 'Stop screen sharing' : 'Start screen sharing'}
              >
                {screenOn ? <FiX size={15} /> : <FiMonitor size={15} />}
                {screenOn ? 'Stop Share' : 'Share Screen'}
              </button>
            </>
          )}
          {!info?.livekit?.canPublish && <Link to={`/my-learning/${info?.classSession?.courseSlug || ''}`} className="btn btn-outline">Back to Course</Link>}
          <button className="btn btn-primary" onClick={handleLeave}><FiPhoneOff size={15} /> Leave</button>
        </div>
      </div>

      {loading && <div className="live-classroom-loading">Connecting to the live room...</div>}
      {error && <p className="form-error live-classroom-error">{error}</p>}

      {!loading && !error && (
        <div className="live-classroom-shell">
          <div className="live-classroom-main">
            <div className="live-classroom-panel">
              <div className="live-panel-head">
                <span><FiUsers size={14} /> {remoteParticipants.length} Remote Participants</span>
                <span><FiMessageSquare size={14} /> Private batch room</span>
                <span>{isConnected ? 'Connected' : 'Connecting'}</span>
                {isPresentationMode && (
                  <span className="live-screen-badge">
                    <FiMonitor size={13} /> {activeScreenShare.isLocal ? 'You are presenting' : `${activeScreenShare.name} is presenting`}
                  </span>
                )}
              </div>
              {showWaitingNotice && (
                <p className="live-panel-note">
                  You are alone in the room right now. Your preview and controls stay active so you can test camera, mic, and screen share before others join.
                </p>
              )}
            </div>

            {!hasJoinedRoom ? (
              <div className="live-classroom-empty">Connecting you to the live room...</div>
            ) : isPresentationMode ? (
              <div className="live-presentation-layout">
                <div className="live-screen-main">
                  <TrackView
                    track={activeScreenShare.track}
                    label={activeScreenShare.isLocal ? 'Your Screen' : `${activeScreenShare.name}'s Screen`}
                  />
                </div>

                <div className="live-camera-strip">
                  {visibleParticipants.map((participant) => (
                    <div key={participant.sid} className="live-camera-pip">
                      {participant.cameraTrack ? (
                        <TrackView
                          track={participant.cameraTrack}
                          label={participant.isLocal ? 'You' : participant.name}
                        />
                      ) : (
                        <div className="live-avatar-pip">
                          <strong>{participant.name?.charAt(0)?.toUpperCase() || 'U'}</strong>
                          <span>{participant.isLocal ? 'You' : participant.name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="live-classroom-grid">
                {visibleParticipants.map((participant) => (
                  <div key={participant.sid} className="live-participant-card">
                    {participant.videoTracks.length > 0 ? (
                      <TrackView
                        track={participant.cameraTrack || participant.videoTracks[0]}
                        label={participant.isLocal ? `${participant.name} (You)` : participant.name}
                      />
                    ) : (
                      <div className="live-avatar-card">
                        <strong>{participant.name?.charAt(0)?.toUpperCase() || 'U'}</strong>
                        <span>{participant.isLocal ? `${participant.name} (You)` : participant.name}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="live-chat-panel">
            <div className="live-chat-header">
              <h2>Class Chat</h2>
              <p>Use chat for questions, updates, and session communication.</p>
            </div>
            <div className="live-chat-messages">
              {messages.length === 0 ? (
                <div className="live-chat-empty">Messages shared during the live session will appear here.</div>
              ) : messages.map((message) => (
                <div key={message.id} className={`live-chat-bubble ${message.isOwn ? 'own' : ''}`}>
                  <strong>{message.senderName}</strong>
                  <span>{message.text}</span>
                  <small>{new Date(message.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</small>
                </div>
              ))}
            </div>
            <form className="live-chat-form" onSubmit={sendMessage}>
              <input
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder={isConnected ? 'Write a message...' : 'Chat will be available once the room connects'}
                disabled={!isConnected}
              />
              <button className="btn btn-primary" type="submit" disabled={!isConnected}>
                <FiSend size={14} /> Send
              </button>
            </form>
          </aside>
        </div>
      )}

      <div className="live-audio-layer" aria-hidden="true">
        {remoteAudioTracks.map((item) => (
          <TrackView key={item.key} track={item.track} />
        ))}
      </div>
    </div>
  )
}
