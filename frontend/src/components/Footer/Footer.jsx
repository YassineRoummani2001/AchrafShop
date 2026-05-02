import React from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiTwitter, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              ACHRAF<span>SHOP</span>
            </Link>
            <p className="footer-tagline">
              Premium fashion for men, women, and kids. Curated style, exceptional quality.
            </p>
            <div className="footer-social">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><FiInstagram /></a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><FiFacebook /></a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter"><FiTwitter /></a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube"><FiYoutube /></a>
            </div>
          </div>

          {/* Shop */}
          <div className="footer-col">
            <h4 className="footer-heading">Shop</h4>
            <ul className="footer-links">
              <li><Link to="/shop?gender=men">Men</Link></li>
              <li><Link to="/shop?gender=women">Women</Link></li>
              <li><Link to="/shop?gender=kids">Kids</Link></li>
              <li><Link to="/shop?type=shoes">Shoes</Link></li>
              <li><Link to="/shop?type=accessories">Accessories</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div className="footer-col">
            <h4 className="footer-heading">Help</h4>
            <ul className="footer-links">
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/shipping">Shipping & Returns</Link></li>
              <li><Link to="/size-guide">Size Guide</Link></li>
              <li><Link to="/track-order">Track Order</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4 className="footer-heading">Contact</h4>
            <ul className="footer-contact">
              <li><FiMail size={14} /> <a href="mailto:achrafshop@gmail.com">achrafshop@gmail.com</a></li>
              <li><FiPhone size={14} /> <a href="tel:+212634890752">+212 634 890 752</a></li>
              <li><FiMapPin size={14} /> <span>123 Ain Cheggag, Fes, Morocco</span></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>&copy; {currentYear} AchrafShop. All rights reserved.</p>
          <div className="footer-legal">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
