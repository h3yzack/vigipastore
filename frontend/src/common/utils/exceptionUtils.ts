
export function getApiErrorMessage(error: any, fallback = "Unexpected error occurred.") {
  if (error.code === "ECONNABORTED" || error.message?.includes("Network Error")) {
    return "Cannot connect to server. Please check your network.";
  }
  if (error.response) {
    return error.response.data?.message || fallback;
  }
  return fallback;
}