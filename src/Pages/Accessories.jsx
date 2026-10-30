
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCheck,
  FiFilter,
  FiSearch,
  FiSliders,
  FiX,
} from "react-icons/fi";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import products from "../data/products";
import "./Accessories.css";

const accessoryCategories = [
  "All Accessories",
  "Audio",
  "Wearables",
  "Mobile Accessories",
  "Computer Accessories",
  "Other",
];

function getAccessoryGroup(product) {
  const category = String(product.category || "").toLowerCase();
  const name = String(product.name || product.title || "").toLowerCase();
  const description = String(product.description || "").toLowerCase();
  const text = `${name} ${description}`;

  // Keep category checks based on product data, not display labels alone.
  if (
    category.includes("accessor") &&
    (text.includes("headphone") ||
      text.includes("earbud") ||
      text.includes("speaker") ||
      text.includes("audio"))
  ) {
    return "Audio";
  }

  if (
    text.includes("watch") ||
    text.includes("fitness band") ||
    text.includes("wearable")
  ) {
    return "Wearables";
  }

  if (
    text.includes("charger") ||
    text.includes("power bank") ||
    text.includes("phone case") ||
    text.includes("mobile cover") ||
    text.includes("cable")
  ) {
    return "Mobile Accessories";
  }

  if (
    text.includes("keyboard") ||
    text.includes("mouse") ||
    text.includes("laptop stand") ||
    text.includes("webcam")
  ) {
    return "Computer Accessories";
  }

  if (category.includes("accessor")) {
    return "Other";
  }

  return null;
}

