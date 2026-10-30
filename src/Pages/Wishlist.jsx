
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiHeart,
  FiShoppingCart,
  FiStar,
  FiTrash2,
  FiZap,
  FiCheck,
} from "react-icons/fi";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useShop } from "../context/ShopContext";
import legacyProducts from "../data/products";
import "./Wishlist.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

function formatPrice(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

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

  if (originalPrice <= price || originalPrice <= 0) return 0;

  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

function getProductId(product) {
  return String(product?._id || product?.id || "");
}

function Wishlist() {
  const { wishlist, toggleWishlist, addToCart } = useShop();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [toast, setToast] = useState("");
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    let active = true;

    async function fetchProducts() {
      try {
        setLoading(true);
        setLoadError("");

        const response = await fetch(`${API_URL}/products`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load products.");
        }

        const fetchedProducts = Array.isArray(data.products)
          ? data.products
          : [];

        if (active) {
          setProducts(
            fetchedProducts.map((product) => ({
              ...product,
              id: String(product._id),
            }))
          );
        }
      } catch (error) {
        if (active) {
          setLoadError(error.message || "Unable to load products.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchProducts();

    return () => {
      active = false;
    };
  }, []);

  const wishlistProducts = useMemo(() => {
    if (!Array.isArray(wishlist)) return [];

    return wishlist
      .map((wishlistId) => {
        const savedId = String(wishlistId);

        // First match current MongoDB IDs.
        const directMatch = products.find(
          (product) => getProductId(product) === savedId
        );

        if (directMatch) {
          return {
            ...directMatch,
            wishlistKey: savedId,
          };
        }

        // Backward compatibility for old numeric wishlist IDs.
        const legacyProduct = legacyProducts.find(
          (product) => String(product.id) === savedId
        );

        if (!legacyProduct) return null;

        const matchedBackendProduct = products.find(
          (product) =>
            String(product.name).trim().toLowerCase() ===
            String(legacyProduct.name).trim().toLowerCase()
        );

        return matchedBackendProduct
          ? {
              ...matchedBackendProduct,
              id: String(matchedBackendProduct._id),
              wishlistKey: savedId,
            }
          : null;
      })
      .filter(Boolean);
  }, [wishlist, products]);

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(window.__novaWishlistToast);

    window.__novaWishlistToast = window.setTimeout(() => {
      setToast("");
    }, 2200);
  };

  const handleRemove = (product) => {
    toggleWishlist(product.wishlistKey || product.id);
    showToast(`${product.name} removed from wishlist`);
  };

  const handleAddToCart = async (product) => {
    const productId = getProductId(product);

    if (!/^[a-f\d]{24}$/i.test(productId)) {
      showToast("Invalid product ID. Please refresh the page.");
      return;
    }

    try {
      setAddingId(productId);

      await addToCart(
        {
          ...product,
          id: productId,
          _id: productId,
        },
        1
      );

      showToast(`${product.name} added to cart`);
    } catch (error) {
      showToast(error.message || "Could not add product to cart");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="wishlist-page">
      <Navbar />

      <main className="wishlist-main">
        <section className="wishlist-hero">
          <div className="wishlist-hero-glow wishlist-glow-one" />
          <div className="wishlist-hero-glow wishlist-glow-two" />

          <div className="wishlist-container">
            <div className="wishlist-hero-content">
              <span className="wishlist-eyebrow">
                <FiHeart />
                YOUR COLLECTION
              </span>

              <h1>
                Your
                <span> Wishlist.</span>
              </h1>

              <p>
                Keep the products you love close.
                Add them to your cart whenever you're ready.
              </p>

              <div className="wishlist-hero-stats">
                <div className="wishlist-stat">
                  <strong>{wishlistProducts.length}</strong>
                  <span>
                    {wishlistProducts.length === 1
                      ? "Saved item"
                      : "Saved items"}
                  </span>
                </div>

                <div className="wishlist-stat-divider" />

                <div className="wishlist-stat">
                  <FiZap />
                  <span>Ready to shop</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="wishlist-content">
          <div className="wishlist-container">
            {loading ? (
              <div className="wishlist-empty">
                <h2>Loading your wishlist...</h2>
              </div>
            ) : loadError ? (
              <div className="wishlist-empty">
                <h2>Unable to load products</h2>
                <p>{loadError}</p>
                <button
                  type="button"
                  className="wishlist-shop-button"
                  onClick={() => window.location.reload()}
                >
                  Try again
                </button>
              </div>
            ) : wishlistProducts.length === 0 ? (
              <div className="wishlist-empty">
                <div className="wishlist-empty-icon">
                  <FiHeart />
                </div>

                <span className="wishlist-empty-label">
                  NOTHING SAVED YET
                </span>

                <h2>Your wishlist is waiting.</h2>

                <p>
                  Save products you love and they'll appear here.
                  No rush — your picks stay with you.
                </p>

                <Link to="/products" className="wishlist-shop-button">
                  Explore Products
                  <FiArrowRight />
                </Link>
              </div>
            ) : (
              <>
                <div className="wishlist-section-header">
                  <div>
                    <span className="wishlist-section-label">
                      <FiHeart />
                      SAVED FOR LATER
                    </span>

                    <h2>
                      {wishlistProducts.length}{" "}
                      {wishlistProducts.length === 1
                        ? "product"
                        : "products"}{" "}
                      you love.
                    </h2>
                  </div>

                  <Link
                    to="/products"
                    className="wishlist-continue-shopping"
                  >
                    Continue shopping
                    <FiArrowRight />
                  </Link>
                </div>

                <div className="wishlist-grid">
                  {wishlistProducts.map((product) => {
                    const productId = getProductId(product);
                    const originalPrice = getOriginalPrice(product);
                    const discount = getDiscount(product);
                    const stock = Number(product.stock ?? 20);
                    const isOutOfStock = stock <= 0;

                    return (
                      <article
                        className="wishlist-card"
                        key={productId}
                      >
                        <div className="wishlist-card-image-wrap">
                          <Link
                            to={`/product/${productId}`}
                            className="wishlist-card-image-link"
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="wishlist-card-image"
                              loading="lazy"
                            />
                          </Link>

                          {product.badge && (
                            <span className="wishlist-product-badge">
                              {product.badge}
                            </span>
                          )}

                          {discount > 0 && (
                            <span className="wishlist-discount">
                              -{discount}%
                            </span>
                          )}

                          <button
                            type="button"
                            className="wishlist-remove-button"
                            onClick={() => handleRemove(product)}
                            aria-label={`Remove ${product.name} from wishlist`}
                          >
                            <FiTrash2 />
                          </button>
                        </div>

                        <div className="wishlist-card-body">
                          <div className="wishlist-product-category">
                            {product.category}
                          </div>

                          <Link
                            to={`/product/${productId}`}
                            className="wishlist-product-name"
                          >
                            {product.name}
                          </Link>

                          {product.description && (
                            <p className="wishlist-product-description">
                              {product.description}
                            </p>
                          )}

                          <div className="wishlist-product-rating">
                            <div className="wishlist-stars">
                              <FiStar />
                              <span>{product.rating || "4.8"}</span>
                            </div>

                            <span className="wishlist-reviews">
                              ({product.reviews || 0} reviews)
                            </span>
                          </div>

                          <div className="wishlist-price-row">
                            <span className="wishlist-current-price">
                              {formatPrice(product.price)}
                            </span>

                            {originalPrice > Number(product.price || 0) && (
                              <span className="wishlist-old-price">
                                {formatPrice(originalPrice)}
                              </span>
                            )}
                          </div>

                          <div
                            className={`wishlist-stock ${
                              isOutOfStock
                                ? "out"
                                : stock <= 5
                                ? "low"
                                : ""
                            }`}
                          >
                            <span className="wishlist-stock-dot" />

                            {isOutOfStock
                              ? "Out of stock"
                              : stock <= 5
                              ? `Only ${stock} left`
                              : "In stock"}
                          </div>

                          <div className="wishlist-actions">
                            <button
                              type="button"
                              className={`wishlist-cart-button ${
                                addingId === productId ? "added" : ""
                              }`}
                              disabled={
                                isOutOfStock || addingId === productId
                              }
                              onClick={() => handleAddToCart(product)}
                            >
                              {addingId === productId ? (
                                <>
                                  <FiCheck />
                                  Adding...
                                </>
                              ) : (
                                <>
                                  <FiShoppingCart />
                                  Add to Cart
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              className="wishlist-heart-button"
                              onClick={() => handleRemove(product)}
                              aria-label={`Remove ${product.name}`}
                            >
                              <FiHeart />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <div className="wishlist-bottom-cta">
                  <div>
                    <span>
                      <FiZap />
                      FIND YOUR NEXT FAVOURITE
                    </span>

                    <h3>Still looking around?</h3>

                    <p>
                      Explore more premium tech picked specially
                      for your everyday needs.
                    </p>
                  </div>

                  <Link to="/products" className="wishlist-cta-button">
                    Explore Products
                    <FiArrowRight />
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {toast && (
        <div className="wishlist-toast">
          <span className="wishlist-toast-icon">
            <FiCheck />
          </span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

export default Wishlist;
