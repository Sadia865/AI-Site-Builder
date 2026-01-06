import axios from "axios";
import { toast } from "sonner";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASEURL || "http://localhost:3000",
  withCredentials: true,
  timeout: 180_000, // 3 min timeout for AI generation requests
});

// Optional: Retry failed requests once if timeout happens
api.interceptors.response.use(
  res => res,
  async err => {
    if (err.code === "ECONNABORTED") {
      toast.error("Request timed out. Please try again.");
    }
    return Promise.reject(err);
  }
);

export default api;
