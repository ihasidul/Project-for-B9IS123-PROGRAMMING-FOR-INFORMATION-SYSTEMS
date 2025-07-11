const API_ROOT_URL = import.meta.env.VITE_API_ROOT_URL;
export default async function createProduct(product) {
  const response = await fetch(API_ROOT_URL + `/product`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    }
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  } else {
    let responseData = await response.json();
    return responseData.data.product;
  }
}
