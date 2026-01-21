import axios from "axios";
import { API } from "../config/constants";
import { tokenStorage } from "../utils/storage";

export const axiosClient = axios.create({
  baseURL: API.BASE_URL,
  timeout: API.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request Interceptor (attach token automatically)
axiosClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.get();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor (handle common errors)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend sends 401 -> token expired / invalid
    if (error?.response?.status === 401) {
      tokenStorage.remove();
      // optional: you can redirect to login later
      // window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
