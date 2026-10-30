
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowUp,
  FiArrowRight,
  FiMail,
  FiMapPin,
  FiPhone,
  FiShoppingBag,
  FiInstagram,
  FiFacebook,
  FiTwitter,
  FiGithub,
  FiCheckCircle,
} from "react-icons/fi";

import "./Footer.css";

function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const currentYear = new Date().getFullYear();

  const handleNewsletter = (event) => {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setMessage("Please enter your email address.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(trimmedEmail)) {
      setMessage("Please enter a valid email address.");
      return;
    }

    // Demo subscription: saves the email in this browser.
    // Connect an API to create a real newsletter subscription.
    try {
      const savedEmails = JSON.parse(
        localStorage.getItem("novaNewsletterEmails") || "[]"
      );

      if (
        savedEmails.some(
          (savedEmail) =>
            savedEmail.toLowerCase() === trimmedEmail.toLowerCase()
        )
      ) {
        setMessage("You're already on our newsletter list.");
        return;
      }

      savedEmails.push(trimmedEmail);
      localStorage.setItem(
        "novaNewsletterEmails",
        JSON.stringify(savedEmails)
      );

      setEmail("");
      setMessage("Thanks! Your email has been saved.");
    } catch {
      setMessage("Unable to save right now. Please try again.");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="nova-footer">
      <div className="nova-footer-container">
        {/* Newsletter banner */}
        <section className="footer-newsletter">
          <div className="footer-newsletter-content">
            <span className="footer-eyebrow">STAY IN THE LOOP</span>

            <h2>
              Good tech.
              <br />
              <span>Great deals.</span>
            </h2>

            <p>
              Get updates on new arrivals, exclusive offers, and the latest
              tech picks from NovaCart.
            </p>
          </div>

          <form
            className="footer-newsletter-form"
            onSubmit={handleNewsletter}
          >
            <label htmlFor="footer-newsletter-email">
              Email address
            </label>

            <div className="footer-input-wrap">
              <FiMail aria-hidden="true" />

              <input
                id="footer-newsletter-email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setMessage("");
                }}
                autoComplete="email"
                required
              />

              <button type="submit" aria-label="Subscribe to newsletter">
                <FiArrowRight aria-hidden="true" />
              </button>
            </div>

            <p
              className="footer-newsletter-message"
              aria-live="polite"
              role="status"
            >
              {message || "No spam. Just good tech and better deals."}
            </p>
          </form>
        </section>

        {/* Footer main columns */}
        <div className="footer-main">
          <div className="footer-brand-column">
            <Link to="/" className="footer-logo">
              <span className="footer-logo-icon">
                <FiShoppingBag aria-hidden="true" />
              </span>

              <span>
                Nova<span className="footer-logo-accent">Cart</span>
                <small>TECH FOR YOUR EVERYDAY</small>
              </span>
            </Link>

            <p className="footer-brand-description">
              Discover technology that fits your life. Explore everyday
              essentials, innovative gadgets, and better ways to shop.
            </p>

            <div className="footer-socials">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <FiInstagram />
              </a>

              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                <FiFacebook />
              </a>

              <a
                href="https://x.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="X"
              >
                <FiTwitter />
              </a>

              <a
                href="https://github.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
              >
                <FiGithub />
              </a>
            </div>
          </div>

          <div className="footer-links-column">
            <h3>Explore</h3>

            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Shop All</Link></li>
              <li><Link to="/electronics">Electronics</Link></li>
              <li><Link to="/accessories">Accessories</Link></li>
              <li><Link to="/deals">Exclusive Deals</Link></li>
            </ul>
          </div>

          <div className="footer-links-column">
            <h3>Customer Care</h3>

            <ul>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/shipping">Shipping Information</Link></li>
              <li><Link to="/returns">Returns & Refunds</Link></li>
              <li><Link to="/faq">FAQs</Link></li>
              <li><Link to="/track-order">Track Your Order</Link></li>
            </ul>
          </div>

          <div className="footer-contact-column">
            <h3>Get in Touch</h3>

            <p className="footer-contact-item">
              <FiMail aria-hidden="true" />
              <a href="mailto:support@novacart.example">
                support@novacart.example
              </a>
            </p>

            <p className="footer-contact-item">
              <FiPhone aria-hidden="true" />
              <span>Contact details coming soon</span>
            </p>

            <p className="footer-contact-item">
              <FiMapPin aria-hidden="true" />
              <span>Online store · India</span>
            </p>

            <div className="footer-trust-note">
              <FiCheckCircle aria-hidden="true" />
              <span>Made for a better shopping experience</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p>
            © {currentYear} NovaCart. All rights reserved.
          </p>

          <div className="footer-legal-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>

          <button
            type="button"
            className="footer-back-to-top"
            onClick={scrollToTop}
            aria-label="Back to top"
            title="Back to top"
          >
            <FiArrowUp aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
