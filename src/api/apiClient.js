import axios from "axios";
const timeout = Number(import.meta.env.VITE_REQUEST_TIMEOUT_MS) || 15000;
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
  timeout,
  headers: { Accept: "application/json" },
});
apiClient.interceptors.response.use(
  (r) => r,
  (error) => {
    const body = error.response?.data;
    const mapped = new Error(
      body?.message ||
        (error.code === "ECONNABORTED"
          ? "The request timed out."
          : "Unable to retrieve dashboard data."),
    );
    mapped.status = error.response?.status;
    mapped.code = body?.code;
    mapped.endpoint = error.config?.url;
    return Promise.reject(mapped);
  },
);
