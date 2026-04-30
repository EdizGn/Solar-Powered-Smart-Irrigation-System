import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'

/**
 * AuthContext - Manages JWT-based authentication state (TDR §8.4, §8.5).
 *
 * Security model (TDR §8.5):
 *  - Access token (JWT, 15 min TTL) is kept in module-level memory only.
 *    It is NEVER written to localStorage or sessionStorage to mitigate XSS.
 *  - A refresh token is stored in an HttpOnly, Secure, SameSite=Strict cookie
 *    by the backend on login. The browser sends it automatically; the frontend
 *    never reads or stores it.
 *  - On every page load (or app mount) the context calls POST /api/v1/auth/refresh
 *    to silently obtain a new access token. If the cookie is absent or expired,
 *    the call returns 401 and the user is sent to /login.
 *
 * TODO (backend integration):
 *  - Replace MOCK_LOGIN with real POST /api/v1/auth/login call.
 *  - Replace MOCK_REFRESH with real POST /api/v1/auth/refresh call.
 *  - Replace MOCK_LOGOUT with real POST /api/v1/auth/logout call.
 */

// ---------------------------------------------------------------------------
// Module-level token store — survives re-renders, wiped on tab close.
// Never accessible from outside this module.
// ---------------------------------------------------------------------------
let _accessToken = null   // string | null

/** Read the current in-memory access token (used by API utilities). */
// eslint-disable-next-line react-refresh/only-export-components
export function getAccessToken() {
  return _accessToken
}

// ---------------------------------------------------------------------------
// API base URL — reads from Vite env or falls back to localhost for dev.
// ---------------------------------------------------------------------------
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'

// ---------------------------------------------------------------------------
// Mock helpers (remove when backend is live)
// ---------------------------------------------------------------------------
const MOCK_DELAY = 700   // ms

/** Simulates POST /api/v1/auth/login */
async function MOCK_LOGIN(username, password) {
  await new Promise((r) => setTimeout(r, MOCK_DELAY))
  if (username === 'admin' && password === 'admin123') {
    return {
      accessToken: 'mock.jwt.access-token',
      user: { id: 1, username, name: 'Admin User', role: 'admin' },
    }
  }
  throw new Error('Invalid username or password')
}

/** Simulates POST /api/v1/auth/refresh (cookie-based) */
async function MOCK_REFRESH() {
  await new Promise((r) => setTimeout(r, 200))
  // In dev, treat the presence of 'irrigation_refresh' sessionStorage flag
  // as a stand-in for the HttpOnly cookie that the browser would send.
  const hasSession = sessionStorage.getItem('irrigation_dev_session')
  if (!hasSession) throw new Error('No refresh session')
  return {
    accessToken: 'mock.jwt.access-token-refreshed',
    user: JSON.parse(hasSession),
  }
}

/** Simulates POST /api/v1/auth/logout */
async function MOCK_LOGOUT() {
  await new Promise((r) => setTimeout(r, 200))
  sessionStorage.removeItem('irrigation_dev_session')
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const AuthContext = createContext(null)

/**
 * AuthProvider - Wraps the app and provides auth state.
 *
 * @param {{ children: React.ReactNode }} props
 */
export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null)
  const [isLoading, setIsLoading] = useState(true)   // true while silent refresh runs
  const [error, setError]       = useState(null)

  // Refresh timer ref — cleared on logout / unmount
  const refreshTimerRef = useRef(null)

  // ---------------------------------------------------------------------------
  // scheduleRefresh — queues a silent token refresh ~1 min before expiry.
  // In production the backend should send the expiry in the login response.
  // We default to 14 minutes (15 min JWT TTL − 1 min buffer).
  // ---------------------------------------------------------------------------
  const scheduleRefresh = useCallback((ttlMs = 14 * 60 * 1000) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    refreshTimerRef.current = setTimeout(async () => {
      try {
        // TODO: replace MOCK_REFRESH with:
        // const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
        //   method: 'POST', credentials: 'include'
        // })
        // if (!res.ok) throw new Error('Refresh failed')
        // const { accessToken, user: freshUser } = await res.json()
        const { accessToken, user: freshUser } = await MOCK_REFRESH()
        _accessToken = accessToken
        setUser(freshUser)
        scheduleRefresh()          // chain the next refresh
      } catch {
        // Refresh failed → force logout silently
        _accessToken = null
        setUser(null)
      }
    }, ttlMs)
  }, [])

  // ---------------------------------------------------------------------------
  // silentRefresh — called once on mount to restore session from cookie.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false

    async function silentRefresh() {
      try {
        // TODO: replace MOCK_REFRESH with real fetch (credentials: 'include')
        const { accessToken, user: restoredUser } = await MOCK_REFRESH()
        if (!cancelled) {
          _accessToken = accessToken
          setUser(restoredUser)
          scheduleRefresh()
        }
      } catch {
        // No valid refresh cookie → stay logged out (normal on first visit)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    silentRefresh()
    return () => {
      cancelled = true
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    }
  }, [scheduleRefresh])

  // ---------------------------------------------------------------------------
  // login — authenticates with username + password.
  // ---------------------------------------------------------------------------
  const login = useCallback(async (username, password) => {
    setIsLoading(true)
    setError(null)

    try {
      // TODO: replace MOCK_LOGIN with:
      // const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
      //   method: 'POST',
      //   credentials: 'include',   // backend sets the HttpOnly refresh cookie
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ username, password }),
      // })
      // if (!res.ok) {
      //   const { message } = await res.json().catch(() => ({}))
      //   throw new Error(message ?? 'Login failed')
      // }
      // const { accessToken, user: loggedInUser } = await res.json()
      const { accessToken, user: loggedInUser } = await MOCK_LOGIN(username, password)

      _accessToken = accessToken

      // Dev-only: store a session marker so MOCK_REFRESH works after page reload.
      // In production this line is not needed — the HttpOnly cookie handles it.
      sessionStorage.setItem('irrigation_dev_session', JSON.stringify(loggedInUser))

      setUser(loggedInUser)
      scheduleRefresh()
      return true
    } catch (err) {
      setError(err.message ?? 'Login failed')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [scheduleRefresh])

  // ---------------------------------------------------------------------------
  // logout — clears token, cancels refresh timer, calls logout endpoint.
  // ---------------------------------------------------------------------------
  const logout = useCallback(async () => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    _accessToken = null
    setUser(null)
    setError(null)

    try {
      // TODO: replace MOCK_LOGOUT with:
      // await fetch(`${API_BASE}/api/v1/auth/logout`, {
      //   method: 'POST', credentials: 'include'
      // })
      await MOCK_LOGOUT()
    } catch {
      // Logout errors are non-critical — user is already cleared locally
    }
  }, [])

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * useAuth - Hook to consume the AuthContext.
 * Throws if used outside of <AuthProvider>.
 *
 * @returns {{ user: object|null, isAuthenticated: boolean, isLoading: boolean, error: string|null, login: Function, logout: Function }}
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
