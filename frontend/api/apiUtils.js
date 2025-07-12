const API_ROOT_URL = import.meta.env.VITE_API_ROOT_URL;

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_ROOT_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (errorData.message) {
        throw new Error(errorData.message);
      } else if (errorData.detail) {
        throw new Error(errorData.detail);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

export const authenticatedRequest = async (endpoint, options = {}, token) => {
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  return apiRequest(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      ...authHeaders,
    },
  });
};
