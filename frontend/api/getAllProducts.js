const API_ROOT_URL = import.meta.env.VITE_API_ROOT_URL;
export default async function getAllProducts({
  page = 1,
  limit = 10,
  search = null,
  categoryId = null,
  isActive = null,
  minPrice = null,
  maxPrice = null,
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

  console.log(
    "Fetching products with params:",
    params.toString(),
    " from API",
    API_ROOT_URL
  );
  const response = await fetch(
    `${API_ROOT_URL}/product?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  } else {
    let responseData = await response.json();
    console.log("data", responseData);
    console.log("Response product:", responseData.data.products);

    if (responseData.data.products && responseData.data.products.length > 0) {
      return responseData.data.products;
    } else {
      console.warn("No products found in the response:", responseData);
      return [];
    }
  }
}
