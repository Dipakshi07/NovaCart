
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
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  if (!product) return null;

  const {
    _id,
    id,
    name,
    title,
    category = "Technology",
    price = 0,
    originalPrice,
    oldPrice,
    image,
    rating,
    reviews,
    badge,
    description,
    stock = 10,
  } = product;

  const productName = name || title || "NovaCart Product";

  // Always prefer MongoDB ID.
  const productId = String(_id || id || "");

  // Validate MongoDB ObjectId.
  const isValidMongoId = /^[0-9a-fA-F]{24}$/.test(productId);

  const productDetailsPath = `/product/${productId}`;

  const productImage =
    image ||
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80";

  const numericPrice = Number(price) || 0;

  const numericOriginalPrice =
    Number(originalPrice ?? oldPrice) || numericPrice;

  const hasDiscount = numericOriginalPrice > numericPrice;

  const discountPercentage = hasDiscount
    ? Math.round(
        ((numericOriginalPrice - numericPrice) /
          numericOriginalPrice) *
          100
      )
    : 0;

  const wishlisted =
    isValidMongoId &&
    typeof isWishlisted === "function" &&
    isWishlisted(productId);

  const cartItem = cart.find(
    (item) =>
      String(
        item.product?._id ||
        item.product?.id ||
        item._id ||
        item.id ||
        ""
      ) === productId
  );

  const quantityInCart = Number(cartItem?.quantity) || 0;

  const numericStock = Number(stock);
  const isOutOfStock =
    Number.isFinite(numericStock) && numericStock <= 0;

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numericPrice);

  const formattedOriginalPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numericOriginalPrice);

  // Add to Cart
  const handleAddToCart = async () => {
    if (adding || isOutOfStock) return;

    if (!isValidMongoId) {
      setError("Invalid product ID. Please refresh the shop page.");
      return;
    }

    try {
      setAdding(true);
      setError("");
      setAdded(false);

      await addToCart(
        {
          ...product,
          _id: productId,
          id: productId,
        },
        1
      );

      setAdded(true);

      window.setTimeout(() => {
        setAdded(false);
      }, 1500);
    } catch (err) {
      console.error("Add to cart error:", err);

      setError(
        err.message || "Unable to add product to cart."
      );
    } finally {
      setAdding(false);
    }
  };

  // Wishlist
  const handleWishlist = async () => {
    if (!isValidMongoId) {
      setError("Invalid product ID. Please refresh the shop page.");
      return;
    }

    try {
      setError("");

      await toggleWishlist(productId);
    } catch (err) {
      console.error("Wishlist error:", err);

      setError(
        err.message || "Unable to update wishlist."
      );
    }
  };

  return (
    <article className="nova-product-card">

      {/* Product Image */}
      <div className="product-card-image-wrap">

        {isValidMongoId ? (
          <Link
            to={productDetailsPath}
            className="product-card-image-link"
            aria-label={`View ${productName}`}
          >
            <img
              className="product-card-image"
              src={productImage}
              alt={productName}
              loading="lazy"
            />
          </Link>
        ) : (
          <div className="product-card-image-link">
            <img
              className="product-card-image"
              src={productImage}
              alt={productName}
              loading="lazy"
            />
          </div>
        )}

        {/* Badge */}
        {badge && (
          <span
            className={`product-card-badge ${
              String(badge).toLowerCase().includes("sale")
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
          disabled={!isValidMongoId}
          aria-label={`${
            wishlisted ? "Remove" : "Add"
          } ${productName} ${
            wishlisted ? "from" : "to"
          } wishlist`}
          aria-pressed={Boolean(wishlisted)}
        >
          <FiHeart />
        </button>

        {/* Quick View */}
        {isValidMongoId && (
          <Link
            to={productDetailsPath}
            className="product-card-quick-view"
            aria-label={`View details for ${productName}`}
          >
            <FiEye />
            Quick View
          </Link>
        )}

        {/* Out of Stock */}
        {isOutOfStock && (
          <div className="product-card-out-of-stock">
            Currently unavailable
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="product-card-details">

        {/* Category and Rating */}
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
          {isValidMongoId ? (
            <Link to={productDetailsPath}>
              {productName}
            </Link>
          ) : (
            productName
          )}
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

        {/* Add to Cart */}
        <button
          type="button"
          className={`product-card-add-btn ${
            added ? "product-added" : ""
          }`}
          onClick={handleAddToCart}
          disabled={
            isOutOfStock ||
            !isValidMongoId ||
            adding
          }
        >
          {isOutOfStock ? (
            <>
              <FiShoppingCart />
              Out of Stock
            </>
          ) : adding ? (
            <>
              <FiShoppingCart />
              Adding...
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
              <FiArrowUpRight className="product-card-btn-arrow" />
            </>
          ) : (
            <>
              <FiShoppingCart />
              Add to Cart
              <FiArrowUpRight className="product-card-btn-arrow" />
            </>
          )}
        </button>

        {/* Error */}
        {error && (
          <p
            className="product-card-error"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    </article>
  );
}

export default ProductCard;
