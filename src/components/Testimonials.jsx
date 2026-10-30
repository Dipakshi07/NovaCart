
import {
  FiStar,
  FiCheckCircle,
  FiArrowUpRight,
} from "react-icons/fi";

import "./Testimonial.css";

const testimonials = [
  {
    id: 1,
    name: "Aarav Sharma",
    role: "Verified Customer",
    initials: "AS",
    color: "lavender",
    rating: 5,
    product: "Nova X Pro Smartphone",
    date: "Recently",
    review:
      "The entire shopping experience felt premium. The website is easy to navigate, the product details are clear, and checkout is straightforward.",
  },
  {
    id: 2,
    name: "Priya Verma",
    role: "Verified Customer",
    initials: "PV",
    color: "pink",
    rating: 5,
    product: "Wireless Headphones",
    date: "Recently",
    review:
      "I really like the clean design and how easy it is to compare products. Everything feels organised, modern, and simple to use.",
  },
  {
    id: 3,
    name: "Rohan Gupta",
    role: "Verified Customer",
    initials: "RG",
    color: "blue",
    rating: 5,
    product: "Smart Accessories",
    date: "Recently",
    review:
      "Finding the product I wanted was quick and hassle-free. The layout looks great on mobile too, which makes browsing much more convenient.",
  },
];

function Testimonial() {
  return (
    <section className="nova-testimonial-section" id="testimonials">
      <div className="testimonial-container">
        {/* Section heading */}
        <div className="testimonial-header">
          <div className="testimonial-heading-content">
            <span className="testimonial-eyebrow">
              <FiStar />
              THE CUSTOMER EXPERIENCE
            </span>

            <h2 className="testimonial-title">
              Good things are
              <span> worth sharing.</span>
            </h2>

            <p className="testimonial-subtitle">
              Discover what customers value about shopping with NovaCart.
            </p>
          </div>

          <div className="testimonial-rating-summary">
            <div className="testimonial-summary-stars" aria-label="5 out of 5 stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar key={star} />
              ))}
            </div>

            <strong>Customer-first shopping</strong>
            <span>Designed around a better experience</span>
          </div>
        </div>

        {/* Review cards */}
        <div className="testimonial-grid">
          {testimonials.map((testimonial) => (
            <article
              className="testimonial-card"
              key={testimonial.id}
            >
              <div className="testimonial-card-top">
                <div
                  className="testimonial-stars"
                  aria-label={`${testimonial.rating} out of 5 stars`}
                >
                  {Array.from(
                    { length: testimonial.rating },
                    (_, index) => (
                      <FiStar key={index} />
                    )
                  )}
                </div>

                <span className="testimonial-quote-mark" aria-hidden="true">
                  “
                </span>
              </div>

              <p className="testimonial-review">
                “{testimonial.review}”
              </p>

              <div className="testimonial-product">
                <span className="testimonial-product-label">
                  Product interest
                </span>

                <span className="testimonial-product-name">
                  {testimonial.product}
                </span>
              </div>

              <div className="testimonial-divider" />

              <div className="testimonial-customer">
                <div
                  className={`testimonial-avatar avatar-${testimonial.color}`}
                  aria-hidden="true"
                >
                  {testimonial.initials}
                </div>

                <div className="testimonial-customer-info">
                  <strong>{testimonial.name}</strong>

                  <span>
                    <FiCheckCircle />
                    {testimonial.role}
                  </span>
                </div>

                <span className="testimonial-date">
                  {testimonial.date}
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom message */}
        <div className="testimonial-bottom">
          <div className="testimonial-bottom-icon">
            <FiCheckCircle />
          </div>

          <p>
            Shopping should feel simple, secure, and enjoyable.
          </p>

          <a href="/products" className="testimonial-shop-link">
            Explore NovaCart
            <FiArrowUpRight />
          </a>
        </div>
      </div>
    </section>
  );
}

export default Testimonial;
