
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiTrash2,
  FiX,
  FiShield,
  FiTruck,
  FiCreditCard,
} from "react-icons/fi";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useShop } from "../context/ShopContext";
import "./Cart.css";

const API_URL =
  import.meta.env.VITE_API_URL || "https://novacart-backend-1.onrender.com/api";

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);
}

function getProductId(item) {
  return item?._id || item?.id || item?.product?._id;
}

function getProductName(item) {
  return item?.name || item?.title || item?.product?.name || "Product";
}

function getProductImage(item) {
  return (
    item?.image ||
    item?.product?.image ||
    "https://placehold.co/400x400?text=Product"
  );
}

function getProductPrice(item) {
  return Number(item?.price ?? item?.product?.price) || 0;
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

function Cart() {
  const navigate = useNavigate();

  const {
    cart,
    cartCount,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartLoading,
    fetchCart,
  } = useShop();

  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processingProduct, setProcessingProduct] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [customer, setCustomer] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
  });

  const cartItems = Array.isArray(cart) ? cart : [];

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      return (
        total +
        getProductPrice(item) * (Number(item.quantity) || 1)
      );
    }, 0);
  }, [cartItems]);

  const totalAmount = subtotal;

  const handleCustomerChange = (event) => {
    const { name, value } = event.target;

    setCustomer((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Please login before continuing.");
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message || `Request failed (${response.status})`
      );
    }

    return data;
  };

  const refreshCart = async () => {
    if (typeof fetchCart === "function") {
      await fetchCart();
    }
  };

  const handleQuantityChange = async (item, quantity) => {
    const productId = getProductId(item);

    if (!productId || quantity < 1) return;

    try {
      setError("");
      setProcessingProduct(productId);

      await updateQuantity(productId, quantity);
    } catch (err) {
      setError(err.message || "Unable to update quantity.");
    } finally {
      setProcessingProduct(null);
    }
  };

  const handleRemoveItem = async (item) => {
    const productId = getProductId(item);

    if (!productId) return;

    try {
      setError("");
      setProcessingProduct(productId);

      await removeFromCart(productId);
    } catch (err) {
      setError(err.message || "Unable to remove product.");
    } finally {
      setProcessingProduct(null);
    }
  };

  const handleClearCart = async () => {
    if (
      !window.confirm(
        "Are you sure you want to remove all products from your cart?"
      )
    ) {
      return;
    }

    try {
      setError("");
      setLoading(true);

      await clearCart();
    } catch (err) {
      setError(err.message || "Unable to clear cart.");
    } finally {
      setLoading(false);
    }
  };

  const validateCheckout = () => {
    if (
      !customer.fullName.trim() ||
      !customer.phone.trim() ||
      !customer.address.trim() ||
      !customer.city.trim() ||
      !customer.state.trim() ||
      !customer.postalCode.trim()
    ) {
      return "Please fill in all delivery details.";
    }

    if (!/^[0-9]{10}$/.test(customer.phone.trim())) {
      return "Please enter a valid 10-digit mobile number.";
    }

    if (!/^[0-9]{6}$/.test(customer.postalCode.trim())) {
      return "Please enter a valid 6-digit PIN code.";
    }

    return "";
  };

  const getShippingAddress = () => ({
    fullName: customer.fullName.trim(),
    phone: customer.phone.trim(),
    address: customer.address.trim(),
    city: customer.city.trim(),
    state: customer.state.trim(),
    postalCode: customer.postalCode.trim(),
    country: "India",
  });

  const resetCheckout = () => {
    setCustomer({
      fullName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
    });

    setPaymentMethod("COD");
    setShowCheckout(false);
  };

  // CASH ON DELIVERY
  const placeCODOrder = async () => {
    const data = await apiRequest("/orders", {
      method: "POST",
      body: JSON.stringify({
        shippingAddress: getShippingAddress(),
        paymentMethod: "COD",
      }),
    });

    await refreshCart();

    const orderId = data.order?._id || data.order?.id || "";

    setSuccess(
      orderId
        ? `COD order placed successfully! Order ID: ${orderId}`
        : "Your COD order has been placed successfully!"
    );

    resetCheckout();
  };

  // RAZORPAY ONLINE PAYMENT
  const placeOnlineOrder = async () => {
    const sdkLoaded = await loadRazorpayScript();

    if (!sdkLoaded) {
      throw new Error(
        "Unable to load Razorpay checkout. Please check your internet connection."
      );
    }

    const orderData = await apiRequest("/payments/create-order", {
      method: "POST",
      body: JSON.stringify({
        shippingAddress: getShippingAddress(),
      }),
    });

    if (
      !orderData.razorpayOrderId ||
      !orderData.orderId ||
      !orderData.key
    ) {
      throw new Error("Invalid payment order response from server.");
    }

    await refreshCart();

    const options = {
      key: orderData.key,
      amount: orderData.amount,
      currency: orderData.currency || "INR",
      name: "NovaCart",
      description: "NovaCart Purchase",
      order_id: orderData.razorpayOrderId,

      handler: async function (paymentResponse) {
        try {
          setLoading(true);
          setError("");

          await apiRequest("/payments/verify", {
            method: "POST",
            body: JSON.stringify({
              razorpay_order_id:
                paymentResponse.razorpay_order_id,
              razorpay_payment_id:
                paymentResponse.razorpay_payment_id,
              razorpay_signature:
                paymentResponse.razorpay_signature,
            }),
          });

          setSuccess(
            `Payment successful! Your NovaCart order is confirmed. Order ID: ${orderData.orderId}`
          );

          setShowCheckout(false);

          setCustomer({
            fullName: "",
            phone: "",
            address: "",
            city: "",
            state: "",
            postalCode: "",
          });

          await refreshCart();
        } catch (err) {
          setError(
            err.message ||
              "Payment verification could not be completed. Please contact support with your payment ID."
          );
        } finally {
          setLoading(false);
        }
      },

      prefill: {
        name: customer.fullName.trim(),
        contact: customer.phone.trim(),
      },

      notes: {
        orderId: String(orderData.orderId),
      },

      theme: {
        color: "#6558e8",
      },

      modal: {
        ondismiss: function () {
          setError(
            "Payment window closed. Your payment status may still be pending. Please check My Orders before trying again."
          );
        },
      },
    };

    const razorpayInstance = new window.Razorpay(options);

    razorpayInstance.on("payment.failed", function (response) {
      setError(
        response.error?.description ||
          "Payment failed. Please check your payment status in My Orders."
      );
    });

    razorpayInstance.open();
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateCheckout();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!localStorage.getItem("token")) {
      setError("Please login before placing your order.");

      navigate("/login", {
        state: { from: "/cart" },
      });

      return;
    }

    try {
      setLoading(true);

      if (paymentMethod === "COD") {
        await placeCODOrder();
      } else {
        await placeOnlineOrder();
      }
    } catch (err) {
      setError(
        err.message || "Something went wrong while placing your order."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nova-cart-page">
      <Navbar />

      <main className="cart-main">
        <div className="cart-container">

          <div className="cart-page-header">
            <div>
              <span className="cart-eyebrow">
                YOUR SHOPPING BAG
              </span>

              <h1>My Cart</h1>

              <p>{cartCount || 0} items in your shopping bag</p>
            </div>

            <Link to="/shop" className="cart-continue-shopping">
              <FiArrowLeft />
              Continue Shopping
            </Link>
          </div>

          {success && (
            <div className="cart-success-message">
              <FiCheck />
              <span>{success}</span>

              <button
                type="button"
                onClick={() => setSuccess("")}
                aria-label="Close success message"
              >
                <FiX />
              </button>
            </div>
          )}

          {error && (
            <div className="cart-error-message">
              <span>{error}</span>

              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Close error message"
              >
                <FiX />
              </button>
            </div>
          )}

          {cartLoading && (
            <div className="cart-loading">
              <span className="cart-spinner" />
              Loading your cart...
            </div>
          )}

          {!cartLoading && cartItems.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">
                <FiShoppingBag />
              </div>

              <h2>Your cart is empty</h2>

              <p>
                Looks like you haven't added anything to your
                shopping bag yet.
              </p>

              {/* Navigate to Home Featured Products */}
              <Link
                to="/#home-featured-products"
                className="cart-shop-button"
              >
                Explore Products <FiArrowRight />
              </Link>

              {success && (
                <Link to="/my-orders" className="cart-shop-button">
                  View My Orders
                </Link>
              )}
            </div>
          ) : (
            !cartLoading && (
              <div className="cart-layout">

                <section className="cart-items-section">
                  <div className="cart-items-heading">
                    <h2>Shopping Items</h2>

                    <button
                      type="button"
                      onClick={handleClearCart}
                      disabled={loading}
                    >
                      <FiTrash2 />
                      Clear Cart
                    </button>
                  </div>

                  <div className="cart-items-list">
                    {cartItems.map((item) => {
                      const productId = getProductId(item);
                      const price = getProductPrice(item);
                      const quantity = Number(item.quantity) || 1;

                      const isProcessing =
                        processingProduct === productId;

                      return (
                        <article
                          className="cart-item"
                          key={productId}
                        >
                          <Link
                            to={`/product/${productId}`}
                            className="cart-item-image"
                          >
                            <img
                              src={getProductImage(item)}
                              alt={getProductName(item)}
                            />
                          </Link>

                          <div className="cart-item-details">
                            <span className="cart-item-category">
                              {item.category ||
                                item.product?.category ||
                                "Product"}
                            </span>

                            <Link
                              to={`/product/${productId}`}
                              className="cart-item-name"
                            >
                              {getProductName(item)}
                            </Link>

                            <div className="cart-item-price">
                              {formatPrice(price)}
                            </div>

                            <div className="cart-item-controls">
                              <div className="cart-quantity-control">
                                <button
                                  type="button"
                                  disabled={
                                    quantity <= 1 || isProcessing
                                  }
                                  onClick={() =>
                                    handleQuantityChange(
                                      item,
                                      quantity - 1
                                    )
                                  }
                                  aria-label="Decrease quantity"
                                >
                                  <FiMinus />
                                </button>

                                <span>{quantity}</span>

                                <button
                                  type="button"
                                  disabled={isProcessing}
                                  onClick={() =>
                                    handleQuantityChange(
                                      item,
                                      quantity + 1
                                    )
                                  }
                                  aria-label="Increase quantity"
                                >
                                  <FiPlus />
                                </button>
                              </div>

                              <button
                                type="button"
                                className="cart-remove-button"
                                disabled={isProcessing}
                                onClick={() =>
                                  handleRemoveItem(item)
                                }
                              >
                                <FiTrash2 />
                                Remove
                              </button>
                            </div>
                          </div>

                          <div className="cart-item-total">
                            <span>Subtotal</span>
                            <strong>
                              {formatPrice(price * quantity)}
                            </strong>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  <div className="cart-trust-row">
                    <div>
                      <FiShield />
                      <span>Secure Shopping</span>
                    </div>

                    <div>
                      <FiTruck />
                      <span>Reliable Delivery</span>
                    </div>

                    <div>
                      <FiCheck />
                      <span>Quality Products</span>
                    </div>
                  </div>
                </section>

                <aside className="cart-summary">
                  <h2>Order Summary</h2>

                  <div className="cart-summary-row">
                    <span>Subtotal</span>
                    <strong>{formatPrice(subtotal)}</strong>
                  </div>

                  <div className="cart-summary-row">
                    <span>Delivery Charges</span>
                    <strong>FREE</strong>
                  </div>

                  <div className="cart-summary-divider" />

                  <div className="cart-summary-total">
                    <span>Total Amount</span>
                    <strong>{formatPrice(totalAmount)}</strong>
                  </div>

                  <button
                    type="button"
                    className="cart-checkout-button"
                    onClick={() => {
                      setError("");
                      setShowCheckout(true);
                    }}
                    disabled={loading}
                  >
                    Proceed to Checkout <FiArrowRight />
                  </button>

                  <p className="cart-summary-security">
                    <FiShield />
                    Secure payment processing
                  </p>
                </aside>
              </div>
            )
          )}

          {/* CHECKOUT MODAL */}
          {showCheckout && (
            <div
              className="cart-modal-overlay"
              onClick={() => !loading && setShowCheckout(false)}
            >
              <div
                className="cart-checkout-modal"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="cart-modal-header">
                  <div>
                    <span>FINAL STEP</span>
                    <h2>Delivery Details</h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCheckout(false)}
                    disabled={loading}
                    aria-label="Close checkout"
                  >
                    <FiX />
                  </button>
                </div>

                <form onSubmit={handlePlaceOrder}>
                  <div className="cart-checkout-fields">
                    <label>
                      Full Name
                      <input
                        type="text"
                        name="fullName"
                        value={customer.fullName}
                        onChange={handleCustomerChange}
                        placeholder="Enter your full name"
                        required
                      />
                    </label>

                    <label>
                      Mobile Number
                      <input
                        type="tel"
                        name="phone"
                        value={customer.phone}
                        onChange={handleCustomerChange}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        required
                      />
                    </label>

                    <label className="cart-full-field">
                      Complete Address
                      <textarea
                        name="address"
                        value={customer.address}
                        onChange={handleCustomerChange}
                        placeholder="House number, street, area..."
                        rows={3}
                        required
                      />
                    </label>

                    <label>
                      City
                      <input
                        type="text"
                        name="city"
                        value={customer.city}
                        onChange={handleCustomerChange}
                        placeholder="Enter city"
                        required
                      />
                    </label>

                    <label>
                      State
                      <input
                        type="text"
                        name="state"
                        value={customer.state}
                        onChange={handleCustomerChange}
                        placeholder="Enter state"
                        required
                      />
                    </label>

                    <label>
                      PIN Code
                      <input
                        type="text"
                        name="postalCode"
                        value={customer.postalCode}
                        onChange={handleCustomerChange}
                        placeholder="6-digit PIN code"
                        maxLength={6}
                        required
                      />
                    </label>
                  </div>

                  <div className="cart-payment-section">
                    <h3>Choose Payment Method</h3>

                    <label
                      className={`cart-payment-option ${
                        paymentMethod === "COD" ? "selected" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="COD"
                        checked={paymentMethod === "COD"}
                        onChange={(event) =>
                          setPaymentMethod(event.target.value)
                        }
                      />

                      <FiTruck />

                      <span>
                        <strong>Cash on Delivery</strong>
                        <small>Pay when your order arrives</small>
                      </span>
                    </label>

                    <label
                      className={`cart-payment-option ${
                        paymentMethod === "ONLINE" ? "selected" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="ONLINE"
                        checked={paymentMethod === "ONLINE"}
                        onChange={(event) =>
                          setPaymentMethod(event.target.value)
                        }
                      />

                      <FiCreditCard />

                      <span>
                        <strong>Online Payment</strong>
                        <small>
                          UPI, Cards and supported methods via Razorpay
                        </small>
                      </span>
                    </label>
                  </div>

                  <div className="cart-checkout-total">
                    <span>Payable Amount</span>
                    <strong>{formatPrice(totalAmount)}</strong>
                  </div>

                  {error && (
                    <div className="cart-error-message">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="cart-place-order-button"
                    disabled={loading}
                  >
                    {loading
                      ? "Please wait..."
                      : paymentMethod === "COD"
                        ? "Place COD Order"
                        : "Pay Securely"}
                    {!loading && <FiArrowRight />}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Cart;
