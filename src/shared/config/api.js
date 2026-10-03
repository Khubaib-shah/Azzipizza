import apiClient from "../services/api-client";

export const URL = import.meta.env.VITE_API_BASE_URL_PRO_SOCKECT
// ||
// import.meta.env.VITE_API_BASE_URL_PRO ||
// import.meta.env.VITE_API_BASE_URL_DEV;

/**
 * @deprecated Use @shared/services instead.
 * This is kept for backward compatibility with legacy components.
 */
export const baseUri = apiClient;

export default baseUri;
