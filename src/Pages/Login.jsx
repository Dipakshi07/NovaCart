
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiShoppingBag,
} from "react-icons/fi";
import "./Login.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim() || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password.");
      }

      // Support common JWT response formats.
      const token =
        data.token ||
        data.accessToken ||
        data.data?.token ||
        data.user?.token;

      const user =
        data.user ||
        data.data?.user ||
        data.data ||
        null;

      if (!token) {
        throw new Error(
          "Login response did not contain a token. Please check your backend response."
        );
      }

      // Save login session.
      localStorage.setItem("token", token);

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      // Notify Navbar and other components immediately.
      window.dispatchEvent(new Event("authChange"));

      const redirectTo = location.state?.from || "/";

      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Side */}
        <div className="login-banner">
          <Link to="/" className="login-brand">
            <span className="login-brand-icon">
              <FiShoppingBag />
            </span>
            <span>NovaCart</span>
          </Link>

          <div className="login-banner-content">
            <span className="login-tagline">WELCOME BACK</span>

            <h1>
              Shopping made
              <span> smarter.</span>
            </h1>

            <p>
              Discover amazing products, explore exclusive deals, and enjoy
              a seamless shopping experience with NovaCart.
            </p>

            <div className="login-banner-features">
              <div>✓ Secure shopping experience</div>
              <div>✓ Easy order tracking</div>
              <div>✓ Exclusive deals and offers</div>
            </div>
          </div>

          <div className="login-banner-footer">
            Your shopping journey starts here.
          </div>
        </div>

        {/* Right Side */}
        <div className="login-form-section">
          <div className="login-form-wrapper">
            <div className="login-mobile-brand">
              <FiShoppingBag />
              NovaCart
            </div>

            <span className="login-welcome">WELCOME BACK!</span>

            <h2>Sign in to your account</h2>

            <p className="login-subtitle">
              Enter your details to access your NovaCart account.
            </p>

            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="login-input-group">
                <label htmlFor="email">Email Address</label>

                <div className="login-input-wrapper">
                  <FiMail className="login-input-icon" />

                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="login-input-group">
                <label htmlFor="password">Password</label>

                <div className="login-input-wrapper">
                  <FiLock className="login-input-icon" />

                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className="login-form-options">
                <label className="login-remember">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>

                <Link to="/forgot-password" className="login-forgot">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="login-submit-btn"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
                {!loading && <FiArrowRight />}
              </button>
            </form>

            <div className="login-register-link">
              Don't have an account?
              <Link to="/register"> Create Account</Link>
            </div>

            <Link to="/" className="login-back-home">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
