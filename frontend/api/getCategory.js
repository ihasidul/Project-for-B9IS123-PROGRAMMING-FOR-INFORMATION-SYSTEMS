const API_ROOT_URL = import.meta.env.VITE_API_ROOT_URL;
export default async function getCategory() {
  console.log("Fetching categories from API", API_ROOT_URL);
  const response = await fetch(API_ROOT_URL + `/product/category`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  } else {
    let responseData = await response.json();
    console.log("data", responseData);
    console.log("Response category:", responseData.data.categories);

    if (
      responseData.data.categories &&
      responseData.data.categories.length > 0
    ) {
      return responseData.data.categories;
    } else {
      console.warn("No categories found in the response:", responseData);
      return [];
    }
  }
}
