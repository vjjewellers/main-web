import axios from "axios";

const productionApiUrl = "https://vjj-shop-server-0060.onrender.com/api";

const apiBaseUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5000/api" : productionApiUrl);

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("vjj_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || "";

    console.error(
      "API request failed:",
      status || error?.message || "Unknown error",
    );

    const isAuthPage = window.location.pathname.includes("/login");
    const isWishlistRequest = requestUrl.includes("/wishlist");

    if (status === 401 && !isWishlistRequest) {
      localStorage.removeItem("vjj_token");

      if (!isAuthPage) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
