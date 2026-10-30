
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PaymentMethod from "../components/PaymentMethod";
import "./Checkout.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const initialAddress = {
  fullName: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

const Checkout = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [address, setAddress] = useState(initialAddress);
  const [paymentMethod, setPaymentMethod] = useState("ONLINE");

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  // Common API request helper
  const apiRequest = async (endpoint, options = {}) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  };

  // Load Razorpay Checkout script
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  // Fetch cart from backend
  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        navigate("/login");
        return;
      }

      const data = await apiRequest("/cart");

      const items = data.cart?.items || data.items || [];

      setCartItems(items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Address input handler
  const handleAddressChange = (e) => {
    const { name, value } = e.target;

    setAddress((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Calculate total from backend cart data
  const subtotal = cartItems.reduce((total, item) => {
    const product = item.product || item;
    const price = Number(product.price || item.price || 0);
    const quantity = Number(item.quantity || 1);

    return total + price * quantity;
  }, 0);

  const shipping = subtotal > 0 ? 0 : 0;
  const total = subtotal + shipping;

  // Validate delivery address
  const validateAddress = () => {
    const requiredFields = [
      "fullName",
      "phone",
      "address",
      "city",
      "state",
      "postalCode",
    ];

    for (const field of requiredFields) {
      if (!address[field].trim()) {
        setError(`Please enter your ${field}.`);
        return false;
      }
    }

    if (!/^[0-9]{10}$/.test(address.phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return false;
    }

    if (!/^[0-9]{6}$/.test(address.postalCode)) {
      setError("Please enter a valid 6-digit PIN code.");
      return false;
    }

    return true;
  };

  // COD order
  const placeCODOrder = async () => {
    const data = await apiRequest("/orders", {
      method: "POST",
      body: JSON.stringify({
        shippingAddress: address,
        paymentMethod: "COD",
      }),
    });

    setSuccess("Your Cash on Delivery order has been placed!");

    setCartItems([]);

    navigate("/order-success", {
      state: {
        order: data.order,
        paymentMethod: "COD",
      },
    });
  };

  // Online Razorpay payment
  const placeOnlineOrder = async () => {
    const scriptLoaded = await loadRazorpay();

    if (!scriptLoaded) {
      throw new Error(
        "Unable to load Razorpay Checkout. Please check your internet connection."
      );
    }

    // Create order on backend
    const orderData = await apiRequest("/payments/create-order", {
      method: "POST",
      body: JSON.stringify({
        shippingAddress: address,
      }),
    });

    const razorpayOptions = {
      key: orderData.key,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "NovaCart",
      description: "Online Shopping Payment",
      order_id: orderData.razorpayOrderId,

      handler: async (response) => {
        try {
          setError("");
          setPlacingOrder(true);

          // Verify payment on backend
          const verification = await apiRequest("/payments/verify", {
            method: "POST",
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          setCartItems([]);

          navigate("/order-success", {
            state: {
              order: verification.order,
              paymentMethod: "ONLINE",
            },
          });
        } catch (err) {
          setError(
            `Payment verification failed: ${err.message}. Please contact support with your payment ID: ${response.razorpay_payment_id}`
          );
          setPlacingOrder(false);
        }
      },

      prefill: {
        name: address.fullName,
        contact: address.phone,
      },

      notes: {
        address: `${address.address}, ${address.city}`,
      },

      theme: {
        color: "#4f46e5",
      },

      modal: {
        ondismiss: () => {
          setPlacingOrder(false);
          setError(
            "Payment window closed. Your order may still be pending. Check your orders before trying again."
          );
        },
      },
    };

    const razorpay = new window.Razorpay(razorpayOptions);

    razorpay.on("payment.failed", (response) => {
      const paymentId = response.error?.metadata?.payment_id;

      if (paymentId) {
        apiRequest("/payments/failure", {
          method: "POST",
          body: JSON.stringify({
            razorpayPaymentId: paymentId,
          }),
        }).catch((err) => {
          console.error("Payment failure update:", err.message);
        });
      }

      setPlacingOrder(false);
      setError(
        response.error?.description || "Payment failed. Please try again."
      );
    });

    razorpay.open();
  };

  // Submit checkout
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!validateAddress()) return;

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    try {
      setPlacingOrder(true);

      if (paymentMethod === "COD") {
        await placeCODOrder();
      } else {
        await placeOnlineOrder();
        // Razorpay modal opens; keep the button disabled
        // until payment succeeds, fails, or modal closes.
        return;
      }
    } catch (err) {
      setError(err.message);
    }

    setPlacingOrder(false);
  };

  if (loading) {
    return (
      <div className="checkout-loading">
        <div className="checkout-spinner"></div>
        <p>Loading your checkout...</p>
      </div>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-header">
        <div>
          <span className="checkout-eyebrow">NOVACART CHECKOUT</span>
          <h1>Complete Your Order</h1>
          <p>You're just one step away from your favourite products.</p>
        </div>
      </div>

      {error && (
        <div className="checkout-alert checkout-error">
          <span>⚠️</span>
          {error}
          <button type="button" onClick={() => setError("")}>
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="checkout-alert checkout-success">
          ✓ {success}
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="checkout-empty">
          <div>🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some products before proceeding to checkout.</p>
          <button onClick={() => navigate("/shop")}>
            Continue Shopping
          </button>
        </div>
      ) : (
        <form className="checkout-layout" onSubmit={handlePlaceOrder}>
          <div className="checkout-left">
            <section className="checkout-card">
              <div className="checkout-section-heading">
                <span className="checkout-step">01</span>
                <div>
                  <h2>Delivery Information</h2>
                  <p>Enter the address where you want your order delivered.</p>
                </div>
              </div>

              <div className="checkout-form-grid">
                <div className="checkout-field full-width">
                  <label htmlFor="fullName">Full Name *</label>
                  <input
                    id="fullName"
                    name="fullName"
                    value={address.fullName}
                    onChange={handleAddressChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="checkout-field">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={address.phone}
                    onChange={handleAddressChange}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    autoComplete="tel"
                    required
                  />
                </div>

                <div className="checkout-field">
                  <label htmlFor="postalCode">PIN Code *</label>
                  <input
                    id="postalCode"
                    name="postalCode"
                    value={address.postalCode}
                    onChange={handleAddressChange}
                    placeholder="6-digit PIN code"
                    maxLength={6}
                    autoComplete="postal-code"
                    required
                  />
                </div>

                <div className="checkout-field full-width">
                  <label htmlFor="address">Full Address *</label>
                  <textarea
                    id="address"
                    name="address"
                    value={address.address}
                    onChange={handleAddressChange}
                    placeholder="House number, street, area, landmark"
                    rows={3}
                    autoComplete="street-address"
                    required
                  />
                </div>

                <div className="checkout-field">
                  <label htmlFor="city">City *</label>
                  <input
                    id="city"
                    name="city"
                    value={address.city}
                    onChange={handleAddressChange}
                    placeholder="Enter city"
                    autoComplete="address-level2"
                    required
                  />
                </div>

                <div className="checkout-field">
                  <label htmlFor="state">State *</label>
                  <input
                    id="state"
                    name="state"
                    value={address.state}
                    onChange={handleAddressChange}
                    placeholder="Enter state"
                    autoComplete="address-level1"
                    required
                  />
                </div>

                <div className="checkout-field full-width">
                  <label htmlFor="country">Country</label>
                  <input
                    id="country"
                    name="country"
                    value={address.country}
                    onChange={handleAddressChange}
                    autoComplete="country-name"
                    required
                  />
                </div>
              </div>
            </section>

            <section className="checkout-card">
              <div className="checkout-section-heading">
                <span className="checkout-step">02</span>
                <div>
                  <h2>Payment Details</h2>
                  <p>Select your preferred payment method.</p>
                </div>
              </div>

              <PaymentMethod
                selectedMethod={paymentMethod}
                onMethodChange={setPaymentMethod}
              />
            </section>
          </div>

          <aside className="checkout-right">
            <section className="checkout-card order-summary">
              <h2>Order Summary</h2>
              <p className="summary-subtitle">
                {cartItems.length} product(s) in your cart
              </p>

              <div className="summary-products">
                {cartItems.map((item) => {
                  const product = item.product || item;
                  const quantity = Number(item.quantity || 1);
                  const price = Number(product.price || item.price || 0);

                  return (
                    <div
                      className="summary-product"
                      key={product._id || product.id}
                    >
                      <img
                        src={product.image || "/placeholder.png"}
                        alt={product.name || "Product"}
                      />

                      <div className="summary-product-info">
                        <h3>{product.name}</h3>
                        <p>Qty: {quantity}</p>
                      </div>

                      <strong>
                        ₹{(price * quantity).toLocaleString("en-IN")}
                      </strong>
                    </div>
                  );
                })}
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                <span className="free-shipping">
                  {shipping === 0 ? "FREE" : `₹${shipping}`}
                </span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-total">
                <span>Total Amount</span>
                <strong>₹{total.toLocaleString("en-IN")}</strong>
              </div>

              <button
                type="submit"
                className="place-order-btn"
                disabled={placingOrder || cartItems.length === 0}
              >
                {placingOrder
                  ? "Processing..."
                  : paymentMethod === "COD"
                    ? "Place COD Order"
                    : "Pay Securely"}
                {!placingOrder && <span>→</span>}
              </button>

              <div className="checkout-trust">
                <span>🔒</span>
                <p>Your payment and personal information are protected.</p>
              </div>
            </section>
          </aside>
        </form>
      )}
    </main>
  );
};

export default Checkout;