function Accessories() {
  const [activeCategory, setActiveCategory] = useState("All Accessories");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(100000);
  const [discountOnly, setDiscountOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const accessoryProducts = useMemo(() => {
    return (Array.isArray(products) ? products : []).filter(
      (product) => getAccessoryGroup(product) !== null
    );
  }, []);

  const maximumAvailablePrice = useMemo(() => {
    const prices = accessoryProducts.map(
      (product) => Number(product.price) || 0
    );

    return Math.max(1000, ...prices);
  }, [accessoryProducts]);

  const visibleProducts = useMemo(() => {
    let result = [...accessoryProducts];

    if (activeCategory !== "All Accessories") {
      result = result.filter(
        (product) => getAccessoryGroup(product) === activeCategory
      );
    }

    const query = searchTerm.trim().toLowerCase();

    if (query) {
      result = result.filter((product) => {
        const searchableText = [
          product.name,
          product.title,
          product.category,
          product.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      });
    }

    result = result.filter(
      (product) => (Number(product.price) || 0) <= maxPrice
    );

    if (discountOnly) {
      result = result.filter(
        (product) =>
          (Number(product.originalPrice) || 0) >
          (Number(product.price) || 0)
      );
    }

    if (sortBy === "price-low") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price-high") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === "rating") {
      result.sort(
        (a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0)
      );
    } else if (sortBy === "name") {
      result.sort((a, b) =>
        String(a.name || a.title || "").localeCompare(
          String(b.name || b.title || "")
        )
      );
    }

    return result;
  }, [
    accessoryProducts,
    activeCategory,
    searchTerm,
    sortBy,
    maxPrice,
    discountOnly,
  ]);

  const resetFilters = () => {
    setActiveCategory("All Accessories");
    setSearchTerm("");
    setSortBy("featured");
    setMaxPrice(maximumAvailablePrice);
    setDiscountOnly(false);
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <div className="nova-accessories-page">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="accessories-hero">
          <div className="accessories-hero-glow accessories-glow-one" />
          <div className="accessories-hero-glow accessories-glow-two" />

          <div className="accessories-container accessories-hero-content">
            <div className="accessories-breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <span>Accessories</span>
            </div>

            <span className="accessories-eyebrow">
              THE PERFECT ADD-ONS
            </span>

            <h1>
              Small upgrades.
              <br />
              <span>Big difference.</span>
            </h1>

            <p>
              Discover everyday essentials and smart accessories
              that make your tech work better for you.
            </p>

            <a href="#accessories-catalog" className="accessories-hero-btn">
              Explore accessories
              <FiArrowRight />
            </a>

            <div className="accessories-hero-stats">
              <div>
                <strong>{accessoryProducts.length}+</strong>
                <span>Products in collection</span>
              </div>

              <span className="accessories-stat-divider" />

              <div>
                <strong>Easy</strong>
                <span>Browsing and filtering</span>
              </div>
            </div>
          </div>
        </section>

        {/* Catalog */}
        <section
          className="accessories-catalog-section"
          id="accessories-catalog"
        >
          <div className="accessories-container">
            <div className="accessories-catalog-heading">
              <div>
                <span className="accessories-section-eyebrow">
                  THE ACCESSORIES EDIT
                </span>

                <h2>Find your next favourite.</h2>

                <p>
                  Explore the collection and find the right fit for your setup.
                </p>
              </div>

              <button
                type="button"
                className={`accessories-mobile-filter ${
                  showFilters ? "filter-open" : ""
                }`}
                onClick={() => setShowFilters((previous) => !previous)}
                aria-expanded={showFilters}
              >
                {showFilters ? <FiX /> : <FiFilter />}
                {showFilters ? "Hide filters" : "Filters"}
              </button>
            </div>

            <div className="accessories-toolbar">
              <div className="accessories-search">
                <FiSearch />

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search accessories..."
                  aria-label="Search accessories"
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

              <label className="accessories-sort">
                <FiSliders />

                <span>Sort by</span>

                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="name">Name: A–Z</option>
                </select>
              </label>
            </div>

            <div className="accessories-layout">
              {/* Sidebar filters */}
              <aside
                className={`accessories-sidebar ${
                  showFilters ? "sidebar-visible" : ""
                }`}
              >
                <div className="accessories-sidebar-heading">
                  <h3>Filters</h3>

                  <button type="button" onClick={resetFilters}>
                    Reset
                  </button>
                </div>

                <div className="accessories-filter-group">
                  <h4>Categories</h4>

                  {accessoryCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      className={`accessories-category-option ${
                        activeCategory === category ? "selected" : ""
                      }`}
                      onClick={() => setActiveCategory(category)}
                    >
                      <span>{category}</span>

                      {activeCategory === category && <FiCheck />}
                    </button>
                  ))}
                </div>

                <div className="accessories-filter-divider" />

                <div className="accessories-filter-group">
                  <div className="accessories-price-heading">
                    <h4>Maximum price</h4>
                    <span>{formatPrice(maxPrice)}</span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max={maximumAvailablePrice}
                    step={Math.max(
                      1,
                      Math.ceil(maximumAvailablePrice / 100)
                    )}
                    value={Math.min(maxPrice, maximumAvailablePrice)}
                    onChange={(event) =>
                      setMaxPrice(Number(event.target.value))
                    }
                    className="accessories-price-range"
                    aria-label="Maximum price"
                  />

                  <div className="accessories-price-limits">
                    <span>₹0</span>
                    <span>{formatPrice(maximumAvailablePrice)}</span>
                  </div>
                </div>

                <div className="accessories-filter-divider" />

                <label className="accessories-discount-toggle">
                  <input
                    type="checkbox"
                    checked={discountOnly}
                    onChange={(event) =>
                      setDiscountOnly(event.target.checked)
                    }
                  />

                  <span className="accessories-custom-checkbox">
                    <FiCheck />
                  </span>

                  <span>Discounted products only</span>
                </label>
              </aside>

              {/* Product results */}
              <div className="accessories-results">
                <div className="accessories-results-header">
                  <p>
                    Showing <strong>{visibleProducts.length}</strong>{" "}
                    {visibleProducts.length === 1 ? "product" : "products"}
                  </p>

                  {(searchTerm ||
                    activeCategory !== "All Accessories" ||
                    discountOnly ||
                    maxPrice < maximumAvailablePrice) && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="accessories-clear-filters"
                    >
                      Clear all
                      <FiX />
                    </button>
                  )}
                </div>

                {visibleProducts.length > 0 ? (
                  <div className="accessories-product-grid">
                    {visibleProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="accessories-empty-state">
                    <div className="accessories-empty-icon">
                      <FiSearch />
                    </div>

                    <h3>No matching accessories</h3>

                    <p>
                      Try a different search term or adjust your filters.
                    </p>

                    <button
                      type="button"
                      onClick={resetFilters}
                    >
                      Show all accessories
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

export default Accessories;
