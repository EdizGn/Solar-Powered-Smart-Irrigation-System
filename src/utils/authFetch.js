/**
 * authFetch - Authenticated fetch wrapper (TDR §8.5, §9.1).
 *
 * Automatically attaches the in-memory JWT access token to every request as
 *   Authorization: Bearer <token>
 * and sets credentials: 'include' so the browser sends the HttpOnly refresh
 * cookie on every request (needed for the /api/v1/auth/refresh endpoint).
 *
 * Usage:
 *   import { authFetch } from '../utils/authFetch'
 *   const data = await authFetch('/api/v1/sensors/latest')
 *
 * On 401 responses the function throws an AuthError so callers can handle
 * session expiry (e.g. redirect to /login via the AuthContext logout fn).
 *
 * TODO (backend integration): update API_BASE via VITE_API_BASE_URL in .env
 */

import { getAccessToken } from '../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'

/** Thrown when the server responds with HTTP 401 Unauthorized. */
export class AuthError extends Error {
  constructor(message = 'Unauthorized') {
    super(message)
    this.name = 'AuthError'
    this.status = 401
  }
}

/**
 * Wrapper around fetch() that:
 *  1. Resolves relative paths against API_BASE
 *  2. Attaches the Bearer token from memory
 *  3. Includes cookies (for refresh token)
 *  4. Sets Content-Type: application/json by default
 *  5. Throws AuthError on 401, Error on other non-2xx responses
 *
 * @param {string} path       - API path, e.g. '/api/v1/sensors/latest'
 * @param {RequestInit} [options] - Standard fetch options (merged)
 * @returns {Promise<any>}    - Parsed JSON body
 */
export async function authFetch(path, options = {}) {
  const token = getAccessToken()

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  }

  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',   // send HttpOnly refresh cookie automatically
    ...options,
    headers,
  })

  if (response.status === 401) {
    throw new AuthError()
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.message ?? `HTTP ${response.status}`)
  }

  // 204 No Content — return null instead of trying to parse empty body
  if (response.status === 204) return null

  return response.json()
}
