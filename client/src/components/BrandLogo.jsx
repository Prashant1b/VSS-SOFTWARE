import { Link } from 'react-router-dom'
import './BrandLogo.css'

export default function BrandLogo({ variant = 'default', to = '/', showWordmark = true }) {
  const content = (
    <>
      <span className="brand-mark" aria-hidden="true">
        <span className="brand-mark-v">V</span>
        <span className="brand-mark-s">S</span>
      </span>
      {showWordmark && (
        <span className="brand-wordmark">
          <span className="brand-wordmark-main">VATE SOFTWARE</span>
          <span className="brand-wordmark-sub">SYSTEMS</span>
        </span>
      )}
    </>
  )

  if (!to) {
    return <span className={`brand-logo brand-logo-${variant}`}>{content}</span>
  }

  return (
    <Link to={to} className={`brand-logo brand-logo-${variant}`} aria-label="VATE Software Systems home">
      {content}
    </Link>
  )
}
