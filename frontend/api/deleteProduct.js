const API_ROOT_URL = import.meta.env.VITE_API_ROOT_URL;
export default async function deleteProduct(productId) {
  const response = await fetch(API_ROOT_URL + `/product/${productId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  } else {
    return true;
  }
}
