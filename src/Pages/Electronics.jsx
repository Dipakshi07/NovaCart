
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCheck,
  FiCpu,
  FiHeadphones,
  FiMonitor,
  FiSearch,
  FiSmartphone,
  FiSliders,
  FiTag,
  FiX,
  FiZap,
} from "react-icons/fi";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import products from "../data/products";
import "./Electronics.css";

const CATEGORY_OPTIONS = [
  "All Electronics",
  "Smartphones",
  "Laptops",
  "Audio",
  "Accessories",
  "Other Electronics",
];

function getDiscount(product) {
  const price = Number(product.price) || 0;
  const originalPrice = Number(product.originalPrice) || price;

  if (originalPrice <= price || originalPrice <= 0) return 0;

  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

function getProductCategory(product) {
  const category = String(product.category || "").toLowerCase();
  const text = `${product.name || product.title || ""} ${
    product.description || ""
  }`.toLowerCase();

  if (
    category === "electronics" ||
    category.includes("electronic")
  ) {
    if (/phone|smartphone|iphone|mobile|galaxy/.test(text)) {
      return "Smartphones";
    }

    if (/laptop|notebook|macbook|chromebook/.test(text)) {
      return "Laptops";
    }

    if (/headphone|earbud|earphone|speaker|audio|headset/.test(text)) {
      return "Audio";
    }

    if (/keyboard|mouse|charger|cable|adapter|stand|power bank/.test(text)) {
      return "Accessories";
    }

    return "Other Electronics";
  }

  return null;
}

function Electronics() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Electronics");
  const [sortBy, setSortBy] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(null);
  const [discountOnly, setDiscountOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const allProducts = Array.isArray(products) ? products : [];

  const electronicsProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const category = String(product.category || "").toLowerCase();

      return (
        category === "electronics" ||
        category.includes("electronic") ||
        getProductCategory(product) !== null
      );
    });
  }, [allProducts]);

  const maximumAvailablePrice = useMemo(() => {
    return Math.max(
      1000,
      ...electronicsProducts.map((product) => Number(product.price) || 0)
    );
  }, [electronicsProducts]);

  const effectiveMaxPrice = maxPrice ?? maximumAvailablePrice;

  const categoryCounts = useMemo(() => {
    const counts = { "All Electronics": electronicsProducts.length };

    CATEGORY_OPTIONS.slice(1).forEach((category) => {
      counts[category] = electronicsProducts.filter(
        (product) => getProductCategory(product) === category
      ).length;
    });

    return counts;
  }, [electronicsProducts]);

  const filteredProducts = useMemo(() => {
    let result = electronicsProducts.filter((product) => {
      const price = Number(product.price) || 0;
      const matchesCategory =
        selectedCategory === "All Electronics" ||
        getProductCategory(product) === selectedCategory;

      const matchesPrice = price <= effectiveMaxPrice;
      const matchesDiscount = !discountOnly || getDiscount(product) > 0;

      return matchesCategory && matchesPrice && matchesDiscount;
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

    if (sortBy === "price-low") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price-high") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === "rating") {
      result.sort(
        (a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0)
      );
    } else if (sortBy === "discount") {
      result.sort((a, b) => getDiscount(b) - getDiscount(a));
    }

    return result;
  }, [
    electronicsProducts,
    selectedCategory,
    searchTerm,
    sortBy,
    effectiveMaxPrice,
    discountOnly,
  ]);

  const discountedCount = electronicsProducts.filter(
    (product) => getDiscount(product) > 0
  ).length;

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(price) || 0);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All Electronics");
    setSortBy("featured");
    setMaxPrice(maximumAvailablePrice);
    setDiscountOnly(false);
  };

  return (
    <div className="nova-electronics-page">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="electronics-hero">
          <div className="electronics-hero-orb electronics-orb-one" />
          <div className="electronics-hero-orb electronics-orb-two" />

          <div className="electronics-container electronics-hero-inner">
            <nav className="electronics-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <span>Electronics</span>
            </nav>

            <div className="electronics-hero-layout">
              <div className="electronics-hero-copy">
                <span className="electronics-eyebrow">
                  <FiZap />
                  DISCOVER WHAT'S NEXT
                </span>

                <h1>
                  Technology
                  <br />
                  <span>that moves you.</span>
                </h1>

                <p>
                  Explore everyday tech, smart devices and electronics
                  designed to fit your lifestyle — all in one place.
                </p>

                <a
                  href="#electronics-catalog"
                  className="electronics-primary-btn"
                >
                  Explore electronics
                  <FiArrowRight />
                </a>

                <div className="electronics-hero-note">
                  <FiCheck />
                  Browse products and compare listed prices
                </div>
              </div>

              <div className="electronics-visual">
                <div className="electronics-visual-glow" />

                <div className="electronics-visual-card electronics-visual-phone">
                  <FiSmartphone />
                  <span>Smart devices</span>
                </div>

                <div className="electronics-visual-card electronics-visual-audio">
                  <FiHeadphones />
                  <span>Audio gear</span>
                </div>

                <div className="electronics-visual-card electronics-visual-computer">
                  <FiMonitor />
                  <span>Computing</span>
                </div>

                <div className="electronics-visual-center">
                  <FiCpu />
                  <span>NOVA</span>
                </div>
              </div>
            </div>

            <div className="electronics-stats">
              <div className="electronics-stat">
                <span className="electronics-stat-icon">
                  <FiCpu />
                </span>
                <div>
                  <strong>{electronicsProducts.length}+</strong>
                  <span>Electronics products</span>
                </div>
              </div>

              <div className="electronics-stat">
                <span className="electronics-stat-icon">
                  <FiTag />
                </span>
                <div>
                  <strong>{discountedCount}</strong>
                  <span>Discounted items</span>
                </div>
              </div>

              <div className="electronics-stat">
                <span className="electronics-stat-icon">
                  <FiSmartphone />
                </span>
                <div>
                  <strong>{CATEGORY_OPTIONS.length - 1}</strong>
                  <span>Browse categories</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Catalog */}
        <section
          className="electronics-catalog-section"
          id="electronics-catalog"
        >
          <div className="electronics-container">
            <div className="electronics-section-heading">
              <div>
                <span className="electronics-section-eyebrow">
                  FIND YOUR NEXT UPGRADE
                </span>

                <h2>Explore electronics.</h2>

                <p>
                  Search products, compare prices and discover your next
                  favourite device.
                </p>
              </div>

              <button
                type="button"
                className="electronics-mobile-filter-btn"
                onClick={() => setShowFilters((previous) => !previous)}
                aria-expanded={showFilters}
              >
                {showFilters ? <FiX /> : <FiSliders />}
                {showFilters ? "Hide filters" : "Filters"}
              </button>
            </div>

            <div className="electronics-toolbar">
              <div className="electronics-search">
                <FiSearch />

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search phones, audio, laptops..."
                  aria-label="Search electronics"
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

              <label className="electronics-sort">
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
                  <option value="discount">Biggest Discount</option>
                </select>
              </label>
            </div>

            <div className="electronics-layout">
              {/* Sidebar filters */}
              <aside
                className={`electronics-sidebar ${
                  showFilters ? "electronics-sidebar-visible" : ""
                }`}
              >
                <div className="electronics-sidebar-heading">
                  <h3>Filters</h3>

                  <button type="button" onClick={resetFilters}>
                    Reset all
                  </button>
                </div>

                <div className="electronics-filter-group">
                  <h4>Categories</h4>

                  {CATEGORY_OPTIONS.map((category) => (
                    <button
                      key={category}
                      type="button"
                      className={`electronics-category-option ${
                        selectedCategory === category ? "selected" : ""
                      }`}
                      onClick={() => setSelectedCategory(category)}
                      aria-pressed={selectedCategory === category}
                    >
                      <span>{category}</span>
                      <span className="electronics-category-count">
                        {categoryCounts[category] || 0}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="electronics-filter-divider" />

                <div className="electronics-filter-group">
                  <div className="electronics-price-heading">
                    <h4>Maximum price</h4>
                    <strong>{formatPrice(effectiveMaxPrice)}</strong>
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
                    className="electronics-price-range"
                    aria-label="Maximum electronics price"
                  />

                  <div className="electronics-price-limits">
                    <span>₹0</span>
                    <span>{formatPrice(maximumAvailablePrice)}</span>
                  </div>
                </div>

                <div className="electronics-filter-divider" />

                <label className="electronics-discount-toggle">
                  <input
                    type="checkbox"
                    checked={discountOnly}
                    onChange={(event) =>
                      setDiscountOnly(event.target.checked)
                    }
                  />

                  <span className="electronics-checkbox">
                    <FiCheck />
                  </span>

                  <span>Show discounted products only</span>
                </label>
              </aside>

              {/* Product results */}
              <div className="electronics-results">
                <div className="electronics-results-header">
                  <p>
                    Showing <strong>{filteredProducts.length}</strong>{" "}
                    {filteredProducts.length === 1 ? "product" : "products"}
                  </p>

                  {(searchTerm ||
                    selectedCategory !== "All Electronics" ||
                    discountOnly ||
                    effectiveMaxPrice < maximumAvailablePrice) && (
                    <button
                      type="button"
                      className="electronics-clear-btn"
                      onClick={resetFilters}
                    >
                      Clear filters
                      <FiX />
                    </button>
                  )}
                </div>

                {filteredProducts.length > 0 ? (
                  <div className="electronics-product-grid">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="electronics-empty-state">
                    <span className="electronics-empty-icon">
                      <FiSearch />
                    </span>

                    <h3>No electronics found</h3>

                    <p>
                      Try another search, choose a different category
                      or reset your filters to see all available products.
                    </p>

                    <button type="button" onClick={resetFilters}>
                      Show all electronics
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

export default Electronics;
