
import { useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiCheckCircle,
  FiHeadphones,
  FiHeart,
  FiMonitor,
  FiPackage,
  FiRefreshCw,
  FiShield,
  FiSmartphone,
  FiStar,
  FiTag,
  FiTruck,
  FiZap,
} from "react-icons/fi";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import products from "../data/products";
import "./Home.css";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);

function getDiscount(product) {
  const price = Number(product.price) || 0;
  const originalPrice =
    Number(product.originalPrice ?? product.oldPrice) || price;

  if (originalPrice <= price || originalPrice <= 0) return 0;

  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

const categories = [
  {
    title: "Electronics",
    description: "Smart tech for everyday life",
    icon: FiMonitor,
    link: "/electronics",
    className: "home-category-electronics",
  },
  {
    title: "Accessories",
    description: "The details that make a difference",
    icon: FiHeadphones,
    link: "/accessories",
    className: "home-category-accessories",
  },
  {
    title: "Smart Devices",
    description: "Upgrade your daily routine",
    icon: FiSmartphone,
    link: "/electronics",
    className: "home-category-smart",
  },
];

const benefits = [
  {
    icon: FiTruck,
    title: "Convenient delivery",
    description: "Clear delivery information throughout your order.",
  },
  {
    icon: FiShield,
    title: "Secure shopping",
    description: "A checkout experience designed with security in mind.",
  },
  {
    icon: FiRefreshCw,
    title: "Easy support",
    description: "Get help when you need assistance with your order.",
  },
  {
    icon: FiPackage,
    title: "Carefully selected",
    description: "Discover useful tech and accessories in one place.",
  },
];

const testimonials = [
  {
    quote:
      "The website feels clean and easy to navigate. Finding a product is simple.",
    name: "Aarav Sharma",
    role: "Online shopper",
    initials: "AS",
  },
  {
    quote:
      "I like having product details and prices together. It makes comparing options easier.",
    name: "Priya Verma",
    role: "Tech enthusiast",
    initials: "PV",
  },
  {
    quote:
      "A neat shopping experience with a modern look and products that are easy to explore.",
    name: "Rohan Singh",
    role: "NovaCart visitor",
    initials: "RS",
  },
];

function Home() {
  const location = useLocation();

  const allProducts = Array.isArray(products) ? products : [];

  // Scroll to Featured Products when URL contains #products
  useEffect(() => {
    if (
      location.pathname === "/" &&
      (
        location.hash === "#products" ||
        location.hash === "#home-featured-products"
      )
    ) {
      let timer;

      const scrollToProducts = () => {
        const section = document.getElementById("products");

        if (section) {
          section.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      };

      // Wait for the Home page and products section to render
      timer = setTimeout(scrollToProducts, 200);

      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.hash]);

  const featuredProducts = useMemo(() => {
    return [...allProducts]
      .sort(
        (a, b) =>
          (Number(b.rating) || 0) - (Number(a.rating) || 0)
      )
      .slice(0, 8);
  }, [allProducts]);

  const dealProducts = useMemo(() => {
    return [...allProducts]
      .filter((product) => getDiscount(product) > 0)
      .sort((a, b) => getDiscount(b) - getDiscount(a))
      .slice(0, 4);
  }, [allProducts]);

  const bestDiscount = allProducts.reduce(
    (best, product) => Math.max(best, getDiscount(product)),
    0
  );

  return (
    <div className="nova-home-page">
      <Navbar />

      <main>
        {/* HERO */}
        <section className="home-hero">
          <div className="home-hero-grid-pattern" />
          <div className="home-hero-glow home-glow-one" />
          <div className="home-hero-glow home-glow-two" />

          <div className="home-container home-hero-layout">
            <div className="home-hero-content">
              <div className="home-hero-pill">
                <span className="home-live-dot" />
                YOUR NEXT TECH DISCOVERY STARTS HERE
              </div>

              <h1>
                Shop smarter.
                <br />
                <span>Live connected.</span>
              </h1>

              <p className="home-hero-description">
                Discover modern electronics, everyday essentials and
                accessories that fit your world. Your next favourite
                find is just a click away.
              </p>

              <div className="home-hero-actions">
                <Link to="/products" className="home-btn-primary">
                  Explore products
                  <FiArrowRight />
                </Link>

                <Link to="/deals" className="home-btn-secondary">
                  View latest deals
                  <FiZap />
                </Link>
              </div>

              <div className="home-hero-proof">
                <div className="home-proof-icon">
                  <FiCheckCircle />
                </div>
                <div>
                  <strong>Easy to explore</strong>
                  <span>Find products that suit your needs</span>
                </div>
              </div>
            </div>

            <div
              className="home-hero-art"
              aria-label="NovaCart technology showcase"
            >
              <div className="home-art-orbit home-art-orbit-one" />
              <div className="home-art-orbit home-art-orbit-two" />
              <div className="home-art-glow" />

              <div className="home-floating-label home-floating-label-top">
                <span className="home-floating-icon">
                  <FiZap />
                </span>
                <span>
                  <strong>Next-gen tech</strong>
                  <small>Made for your everyday</small>
                </span>
              </div>

              <div className="home-device-stage">
                <div className="home-device-back" />

                <div className="home-device-phone">
                  <div className="home-phone-camera" />
                  <div className="home-phone-screen">
                    <div className="home-phone-topline">
                      <span>NOVA</span>
                      <FiZap />
                    </div>
                    <div className="home-phone-circle">
                      <FiSmartphone />
                    </div>
                    <span className="home-phone-caption">
                      Made to connect.
                    </span>
                    <div className="home-phone-lines">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>

                <div className="home-device-earbuds">
                  <div className="home-earbud-case">
                    <span />
                    <span />
                  </div>
                </div>

                <div className="home-device-watch">
                  <div className="home-watch-strap" />
                  <div className="home-watch-face">
                    <span>10:09</span>
                    <div />
                  </div>
                </div>
              </div>

              <div className="home-floating-label home-floating-label-bottom">
                <span className="home-floating-icon">
                  <FiStar />
                </span>
                <span>
                  <strong>Find your favourite</strong>
                  <small>Explore the NovaCart collection</small>
                </span>
              </div>
            </div>
          </div>

          <div className="home-container home-hero-bottom">
            <span>TECH THAT FITS YOUR LIFE</span>
            <div className="home-hero-bottom-line" />
            <a href="#home-categories">
              Explore the collection <FiArrowRight />
            </a>
          </div>
        </section>

        {/* BENEFITS */}
        <section className="home-benefit-strip">
          <div className="home-container home-benefit-grid">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <div className="home-benefit-item" key={benefit.title}>
                  <span className="home-benefit-icon">
                    <Icon />
                  </span>
                  <div>
                    <h3>{benefit.title}</h3>
                    <p>{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CATEGORIES */}
        <section
          className="home-section home-categories-section"
          id="home-categories"
        >
          <div className="home-container">
            <div className="home-section-heading">
              <div>
                <span className="home-section-eyebrow">
                  BROWSE BY INTEREST
                </span>
                <h2>Find your kind of tech.</h2>
                <p>
                  Explore collections designed around the things you use
                  every day.
                </p>
              </div>

              <Link to="/products" className="home-text-link">
                Browse all <FiArrowUpRight />
              </Link>
            </div>

            <div className="home-category-grid">
              {categories.map((category, index) => {
                const Icon = category.icon;

                return (
                  <Link
                    to={category.link}
                    className={`home-category-card ${category.className}`}
                    key={category.title}
                  >
                    <div className="home-category-top">
                      <span className="home-category-icon">
                        <Icon />
                      </span>
                      <span className="home-category-number">
                        0{index + 1}
                      </span>
                    </div>

                    <div className="home-category-art">
                      <div className="home-category-art-ring" />
                      <Icon />
                    </div>

                    <div className="home-category-bottom">
                      <div>
                        <h3>{category.title}</h3>
                        <p>{category.description}</p>
                      </div>
                      <span className="home-category-arrow">
                        <FiArrowUpRight />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* FEATURED PRODUCTS */}
        <section
          className="home-section home-featured-section"
          id="products"
        >
          <div className="home-container">
            <div className="home-section-heading">
              <div>
                <span className="home-section-eyebrow">
                  THE NOVACART EDIT
                </span>
                <h2>Popular picks.</h2>
                <p>
                  Explore highly rated items from the products currently
                  in our collection.
                </p>
              </div>

              <Link to="/products" className="home-text-link">
                View all products <FiArrowUpRight />
              </Link>
            </div>

            {featuredProducts.length > 0 ? (
              <div className="home-product-grid">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="home-empty-products">
                <FiPackage />
                <h3>Your next favourite is on its way.</h3>
                <p>Add products to your products.js file to show them here.</p>
              </div>
            )}
          </div>
        </section>

        {/* DEALS BANNER */}
        <section className="home-deals-section">
          <div className="home-container">
            <div className="home-deals-banner">
              <div className="home-deals-glow" />

              <div className="home-deals-content">
                <span className="home-section-eyebrow">
                  <FiZap /> SMART SHOPPING STARTS HERE
                </span>

                <h2>
                  Good tech.
                  <br />
                  <span>Better value.</span>
                </h2>

                <p>
                  Check out products with listed discounts and find an
                  upgrade that works for your budget.
                </p>

                <Link to="/deals" className="home-btn-primary">
                  Explore deals <FiArrowRight />
                </Link>
              </div>

              <div className="home-deals-feature">
                <div className="home-deals-feature-icon">
                  <FiTag />
                </div>

                <span>BEST LISTED DISCOUNT</span>
                <strong>
                  {bestDiscount}%<small> OFF</small>
                </strong>

                <p>
                  {dealProducts.length > 0
                    ? `${dealProducts.length} featured discounted ${
                        dealProducts.length === 1 ? "item" : "items"
                      } shown below`
                    : "Explore our collection for available products"}
                </p>

                <div className="home-deals-feature-line">
                  <span />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DEAL PRODUCT PICKS */}
        {dealProducts.length > 0 && (
          <section className="home-section home-deal-products-section">
            <div className="home-container">
              <div className="home-section-heading">
                <div>
                  <span className="home-section-eyebrow">
                    MORE VALUE, LESS SPEND
                  </span>
                  <h2>Deals to discover.</h2>
                  <p>
                    These picks have a current price below their listed
                    original price.
                  </p>
                </div>

                <Link to="/deals" className="home-text-link">
                  All deals <FiArrowUpRight />
                </Link>
              </div>

              <div className="home-product-grid">
                {dealProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* WISHLIST CTA */}
        <section className="home-wishlist-section">
          <div className="home-container">
            <div className="home-wishlist-banner">
              <div className="home-wishlist-icon">
                <FiHeart />
              </div>

              <div className="home-wishlist-copy">
                <span className="home-section-eyebrow">
                  SAVE IT FOR LATER
                </span>
                <h2>Found something you love?</h2>
                <p>
                  Add your favourite products to your wishlist and keep
                  the things you like in one place.
                </p>
              </div>

              <Link to="/wishlist" className="home-btn-secondary">
                Explore wishlist <FiArrowRight />
              </Link>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="home-section home-testimonials-section">
          <div className="home-container">
            <div className="home-section-heading home-testimonial-heading">
              <div>
                <span className="home-section-eyebrow">
                  THE SHOPPING EXPERIENCE
                </span>
                <h2>Made for easy discovery.</h2>
                <p>
                  A look at the experience NovaCart aims to deliver.
                </p>
              </div>
            </div>

            <div className="home-testimonial-grid">
              {testimonials.map((testimonial) => (
                <article
                  className="home-testimonial-card"
                  key={testimonial.name}
                >
                  <div className="home-testimonial-stars" aria-label="5 stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar key={star} />
                    ))}
                  </div>

                  <p className="home-testimonial-quote">
                    “{testimonial.quote}”
                  </p>

                  <div className="home-testimonial-person">
                    <span className="home-testimonial-avatar">
                      {testimonial.initials}
                    </span>

                    <div>
                      <strong>{testimonial.name}</strong>
                      <span>{testimonial.role}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <p className="home-testimonial-disclaimer">
              These are illustrative sample testimonials for the website
              design, not verified customer reviews.
            </p>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="home-final-cta">
          <div className="home-container home-final-cta-inner">
            <div>
              <span className="home-section-eyebrow">
                YOUR NEXT FIND IS WAITING
              </span>
              <h2>Ready to discover something new?</h2>
              <p>
                Explore the collection and find tech that fits your everyday.
              </p>
            </div>

            <Link to="/products" className="home-btn-primary">
              Start exploring <FiArrowRight />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Home;
