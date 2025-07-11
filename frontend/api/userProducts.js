import { authenticatedRequest } from "./apiUtils.js";

/**
 * Get user's products (farmer's products)
 * @param {Object} params - Query parameters for filtering, sorting, pagination
 * @param {string} token - JWT token for authentication
 * @returns {Promise<Object>} API response with user's products
 */
export const getUserProducts = async (params = {}, token) => {
  try {
    const queryParams = new URLSearchParams();

    // Add pagination parameters
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);

    // Add search parameter
    if (params.search) queryParams.append("search", params.search);

    // Add filtering parameters
    if (params.category_id)
      queryParams.append("category_id", params.category_id);
    if (params.is_active !== undefined)
      queryParams.append("is_active", params.is_active);
    if (params.min_price) queryParams.append("min_price", params.min_price);
    if (params.max_price) queryParams.append("max_price", params.max_price);

    // Add sorting parameters
    if (params.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params.sort_order) queryParams.append("sort_order", params.sort_order);

    const queryString = queryParams.toString();
    const endpoint = `/product/user-products${queryString ? `?${queryString}` : ""}`;

    const response = await authenticatedRequest(
      endpoint,
      {
        method: "GET",
      },
      token
    );

    return {
      success: true,
      data: response.data,
      message: response.message,
    };
  } catch (error) {
    console.error("Error fetching user products:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch user products",
    };
  }
};
export default getUserProducts;
