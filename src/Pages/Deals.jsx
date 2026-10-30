
// src/pages/Deals.jsx

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCheck,
  FiClock,
  FiPercent,
  FiSearch,
  FiSliders,
  FiTag,
  FiX,
  FiZap,
} from "react-icons/fi";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import products from "../data/products";

import "./Deals.css";

function getOriginalPrice(product) {
  return (
    Number(product.originalPrice ?? product.oldPrice) ||
    Number(product.price) ||
    0
  );
}

function getDiscount(product) {
  const price = Number(product.price) || 0;
  const originalPrice = getOriginalPrice(product);

  if (originalPrice <= price || originalPrice <= 0) {
    return 0;
  }

  return Math.round(
    ((originalPrice - price) / originalPrice) * 100
  );
}

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);
}

function Deals() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("discount");
  const [minimumDiscount, setMinimumDiscount] = useState(0);
  const [maxPrice, setMaxPrice] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const allProducts = Array.isArray(products) ? products : [];

  // Only products with an actual discount are shown.
  const dealProducts = useMemo(
    () =>
      allProducts.filter(
        (product) => getDiscount(product) > 0
      ),
    [allProducts]
  );

  const maximumAvailablePrice = useMemo(
    () =>
      Math.max(
        1000,
        ...dealProducts.map(
          (product) => Number(product.price) || 0
        )
      ),
    [dealProducts]
  );

  const effectiveMaxPrice =
    maxPrice ?? maximumAvailablePrice;

  // Search, filter and sort products dynamically.
  const filteredDeals = useMemo(() => {
    let result = dealProducts.filter((product) => {
      const price = Number(product.price) || 0;
      const discount = getDiscount(product);

      return (
        discount >= minimumDiscount &&
        price <= effectiveMaxPrice
      );
    });

    const query = searchTerm.trim().toLowerCase();

    if (query) {
      result = result.filter((product) => {
        const searchableText = [
          product.name,
          product.title,
          product.category,
          product.description,
          product.badge,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      });
    }

    // Sort a new array so the source product list stays unchanged.
    result = [...result];

    if (sortBy === "discount") {
      result.sort(
        (a, b) => getDiscount(b) - getDiscount(a)
      );
    } else if (sortBy === "price-low") {
      result.sort(
        (a, b) =>
          (Number(a.price) || 0) -
          (Number(b.price) || 0)
      );
    } else if (sortBy === "price-high") {
      result.sort(
        (a, b) =>
          (Number(b.price) || 0) -
          (Number(a.price) || 0)
      );
    } else if (sortBy === "rating") {
      result.sort(
        (a, b) =>
          (Number(b.rating) || 0) -
          (Number(a.rating) || 0)
      );
    } else if (sortBy === "savings") {
      result.sort(
        (a, b) =>
          (getOriginalPrice(b) - Number(b.price || 0)) -
          (getOriginalPrice(a) - Number(a.price || 0))
      );
    }

    return result;
  }, [
    dealProducts,
    searchTerm,
    sortBy,
    minimumDiscount,
    effectiveMaxPrice,
  ]);

  const totalSavings = dealProducts.reduce(
    (total, product) =>
      total +
      Math.max(
        0,
        getOriginalPrice(product) -
          (Number(product.price) || 0)
      ),
    0
  );

  const bestDiscount = dealProducts.reduce(
    (best, product) =>
      Math.max(best, getDiscount(product)),
    0
  );

  function resetFilters() {
    setSearchTerm("");
    setSortBy("discount");
    setMinimumDiscount(0);
    setMaxPrice(null);
  }

  return (
    <div className="nova-deals-page">
      <Navbar />

      <main>
        {/* Deals hero */}
        <section className="deals-hero">
          <div className="deals-hero-orb deals-orb-one" />
          <div className="deals-hero-orb deals-orb-two" />

          <div className="deals-container deals-hero-inner">
            <div className="deals-breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <span>Deals &amp; Offers</span>
            </div>

            <div className="deals-hero-layout">
              <div className="deals-hero-copy">
                <span className="deals-eyebrow">
                  <FiZap />
                  THE NOVACART DEAL ZONE
                </span>

                <h1>
                  Great tech.
                  <br />
                  <span>Better prices.</span>
                </h1>

                <p>
                  Discover discounted products and get more
                  value from your next tech upgrade.
                </p>

                <a
                  href="#deals-catalog"
                  className="deals-primary-btn"
                >
                  Explore all deals
                  <FiArrowRight />
                </a>

                <div className="deals-trust-note">
                  <FiTag />
                  Prices and savings shown for each product
                </div>
              </div>

              <div className="deals-highlight-card">
                <div className="deals-highlight-icon">
                  <FiPercent />
                </div>

                <span className="deals-highlight-label">
                  BIGGEST CURRENT DISCOUNT
                </span>

                <strong className="deals-highlight-number">
                  {bestDiscount}%
                  <span> OFF</span>
                </strong>

                <p>
                  Shop eligible products at their current
                  listed prices.
                </p>

                <div className="deals-highlight-footer">
                  <FiClock />
                  <span>Browse available offers</span>
                </div>
              </div>
            </div>

            <div className="deals-stats">
              <div className="deals-stat-item">
                <span className="deals-stat-icon">
                  <FiTag />
                </span>

                <div>
                  <strong>{dealProducts.length}</strong>
                  <span>Discounted products</span>
                </div>
              </div>

              <div className="deals-stat-item">
                <span className="deals-stat-icon">
                  <FiPercent />
                </span>

                <div>
                  <strong>{bestDiscount}%</strong>
                  <span>Best listed discount</span>
                </div>
              </div>

              <div className="deals-stat-item">
                <span className="deals-stat-icon">
                  <FiZap />
                </span>

                <div>
                  <strong>{formatPrice(totalSavings)}</strong>
                  <span>Combined listed savings</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Deals catalog */}
        <section
          className="deals-catalog-section"
          id="deals-catalog"
        >
          <div className="deals-container">
            <div className="deals-section-heading">
              <div>
                <span className="deals-section-eyebrow">
                  SAVE ON YOUR NEXT PICK
                </span>

                <h2>Deals worth a closer look.</h2>

                <p>
                  Compare prices, find your favourite and
                  choose what works for you.
                </p>
              </div>

              <button
                type="button"
                className="deals-mobile-filter-btn"
                onClick={() =>
                  setShowFilters((previous) => !previous)
                }
                aria-expanded={showFilters}
              >
                {showFilters ? <FiX /> : <FiSliders />}
                {showFilters ? "Hide filters" : "Filters"}
              </button>
            </div>

            {/* Search and sort */}
            <div className="deals-toolbar">
              <div className="deals-search-box">
                <FiSearch />

                <input
                  type="search"
                  placeholder="Search deals and products..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  aria-label="Search discounted products"
                />

                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    aria-label="Clear search"
                  >
                    <FiX />
                  </button>
                )}
              </div>

              <label className="deals-sort-control">
                <FiSliders />
                <span>Sort by</span>

                <select
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(event.target.value)
                  }
                >
                  <option value="discount">
                    Highest Discount
                  </option>
                  <option value="savings">
                    Biggest Savings
                  </option>
                  <option value="price-low">
                    Price: Low to High
                  </option>
                  <option value="price-high">
                    Price: High to Low
                  </option>
                  <option value="rating">
                    Highest Rated
                  </option>
                </select>
              </label>
            </div>

            <div className="deals-catalog-layout">
              {/* Filters */}
              <aside
                className={`deals-sidebar ${
                  showFilters ? "deals-sidebar-visible" : ""
                }`}
              >
                <div className="deals-sidebar-heading">
                  <h3>Refine deals</h3>

                  <button
                    type="button"
                    onClick={resetFilters}
                  >
                    Reset
                  </button>
                </div>

                <div className="deals-filter-group">
                  <h4>Minimum discount</h4>

                  <div className="deals-discount-options">
                    {[0, 10, 20, 30, 40, 50].map(
                      (discount) => (
                        <button
                          key={discount}
                          type="button"
                          className={
                            minimumDiscount === discount
                              ? "selected"
                              : ""
                          }
                          onClick={() =>
                            setMinimumDiscount(discount)
                          }
                        >
                          {discount === 0
                            ? "Any"
                            : `${discount}%+`}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="deals-filter-divider" />

                <div className="deals-filter-group">
                  <div className="deals-price-heading">
                    <h4>Maximum price</h4>
                    <strong>
                      {formatPrice(effectiveMaxPrice)}
                    </strong>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max={maximumAvailablePrice}
                    step={Math.max(
                      1,
                      Math.ceil(maximumAvailablePrice / 100)
                    )}
                    value={Math.min(
                      effectiveMaxPrice,
                      maximumAvailablePrice
                    )}
                    onChange={(event) =>
                      setMaxPrice(Number(event.target.value))
                    }
                    className="deals-price-range"
                    aria-label="Maximum deal price"
                  />

                  <div className="deals-price-limits">
                    <span>₹0</span>
                    <span>
                      {formatPrice(maximumAvailablePrice)}
                    </span>
                  </div>
                </div>

                <div className="deals-filter-divider" />

                <div className="deals-sidebar-tip">
                  <FiCheck />
                  <p>
                    Discount percentages are calculated from
                    each product's listed original and current
                    prices.
                  </p>
                </div>
              </aside>

              {/* Results */}
              <div className="deals-results">
                <div className="deals-results-header">
                  <p>
                    <strong>{filteredDeals.length}</strong>{" "}
                    {filteredDeals.length === 1
                      ? "deal"
                      : "deals"}{" "}
                    found
                  </p>

                  {(searchTerm ||
                    minimumDiscount > 0 ||
                    effectiveMaxPrice < maximumAvailablePrice) && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="deals-clear-btn"
                    >
                      Clear filters
                      <FiX />
                    </button>
                  )}
                </div>

                {filteredDeals.length > 0 ? (
                  <div className="deals-product-grid">
                    {filteredDeals.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="deals-empty-state">
                    <span className="deals-empty-icon">
                      <FiTag />
                    </span>

                    <h3>
                      {dealProducts.length === 0
                        ? "No discounted products yet"
                        : "No matching deals found"}
                    </h3>

                    <p>
                      {dealProducts.length === 0
                        ? "Add originalPrice or oldPrice greater than price in your products data to display deals here."
                        : "Try lowering your minimum discount, increasing your price limit or searching for another product."}
                    </p>

                    <button
                      type="button"
                      onClick={resetFilters}
                    >
                      Show all deals
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Deals;
