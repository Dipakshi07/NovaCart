
import React from "react";
import "./PaymentMethod.css";

const PaymentMethod = ({
  selectedMethod,
  onMethodChange,
}) => {
  const paymentMethods = [
    {
      id: "ONLINE",
      icon: "💳",
      title: "Pay Online",
      description:
        "Pay securely using UPI, Debit/Credit Card, Net Banking and more.",
      features: ["Secure Payment", "Instant Confirmation"],
    },
    {
      id: "COD",
      icon: "📦",
      title: "Cash on Delivery",
      description:
        "Pay for your order when it arrives at your doorstep.",
      features: ["No Online Payment", "Pay at Delivery"],
    },
  ];

  return (
    <div className="payment-method-container">
      <div className="payment-method-heading">
        <div>
          <h2>Payment Method</h2>
          <p>Choose how you want to pay for your order.</p>
        </div>

        <span className="payment-secure-badge">
          🔒 Secure Checkout
        </span>
      </div>

      <div className="payment-options">
        {paymentMethods.map((method) => (
          <label
            key={method.id}
            className={`payment-option ${
              selectedMethod === method.id ? "selected" : ""
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method.id}
              checked={selectedMethod === method.id}
              onChange={() => onMethodChange(method.id)}
            />

            <span className="payment-radio"></span>

            <div className="payment-option-icon">
              {method.icon}
            </div>

            <div className="payment-option-content">
              <div className="payment-option-title">
                <h3>{method.title}</h3>

                {method.id === "ONLINE" && (
                  <span className="payment-recommended">
                    Recommended
                  </span>
                )}
              </div>

              <p>{method.description}</p>

              <div className="payment-features">
                {method.features.map((feature) => (
                  <span key={feature}>
                    ✓ {feature}
                  </span>
                ))}
              </div>
            </div>
          </label>
        ))}
      </div>

      {selectedMethod === "ONLINE" && (
        <div className="online-payment-info">
          <div className="online-payment-info-icon">🔐</div>

          <div>
            <h4>Secure Online Payment</h4>
            <p>
              You will be redirected to Razorpay Checkout,
              where you can select an available payment option
              such as UPI, cards or Net Banking.
            </p>
          </div>
        </div>
      )}

      {selectedMethod === "COD" && (
        <div className="cod-payment-info">
          <span>📦</span>
          <p>
            Keep the payment amount ready when your order
            is delivered.
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethod;
