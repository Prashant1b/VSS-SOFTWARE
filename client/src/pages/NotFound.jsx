import { Link } from 'react-router-dom'
import './NotFound.css'

export default function NotFound() {
  return (
    <div className="page-enter">
      <section className="not-found-page">
        <div className="container">
          <div className="not-found-card">
            <span className="not-found-code">404</span>
            <h1>Page Not Found</h1>
            <p>The page you are trying to open does not exist or may have been moved.</p>
            <div className="not-found-actions">
              <Link to="/" className="btn btn-primary">Go Home</Link>
              <Link to="/edtech" className="btn btn-outline">Browse Courses</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
