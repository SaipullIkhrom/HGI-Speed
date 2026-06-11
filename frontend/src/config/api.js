export const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export const apiFetch = (endpoint, options = {}) => {
  return fetch(`${BASE_URL}${endpoint}`, options);
};
