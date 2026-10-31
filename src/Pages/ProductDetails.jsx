
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  FiArrowLeft,
  FiHeart,
  FiMinus,
  FiPlus,
  FiShoppingCart,
  FiStar,
  FiCheck,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import { useShop } from "../context/ShopContext";
import "./ProductDetails.css";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://novacart-backend-1.onrender.com/api"
).replace(/\/$/, "");

function isMongoId(id) {
  return /^[a-f\d]{24}$/i.test(String(id || ""));
}

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    addToCart,
    toggleWishlist,
    isWishlisted,
    cart = [],
  } = useShop();

  // All React hooks are declared before conditional returns.
  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productError, setProductError] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Fetch product from backend.
  useEffect(() => {
    let cancelled = false;

    const fetchProduct = async () => {
      try {
        setLoadingProduct(true);
        setProductError("");
        setProduct(null);

        if (!id) {
          throw new Error("Product ID is missing.");
        }

        if (!isMongoId(id)) {
          throw new Error(
            "Invalid product ID. Please open the product from the Products page."
          );
        }

        const response = await fetch(
          `${API_URL}/products/${encodeURIComponent(id)}`
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.message || `Product request failed (${response.status}).`
          );
        }

        // Support different common backend response formats.
        const fetchedProduct =
          data.product ||
          data.data?.product ||
          data.data ||
          data.result ||
          null;

        if (
          !fetchedProduct ||
          !isMongoId(fetchedProduct._id)
        ) {
          throw new Error(
            data.message ||
              "Product not found or backend returned an invalid product ID."
          );
        }

        if (!cancelled) {
          const mongoId = String(fetchedProduct._id);

          setProduct({
            ...fetchedProduct,
            _id: mongoId,
            id: mongoId,
          });
        }
      } catch (error) {
        console.error("Product details fetch error:", error);

        if (!cancelled) {
          setProduct(null);
          setProductError(
            error.message || "Unable to load product details."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingProduct(false);
        }
      }
    };

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Reset product page state when the URL ID changes.
  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);
    setAdded(false);
    setAddingToCart(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [id]);

  // Loading state.
  if (loadingProduct) {
    return (
      <main className="product-details-page">
        <div className="product-not-found">
          <div className="product-not-found-icon">🛍️</div>

          <h1>Loading Product...</h1>

          <p>
            Please wait while we load the latest product information.
          </p>
        </div>
      </main>
    );
  }

  // Product not found or API error.
  if (!product) {
    return (
      <main className="product-details-page">
        <div className="product-not-found">
          <div className="product-not-found-icon">🛍️</div>

          <h1>Product Not Found</h1>

          <p>
            {productError ||
              "Sorry, we couldn't find the product you're looking for."}
          </p>

          <button
            type="button"
            className="back-to-shop-btn"
            onClick={() => navigate("/products")}
          >
            <FiArrowLeft />
            Back to Products
          </button>
        </div>
      </main>
    );
  }

  // Product information.
  const {
    _id,
    id: productId,
    name,
    title,
    category = "Technology",
    brand,
    price = 0,
    originalPrice,
    oldPrice,
    image,
    images,
    rating,
    reviews,
    badge,
    description,
    stock = 10,
    features,
    specifications,
  } = product;

  const mongoProductId = String(_id || productId || "");

  const productName = name || title || "NovaCart Product";

  const numericPrice = Number(price) || 0;

  const numericOriginalPrice =
    Number(originalPrice || oldPrice) || numericPrice;

  const hasDiscount = numericOriginalPrice > numericPrice;

  const discountPercentage = hasDiscount
    ? Math.round(
        ((numericOriginalPrice - numericPrice) /
          numericOriginalPrice) *
          100
      )
    : 0;

  const numericStock = Math.max(0, Number(stock) || 0);

  const isOutOfStock = numericStock <= 0;

  const wishlisted =
    typeof isWishlisted === "function" &&
    isWishlisted(mongoProductId);

  // IMPORTANT: No useMemo here.
  // This is a normal JavaScript calculation, not a React hook.
  const productImages = [];

  if (Array.isArray(images)) {
    productImages.push(...images.filter(Boolean));
  }

  if (image && !productImages.includes(image)) {
    productImages.unshift(image);
  }

  if (productImages.length === 0) {
    productImages.push(
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85"
    );
  }

  const safeSelectedImage = Math.min(
    selectedImage,
    productImages.length - 1
  );

  const currentImage =
    productImages[safeSelectedImage] || productImages[0];

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

  // Find the current product in cart.
  const cartItem = cart.find((item) => {
    const itemId =
      item._id ||
      item.id ||
      item.product?._id ||
      item.product?.id;

    return String(itemId || "") === mongoProductId;
  });

  const quantityInCart = Number(cartItem?.quantity) || 0;

  // Features.
  const productFeatures = Array.isArray(features)
    ? features
    : [
        "Premium quality product",
        "Designed for everyday use",
        "Reliable performance",
        "Modern and stylish design",
      ];

  // Add to Cart.
  const handleAddToCart = async () => {
    if (
      isOutOfStock ||
      addingToCart ||
      !isMongoId(mongoProductId)
    ) {
      return;
    }

    try {
      setAddingToCart(true);
      setAdded(false);

      await addToCart(
        {
          ...product,
          _id: mongoProductId,
          id: mongoProductId,
        },
        quantity
      );

      setAdded(true);

      window.setTimeout(() => {
        setAdded(false);
      }, 1800);
    } catch (error) {
      console.error("Product details add to cart error:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  // Buy Now.
  const handleBuyNow = async () => {
    if (
      isOutOfStock ||
      addingToCart ||
      !isMongoId(mongoProductId)
    ) {
      return;
    }

    try {
      setAddingToCart(true);

      await addToCart(
        {
          ...product,
          _id: mongoProductId,
          id: mongoProductId,
        },
        quantity
      );

      navigate("/cart");
    } catch (error) {
      console.error("Buy now error:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  // Wishlist.
  const handleWishlist = () => {
    if (!isMongoId(mongoProductId)) return;

    toggleWishlist(mongoProductId);
  };

  // Quantity controls.
  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    setQuantity((current) =>
      Math.min(numericStock || 99, current + 1)
    );
  };

  // Gallery controls.
  const previousImage = () => {
    setSelectedImage((current) =>
      current === 0 ? productImages.length - 1 : current - 1
    );
  };

  const nextImage = () => {
    setSelectedImage((current) =>
      current === productImages.length - 1 ? 0 : current + 1
    );
  };

  return (
    <main className="product-details-page">
      <div className="product-details-container">

        {/* Breadcrumb */}
        <div className="product-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/products">Products</Link>
          <span>/</span>
          <span>{productName}</span>
        </div>

        {/* Back Button */}
        <button
          type="button"
          className="product-back-btn"
          onClick={() => navigate(-1)}
        >
          <FiArrowLeft />
          Back
        </button>

        {/* Main Product Section */}
        <section className="product-main-section">

          {/* LEFT - PRODUCT IMAGES */}
          <div className="product-gallery">

            <div className="product-main-image-wrapper">
              {badge && (
                <span
                  className={`product-details-badge ${
                    String(badge).toLowerCase().includes("sale")
                      ? "sale"
                      : ""
                  }`}
                >
                  {badge}
                </span>
              )}

              {!badge && hasDiscount && (
                <span className="product-details-badge sale">
                  -{discountPercentage}% OFF
                </span>
              )}

              <img
                src={currentImage}
                alt={productName}
                className="product-main-image"
              />

              {productImages.length > 1 && (
                <>
                  <button
                    type="button"
                    className="gallery-arrow gallery-arrow-left"
                    onClick={previousImage}
                    aria-label="Previous image"
                  >
                    <FiChevronLeft />
                  </button>

                  <button
                    type="button"
                    className="gallery-arrow gallery-arrow-right"
                    onClick={nextImage}
                    aria-label="Next image"
                  >
                    <FiChevronRight />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {productImages.length > 1 && (
              <div className="product-thumbnails">
                {productImages.map((productImage, index) => (
                  <button
                    type="button"
                    key={`${productImage}-${index}`}
                    className={`product-thumbnail ${
                      safeSelectedImage === index ? "active" : ""
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={productImage}
                      alt={`${productName} ${index + 1}`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT - PRODUCT INFO */}
          <div className="product-information">

            <div className="product-category">
              {category}
            </div>

            {brand && (
              <div className="product-brand">
                Brand: <strong>{brand}</strong>
              </div>
            )}

            <h1 className="product-details-title">
              {productName}
            </h1>

            {/* Rating */}
            <div className="product-rating-row">
              <div className="product-stars">
                {Array.from({ length: 5 }).map((_, index) => (
                  <FiStar
                    key={index}
                    className={
                      index < Math.round(Number(rating) || 0)
                        ? "star-filled"
                        : ""
                    }
                  />
                ))}
              </div>

              <strong>
                {Number(rating)
                  ? Number(rating).toFixed(1)
                  : "4.5"}
              </strong>

              {typeof reviews === "number" && (
                <span className="review-count">
                  ({reviews} reviews)
                </span>
              )}
            </div>

            {/* Price */}
            <div className="product-details-price-box">
              <span className="product-details-price">
                {formattedPrice}
              </span>

              {hasDiscount && (
                <span className="product-details-original-price">
                  {formattedOriginalPrice}
                </span>
              )}

              {hasDiscount && (
                <span className="product-details-discount">
                  {discountPercentage}% OFF
                </span>
              )}
            </div>

            {/* Description */}
            {description && (
              <div className="product-description">
                <h3>Description</h3>
                <p>{description}</p>
              </div>
            )}

            {/* Features */}
            <div className="product-features">
              <h3>Key Features</h3>

              <ul>
                {productFeatures.map((feature, index) => (
                  <li key={index}>
                    <FiCheck />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stock */}
            <div
              className={`product-stock ${
                isOutOfStock
                  ? "out-of-stock"
                  : numericStock <= 5
                  ? "low-stock"
                  : "in-stock"
              }`}
            >
              {isOutOfStock
                ? "Out of Stock"
                : numericStock <= 5
                ? `Only ${numericStock} left in stock`
                : "In Stock"}
            </div>

            {/* Quantity + Wishlist */}
            {!isOutOfStock && (
              <div className="product-purchase-row">
                <div className="quantity-selector">
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <FiMinus />
                  </button>

                  <span>{quantity}</span>

                  <button
                    type="button"
                    onClick={increaseQuantity}
                    disabled={
                      numericStock > 0 &&
                      quantity >= numericStock
                    }
                    aria-label="Increase quantity"
                  >
                    <FiPlus />
                  </button>
                </div>

                <button
                  type="button"
                  className={`product-wishlist-btn ${
                    wishlisted ? "wishlisted" : ""
                  }`}
                  onClick={handleWishlist}
                >
                  <FiHeart />
                  {wishlisted ? "Wishlisted" : "Add to Wishlist"}
                </button>
              </div>
            )}

            {/* Cart + Buy */}
            <div className="product-action-buttons">
              <button
                type="button"
                className={`product-add-cart-btn ${
                  added ? "added" : ""
                }`}
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart}
              >
                {addingToCart ? (
                  <>
                    <FiRefreshCw />
                    Adding...
                  </>
                ) : added ? (
                  <>
                    <FiCheck />
                    Added to Cart
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
                className="product-buy-now-btn"
                onClick={handleBuyNow}
                disabled={isOutOfStock || addingToCart}
              >
                {addingToCart ? "Processing..." : "Buy Now"}
              </button>
            </div>

            {/* Already in cart */}
            {quantityInCart > 0 && (
              <div className="already-cart-message">
                <FiCheck />

                {quantityInCart}{" "}
                {quantityInCart === 1 ? "item" : "items"} already in your cart
              </div>
            )}

            {/* Benefits */}
            <div className="product-benefits">
              <div className="product-benefit">
                <FiTruck />

                <div>
                  <strong>Fast Delivery</strong>
                  <span>Quick delivery to your doorstep</span>
                </div>
              </div>

              <div className="product-benefit">
                <FiShield />

                <div>
                  <strong>Secure Payment</strong>
                  <span>100% secure checkout</span>
                </div>
              </div>

              <div className="product-benefit">
                <FiRefreshCw />

                <div>
                  <strong>Easy Returns</strong>
                  <span>Hassle-free return policy</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SPECIFICATIONS */}
        {specifications &&
          typeof specifications === "object" &&
          !Array.isArray(specifications) && (
            <section className="product-specifications">
              <h2>Product Specifications</h2>

              <div className="specifications-grid">
                {Object.entries(specifications).map(([key, value]) => (
                  <div className="specification-item" key={key}>
                    <span>{key}</span>
                    <strong>{String(value)}</strong>
                  </div>
                ))}
              </div>
            </section>
          )}

        {/* PRODUCT INFORMATION */}
        <section className="product-bottom-info">
          <div>
            <FiTruck />

            <div>
              <h3>Fast & Reliable Delivery</h3>
              <p>
                Your order will be carefully packed and delivered safely.
              </p>
            </div>
          </div>

          <div>
            <FiShield />

            <div>
              <h3>Secure Shopping</h3>
              <p>
                Your personal and payment information stays protected.
              </p>
            </div>
          </div>

          <div>
            <FiRefreshCw />

            <div>
              <h3>Easy Returns</h3>
              <p>
                Shop confidently with our customer-friendly return policy.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ProductDetails;
