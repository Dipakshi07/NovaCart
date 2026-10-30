import { useCallback, useEffect, useState } from "react";
import apiRequest from "../services/api";

const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const search = filters.search || "";
  const category = filters.category || "";
  const sort = filters.sort || "";
  const minPrice = filters.minPrice ?? "";
  const maxPrice = filters.maxPrice ?? "";

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search) params.set("search", search);
      if (category && category !== "All Products") {
        params.set("category", category);
      }
      if (sort) params.set("sort", sort);
      if (minPrice !== "") params.set("minPrice", minPrice);
      if (maxPrice !== "") params.set("maxPrice", maxPrice);

      const query = params.toString();
      const data = await apiRequest(
        `/products${query ? `?${query}` : ""}`
      );

      const receivedProducts = Array.isArray(data.products)
        ? data.products
        : [];

      // Never use a numeric/static fallback ID.
      const validProducts = receivedProducts.filter(
        (product) =>
          product._id &&
          /^[0-9a-fA-F]{24}$/.test(String(product._id))
      );

      setProducts(validProducts);
    } catch (err) {
      setError(err.message || "Unable to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, minPrice, maxPrice]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refetchProducts: fetchProducts,
  };
};

export default useProducts;