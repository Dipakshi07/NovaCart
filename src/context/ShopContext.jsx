
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
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api"
).replace(/\/$/, "");

/* =========================================================
   HELPERS
========================================================= */

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);

    if (!saved) {
      return fallback;
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    console.error(`Unable to read ${key}:`, error);
    return fallback;
  }
}

/**
 * MongoDB ObjectId validation
 */
function isMongoId(id) {
  return /^[a-f\d]{24}$/i.test(String(id || ""));
}

/**
 * Always prefer MongoDB _id.
 *
 * IMPORTANT:
 * Backend products should contain _id.
 * We only use id as a compatibility fallback.
 */
function getProductId(product) {
  if (!product) return null;

  const mongoId = product._id;

  if (mongoId && isMongoId(mongoId)) {
    return String(mongoId);
  }

  const fallbackId = product.id;

  if (fallbackId && isMongoId(fallbackId)) {
    return String(fallbackId);
  }

  return null;
}

/**
 * Normalize backend cart response.
 *
 * Backend:
 * {
 *   product: {
 *      _id,
 *      name,
 *      price,
 *      ...
 *   },
 *   quantity
 * }
 *
 * Frontend:
 * {
 *   _id,
 *   id,
 *   name,
 *   price,
 *   quantity
 * }
 */
function normalizeCartItems(items = []) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item) => item?.product)
    .map((item) => {
      const product = item.product;

      const productId = getProductId(product);

      if (!productId) {
        return null;
      }

      return {
        ...product,

        // Always keep both fields synchronized.
        _id: productId,
        id: productId,

        quantity: Math.max(
          1,
          Number(item.quantity) || 1
        ),
      };
    })
    .filter(Boolean);
}

/**
 * Normalize local guest cart.
 *
 * Old localStorage entries may contain numeric IDs.
 * They are intentionally removed because they cannot be
 * used with the MongoDB cart API.
 */
function normalizeGuestCart(items = []) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      const productId = getProductId(item);

      if (!productId) {
        return null;
      }

      return {
        ...item,
        _id: productId,
        id: productId,
        quantity: Math.max(
          1,
          Number(item.quantity) || 1
        ),
      };
    })
    .filter(Boolean);
}

/* =========================================================
   PROVIDER
========================================================= */

