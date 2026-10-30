
import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./MyOrders.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getStatusClass = (status) =>
  String(status || "pending").toLowerCase().replace(/\s+/g, "-");

function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  const getToken = () => localStorage.getItem("token");

  const fetchOrders = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setError("Please login to view your orders.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/orders/my-orders`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        setError("Your session has expired. Please login again.");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to load your orders.");
      }

      // Supports common API response formats:
      // { orders: [] }, { data: { orders: [] } }, or a direct array.
      const orderList = Array.isArray(data)
        ? data
        : data.orders || data.data?.orders || data.data || [];

      setOrders(Array.isArray(orderList) ? orderList : []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancelOrder = async (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) return;

    try {
      setCancellingId(orderId);
      setError("");

      const response = await fetch(
        `${API_URL}/orders/${orderId}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to cancel this order.");
      }

      // Refresh the list to show the latest order and payment status.
      await fetchOrders();
    } catch (err) {
      setError(err.message || "Order cancellation failed.");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="my-orders-page">
        <div className="orders-loading">
          <div className="orders-spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="my-orders-page">
      <div className="my-orders-container">
        <div className="orders-header">
          <div>
            <span className="orders-eyebrow">NOVACART ACCOUNT</span>
            <h1>My Orders</h1>
            <p>Track and manage all your purchases in one place.</p>
          </div>

          <Link to="/shop" className="continue-shopping-btn">
            Continue Shopping
          </Link>
        </div>

        {error && (
          <div className="orders-error" role="alert">
            <span>{error}</span>

            {error.toLowerCase().includes("login") ||
            error.toLowerCase().includes("session") ? (
              <button onClick={() => navigate("/login")}>Login</button>
            ) : (
              <button onClick={fetchOrders}>Try Again</button>
            )}
          </div>
        )}

        {!error && orders.length === 0 ? (
          <section className="empty-orders">
            <div className="empty-orders-icon">📦</div>
            <h2>No orders yet!</h2>
            <p>
              You haven't placed any orders. Explore our products and find
              something you love.
            </p>
            <Link to="/shop" className="shop-now-btn">
              Start Shopping
            </Link>
          </section>
        ) : (
          <section className="orders-list">
            <div className="orders-count">
              <h2>Order History</h2>
              <span>
                {orders.length} {orders.length === 1 ? "Order" : "Orders"}
              </span>
            </div>

            {orders.map((order) => {
              const orderId = order._id || order.id;
              const orderItems = order.items || [];
              const canCancel = ["pending"].includes(
                String(order.status || "").toLowerCase()
              );

              return (
                <article className="order-card" key={orderId}>
                  <div className="order-card-header">
                    <div className="order-meta">
                      <div>
                        <span className="order-label">ORDER ID</span>
                        <strong>#{String(orderId || "").slice(-8).toUpperCase()}</strong>
                      </div>

                      <div>
                        <span className="order-label">ORDER DATE</span>
                        <strong>{formatDate(order.createdAt)}</strong>
                      </div>

                      <div>
                        <span className="order-label">TOTAL AMOUNT</span>
                        <strong className="order-total">
                          {formatPrice(order.totalAmount)}
                        </strong>
                      </div>
                    </div>

                    <div className="order-status-group">
                      <span
                        className={`status-badge ${getStatusClass(order.status)}`}
                      >
                        {order.status || "Pending"}
                      </span>

                      <span
                        className={`payment-badge ${getStatusClass(
                          order.paymentStatus
                        )}`}
                      >
                        Payment: {order.paymentStatus || "Pending"}
                      </span>
                    </div>
                  </div>

                  <div className="order-products">
                    {orderItems.map((item, index) => {
                      const product = item.product || {};
                      const productName = item.name || product.name || "Product";
                      const productImage = item.image || product.image;

                      return (
                        <div
                          className="order-product"
                          key={item._id || product._id || index}
                        >
                          <div className="order-product-image">
                            {productImage ? (
                              <img src={productImage} alt={productName} />
                            ) : (
                              <span>📦</span>
                            )}
                          </div>

                          <div className="order-product-info">
                            <h3>{productName}</h3>
                            <p>Quantity: {item.quantity || 1}</p>
                          </div>

                          <strong>
                            {formatPrice(
                              Number(item.price || product.price || 0) *
                                Number(item.quantity || 1)
                            )}
                          </strong>
                        </div>
                      );
                    })}
                  </div>

                  <div className="order-card-footer">
                    <div className="order-payment-info">
                      <span>
                        Payment Method:{" "}
                        <strong>
                          {order.paymentMethod === "ONLINE"
                            ? "Online Payment"
                            : order.paymentMethod || "COD"}
                        </strong>
                      </span>

                      {order.shippingAddress?.city && (
                        <span>
                          Delivery City:{" "}
                          <strong>{order.shippingAddress.city}</strong>
                        </span>
                      )}
                    </div>

                    {canCancel && (
                      <button
                        className="cancel-order-btn"
                        disabled={cancellingId === orderId}
                        onClick={() => handleCancelOrder(orderId)}
                      >
                        {cancellingId === orderId
                          ? "Cancelling..."
                          : "Cancel Order"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}

export default MyOrders;
