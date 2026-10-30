
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowUpRight,
  FiZap,
  FiClock,
  FiShoppingBag,
} from "react-icons/fi";
import "./DealBanner.css";

function DealBanner() {
  // Countdown duration: 24 hours from the component's first load
  const [timeLeft, setTimeLeft] = useState(() => {
    const savedEndTime = localStorage.getItem("novaDealEndTime");

    if (savedEndTime && Number(savedEndTime) > Date.now()) {
      return Number(savedEndTime);
    }

    const newEndTime = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem("novaDealEndTime", String(newEndTime));

    return newEndTime;
  });

  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const updateCountdown = () => {
      setRemaining(Math.max(0, timeLeft - Date.now()));
    };

    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formatTime = (value) => String(value).padStart(2, "0");

  return (
    <section className="deal-banner">
      <div className="deal-banner-glow deal-banner-glow-one" />
      <div className="deal-banner-glow deal-banner-glow-two" />

      <div className="deal-banner-content">
        <div className="deal-banner-left">
          <div className="deal-banner-eyebrow">
            <FiZap />
            <span>LIMITED-TIME OFFER</span>
          </div>

          <h2>
            Upgrade Your
            <br />
            <span>Everyday.</span>
          </h2>

          <p className="deal-banner-description">
            Premium tech. Incredible prices. Discover handpicked deals on
            your favorite gadgets before the offer ends.
          </p>

          <div className="deal-banner-discount">
            <span className="discount-number">UP TO 40%</span>
            <span className="discount-label">OFF SELECTED PRODUCTS</span>
          </div>

          <Link to="/deals" className="deal-banner-button">
            <FiShoppingBag />
            <span>Explore Deals</span>
            <FiArrowUpRight className="deal-button-arrow" />
          </Link>
        </div>

        <div className="deal-banner-right">
          <div className="deal-banner-image-wrap">
            <div className="deal-banner-image-ring" />

            <img
              className="deal-banner-image"
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85"
              alt="Premium wireless headphones on offer"
              loading="lazy"
            />

            <div className="deal-floating-card deal-floating-top">
              <span className="deal-floating-icon">
                <FiZap />
              </span>
              <span>
                <strong>Hot Deal</strong>
                <small>Limited stock</small>
              </span>
            </div>

            <div className="deal-floating-card deal-floating-bottom">
              <span className="deal-price-old">₹7,999</span>
              <strong>₹5,999</strong>
              <span className="deal-price-save">Save 25%</span>
            </div>
          </div>

          <div className="deal-countdown">
            <div className="deal-countdown-heading">
              <FiClock />
              <span>Offer ends in</span>
            </div>

            <div className="deal-countdown-units">
              <div className="deal-time-unit">
                <strong>{formatTime(hours)}</strong>
                <span>HRS</span>
              </div>

              <span className="deal-time-separator">:</span>

              <div className="deal-time-unit">
                <strong>{formatTime(minutes)}</strong>
                <span>MIN</span>
              </div>

              <span className="deal-time-separator">:</span>

              <div className="deal-time-unit">
                <strong>{formatTime(seconds)}</strong>
                <span>SEC</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="deal-banner-bottom-line" />
    </section>
  );
}

export default DealBanner;
