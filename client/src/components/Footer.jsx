import { Link } from 'react-router-dom'
import { FiMail, FiPhone, FiMapPin, FiLinkedin } from 'react-icons/fi'
import { FaWhatsapp, FaFacebookF } from 'react-icons/fa'
import BrandLogo from './BrandLogo'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <BrandLogo variant="footer" to="/" />
            </div>
            <p className="footer-desc">
              Learn. Get Hired. Build with AI. Your 3-in-1 partner for education,
              staffing, and enterprise AI solutions.
            </p>
            <div className="footer-socials">
              <a href="https://linkedin.com/company/vate-tech/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FiLinkedin size={17} />
              </a>
              <a href="https://wa.me/919389329264" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <FaWhatsapp size={17} />
              </a>
              <a href="https://m.facebook.com/people/Vate-Digi/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FaFacebookF size={15} />
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Services</h4>
            <ul>
              <li><Link to="/edtech">EdTech & Training</Link></li>
              <li><Link to="/staffing">Staffing Solutions</Link></li>
              <li><Link to="/ai-solutions">AI Solutions</Link></li>
              <li><Link to="/resources">Resources</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/resources">Success Stories</Link></li>
              <li><Link to="/about">Careers</Link></li>
              <li><Link to="/about">Privacy Policy</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <ul className="footer-contact">
              <li>
                <FiMail size={14} />
                <a href="mailto:vatedigital@gmail.com">vatedigital@gmail.com</a>
              </li>
              <li>
                <FiPhone size={14} />
                <a href="tel:+918147285223">+91 8147285223</a>
              </li>
              <li>
                <FaWhatsapp size={14} />
                <a href="https://wa.me/919389329264" target="_blank" rel="noopener noreferrer">+91 9389329264</a>
              </li>
              <li>
                <FiMapPin size={14} />
                <span>India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 VATE Software Systems Pvt. Ltd. All Rights Reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/about">Privacy Policy</Link>
            <Link to="/about">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
