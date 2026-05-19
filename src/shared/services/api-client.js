import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL_PRO_SOCKECT
// ||
// import.meta.env.VITE_API_BASE_URL_PRO ||
// import.meta.env.VITE_API_BASE_URL_DEV;

/** Maximum number of automatic retries for retriable failures. */
const MAX_RETRIES = 3;

/** Base delay (ms) for exponential backoff between retries. */
const RETRY_BASE_DELAY = 1500;

/**
 * Determines whether a failed request should be retried.
 * Only idempotent methods (GET, HEAD, OPTIONS) and only on
 * network / timeout errors (not 4xx/5xx server responses).
 */
function shouldRetry(error) {
  const method = (error.config?.method || "").toUpperCase();
  const isIdempotent = ["GET", "HEAD", "OPTIONS"].includes(method);
  const isNetworkOrTimeout =
    error.code === "ECONNABORTED" ||
    error.code === "ERR_NETWORK" ||
    error.message?.includes("timeout") ||
    !error.response; // no response = network-level failure
  return isIdempotent && isNetworkOrTimeout;
}

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Custom": "force-cors",
  },
  timeout: 30000, // 30 s – generous for slow mobile networks
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Track retry count on the config object
    config.__retryCount = config.__retryCount || 0;
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // --- Automatic retry with exponential backoff ---
    if (config && shouldRetry(error) && config.__retryCount < MAX_RETRIES) {
      config.__retryCount += 1;
      const delay = RETRY_BASE_DELAY * Math.pow(2, config.__retryCount - 1);
      console.warn(
        `[api-client] Retry ${config.__retryCount}/${MAX_RETRIES} for ${config.method?.toUpperCase()} ${config.url} in ${delay}ms`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return apiClient(config); // re-issue the request
    }

    // --- Normal error handling ---
    const message = error.response?.data?.message || error.message || "An unexpected error occurred";

    if (error.response?.status === 401) {
      console.warn("Unauthorized access - redirecting or clearing session");
    }

    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data,
      originalError: error,
    });
  }
);

export default apiClient;
