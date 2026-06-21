import { getAccessToken } from './auth';

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

/**
 * Internal helper — attaches the current Supabase JWT as an Authorization
 * Bearer header and performs a fetch to the Go backend.
 */
async function backendFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated — please log in.');

  return fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
}

/**
 * POST (or PUT/DELETE) to a Go Backend REST endpoint.
 *
 * Route mapping (old Hasura action → new REST):
 *   /actions/create-qr  →  POST   /api/qr
 *   /actions/update-qr  →  PUT    /api/qr/{id}
 *   /actions/delete-qr  →  DELETE /api/qr/{id}
 */
export async function callBackendAction(
  path: string,
  _clientID: string,      // kept for API compatibility; JWT carries the identity now
  input: Record<string, any> = {}
): Promise<any> {
  // Translate legacy Hasura action paths to REST paths
  let method = 'POST';
  let restPath = path;
  let body: Record<string, any> = input;

  if (path === '/actions/create-qr') {
    method = 'POST';
    restPath = '/api/qr';
  } else if (path === '/actions/update-qr') {
    method = 'PUT';
    const { id, ...rest } = input;
    restPath = `/api/qr/${id}`;
    body = rest;
  } else if (path === '/actions/delete-qr') {
    method = 'DELETE';
    restPath = `/api/qr/${input.id}`;
    body = {};
  }

  const response = await backendFetch(restPath, {
    method,
    body: method !== 'DELETE' ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) return null; // DELETE — no content

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error || json.message || `Request failed with status ${response.status}`);
  }
  return json;
}

/**
 * GET a resource from the Go backend.
 *
 * Route mapping:
 *   /qr-codes      →  GET /api/qr
 *   /scans/count   →  GET /api/scans/count
 *   /scans         →  GET /api/scans?qr_id=<id>
 */
export async function fetchFromBackend(
  path: string,
  _clientID: string,                      // kept for API compatibility
  params: Record<string, string> = {}
): Promise<any> {
  // Translate legacy paths to REST paths
  let restPath = path;
  if (path === '/qr-codes') restPath = '/api/qr';
  else if (path === '/scans/count') restPath = '/api/scans/count';
  else if (path === '/scans') restPath = '/api/scans';

  // Append query parameters
  const url = new URL(`${BACKEND_URL}${restPath}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const response = await backendFetch(url.pathname + url.search);

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error || json.message || `Request failed with status ${response.status}`);
  }
  return json;
}
