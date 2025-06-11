export default async function getHealthCheckOfBackend() {
  const response = await fetch(`/`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  } else {
    return true;
  }
}
