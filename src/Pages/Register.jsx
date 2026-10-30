
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiShoppingBag,
} from "react-icons/fi";
import "./Register.css";

// Backend API URL
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // Handle registration
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
    } = formData;

    // Required field validation
    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    // Name validation
    if (name.trim().length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    if (name.trim().length > 100) {
      setError("Name cannot exceed 100 characters.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    // Password validation
    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }

    // Phone validation
    if (
      phone.trim() &&
      !/^[0-9]{10}$/.test(phone.trim())
    ) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    try {
      setLoading(true);

      console.log("Register API:", `${API_URL}/auth/register`);

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
        }),
      });

      // Safely read response
      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      // Backend returned an error
      if (!response.ok) {
        throw new Error(
          data.message || `Registration failed (${response.status})`
        );
      }

      // Registration successful
      console.log("Registration successful:", data);

      setSuccess(
        data.message || "Account created successfully! Please login."
      );

      // Clear form
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });

      // Redirect to Login
      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1200);

    } catch (err) {
      console.error("Registration error:", err);

      if (
        err instanceof TypeError ||
        err.message === "Failed to fetch"
      ) {
        setError(
          "Cannot connect to NovaCart server. Please make sure the backend is running on port 5000."
        );
      } else {
        setError(
          err.message || "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">

        {/* Left Banner */}
        <div className="register-banner">
          <Link to="/" className="register-brand">
            <span className="register-brand-icon">
              <FiShoppingBag />
            </span>
            NovaCart
          </Link>

          <div className="register-banner-content">
            <span className="register-tagline">
              JOIN NOVACART
            </span>

            <h1>
              Your next
              <span> great find </span>
              starts here.
            </h1>

            <p>
              Create your account and explore a
              smarter way to shop for technology
              and everyday essentials.
            </p>

            <div className="register-features">
              <div>✓ Track all your orders in one place</div>
              <div>✓ Save products to your wishlist</div>
              <div>✓ Discover exclusive deals</div>
            </div>
          </div>

          <div className="register-banner-footer">
            Welcome to the NovaCart community.
          </div>
        </div>

        {/* Right Form */}
        <div className="register-form-section">
          <div className="register-form-wrapper">

            <div className="register-mobile-brand">
              <FiShoppingBag />
              NovaCart
            </div>

            <span className="register-welcome">
              GET STARTED
            </span>

            <h2>Create your account</h2>

            <p className="register-subtitle">
              Enter your details to become a
              NovaCart member.
            </p>

            {/* Error Message */}
            {error && (
              <div className="register-error" role="alert">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="register-success" role="status">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* Name */}
              <div className="register-input-group">
                <label htmlFor="register-name">
                  Full Name *
                </label>

                <div className="register-input-wrapper">
                  <FiUser className="register-input-icon" />

                  <input
                    type="text"
                    id="register-name"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    maxLength={100}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="register-input-group">
                <label htmlFor="register-email">
                  Email Address *
                </label>

                <div className="register-input-wrapper">
                  <FiMail className="register-input-icon" />

                  <input
                    type="email"
                    id="register-email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="register-input-group">
                <label htmlFor="register-phone">
                  Phone Number <span>(Optional)</span>
                </label>

                <div className="register-input-wrapper">
                  <FiPhone className="register-input-icon" />

                  <input
                    type="tel"
                    id="register-phone"
                    name="phone"
                    placeholder="Enter 10-digit mobile number"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    maxLength={10}
                    inputMode="numeric"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="register-input-group">
                <label htmlFor="register-password">
                  Password *
                </label>

                <div className="register-input-wrapper">
                  <FiLock className="register-input-icon" />

                  <input
                    type={showPassword ? "text" : "password"}
                    id="register-password"
                    name="password"
                    placeholder="Create a password (min. 8 characters)"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />

                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="register-input-group">
                <label htmlFor="register-confirm-password">
                  Confirm Password *
                </label>

                <div className="register-input-wrapper">
                  <FiLock className="register-input-icon" />

                  <input
                    type={
                      showConfirmPassword ? "text" : "password"
                    }
                    id="register-confirm-password"
                    name="confirmPassword"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />

                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="register-submit-btn"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}

                {!loading && <FiArrowRight />}
              </button>
            </form>

            <div className="register-login-link">
              Already have an account?
              <Link to="/login"> Sign In</Link>
            </div>

            <Link to="/" className="register-back-home">
              ← Back to Home
            </Link>

          </div>
        </div>

      </div>
    </div>
  );
}

// IMPORTANT: Default export
export default Register;
