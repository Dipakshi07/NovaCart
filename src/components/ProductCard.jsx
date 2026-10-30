import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiHeart,
  FiShoppingCart,
  FiStar,
  FiCheck,
  FiArrowUpRight,
  FiEye,
} from "react-icons/fi";

import { useShop } from "../context/ShopContext";
import "./ProductCard.css";

function ProductCard({ product }) {
  const {
    addToCart,
    toggleWishlist,
    isWishlisted,
    cart = [],
  } = useShop();

  const [added, setAdded] = useState(false);

  if (!product) return null;

  const {
    id,
    name,
    title,
    category = "Technology",
    price = 0,
    originalPrice,
    image,
    rating,
    reviews,
    badge,
    description,
    stock = 10,
  } = product;

  const productName = name || title || "NovaCart Product";

  const productImage =
    image ||
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80";

  const numericPrice = Number(price) || 0;
  const numericOriginalPrice =
    Number(originalPrice) || numericPrice;

  const hasDiscount = numericOriginalPrice > numericPrice;

  const discountPercentage = hasDiscount
    ? Math.round(
        ((numericOriginalPrice - numericPrice) /
          numericOriginalPrice) *
          100
      )
    : 0;

  const productId = id;

  const isAvailable =
    productId !== undefined &&
    productId !== null &&
    productId !== "";

  const wishlisted =
    typeof isWishlisted === "function" &&
    isWishlisted(productId);

  const cartItem = cart.find(
    (item) => String(item.id) === String(productId)
  );

  const quantityInCart =
    Number(cartItem?.quantity) ||
    (cartItem ? 1 : 0);

  const isOutOfStock = Number(stock) <= 0;

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numericPrice);

  const formattedOriginalPrice =
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(numericOriginalPrice);

  const productDetailsPath = `/product/${productId}`;

  const handleAddToCart = () => {
    if (isOutOfStock || !isAvailable) return;

    addToCart(product);

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1500);
  };

  const handleWishlist = () => {
    if (!isAvailable) return;

    toggleWishlist(productId);
  };

  return (
    <article className="nova-product-card">
      {/* Product Image */}
      <div className="product-card-image-wrap">
        <Link
          to={productDetailsPath}
          className="product-card-image-link"
          aria-label={`View ${productName}`}
          tabIndex={isAvailable ? 0 : -1}
        >
          <img
            className="product-card-image"
            src={productImage}
            alt={productName}
            loading="lazy"
          />
        </Link>

        {/* Badge */}
        {badge && (
          <span
            className={`product-card-badge ${
              String(badge)
                .toLowerCase()
                .includes("sale")
                ? "badge-sale"
                : ""
            }`}
          >
            {badge}
          </span>
        )}

        {!badge && hasDiscount && (
          <span className="product-card-badge badge-sale">
            -{discountPercentage}% OFF
          </span>
        )}

        {/* Wishlist */}
        <button
          type="button"
          className={`product-card-wishlist ${
            wishlisted ? "wishlisted" : ""
          }`}
          onClick={handleWishlist}
          aria-label={
            wishlisted
              ? `Remove ${productName} from wishlist`
              : `Add ${productName} to wishlist`
          }
          aria-pressed={Boolean(wishlisted)}
        >
          <FiHeart />
        </button>

        {/* Quick View */}
        <Link
          to={productDetailsPath}
          className="product-card-quick-view"
          aria-label={`View details for ${productName}`}
        >
          <FiEye />
          Quick View
        </Link>

        {/* Out Of Stock */}
        {isOutOfStock && (
          <div className="product-card-out-of-stock">
            Currently unavailable
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="product-card-details">
        {/* Category + Rating */}
        <div className="product-card-category-row">
          <span className="product-card-category">
            {category}
          </span>

          {typeof rating === "number" && (
            <span className="product-card-rating">
              <FiStar />
              {rating.toFixed(1)}

              {typeof reviews === "number" && (
                <span className="product-card-reviews">
                  ({reviews})
                </span>
              )}
            </span>
          )}
        </div>

        {/* Product Title */}
        <h3 className="product-card-title">
          <Link to={productDetailsPath}>
            {productName}
          </Link>
        </h3>

        {/* Description */}
        {description && (
          <p className="product-card-description">
            {description}
          </p>
        )}

        {/* Price */}
        <div className="product-card-price-row">
          <div className="product-card-prices">
            <span className="product-card-price">
              {formattedPrice}
            </span>

            {hasDiscount && (
              <span className="product-card-original-price">
                {formattedOriginalPrice}
              </span>
            )}
          </div>

          {hasDiscount && (
            <span className="product-card-savings">
              Save {discountPercentage}%
            </span>
          )}
        </div>

        {/* Add To Cart */}
        <button
          type="button"
          className={`product-card-add-btn ${
            added ? "product-added" : ""
          }`}
          onClick={handleAddToCart}
          disabled={isOutOfStock || !isAvailable}
        >
          {isOutOfStock ? (
            <>
              <FiShoppingCart />
              Out of Stock
            </>
          ) : added ? (
            <>
              <FiCheck />
              Added to Cart
            </>
          ) : quantityInCart > 0 ? (
            <>
              <FiShoppingCart />
              Add More
            </>
          ) : (
            <>
              <FiShoppingCart />
              Add to Cart
              <FiArrowUpRight className="product-card-btn-arrow" />
            </>
          )}
        </button>
      </div>
    </article>
  );
}

export default ProductCard;