import { authenticatedRequest } from "./apiUtils.js";

/**
 * Get bulk requests for the authenticated user
 * @param {Object} params - Query parameters for filtering, sorting, pagination
 * @param {string} token - JWT token for authentication
 * @returns {Promise<Object>} API response with bulk requests
 */
export default async function getBulkRequests(params = {}, token) {
  try {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);

    if (params.search) queryParams.append("search", params.search);

    if (params.category_id)
      queryParams.append("category_id", params.category_id);
    if (params.status) queryParams.append("status", params.status);
    if (params.min_quantity)
      queryParams.append("min_quantity", params.min_quantity);
    if (params.max_quantity)
      queryParams.append("max_quantity", params.max_quantity);
    if (params.min_price) queryParams.append("min_price", params.min_price);
    if (params.max_price) queryParams.append("max_price", params.max_price);

    if (params.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params.sort_order) queryParams.append("sort_order", params.sort_order);

    const queryString = queryParams.toString();
    const endpoint = `/bulk-request${queryString ? `?${queryString}` : ""}`;

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
    console.error("Error fetching bulk requests:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch bulk requests",
    };
  }
}

/**
 * Create a new bulk request
 * @param {Object} bulkRequestData - Bulk request data to create
 * @param {string} token - JWT token for authentication
 * @returns {Promise<Object>} API response
 */
export const createBulkRequest = async (bulkRequestData, token) => {
  try {
    const response = await authenticatedRequest(
      "/bulk-request",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bulkRequestData),
      },
      token
    );

    return {
      success: true,
      data: response.data,
      message: response.message,
    };
  } catch (error) {
    console.error("Error creating bulk request:", error);
    return {
      success: false,
      error: error.message || "Failed to create bulk request",
    };
  }
};

/**
 * Update an existing bulk request
 * @param {number} bulkRequestId - ID of the bulk request to update
 * @param {Object} bulkRequestData - Updated bulk request data
 * @param {string} token - JWT token for authentication
 * @returns {Promise<Object>} API response
 */
export const updateBulkRequest = async (
  bulkRequestId,
  bulkRequestData,
  token
) => {
  try {
    const response = await authenticatedRequest(
      `/bulk-request/${bulkRequestId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bulkRequestData),
      },
      token
    );

    return {
      success: true,
      data: response.data,
      message: response.message,
    };
  } catch (error) {
    console.error("Error updating bulk request:", error);
    return {
      success: false,
      error: error.message || "Failed to update bulk request",
    };
  }
};

/**
 * Delete a bulk request
 * @param {number} bulkRequestId - ID of the bulk request to delete
 * @param {string} token - JWT token for authentication
 * @returns {Promise<Object>} API response
 */
export const deleteBulkRequest = async (bulkRequestId, token) => {
  try {
    const response = await authenticatedRequest(
      `/bulk-request/${bulkRequestId}`,
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
    console.error("Error deleting bulk request:", error);
    return {
      success: false,
      error: error.message || "Failed to delete bulk request",
    };
  }
};
