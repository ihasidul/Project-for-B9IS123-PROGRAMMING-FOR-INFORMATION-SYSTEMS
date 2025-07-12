import { authenticatedRequest } from "./apiUtils.js";

/**
 * Get user's products (farmer's products)
 * @param {Object} params - Query parameters for filtering, sorting, pagination
 * @param {string} token - JWT token for authentication
 * @returns {Promise<Object>} API response with user's products
 */
export default async function getUserProducts(params = {}, token) {
  try {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);

    if (params.search) queryParams.append("search", params.search);

    if (params.category_id)
      queryParams.append("category_id", params.category_id);
    if (params.is_active !== undefined)
      queryParams.append("is_active", params.is_active);
    if (params.min_price) queryParams.append("min_price", params.min_price);
    if (params.max_price) queryParams.append("max_price", params.max_price);

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

    // Return the response directly since it now includes pagination
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
}

/**
 * Create a new product
 * @param {Object} productData - Product data to create
 * @param {string} token - JWT token for authentication
 * @returns {Promise<Object>} API response
 */
export const createProduct = async (productData, token) => {
  try {
    const response = await authenticatedRequest(
      "/product",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      },
      token
    );

    return {
      success: true,
      data: response.data,
      message: response.message,
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      success: false,
      error: error.message || "Failed to create product",
    };
  }
};

/**
 * Update an existing product
 * @param {number} productId - ID of the product to update
 * @param {Object} productData - Updated product data
 * @param {string} token - JWT token for authentication
 * @returns {Promise<Object>} API response
 */
export const updateProduct = async (productId, productData, token) => {
  try {
    const response = await authenticatedRequest(
      `/product/${productId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      },
      token
    );

    return {
      success: true,
      data: response.data,
      message: response.message,
    };
  } catch (error) {
    console.error("Error updating product:", error);
    return {
      success: false,
      error: error.message || "Failed to update product",
    };
  }
};

/**
 * Delete a product
 * @param {number} productId - ID of the product to delete
 * @param {string} token - JWT token for authentication
 * @returns {Promise<Object>} API response
 */
export const deleteProduct = async (productId, token) => {
  try {
    const response = await authenticatedRequest(
      `/product/${productId}`,
      {
        method: "DELETE",
      },
      token
    );

    return {
      success: true,
      data: response.data,
      message: response.message,
    };
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      success: false,
      error: error.message || "Failed to delete product",
    };
  }
};
