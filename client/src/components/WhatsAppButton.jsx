import { FaWhatsapp } from 'react-icons/fa'
import './WhatsAppButton.css'

export default function WhatsAppButton() {
  const phone = '919389329264'
  const text = 'Hi VSS, I would like to know more about your services.'
  const isMobile = typeof window !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent)
  const href = isMobile
    ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`
    : `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`

  return (
    <a
      href={href}
      target={isMobile ? '_self' : '_blank'}
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="Chat on WhatsApp"
      title="Open WhatsApp chat"
    >
      <FaWhatsapp size={28} />
      <span className="whatsapp-tooltip">Chat with us</span>
    </a>
  )
}
