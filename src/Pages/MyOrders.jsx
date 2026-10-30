
import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import {
  FiCheck,
  FiClock,
  FiTruck,
  FiPackage,
  FiMapPin,
  FiCreditCard,
  FiCalendar,
} from "react-icons/fi";
import "./MyOrders.css";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://novacart-backend-1.onrender.com/api"
).replace(/\/$/, "");

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};

const formatDateTime = (date) => {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
};

const getStatusClass = (status) =>
  String(status || "Pending")
    .toLowerCase()
    .replace(/\s+/g, "-");

const STATUS_STEPS = [
  {
    key: "Ordered",
    label: "Ordered",
    icon: FiPackage,
  },
  {
    key: "Shipping",
    label: "Shipping",
    icon: FiTruck,
  },
  {
    key: "Out for Delivery",
    label: "Out for Delivery",
    icon: FiMapPin,
  },
  {
    key: "Delivered",
    label: "Delivered",
    icon: FiCheck,
  },
];

const getStatusIndex = (status) =>
  STATUS_STEPS.findIndex(
    (step) => step.key === status
  );

const getTrackingDate = (
  order,
  status
) => {
  if (status === "Ordered") {
    return (
      order.orderedAt ||
      order.createdAt
    );
  }

  if (status === "Shipping") {
    return order.shippedAt;
  }

  if (
    status === "Out for Delivery"
  ) {
    return order.outForDeliveryAt;
  }

  if (status === "Delivered") {
    return order.deliveredAt;
  }

  return null;
};

