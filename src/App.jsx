
import { Routes, Route } from "react-router-dom";

import { ShopProvider } from "./context/ShopContext";

import Home from "./Pages/Home";
import Shop from "./Pages/Shop";
import Electronics from "./Pages/Electronics";
import Accessories from "./Pages/Accessories";
import Deals from "./Pages/Deals";
import Cart from "./Pages/Cart";
import Wishlist from "./Pages/Wishlist";
import Checkout from "./Pages/Checkout";
import MyOrders from "./Pages/MyOrders";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import ProductDetails from "./Pages/ProductDetails";

function PlaceholderPage({ title, description }) {
  return (
    <main
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
        background: "#0b0b12",
        color: "#f8f7ff",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "32px", marginBottom: "12px" }}>
        {title}
      </h1>

      <p style={{ color: "#a39db4", maxWidth: "450px", lineHeight: 1.8 }}>
        {description}
      </p>
    </main>
  );
}

function NotFound() {
  return (
    <PlaceholderPage
      title="404 — Page Not Found"
      description="This page doesn't exist. Please return to NovaCart and explore our collection."
    />
  );
}

function App() {
  return (
    <ShopProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Shop />} />
        <Route path="/electronics" element={<Electronics />} />
        <Route path="/accessories" element={<Accessories />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route
          path="/cart"
          element={
            <PlaceholderPage
              title="Your Shopping Cart"
              description="Your shopping cart page will be connected here."
            />
          }
        />

        <Route
          path="/wishlist"
          element={
            <PlaceholderPage
              title="Your Wishlist"
              description="Your saved products will appear here."
            />
          }
        />

        <Route
          path="/product/:id"
          element={
            <PlaceholderPage
              title="Product Details"
              description="Individual product details will appear here."
            />
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ShopProvider>
  );
}

export default App;
