import { apiRequest } from "./apiUtils.js";

/**
 * Login user with username and password
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Promise<Object>} Login response with token and user data
 */
export const loginUser = async (username, password) => {
  try {
    const response = await apiRequest("/user/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.username - Username
 * @param {string} userData.email - Email address
 * @param {string} userData.password - Password
 * @param {string} userData.user_type - User type (customer, seller, business)
 * @returns {Promise<Object>} Registration response
 */
export const registerUser = async (userData) => {
  try {
    const response = await apiRequest("/user/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    return {
      success: true,
      message: response.message,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// TODO: Token verification is handled client-side by checking token expiration
// If needed, a verify-token endpoint can be added to the backend later