function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState(
    []
  );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [cancellingId, setCancellingId] =
    useState(null);

  const getToken = () =>
    localStorage.getItem("token");

  const fetchOrders =
    useCallback(async () => {
      const token = getToken();

      if (!token) {
        setError(
          "Please login to view your orders."
        );

        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `${API_URL}/orders/my-orders`,
            {
              method: "GET",

              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type":
                  "application/json",
              },
            }
          );

        const data =
          await response
            .json()
            .catch(() => ({}));

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          localStorage.removeItem(
            "token"
          );

          setError(
            "Your session has expired. Please login again."
          );

          return;
        }

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load your orders."
          );
        }

        const orderList =
          Array.isArray(data)
            ? data
            : data.orders ||
              data.data?.orders ||
              data.data ||
              [];

        setOrders(
          Array.isArray(orderList)
            ? orderList
            : []
        );
      } catch (err) {
        console.error(
          "Fetch orders error:",
          err
        );

        setError(
          err.message ||
            "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancelOrder =
    async (orderId) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to cancel this order?"
        );

      if (!confirmed) return;

      try {
        setCancellingId(orderId);
        setError("");

        const response =
          await fetch(
            `${API_URL}/orders/${orderId}/cancel`,
            {
              method: "PATCH",

              headers: {
                Authorization: `Bearer ${getToken()}`,
                "Content-Type":
                  "application/json",
              },
            }
          );

        const data =
          await response
            .json()
            .catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to cancel this order."
          );
        }

        await fetchOrders();
      } catch (err) {
        setError(
          err.message ||
            "Order cancellation failed."
        );
      } finally {
        setCancellingId(null);
      }
    };

  if (loading) {
    return (
      <div className="my-orders-page">
        <div className="orders-loading">
          <div className="orders-spinner"></div>

          <p>
            Loading your orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="my-orders-page">
      <div className="my-orders-container">
        {/* Header */}
        <div className="orders-header">
          <div>
            <span className="orders-eyebrow">
              NOVACART ACCOUNT
            </span>

            <h1>My Orders</h1>

            <p>
              Track and manage all your
              purchases in one place.
            </p>
          </div>

          <Link
            to="/shop"
            className="continue-shopping-btn"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div
            className="orders-error"
            role="alert"
          >
            <span>{error}</span>

            {error
              .toLowerCase()
              .includes("login") ||
            error
              .toLowerCase()
              .includes("session") ? (
              <button
                onClick={() =>
                  navigate("/login")
                }
              >
                Login
              </button>
            ) : (
              <button
                onClick={fetchOrders}
              >
                Try Again
              </button>
            )}
          </div>
        )}

        {/* Empty */}
        {!error &&
        orders.length === 0 ? (
          <section className="empty-orders">
            <div className="empty-orders-icon">
              📦
            </div>

            <h2>
              No orders yet!
            </h2>

            <p>
              You haven't placed any
              orders. Explore our products
              and find something you love.
            </p>

            <Link
              to="/shop"
              className="shop-now-btn"
            >
              Start Shopping
            </Link>
          </section>
        ) : (
          <section className="orders-list">
            <div className="orders-count">
              <h2>
                Order History
              </h2>

              <span>
                {orders.length}{" "}
                {orders.length === 1
                  ? "Order"
                  : "Orders"}
              </span>
            </div>

            {orders.map((order) => {
              const orderId =
                order._id ||
                order.id;

              const orderItems =
                order.items || [];

              const currentStatus =
                order.status ||
                "Ordered";

              const currentStatusIndex =
                getStatusIndex(
                  currentStatus
                );

              const canCancel =
                currentStatus ===
                "Ordered";

              const isCancelled =
                currentStatus ===
                "Cancelled";

              return (
                <article
                  className="order-card"
                  key={orderId}
                >
                  {/* =================================
                      ORDER HEADER
                  ================================= */}
                  <div className="order-card-header">
                    <div className="order-meta">
                      <div>
                        <span className="order-label">
                          ORDER ID
                        </span>

                        <strong>
                          #
                          {String(
                            orderId || ""
                          )
                            .slice(-8)
                            .toUpperCase()}
                        </strong>
                      </div>

                      <div>
                        <span className="order-label">
                          ORDER DATE
                        </span>

                        <strong>
                          {formatDate(
                            order.orderedAt ||
                              order.createdAt
                          )}
                        </strong>
                      </div>

                      <div>
                        <span className="order-label">
                          TOTAL AMOUNT
                        </span>

                        <strong className="order-total">
                          {formatPrice(
                            order.totalAmount
                          )}
                        </strong>
                      </div>
                    </div>

                    <div className="order-status-group">
                      <span
                        className={`status-badge ${getStatusClass(
                          currentStatus
                        )}`}
                      >
                        {currentStatus}
                      </span>

                      <span
                        className={`payment-badge ${getStatusClass(
                          order.paymentStatus
                        )}`}
                      >
                        Payment:{" "}
                        {order.paymentStatus ||
                          "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* =================================
                      DELIVERY INFORMATION
                  ================================= */}
                  <div className="order-delivery-summary">
                    <div>
                      <FiCalendar />

                      <div>
                        <span>
                          Expected Delivery
                        </span>

                        <strong>
                          {formatDate(
                            order.expectedDeliveryDate
                          )}
                        </strong>
                      </div>
                    </div>

                    <div>
                      <FiTruck />

                      <div>
                        <span>
                          Shipping Status
                        </span>

                        <strong>
                          {currentStatus}
                        </strong>
                      </div>
                    </div>

                    <div>
                      <FiCreditCard />

                      <div>
                        <span>
                          Payment
                        </span>

                        <strong>
                          {order.paymentMethod ===
                          "ONLINE"
                            ? "Online Payment"
                            : "Cash on Delivery"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* =================================
                      TRACKING TIMELINE
                  ================================= */}
                  {!isCancelled && (
                    <div className="order-tracking">
                      <div className="tracking-header">
                        <h3>
                          Order Tracking
                        </h3>

                        <span>
                          {currentStatus}
                        </span>
                      </div>

                      <div className="tracking-timeline">
                        {STATUS_STEPS.map(
                          (
                            step,
                            index
                          ) => {
                            const StepIcon =
                              step.icon;

                            const stepDate =
                              getTrackingDate(
                                order,
                                step.key
                              );

                            const isCompleted =
                              currentStatusIndex >=
                              index;

                            const isCurrent =
                              currentStatusIndex ===
                              index;

                            return (
                              <div
                                key={
                                  step.key
                                }
                                className={`tracking-step ${
                                  isCompleted
                                    ? "completed"
                                    : ""
                                } ${
                                  isCurrent
                                    ? "current"
                                    : ""
                                }`}
                              >
                                <div className="tracking-icon">
                                  <StepIcon />
                                </div>

                                <div className="tracking-content">
                                  <strong>
                                    {
                                      step.label
                                    }
                                  </strong>

                                  {stepDate ? (
                                    <span>
                                      {formatDateTime(
                                        stepDate
                                      )}
                                    </span>
                                  ) : index ===
                                    3 ? (
                                    <span>
                                      Expected:{" "}
                                      {formatDate(
                                        order.expectedDeliveryDate
                                      )}
                                    </span>
                                  ) : (
                                    <span>
                                      Pending
                                    </span>
                                  )}
                                </div>

                                {index <
                                  STATUS_STEPS.length -
                                    1 && (
                                  <div className="tracking-line" />
                                )}
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}

                  {/* =================================
                      CANCELLED STATUS
                  ================================= */}
                  {isCancelled && (
                    <div className="cancelled-order-message">
                      <FiClock />

                      <div>
                        <strong>
                          Order Cancelled
                        </strong>

                        <span>
                          {order.cancelledAt
                            ? `Cancelled on ${formatDateTime(
                                order.cancelledAt
                              )}`
                            : "This order has been cancelled."}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* =================================
                      PRODUCTS
                  ================================= */}
                  <div className="order-products">
                    {orderItems.map(
                      (
                        item,
                        index
                      ) => {
                        const product =
                          item.product ||
                          {};

                        const productName =
                          item.name ||
                          product.name ||
                          "Product";

                        const productImage =
                          item.image ||
                          product.image;

                        const quantity =
                          Number(
                            item.quantity
                          ) || 1;

                        const price =
                          Number(
                            item.price ||
                              product.price ||
                              0
                          );

                        return (
                          <div
                            className="order-product"
                            key={
                              item._id ||
                              product._id ||
                              index
                            }
                          >
                            <div className="order-product-image">
                              {productImage ? (
                                <img
                                  src={
                                    productImage
                                  }
                                  alt={
                                    productName
                                  }
                                />
                              ) : (
                                <span>
                                  📦
                                </span>
                              )}
                            </div>

                            <div className="order-product-info">
                              <h3>
                                {
                                  productName
                                }
                              </h3>

                              <p>
                                Quantity:{" "}
                                {quantity}
                              </p>

                              <span>
                                Unit Price:{" "}
                                {formatPrice(
                                  price
                                )}
                              </span>
                            </div>

                            <strong>
                              {formatPrice(
                                price *
                                  quantity
                              )}
                            </strong>
                          </div>
                        );
                      }
                    )}
                  </div>

                  {/* =================================
                      SHIPPING ADDRESS
                  ================================= */}
                  {order.shippingAddress && (
                    <div className="order-shipping-address">
                      <div className="shipping-address-icon">
                        <FiMapPin />
                      </div>

                      <div>
                        <h3>
                          Shipping Address
                        </h3>

                        <p>
                          <strong>
                            {
                              order
                                .shippingAddress
                                .fullName
                            }
                          </strong>
                        </p>

                        <p>
                          {
                            order
                              .shippingAddress
                              .address
                          }
                        </p>

                        <p>
                          {
                            order
                              .shippingAddress
                              .city
                          }
                          ,{" "}
                          {
                            order
                              .shippingAddress
                              .state
                          }{" "}
                          -{" "}
                          {
                            order
                              .shippingAddress
                              .postalCode
                          }
                        </p>

                        <p>
                          {
                            order
                              .shippingAddress
                              .country
                          }
                        </p>

                        <p>
                          Phone:{" "}
                          {
                            order
                              .shippingAddress
                              .phone
                          }
                        </p>
                      </div>
                    </div>
                  )}

                  {/* =================================
                      FOOTER
                  ================================= */}
                  <div className="order-card-footer">
                    <div className="order-payment-info">
                      <span>
                        Payment Method:{" "}
                        <strong>
                          {order.paymentMethod ===
                          "ONLINE"
                            ? "Online Payment"
                            : "Cash on Delivery"}
                        </strong>
                      </span>

                      <span>
                        Payment Status:{" "}
                        <strong>
                          {order.paymentStatus ||
                            "Pending"}
                        </strong>
                      </span>
                    </div>

                    {canCancel && (
                      <button
                        className="cancel-order-btn"
                        disabled={
                          cancellingId ===
                          orderId
                        }
                        onClick={() =>
                          handleCancelOrder(
                            orderId
                          )
                        }
                      >
                        {cancellingId ===
                        orderId
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
