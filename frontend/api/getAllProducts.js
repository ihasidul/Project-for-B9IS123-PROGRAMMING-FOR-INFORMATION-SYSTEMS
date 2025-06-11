const API_ROOT_URL = import.meta.env.VITE_API_ROOT_URL;
export default async function getAllProducts(offset = 0, limit = 10) {
  console.log(
    "Fetching products with offset:",
    offset,
    "and limit:",
    limit,
    " from API",
    API_ROOT_URL
  );
  const response = await fetch(
    API_ROOT_URL + `/product?offset=${offset}&limit=${limit}`,
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
      console.warn("No products found in the response:", data);
      return [];
    }
  }
}
