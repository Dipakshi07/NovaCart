import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiTrendingUp, FiZap } from "react-icons/fi";

import ProductCard from "./ProductCard";
import products from "../data/products";
import "./ProductSection.css";

const categories = [
  { label: "All Products", value: "all" },
  { label: "Electronics", value: "electronics" },
  { label: "Accessories", value: "accessories" },
  { label: "Deals", value: "deals" },
];

function ProductSection({
  title = "Products worth discovering.",
  subtitle = "Carefully selected tech. Exceptional everyday experiences.",
  limit = 8,
  showFilters = true,
  showViewAll = true,
  dealsOnly = false,
}) {
  const [activeCategory, setActiveCategory] = useState(
    dealsOnly ? "deals" : "all"
  );

  const filteredProducts = useMemo(() => {
    let result = Array.isArray(products) ? [...products] : [];

    /*
     * DEALS FILTER
     */
    if (dealsOnly || activeCategory === "deals") {
      result = result.filter((product) => {
        const price = Number(product.price) || 0;

        const originalPrice =
          Number(product.originalPrice ?? product.oldPrice) || price;

        return (
          product.dealsOnly === true ||
          product.isDeal === true ||
          originalPrice > price
        );
      });
    }

    /*
     * ELECTRONICS FILTER
     *
     * Smartphones, Laptops, Audio, Wearables and Monitors
     * are treated as electronics.
     */
    else if (activeCategory === "electronics") {
      const electronicsCategories = [
        "smartphones",
        "laptops",
        "audio",
        "wearables",
        "monitors",
      ];

      result = result.filter((product) =>
        electronicsCategories.includes(
          String(product.category || "").trim().toLowerCase()
        )
      );
    }

    /*
     * ACCESSORIES FILTER
     */
    else if (activeCategory === "accessories") {
      result = result.filter(
        (product) =>
          String(product.category || "").trim().toLowerCase() ===
          "accessories"
      );
    }

    return result.slice(0, limit);
  }, [activeCategory, dealsOnly, limit]);

  const sectionTitle = dealsOnly
    ? "Deals you don't want to miss."
    : title;

  const sectionSubtitle = dealsOnly
    ? "Smart picks, standout prices. Grab your favourites while they last."
    : subtitle;

  return (
    <section className="nova-product-section" id="products">
      <div className="product-section-container">

        {/* Section heading */}
        <div className="product-section-header">
          <div className="product-section-heading">
            <span className="product-section-eyebrow">
              <FiTrendingUp />

              {dealsOnly
                ? "LIMITED-TIME OFFERS"
                : "THE NOVACART EDIT"}
            </span>

            <h2 className="product-section-title">
              {sectionTitle}
            </h2>

            <p className="product-section-subtitle">
              {sectionSubtitle}
            </p>
          </div>

          {showViewAll && (
            <Link
              to={dealsOnly ? "/deals" : "/products"}
              className="product-section-view-all"
            >
              View all products
              <FiArrowRight />
            </Link>
          )}
        </div>

        {/* Category filters */}
        {showFilters && !dealsOnly && (
          <div
            className="product-section-filters"
            role="group"
            aria-label="Filter products by category"
          >
            {categories.map((category) => (
              <button
                key={category.value}
                type="button"
                className={`product-section-filter ${
                  activeCategory === category.value ? "active" : ""
                }`}
                onClick={() => setActiveCategory(category.value)}
                aria-pressed={activeCategory === category.value}
              >
                {category.value === "deals" && <FiZap />}

                {category.label}
              </button>
            ))}
          </div>
        )}

        {/* Product grid */}
        {filteredProducts.length > 0 ? (
          <div className="product-section-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="product-section-empty">
            <div className="product-section-empty-icon">
              <FiZap />
            </div>

            <h3>No products found</h3>

            <p>
              Try another category to discover more products.
            </p>

            <button
              type="button"
              onClick={() => setActiveCategory("all")}
            >
              Explore all products
            </button>
          </div>
        )}

        {/* Bottom CTA */}
        {showViewAll && filteredProducts.length > 0 && (
          <div className="product-section-bottom">
            <p>
              Good tech. Great design. One place.
            </p>

            <Link to={dealsOnly ? "/products" : "/deals"}>
              {dealsOnly
                ? "Explore all products"
                : "Explore the deals"}

              <FiArrowRight />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProductSection;