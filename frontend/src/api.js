// Address of the Spring Boot backend
const SERVER_URL = "http://localhost:8080";

// Sends a JSON request to the backend and returns { ok, status, data }.
// status is the HTTP status code (401 = not logged in), or 0 if the server could not be reached.
export async function callApi(path, method = "GET", body = null) {
  const options = { method: method, credentials: "include" }; // send the session cookie

  if (body !== null) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(SERVER_URL + "/api" + path, options);
    const data = await response.json().catch(() => ({ message: "Request failed (error " + response.status + ")." }));
    return { ok: response.ok, status: response.status, data: data };
  } catch (error) {
    return { ok: false, status: 0, data: { message: "Cannot connect to the server. Is the backend running?" } };
  }
}

// Turns a date from the backend such as "2026-11-06T01:13:18" into "6 November 2026"
export function formatDate(dateText) {
  return new Date(dateText).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

// Turns 1450 into "Rs. 1,450.00"
export function formatPrice(price) {
  return "Rs. " + Number(price).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Address of an item's image, or the "No Image" placeholder when the item has no image
export function itemImageUrl(imageName) {
  return imageName ? SERVER_URL + "/item-images/" + imageName : "/no-image.svg";
}

// Used as onError on <img> tags: shows the placeholder if an image file cannot be loaded
export function showPlaceholderImage(event) {
  if (!event.currentTarget.src.endsWith("/no-image.svg")) {
    event.currentTarget.src = "/no-image.svg";
  }
}
