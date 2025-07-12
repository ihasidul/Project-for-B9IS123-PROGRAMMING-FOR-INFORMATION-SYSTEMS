import { apiRequest } from "./apiUtils.js";

export default async function getAllProducts({
  page = 1,
  limit = 10,
  search = null,
  categoryId = null,
  isActive = null,
  minPrice = null,
  maxPrice = null,
  sortBy = "name",
  sortOrder = "asc",
}) {
  const params = new URLSearchParams();
  params.append("page", page);
  params.append("limit", limit);
  if (search) {
    params.append("search", search);
  }
  if (categoryId) {
    params.append("category_id", categoryId);
  }
  if (isActive !== null) {
    params.append("is_active", isActive);
  }
  if (minPrice) {
    params.append("min_price", minPrice);
  }
  if (maxPrice) {
    params.append("max_price", maxPrice);
  }
  if (sortBy) {
    params.append("sort_by", sortBy);
  }
  if (sortOrder) {
    params.append("sort_order", sortOrder);
  }

  try {
    console.log("Fetching products with params:", params.toString());

    const responseData = await apiRequest(`/product?${params.toString()}`, {
      method: "GET",
    });

    console.log("Response data:", responseData);
    console.log("Response products:", responseData.data?.products);
    console.log("Response pagination:", responseData.data?.pagination);

    return {
      data: responseData.data,
      message: responseData.message,
      success: responseData.success || true,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}
