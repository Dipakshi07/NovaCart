
import {
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiHeadphones,
  FiArrowUpRight,
} from "react-icons/fi";

import "./Features.css";

const features = [
  {
    id: 1,
    icon: FiTruck,
    title: "Fast & Free Delivery",
    description:
      "Get your favorite gadgets delivered to your doorstep quickly and safely.",
    detail: "Free shipping on eligible orders",
    className: "feature-purple",
  },
  {
    id: 2,
    icon: FiShield,
    title: "Secure Payments",
    description:
      "Shop with confidence using secure checkout and trusted payment methods.",
    detail: "Your transactions stay protected",
    className: "feature-blue",
  },
  {
    id: 3,
    icon: FiRefreshCw,
    title: "Easy Returns",
    description:
      "Changed your mind? Enjoy a simple return process on eligible products.",
    detail: "Terms apply to eligible products",
    className: "feature-pink",
  },
  {
    id: 4,
    icon: FiHeadphones,
    title: "Dedicated Support",
    description:
      "Need help with an order? Our support team is here to assist you.",
    detail: "We're here when you need us",
    className: "feature-green",
  },
];

function Features() {
  return (
    <section className="features-section" aria-labelledby="features-heading">
      <div className="features-container">
        <div className="features-heading">
          <span className="features-eyebrow">
            THE NOVACART ADVANTAGE
          </span>

          <h2 id="features-heading">
            Shopping made <span>better.</span>
          </h2>

          <p>
            More than great gadgets. Enjoy a shopping experience designed
            around convenience, confidence, and you.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <article
                className={`feature-card ${feature.className}`}
                key={feature.id}
                style={{ "--feature-index": index }}
              >
                <div className="feature-card-top">
                  <div className="feature-icon">
                    <Icon aria-hidden="true" />
                  </div>

                  <span className="feature-number">
                    0{feature.id}
                  </span>
                </div>

                <h3>{feature.title}</h3>

                <p className="feature-description">
                  {feature.description}
                </p>

                <div className="feature-card-bottom">
                  <span>{feature.detail}</span>
                  <FiArrowUpRight aria-hidden="true" />
                </div>
              </article>
            );
          })}
        </div>

        <div className="features-trust">
          <span className="trust-dot" />
          <p>
            Built for a smoother shopping experience, from browsing to delivery.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Features;
