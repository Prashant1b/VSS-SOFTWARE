import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import WhatsAppButton from './components/WhatsAppButton'
import Home from './pages/Home'
import EdTech from './pages/EdTech'
import Staffing from './pages/Staffing'
import AiSolutions from './pages/AiSolutions'
import About from './pages/About'
import Resources from './pages/Resources'
import Team from './pages/Team'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import AdminPanel from './pages/AdminPanel'
import CourseDetail from './pages/CourseDetails'
import TeacherPanel from './pages/TeacherPanel'
import Classroom from './pages/Classroom'
import LiveClassroom from './pages/LiveClassroom'
import './App.css'

function ScrollRestoration() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-page"><span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function getDefaultRoute(user) {
  if (!user) return '/login'
  if (user.role === 'admin') return '/admin'
  if (user.role === 'teacher') return '/teacher'
  return '/dashboard'
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-page"><span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-page"><span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
  if (user) return <Navigate to="/" replace />
  return children
}

function TeacherRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-page"><span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
  if (!user) return <Navigate to="/login" replace />
  if (!['teacher', 'admin'].includes(user.role)) return <Navigate to={getDefaultRoute(user)} replace />
  return children
}

function App() {
  const location = useLocation()
  const isLiveClassPage = location.pathname.startsWith('/live-class/')
  const isBackofficePage = location.pathname === '/admin' || location.pathname === '/teacher' || isLiveClassPage

  return (
    <div className="app">
      <ScrollRestoration />
      {!isBackofficePage && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/edtech" element={<EdTech />} />
          <Route path="/staffing" element={<Staffing />} />
          <Route path="/ai-solutions" element={<AiSolutions />} />
          <Route path="/about" element={<About />} />
          <Route path="/team" element={<Team />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/courses/:slug" element={<CourseDetail />} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/teacher" element={<TeacherRoute><TeacherPanel /></TeacherRoute>} />
          <Route path="/my-learning/:courseSlug" element={<ProtectedRoute><Classroom /></ProtectedRoute>} />
          <Route path="/live-class/:classId" element={<ProtectedRoute><LiveClassroom /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isBackofficePage && <Footer />}
      {!isBackofficePage && <ScrollToTop />}
      {!isBackofficePage && <WhatsAppButton />}
    </div>
  )
}

export default App
