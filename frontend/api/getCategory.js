import { apiRequest } from "./apiUtils.js";

export default async function getCategory() {
  try {
    console.log("Fetching categories from API");

    const responseData = await apiRequest("/product/category", {
      method: "GET",
    });

    console.log("Response data:", responseData);
    console.log("Response categories:", responseData.data.categories);

    if (
      responseData.data.categories &&
      responseData.data.categories.length > 0
    ) {
      return responseData.data.categories;
    } else {
      console.warn("No categories found in the response:", responseData);
      return [];
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}
