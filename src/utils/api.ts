export const BACKEND_URL = "http://localhost:3001";

/**
 * Call a Go Backend REST endpoint.
 * Wraps the request in the Hasura-action-compatible envelope for local dev.
 *
 * Future: replace envelope with JWT Authorization header once the Go backend
 * issues tokens from POST /auth/login.
 */
export async function callBackendAction(
  path: string,
  clientID: string,
  input: Record<string, any> = {}
) {
  const payload = {
    input: { input },
    session_variables: {
      "x-hasura-role": "user",
      "x-hasura-user-id": clientID,
    },
  };

  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || `Action failed with status ${response.status}`);
  }
  return json;
}

/**
 * Fetch a resource from the Go backend via GET.
 * Used for read-only queries (QR list, scan stats, etc.).
 */
export async function fetchFromBackend(
  path: string,
  clientID: string,
  params: Record<string, string> = {}
) {
  const url = new URL(`${BACKEND_URL}${path}`);
  url.searchParams.set("client_id", clientID);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const response = await fetch(url.toString(), {
    headers: {
      "x-hasura-user-id": clientID,
      "x-hasura-role": "user",
    },
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || `Request failed with status ${response.status}`);
  }
  return json;
}
