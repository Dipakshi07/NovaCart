
import { useMemo, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiArrowRight,
  FiCheck,
  FiGrid,
  FiList,
  FiSearch,
  FiSliders,
  FiX,
  FiShoppingBag,
  FiTag,
} from "react-icons/fi";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import "./Shop.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "https://novacart-backend-1.onrender.com/api"
).replace(/\/$/, "");

const CATEGORIES = [
  "All Products",
  "Smartphones",
  "Laptops",
  "Audio",
  "Wearables",
  "Monitors",
  "Accessories",
];

function getDiscount(product) {
  const price = Number(product.price) || 0;

  const originalPrice =
    Number(product.originalPrice ?? product.oldPrice) || price;

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

function Shop() {
  const location = useLocation();

  // Products fetched from MongoDB backend.
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState("");

  const initialSearch = useMemo(() => {
    return new URLSearchParams(location.search).get("search") || "";
  }, [location.search]);

  const [searchTerm, setSearchTerm] = useState(initialSearch);

  const [selectedCategory, setSelectedCategory] =
    useState("All Products");

  const [sortBy, setSortBy] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(null);
  const [discountOnly, setDiscountOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  // Fetch products from backend.
  useEffect(() => {
    let active = true;

    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        setProductError("");

        const response = await fetch(`${API_URL}/products`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load products."
          );
        }

        const fetchedProducts = Array.isArray(data.products)
          ? data.products
          : [];

        // Keep MongoDB _id as the product ID.
        const normalizedProducts = fetchedProducts.map(
          (product) => ({
            ...product,
            id: String(product._id),
          })
        );

        if (active) {
          setProducts(normalizedProducts);
        }
      } catch (error) {
        console.error("Products fetch error:", error);

        if (active) {
          setProductError(
            error.message || "Unable to load products."
          );
        }
      } finally {
        if (active) {
          setLoadingProducts(false);
        }
      }
    };

    fetchProducts();

    return () => {
      active = false;
    };
  }, []);

  const allProducts = products;

  // Update search when URL changes.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchTerm(params.get("search") || "");
  }, [location.search]);

  // Find maximum available product price.
  const maximumAvailablePrice = useMemo(() => {
    return Math.max(
      1000,
      ...allProducts.map(
        (product) => Number(product.price) || 0
      )
    );
  }, [allProducts]);

  const effectiveMaxPrice =
    maxPrice ?? maximumAvailablePrice;

  // Category counts.
  const categoryCounts = useMemo(() => {
    return CATEGORIES.reduce((counts, category) => {
      counts[category] =
        category === "All Products"
          ? allProducts.length
          : allProducts.filter(
              (product) =>
                String(product.category || "").toLowerCase() ===
                category.toLowerCase()
            ).length;

      return counts;
    }, {});
  }, [allProducts]);

  // Filter and sort products.
  const filteredProducts = useMemo(() => {
    let result = allProducts.filter((product) => {
      const category = String(
        product.category || ""
      ).toLowerCase();

      const matchesCategory =
        selectedCategory === "All Products" ||
        category === selectedCategory.toLowerCase();

      const matchesPrice =
        (Number(product.price) || 0) <= effectiveMaxPrice;

      const matchesDiscount =
        !discountOnly || getDiscount(product) > 0;

      return (
        matchesCategory &&
        matchesPrice &&
        matchesDiscount
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

    if (sortBy === "price-low") {
      result.sort(
        (a, b) => Number(a.price) - Number(b.price)
      );
    } else if (sortBy === "price-high") {
      result.sort(
        (a, b) => Number(b.price) - Number(a.price)
      );
    } else if (sortBy === "rating") {
      result.sort(
        (a, b) =>
          (Number(b.rating) || 0) -
          (Number(a.rating) || 0)
      );
    } else if (sortBy === "discount") {
      result.sort(
        (a, b) => getDiscount(b) - getDiscount(a)
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
    allProducts,
    selectedCategory,
    effectiveMaxPrice,
    discountOnly,
    searchTerm,
    sortBy,
  ]);

  const discountedCount = useMemo(
    () =>
      allProducts.filter(
        (product) => getDiscount(product) > 0
      ).length,
    [allProducts]
  );

  // Reset filters.
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All Products");
    setSortBy("featured");
    setMaxPrice(null);
    setDiscountOnly(false);
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedCategory !== "All Products" ||
    discountOnly ||
    effectiveMaxPrice < maximumAvailablePrice;

  return (
    <div className="nova-shop-page">
      <Navbar />

      <main>
        {/* SHOP HERO */}
        <section className="shop-hero">
          <div className="shop-hero-glow shop-hero-glow-one" />
          <div className="shop-hero-glow shop-hero-glow-two" />

          <div className="shop-container shop-hero-inner">
            <nav
              className="shop-breadcrumb"
              aria-label="Breadcrumb"
            >
              <Link to="/">Home</Link>
              <span>/</span>
              <span>Shop</span>
            </nav>

            <div className="shop-hero-layout">
              <div className="shop-hero-copy">
                <span className="shop-eyebrow">
                  <FiShoppingBag />
                  THE NOVACART COLLECTION
                </span>

                <h1>
                  Find your next
                  <br />
                  <span>favourite thing.</span>
                </h1>

                <p>
                  Explore our collection of electronics and
                  accessories. Search, compare and discover
                  products that fit your everyday needs.
                </p>

                <a
                  href="#shop-catalog"
                  className="shop-hero-button"
                >
                  Browse collection <FiArrowRight />
                </a>
              </div>

              <div className="shop-hero-card">
                <div className="shop-hero-card-icon">
                  <FiGrid />
                </div>

                <span className="shop-hero-card-label">
                  CURRENT COLLECTION
                </span>

                <strong>{allProducts.length}</strong>

                <p>
                  Products available to explore in the current
                  catalog.
                </p>

                <div className="shop-hero-card-footer">
                  <span>
                    <FiTag /> {discountedCount} discounted
                  </span>
                  <span className="shop-card-status-dot" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CATALOG */}
        <section
          className="shop-catalog-section"
          id="shop-catalog"
        >
          <div className="shop-container">
            <div className="shop-section-heading">
              <div>
                <span className="shop-section-eyebrow">
                  EXPLORE THE COLLECTION
                </span>

                <h2>Shop all products.</h2>

                <p>
                  Find what you need with simple filters and
                  easy sorting.
                </p>
              </div>

              <button
                type="button"
                className="shop-mobile-filter-button"
                onClick={() =>
                  setShowFilters((previous) => !previous)
                }
                aria-expanded={showFilters}
              >
                {showFilters ? <FiX /> : <FiSliders />}
                {showFilters ? "Hide filters" : "Filters"}
              </button>
            </div>

            {/* SEARCH AND SORT */}
            <div className="shop-toolbar">
              <label className="shop-search-box">
                <FiSearch />

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder="Search products, categories..."
                  aria-label="Search all products"
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
              </label>

              <div className="shop-toolbar-right">
                <label className="shop-sort-control">
                  <span>Sort by</span>

                  <select
                    value={sortBy}
                    onChange={(event) =>
                      setSortBy(event.target.value)
                    }
                  >
                    <option value="featured">Featured</option>
                    <option value="name">Name: A to Z</option>
                    <option value="price-low">
                      Price: Low to High
                    </option>
                    <option value="price-high">
                      Price: High to Low
                    </option>
                    <option value="rating">
                      Highest Rated
                    </option>
                    <option value="discount">
                      Biggest Discount
                    </option>
                  </select>
                </label>

                <div
                  className="shop-view-switch"
                  aria-label="Product layout"
                >
                  <button
                    type="button"
                    className={
                      viewMode === "grid" ? "active" : ""
                    }
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid view"
                    aria-pressed={viewMode === "grid"}
                  >
                    <FiGrid />
                  </button>

                  <button
                    type="button"
                    className={
                      viewMode === "list" ? "active" : ""
                    }
                    onClick={() => setViewMode("list")}
                    aria-label="List view"
                    aria-pressed={viewMode === "list"}
                  >
                    <FiList />
                  </button>
                </div>
              </div>
            </div>

            <div className="shop-catalog-layout">
              {/* FILTER SIDEBAR */}
              <aside
                className={`shop-sidebar ${
                  showFilters ? "shop-sidebar-visible" : ""
                }`}
              >
                <div className="shop-sidebar-heading">
                  <h3>Filters</h3>

                  <button
                    type="button"
                    onClick={resetFilters}
                  >
                    Reset all
                  </button>
                </div>

                <div className="shop-filter-group">
                  <h4>Categories</h4>

                  {CATEGORIES.map((category) => (
                    <button
                      type="button"
                      key={category}
                      className={`shop-category-option ${
                        selectedCategory === category
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedCategory(category)
                      }
                      aria-pressed={
                        selectedCategory === category
                      }
                    >
                      <span>{category}</span>

                      <span className="shop-category-count">
                        {categoryCounts[category] || 0}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="shop-filter-divider" />

                <div className="shop-filter-group">
                  <div className="shop-price-heading">
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
                    className="shop-price-range"
                    aria-label="Maximum product price"
                  />

                  <div className="shop-price-limits">
                    <span>₹0</span>
                    <span>
                      {formatPrice(maximumAvailablePrice)}
                    </span>
                  </div>
                </div>

                <div className="shop-filter-divider" />

                <label className="shop-discount-toggle">
                  <input
                    type="checkbox"
                    checked={discountOnly}
                    onChange={(event) =>
                      setDiscountOnly(event.target.checked)
                    }
                  />

                  <span className="shop-custom-checkbox">
                    <FiCheck />
                  </span>

                  <span>Discounted products only</span>
                </label>

                <div className="shop-sidebar-note">
                  <FiCheck />

                  <p>
                    Product prices and discounts are based on
                    the catalog data currently provided by
                    the store.
                  </p>
                </div>
              </aside>

              {/* PRODUCT RESULTS */}
              <div className="shop-results">
                <div className="shop-results-header">
                  <div>
                    <p>
                      Showing{" "}
                      <strong>{filteredProducts.length}</strong>{" "}
                      of <strong>{allProducts.length}</strong>{" "}
                      products
                    </p>

                    {selectedCategory !== "All Products" && (
                      <span className="shop-active-category">
                        {selectedCategory}
                      </span>
                    )}
                  </div>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      className="shop-clear-filters"
                      onClick={resetFilters}
                    >
                      Clear filters <FiX />
                    </button>
                  )}
                </div>

                {loadingProducts ? (
                  <div className="shop-empty-state">
                    <h3>Loading products...</h3>
                    <p>
                      Please wait while we load the latest products.
                    </p>
                  </div>
                ) : productError ? (
                  <div className="shop-empty-state">
                    <h3>Unable to load products</h3>
                    <p>{productError}</p>

                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                    >
                      Try again
                    </button>
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div
                    className={`shop-product-grid ${
                      viewMode === "list"
                        ? "shop-list-view"
                        : ""
                    }`}
                  >
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="shop-empty-state">
                    <span className="shop-empty-icon">
                      <FiSearch />
                    </span>

                    <h3>No products found</h3>

                    <p>
                      We couldn't find products matching your
                      current search and filters. Try another
                      keyword or reset your filters.
                    </p>

                    <button
                      type="button"
                      onClick={resetFilters}
                    >
                      Show all products
                    </button>
                  </div>
                )}

                {!loadingProducts &&
                  !productError &&
                  filteredProducts.length > 0 && (
                    <div className="shop-bottom-note">
                      <span>
                        <FiCheck />
                      </span>

                      You're viewing the products available in
                      the current catalog.
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

export default Shop;
