// Address of the Spring Boot backend
const SERVER_URL = "http://localhost:8080";

// Sends a JSON request to the backend and returns { ok, data }
export async function callApi(path, method = "GET", body = null) {
  const options = { method: method, credentials: "include" }; // send the session cookie

  if (body !== null) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(SERVER_URL + "/api" + path, options);
    const data = await response.json().catch(() => ({ message: "Request failed (error " + response.status + ")." }));
    return { ok: response.ok, data: data };
  } catch (error) {
    return { ok: false, data: { message: "Cannot connect to the server. Is the backend running?" } };
  }
}
