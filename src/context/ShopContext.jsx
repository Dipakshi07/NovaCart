
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const ShopContext = createContext(null);

const CART_STORAGE_KEY = "novacart_cart";
const WISHLIST_STORAGE_KEY = "novacart_wishlist";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function getProductId(product) {
  return product?._id || product?.id || null;
}

function normalizeCartItems(items = []) {
  return items
    .filter((item) => item.product)
    .map((item) => ({
      ...item.product,
      id: item.product._id || item.product.id,
      _id: item.product._id || item.product.id,
      quantity: Number(item.quantity) || 1,
    }));
}

function isMongoId(id) {
  return /^[a-f\d]{24}$/i.test(String(id || ""));
}

export function ShopProvider({ children }) {
  const [cart, setCart] = useState(() =>
    readStorage(CART_STORAGE_KEY, [])
  );

  const [wishlist, setWishlist] = useState(() =>
    readStorage(WISHLIST_STORAGE_KEY, [])
  );

  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState("");

  const isLoggedIn = () => Boolean(localStorage.getItem("token"));

  const cartRequest = useCallback(async (endpoint, options = {}) => {
    const authToken = localStorage.getItem("token");

    if (!authToken) {
      throw new Error("Please login to use your account cart.");
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Cart request failed.");
    }

    return data;
  }, []);

  // Save guest cart only. Logged-in cart is stored in MongoDB.
  useEffect(() => {
    if (!isLoggedIn()) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(
      WISHLIST_STORAGE_KEY,
      JSON.stringify(wishlist)
    );
  }, [wishlist]);

  const fetchCart = useCallback(async () => {
    if (!isLoggedIn()) {
      setCart(readStorage(CART_STORAGE_KEY, []));
      return;
    }

    try {
      setCartLoading(true);
      setCartError("");

      const data = await cartRequest("/cart");
      setCart(normalizeCartItems(data.cart?.items || []));
    } catch (error) {
      console.error("Fetch cart error:", error);
      setCartError(error.message);
    } finally {
      setCartLoading(false);
    }
  }, [cartRequest]);

  useEffect(() => {
    fetchCart();

    const handleAuthChange = () => {
      fetchCart();
    };

    window.addEventListener("authChange", handleAuthChange);

    return () => {
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, [fetchCart]);

  const addToCart = useCallback(
    async (product, quantity = 1) => {
      const productId = getProductId(product);

      if (!productId) {
        throw new Error("Product ID is missing.");
      }

      const requestedQuantity = Math.max(
        1,
        Math.floor(Number(quantity) || 1)
      );

      if (isLoggedIn()) {
        if (!isMongoId(productId)) {
          throw new Error(
            "This product does not have a MongoDB ID. Please load products from the backend."
          );
        }

        try {
          setCartError("");

          await cartRequest("/cart", {
            method: "POST",
            body: JSON.stringify({
              productId,
              quantity: requestedQuantity,
            }),
          });

          await fetchCart();
        } catch (error) {
          console.error("Add to cart error:", error);
          setCartError(error.message);
          throw error;
        }

        return;
      }

      // Guest cart
      const stock = Number(product.stock);
      if (Number.isFinite(stock) && stock <= 0) {
        throw new Error("This product is out of stock.");
      }

      setCart((currentCart) => {
        const existingItem = currentCart.find(
          (item) =>
            String(getProductId(item)) === String(productId)
        );

        const currentQuantity = existingItem
          ? Number(existingItem.quantity) || 1
          : 0;

        const maxQuantity = Number.isFinite(stock)
          ? Math.floor(stock)
          : Infinity;

        const nextQuantity = Math.min(
          currentQuantity + requestedQuantity,
          maxQuantity
        );

        if (existingItem) {
          return currentCart.map((item) =>
            String(getProductId(item)) === String(productId)
              ? { ...item, ...product, id: productId, quantity: nextQuantity }
              : item
          );
        }

        return [
          ...currentCart,
          {
            ...product,
            id: productId,
            quantity: Math.min(requestedQuantity, maxQuantity),
          },
        ];
      });
    },
    [cartRequest, fetchCart]
  );

  const removeFromCart = useCallback(
    async (productId) => {
      if (isLoggedIn()) {
        try {
          await cartRequest(
            `/cart/${encodeURIComponent(productId)}`,
            { method: "DELETE" }
          );

          await fetchCart();
        } catch (error) {
          setCartError(error.message);
          throw error;
        }

        return;
      }

      setCart((currentCart) =>
        currentCart.filter(
          (item) => String(getProductId(item)) !== String(productId)
        )
      );
    },
    [cartRequest, fetchCart]
  );

  const updateQuantity = useCallback(
    async (productId, quantity) => {
      const nextQuantity = Math.floor(Number(quantity));

      if (!Number.isFinite(nextQuantity) || nextQuantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      if (isLoggedIn()) {
        try {
          await cartRequest(
            `/cart/${encodeURIComponent(productId)}`,
            {
              method: "PATCH",
              body: JSON.stringify({ quantity: nextQuantity }),
            }
          );

          await fetchCart();
        } catch (error) {
          setCartError(error.message);
          throw error;
        }

        return;
      }

      setCart((currentCart) =>
        currentCart
          .map((item) => {
            if (String(getProductId(item)) !== String(productId)) {
              return item;
            }

            const stock = Number(item.stock);
            const maxQuantity = Number.isFinite(stock)
              ? Math.floor(stock)
              : Infinity;

            return {
              ...item,
              quantity: Math.min(nextQuantity, maxQuantity),
            };
          })
          .filter((item) => item.quantity > 0)
      );
    },
    [cartRequest, fetchCart, removeFromCart]
  );

  const clearCart = useCallback(async () => {
    if (isLoggedIn()) {
      await cartRequest("/cart", { method: "DELETE" });
    }

    setCart([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, [cartRequest]);

  const toggleWishlist = useCallback((productId) => {
    if (productId == null) return;

    setWishlist((currentWishlist) => {
      const alreadySaved = currentWishlist.some(
        (id) => String(id) === String(productId)
      );

      return alreadySaved
        ? currentWishlist.filter(
            (id) => String(id) !== String(productId)
          )
        : [...currentWishlist, productId];
    });
  }, []);

  const isWishlisted = useCallback(
    (productId) =>
      wishlist.some((id) => String(id) === String(productId)),
    [wishlist]
  );

  const cartCount = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + (Number(item.quantity) || 0),
        0
      ),
    [cart]
  );

  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total +
          (Number(item.price) || 0) * (Number(item.quantity) || 0),
        0
      ),
    [cart]
  );

  const value = useMemo(
    () => ({
      cart,
      wishlist,
      cartCount,
      cartTotal,
      cartLoading,
      cartError,
      fetchCart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleWishlist,
      isWishlisted,
    }),
    [
      cart,
      wishlist,
      cartCount,
      cartTotal,
      cartLoading,
      cartError,
      fetchCart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleWishlist,
      isWishlisted,
    ]
  );

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);

  if (!context) {
    throw new Error("useShop must be used inside a ShopProvider.");
  }

  return context;
}

export default ShopContext;
