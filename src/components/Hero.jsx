
import { Link } from "react-router-dom";
import {
  FiArrowUpRight,
  FiPlay,
  FiZap,
  FiShield,
  FiTruck,
  FiStar,
} from "react-icons/fi";

import "./Hero.css";

function Hero() {
  return (
    <section className="nova-hero">
      {/* Background decoration */}
      <div className="hero-bg-grid" />
      <div className="hero-glow hero-glow-left" />
      <div className="hero-glow hero-glow-right" />

      <div className="hero-container">
        {/* Left content */}
        <div className="hero-content">
          <div className="hero-announcement">
            <span className="hero-announcement-icon">
              <FiZap />
            </span>

            <span>THE NEXT GENERATION OF TECH SHOPPING</span>

            <FiArrowUpRight className="hero-announcement-arrow" />
          </div>

          <h1 className="hero-title">
            Technology
            <br />
            that moves
            <br />
            <span>you forward.</span>
          </h1>

          <p className="hero-description">
            Discover the gadgets you love, the innovation you need, and
            the everyday tech that makes life better. Your next favorite
            thing is waiting at NovaCart.
          </p>

          <div className="hero-actions">
            <Link to="/products" className="hero-primary-btn">
              Explore Products
              <FiArrowUpRight />
            </Link>

            <Link to="/deals" className="hero-secondary-btn">
              <span className="hero-play-icon">
                <FiPlay />
              </span>
              Discover Deals
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="hero-trust">
            <div className="hero-trust-item">
              <span className="hero-trust-icon">
                <FiShield />
              </span>

              <span>
                <strong>Secure</strong>
                <small>Shopping</small>
              </span>
            </div>

            <span className="hero-trust-divider" />

            <div className="hero-trust-item">
              <span className="hero-trust-icon">
                <FiTruck />
              </span>

              <span>
                <strong>Easy</strong>
                <small>Delivery</small>
              </span>
            </div>

            <span className="hero-trust-divider" />

            <div className="hero-trust-item">
              <span className="hero-trust-icon">
                <FiStar />
              </span>

              <span>
                <strong>Curated</strong>
                <small>Tech Picks</small>
              </span>
            </div>
          </div>
        </div>

        {/* Right visual */}
        <div className="hero-visual">
          <div className="hero-orbit hero-orbit-one" />
          <div className="hero-orbit hero-orbit-two" />

          <div className="hero-product-halo" />

          <div className="hero-product-image-wrap">
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85"
              alt="Premium wireless headphones"
              className="hero-product-image"
              fetchPriority="high"
            />
          </div>

          {/* Floating product badge */}
          <div className="hero-floating-card hero-floating-card-top">
            <div className="hero-floating-icon">
              <FiZap />
            </div>

            <div>
              <span className="hero-floating-label">TRENDING NOW</span>
              <strong>Next-level audio</strong>
            </div>
          </div>

          <div className="hero-floating-card hero-floating-card-bottom">
            <div className="hero-rating-icon">
              <FiStar />
            </div>

            <div>
              <strong>Premium Picks</strong>
              <span>Made for everyday life</span>
            </div>
          </div>

          <div className="hero-image-caption">
            <span className="hero-caption-dot" />
            <span>DESIGNED FOR WHAT'S NEXT</span>
          </div>
        </div>
      </div>

      {/* Bottom statistics */}
      <div className="hero-bottom">
        <div className="hero-bottom-inner">
          <div className="hero-stat">
            <strong>Premium</strong>
            <span>Product Selection</span>
          </div>

          <div className="hero-stat-divider" />

          <div className="hero-stat">
            <strong>Everyday</strong>
            <span>Tech Essentials</span>
          </div>

          <div className="hero-stat-divider" />

          <div className="hero-stat">
            <strong>One Place</strong>
            <span>For Your Next Upgrade</span>
          </div>

          <Link to="/products" className="hero-bottom-link">
            Find your next favorite
            <FiArrowUpRight />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;
