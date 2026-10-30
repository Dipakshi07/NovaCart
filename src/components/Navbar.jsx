
import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  FiShoppingBag,
  FiSearch,
  FiHeart,
  FiShoppingCart,
  FiMenu,
  FiX,
  FiArrowUpRight,
  FiZap,
  FiPackage,
  FiUser,
  FiLogOut,
} from "react-icons/fi";

import { useShop } from "../context/ShopContext";
import "./Navbar.css";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Shop", path: "/products" },
  { label: "Electronics", path: "/electronics" },
  { label: "Accessories", path: "/accessories" },
  { label: "Deals", path: "/deals", deal: true },
  { label: "My Orders", path: "/my-orders", icon: FiPackage },
];

// Read saved login information.
const getAuthData = () => {
  const token = localStorage.getItem("token");
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  return { token, user };
};

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [auth, setAuth] = useState(getAuthData);

  const { cart = [], wishlist = [] } = useShop();

  const location = useLocation();
  const navigate = useNavigate();

  const cartCount = cart.reduce(
    (total, item) => total + (Number(item.quantity) || 1),
    0
  );

  const wishlistCount = wishlist.length;

  const isLoggedIn = Boolean(auth.token);

  const userName =
    auth.user?.name ||
    auth.user?.fullName ||
    auth.user?.username ||
    "My Account";

  // Update login state immediately after login/logout.
  useEffect(() => {
    const updateAuth = () => {
      setAuth(getAuthData());
    };

    window.addEventListener("authChange", updateAuth);
    window.addEventListener("storage", updateAuth);

    return () => {
      window.removeEventListener("authChange", updateAuth);
      window.removeEventListener("storage", updateAuth);
    };
  }, []);

  // Close mobile menu and search when route changes.
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  // Prevent background scrolling when mobile menu is open.
  useEffect(() => {
    document.body.classList.toggle("navbar-menu-open", menuOpen);

    return () => {
      document.body.classList.remove("navbar-menu-open");
    };
  }, [menuOpen]);

  // Close menu using Escape key.
  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchTerm.trim();

    if (!query) {
      setSearchOpen(false);
      navigate("/products");
      return;
    }

    navigate(`/products?search=${encodeURIComponent(query)}`);

    setSearchTerm("");
    setSearchOpen(false);
    setMenuOpen(false);
  };

  const handleNavClick = () => {
    setMenuOpen(false);
    setSearchOpen(false);
  };

  // Open login page.
  const handleLogin = () => {
    handleNavClick();

    navigate("/login", {
      state: {
        from: location.pathname,
      },
    });
  };

  // Logout user.
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setAuth({
      token: null,
      user: null,
    });

    window.dispatchEvent(new Event("authChange"));

    handleNavClick();
    navigate("/", { replace: true });
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="nova-announcement-bar">
        <span className="announcement-sparkle">
          <FiZap />
        </span>

        <p>
          Discover your next favorite gadget at{" "}
          <strong>NovaCart</strong>
        </p>

        <Link to="/deals" onClick={handleNavClick}>
          Explore deals <FiArrowUpRight />
        </Link>
      </div>

      <header className="nova-navbar">
        <div className="navbar-container">

          {/* Brand */}
          <Link
            to="/"
            className="navbar-brand"
            aria-label="NovaCart home"
            onClick={handleNavClick}
          >
            <span className="navbar-brand-icon">
              <FiShoppingBag />
            </span>

            <span className="navbar-brand-text">
              Nova<span>Cart</span>
              <small>TECH FOR YOUR EVERYDAY</small>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="navbar-links" aria-label="Main navigation">
            {navLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `navbar-link ${isActive ? "active" : ""} ${
                    item.deal ? "navbar-deal-link" : ""
                  }`
                }
                onClick={handleNavClick}
              >
                {item.deal && <FiZap aria-hidden="true" />}
                {item.icon && <item.icon aria-hidden="true" />}
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Navbar Actions */}
          <div className="navbar-actions">

            {/* Search */}
            <button
              type="button"
              className={`navbar-icon-btn navbar-search-toggle ${
                searchOpen ? "is-active" : ""
              }`}
              aria-label={searchOpen ? "Close search" : "Open search"}
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((open) => !open)}
            >
              {searchOpen ? <FiX /> : <FiSearch />}
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="navbar-icon-btn navbar-action-link"
              aria-label={`Wishlist, ${wishlistCount} items`}
              title="Wishlist"
              onClick={handleNavClick}
            >
              <FiHeart />

              {wishlistCount > 0 && (
                <span className="navbar-count">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="navbar-icon-btn navbar-action-link navbar-cart-link"
              aria-label={`Shopping cart, ${cartCount} items`}
              title="Shopping cart"
              onClick={handleNavClick}
            >
              <FiShoppingCart />

              {cartCount > 0 && (
                <span className="navbar-count">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* Login / User Account */}
            {!isLoggedIn ? (
              <button
                type="button"
                className="navbar-login-button"
                onClick={handleLogin}
              >
                <FiUser />
                <span>Login</span>
              </button>
            ) : (
              <div className="navbar-auth-actions">
                <Link
                  to="/my-orders"
                  className="navbar-user-button"
                  title="My Account and Orders"
                  onClick={handleNavClick}
                >
                  <FiUser />
                  <span>{userName}</span>
                </Link>

                <button
                  type="button"
                  className="navbar-logout-button"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <FiLogOut />
                  <span>Logout</span>
                </button>
              </div>
            )}

            {/* Shop Button */}
            <Link
              to="/products"
              className="navbar-shop-button"
              onClick={handleNavClick}
            >
              Shop Now <FiArrowUpRight />
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="navbar-icon-btn navbar-menu-toggle"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="navbar-mobile-menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        {/* Expandable Search */}
        <div className={`navbar-search-panel ${searchOpen ? "open" : ""}`}>
          <form className="navbar-search-form" onSubmit={handleSearch}>
            <FiSearch aria-hidden="true" />

            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search smartphones, headphones, accessories..."
              aria-label="Search products"
              autoFocus={searchOpen}
            />

            <button type="submit">
              Search <FiArrowUpRight />
            </button>
          </form>
        </div>

        {/* Mobile Navigation */}
        <div
          id="navbar-mobile-menu"
          className={`navbar-mobile-menu ${menuOpen ? "open" : ""}`}
          aria-hidden={!menuOpen}
        >
          <nav aria-label="Mobile navigation">
            {navLinks.map((item, index) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                tabIndex={menuOpen ? 0 : -1}
                className={({ isActive }) =>
                  `navbar-mobile-link ${isActive ? "active" : ""}`
                }
                style={{ "--mobile-link-index": index }}
                onClick={handleNavClick}
              >
                <span>
                  {item.deal && <FiZap />}
                  {item.icon && <item.icon />}
                  {item.label}
                </span>

                <FiArrowUpRight />
              </NavLink>
            ))}

            {/* Mobile Quick Links */}
            <div className="navbar-mobile-quick-links">
              <Link
                to="/wishlist"
                tabIndex={menuOpen ? 0 : -1}
                onClick={handleNavClick}
              >
                <FiHeart />
                Wishlist ({wishlistCount})
              </Link>

              <Link
                to="/cart"
                tabIndex={menuOpen ? 0 : -1}
                onClick={handleNavClick}
              >
                <FiShoppingCart />
                Cart ({cartCount})
              </Link>
            </div>

            {/* Mobile Login / Logout */}
            <div className="navbar-mobile-auth">
              {!isLoggedIn ? (
                <button
                  type="button"
                  tabIndex={menuOpen ? 0 : -1}
                  onClick={handleLogin}
                >
                  <FiUser />
                  Login / Sign In
                  <FiArrowUpRight />
                </button>
              ) : (
                <>
                  <Link
                    to="/my-orders"
                    tabIndex={menuOpen ? 0 : -1}
                    onClick={handleNavClick}
                  >
                    <FiUser />
                    {userName}
                  </Link>

                  <button
                    type="button"
                    tabIndex={menuOpen ? 0 : -1}
                    onClick={handleLogout}
                  >
                    <FiLogOut />
                    Logout
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Backdrop */}
      {menuOpen && (
        <button
          type="button"
          className="navbar-mobile-backdrop"
          aria-label="Close navigation menu"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}

export default Navbar;
