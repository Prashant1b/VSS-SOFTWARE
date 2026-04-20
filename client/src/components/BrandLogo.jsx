import { Link } from 'react-router-dom'
import './BrandLogo.css'

export default function BrandLogo({ to = '/', showWordmark = true }) {
  return (
    <a href={to} className="brand-logo" aria-label="VATE Software Systems home">
      <img 
        src="/logo.jpeg" 
        alt="VS" 
        className="brand-mark-img"
      />
      {showWordmark && (
        <span className="brand-wordmark">
          <span className="brand-wordmark-main">VATE SOFTWARE</span>
          <span className="brand-wordmark-sub">SYSTEMS</span>
        </span>
      )}
    </a>
  )
}