export function ShopProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const savedCart = readStorage(
      CART_STORAGE_KEY,
      []
    );

    return normalizeGuestCart(savedCart);
  });

  const [wishlist, setWishlist] = useState(() => {
    const savedWishlist = readStorage(
      WISHLIST_STORAGE_KEY,
      []
    );

    return savedWishlist.filter(isMongoId);
  });

  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState("");

  /* =======================================================
     AUTH
  ======================================================= */

  const isLoggedIn = useCallback(() => {
    return Boolean(localStorage.getItem("token"));
  }, []);

  /* =======================================================
     CART API REQUEST
  ======================================================= */

  const cartRequest = useCallback(
    async (endpoint, options = {}) => {
      const authToken =
        localStorage.getItem("token");

      if (!authToken) {
        throw new Error(
          "Please login to use your account cart."
        );
      }

      const response = await fetch(
        `${API_URL}${endpoint}`,
        {
          ...options,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
            ...(options.headers || {}),
          },
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Cart request failed (${response.status}).`
        );
      }

      return data;
    },
    []
  );

  /* =======================================================
     SAVE GUEST CART
  ======================================================= */

  useEffect(() => {
    if (!isLoggedIn()) {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cart)
      );
    }
  }, [cart, isLoggedIn]);

  /* =======================================================
     SAVE WISHLIST
  ======================================================= */

  useEffect(() => {
    localStorage.setItem(
      WISHLIST_STORAGE_KEY,
      JSON.stringify(wishlist)
    );
  }, [wishlist]);

  /* =======================================================
     FETCH CART FROM MONGODB
  ======================================================= */

  const fetchCart = useCallback(async () => {
    if (!isLoggedIn()) {
      const guestCart = normalizeGuestCart(
        readStorage(CART_STORAGE_KEY, [])
      );

      setCart(guestCart);
      return;
    }

    try {
      setCartLoading(true);
      setCartError("");

      const data = await cartRequest("/cart");

      const serverItems =
        data?.cart?.items || [];

      const normalizedItems =
        normalizeCartItems(serverItems);

      setCart(normalizedItems);

      // Remove any old guest-cart data after
      // successful server synchronization.
      localStorage.removeItem(
        CART_STORAGE_KEY
      );
    } catch (error) {
      console.error(
        "Fetch cart error:",
        error
      );

      setCartError(
        error.message ||
          "Unable to load cart."
      );
    } finally {
      setCartLoading(false);
    }
  }, [cartRequest, isLoggedIn]);

  /* =======================================================
     INITIAL CART LOAD + AUTH CHANGE
  ======================================================= */

  useEffect(() => {
    fetchCart();

    const handleAuthChange = () => {
      fetchCart();
    };

    window.addEventListener(
      "authChange",
      handleAuthChange
    );

    return () => {
      window.removeEventListener(
        "authChange",
        handleAuthChange
      );
    };
  }, [fetchCart]);

  /* =======================================================
     ADD TO CART
  ======================================================= */

  const addToCart = useCallback(
    async (product, quantity = 1) => {
      if (!product) {
        throw new Error(
          "Product information is missing."
        );
      }

      const productId =
        getProductId(product);

      /*
       * This is the most important protection.
       *
       * Numeric IDs like:
       * 1, 2, 3, 4...
       *
       * are NOT accepted.
       *
       * Only MongoDB ObjectIds are allowed.
       */
      if (!productId) {
        throw new Error(
          "Invalid product ID. Please reload products from the backend."
        );
      }

      const requestedQuantity = Math.max(
        1,
        Math.floor(Number(quantity) || 1)
      );

      /* ===================================================
         LOGGED-IN USER
      =================================================== */

      if (isLoggedIn()) {
        try {
          setCartError("");

          await cartRequest("/cart", {
            method: "POST",
            body: JSON.stringify({
              productId,
              quantity: requestedQuantity,
            }),
          });

          /*
           * Get the latest cart directly from MongoDB.
           */
          await fetchCart();
        } catch (error) {
          console.error(
            "Add to cart error:",
            error
          );

          setCartError(
            error.message ||
              "Unable to add product to cart."
          );

          throw error;
        }

        return;
      }

      /* ===================================================
         GUEST USER
      =================================================== */

      const stock = Number(product.stock);

      if (
        Number.isFinite(stock) &&
        stock <= 0
      ) {
        throw new Error(
          "This product is out of stock."
        );
      }

      setCart((currentCart) => {
        const existingItem =
          currentCart.find(
            (item) =>
              String(
                getProductId(item)
              ) === productId
          );

        const currentQuantity =
          existingItem
            ? Number(
                existingItem.quantity
              ) || 1
            : 0;

        const maxQuantity =
          Number.isFinite(stock)
            ? Math.floor(stock)
            : Infinity;

        const nextQuantity = Math.min(
          currentQuantity +
            requestedQuantity,
          maxQuantity
        );

        if (existingItem) {
          return currentCart.map(
            (item) =>
              String(
                getProductId(item)
              ) === productId
                ? {
                    ...item,
                    ...product,
                    _id: productId,
                    id: productId,
                    quantity:
                      nextQuantity,
                  }
                : item
          );
        }

        return [
          ...currentCart,
          {
            ...product,

            // Always save MongoDB ID.
            _id: productId,
            id: productId,

            quantity: Math.min(
              requestedQuantity,
              maxQuantity
            ),
          },
        ];
      });
    },
    [
      cartRequest,
      fetchCart,
      isLoggedIn,
    ]
  );

  /* =======================================================
     REMOVE FROM CART
  ======================================================= */

  const removeFromCart = useCallback(
    async (productId) => {
      if (!isMongoId(productId)) {
        throw new Error(
          "Invalid MongoDB product ID."
        );
      }

      if (isLoggedIn()) {
        try {
          setCartError("");

          await cartRequest(
            `/cart/${encodeURIComponent(
              productId
            )}`,
            {
              method: "DELETE",
            }
          );

          await fetchCart();
        } catch (error) {
          console.error(
            "Remove cart error:",
            error
          );

          setCartError(
            error.message ||
              "Unable to remove product."
          );

          throw error;
        }

        return;
      }

      setCart((currentCart) =>
        currentCart.filter(
          (item) =>
            String(
              getProductId(item)
            ) !== String(productId)
        )
      );
    },
    [
      cartRequest,
      fetchCart,
      isLoggedIn,
    ]
  );

  /* =======================================================
     UPDATE QUANTITY
  ======================================================= */

  const updateQuantity = useCallback(
    async (productId, quantity) => {
      if (!isMongoId(productId)) {
        throw new Error(
          "Invalid MongoDB product ID."
        );
      }

      const nextQuantity =
        Math.floor(Number(quantity));

      if (
        !Number.isFinite(nextQuantity) ||
        nextQuantity <= 0
      ) {
        await removeFromCart(productId);
        return;
      }

      /* ===================================================
         LOGGED-IN USER
      =================================================== */

      if (isLoggedIn()) {
        try {
          setCartError("");

          await cartRequest(
            `/cart/${encodeURIComponent(
              productId
            )}`,
            {
              method: "PATCH",
              body: JSON.stringify({
                quantity: nextQuantity,
              }),
            }
          );

          await fetchCart();
        } catch (error) {
          console.error(
            "Update quantity error:",
            error
          );

          setCartError(
            error.message ||
              "Unable to update quantity."
          );

          throw error;
        }

        return;
      }

      /* ===================================================
         GUEST USER
      =================================================== */

      setCart((currentCart) =>
        currentCart
          .map((item) => {
            if (
              String(
                getProductId(item)
              ) !== String(productId)
            ) {
              return item;
            }

            const stock =
              Number(item.stock);

            const maxQuantity =
              Number.isFinite(stock)
                ? Math.floor(stock)
                : Infinity;

            return {
              ...item,
              _id: productId,
              id: productId,
              quantity: Math.min(
                nextQuantity,
                maxQuantity
              ),
            };
          })
          .filter(
            (item) =>
              Number(item.quantity) > 0
          )
      );
    },
    [
      cartRequest,
      fetchCart,
      isLoggedIn,
      removeFromCart,
    ]
  );

  /* =======================================================
     CLEAR CART
  ======================================================= */

  const clearCart = useCallback(
    async () => {
      if (isLoggedIn()) {
        try {
          setCartError("");

          await cartRequest("/cart", {
            method: "DELETE",
          });
        } catch (error) {
          console.error(
            "Clear cart error:",
            error
          );

          setCartError(
            error.message ||
              "Unable to clear cart."
          );

          throw error;
        }
      }

      setCart([]);

      localStorage.removeItem(
        CART_STORAGE_KEY
      );
    },
    [cartRequest, isLoggedIn]
  );

  /* =======================================================
     WISHLIST
  ======================================================= */

  const toggleWishlist = useCallback(
    (productId) => {
      if (!isMongoId(productId)) {
        console.warn(
          "Invalid wishlist product ID:",
          productId
        );
        return;
      }

      setWishlist(
        (currentWishlist) => {
          const alreadySaved =
            currentWishlist.some(
              (id) =>
                String(id) ===
                String(productId)
            );

          if (alreadySaved) {
            return currentWishlist.filter(
              (id) =>
                String(id) !==
                String(productId)
            );
          }

          return [
            ...currentWishlist,
            productId,
          ];
        }
      );
    },
    []
  );

  const isWishlisted = useCallback(
    (productId) => {
      if (!isMongoId(productId)) {
        return false;
      }

      return wishlist.some(
        (id) =>
          String(id) ===
          String(productId)
      );
    },
    [wishlist]
  );

  /* =======================================================
     CART COUNT
  ======================================================= */

  const cartCount = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total +
          (Number(item.quantity) || 0),
        0
      ),
    [cart]
  );

  /* =======================================================
     CART TOTAL
  ======================================================= */

  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total +
          (Number(item.price) || 0) *
            (Number(item.quantity) || 0),
        0
      ),
    [cart]
  );

  /* =======================================================
     CONTEXT VALUE
  ======================================================= */

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

/* =========================================================
   USE SHOP
========================================================= */

export function useShop() {
  const context = useContext(ShopContext);

  if (!context) {
    throw new Error(
      "useShop must be used inside a ShopProvider."
    );
  }

  return context;
}

export default ShopContext;
