import { useEffect, useState } from 'react'
import api from '../api'
import './PartnerLogos.css'

export default function PartnerLogos() {
  const [partners, setPartners] = useState([])

  useEffect(() => {
    api.get('/public/partners')
      .then((res) => {
        if (res.data.data?.length) {
          setPartners(res.data.data)
        }
      })
      .catch(() => {})
  }, [])

  if (!partners.length) return null

  return (
    <section className="partners-section">
      <div className="container">
        <p className="partners-label">Trusted by leading companies for talent acquisition</p>
        <div className="partners-track">
          <div className="partners-slide">
            {[...partners, ...partners].map((partner, i) => (
              <div key={`${partner._id || partner.name}-${i}`} className="partner-logo">
                <span>{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
