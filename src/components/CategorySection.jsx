
import { Link } from "react-router-dom";
import {
  FiArrowUpRight,
  FiSmartphone,
  FiHeadphones,
  FiTag,
  FiGrid,
} from "react-icons/fi";

import "./CategorySection.css";

const categories = [
  {
    id: 1,
    title: "Electronics",
    subtitle: "Power up your everyday",
    description: "Smartphones, laptops & more",
    count: "Explore tech",
    path: "/electronics",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1000&q=85",
    icon: FiSmartphone,
    className: "category-electronics",
  },
  {
    id: 2,
    title: "Accessories",
    subtitle: "Complete your setup",
    description: "Audio, wearables & essentials",
    count: "Explore accessories",
    path: "/accessories",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85",
    icon: FiHeadphones,
    className: "category-accessories",
  },
  {
    id: 3,
    title: "Exclusive Deals",
    subtitle: "More value, less spend",
    description: "Discover selected offers",
    count: "Shop deals",
    path: "/deals",
    image:
      "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1000&q=85",
    icon: FiTag,
    className: "category-deals",
  },
  {
    id: 4,
    title: "All Products",
    subtitle: "Find your next favourite",
    description: "Explore the full collection",
    count: "Shop everything",
    path: "/products",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=85",
    icon: FiGrid,
    className: "category-all",
  },
];

function CategorySection() {
  return (
    <section className="category-section" aria-labelledby="category-heading">
      <div className="category-section-header">
        <div className="category-heading-content">
          <span className="category-eyebrow">
            <span className="category-eyebrow-dot" />
            EXPLORE NOVACART
          </span>

          <h2 id="category-heading">
            Shop by <span>category.</span>
          </h2>

          <p>
            Your next favourite is closer than you think. Explore collections
            curated around your everyday needs.
          </p>
        </div>

        <Link to="/products" className="category-view-all">
          View all products
          <FiArrowUpRight />
        </Link>
      </div>

      <div className="category-grid">
        {categories.map((category, index) => {
          const Icon = category.icon;

          return (
            <Link
              key={category.id}
              to={category.path}
              className={`category-card ${category.className}`}
              style={{ "--category-index": index }}
              aria-label={`Explore ${category.title}`}
            >
              <img
                className="category-card-image"
                src={category.image}
                alt=""
                loading="lazy"
              />

              <div className="category-card-overlay" />

              <div className="category-card-top">
                <span className="category-icon">
                  <Icon />
                </span>

                <span className="category-arrow">
                  <FiArrowUpRight />
                </span>
              </div>

              <div className="category-card-content">
                <span className="category-card-label">
                  {category.subtitle}
                </span>

                <h3>{category.title}</h3>

                <p>{category.description}</p>

                <span className="category-card-cta">
                  {category.count}
                  <FiArrowUpRight />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="category-bottom-note">
        <span className="category-bottom-line" />
        <p>Good technology. Thoughtfully selected.</p>
        <span className="category-bottom-line" />
      </div>
    </section>
  );
}

export default CategorySection;
