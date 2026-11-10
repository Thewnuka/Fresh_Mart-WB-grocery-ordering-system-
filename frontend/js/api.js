// Address of the Spring Boot backend
const SERVER_URL = "http://localhost:8080";

// Sends a request to the backend and returns { ok, status, data }.
// "body" can be a normal object (sent as JSON) or FormData (sent as form fields).
// status is the HTTP status code (401 = not logged in), or 0 if the server could not be reached.
export async function callApi(path, method = "GET", body = null) {
    const options = { method: method, credentials: "include" }; // send the session cookie

    if (body instanceof FormData) {
        options.body = body; // the browser sets the multipart Content-Type itself
    } else if (body !== null) {
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

// Address of an item's image, or the "No Image" placeholder when the item has no image
export function itemImageUrl(imageName) {
    return imageName ? SERVER_URL + "/item-images/" + imageName : "/no-image.svg";
}
