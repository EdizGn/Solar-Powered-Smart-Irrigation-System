import { createContext, useContext, useState, useCallback } from 'react'

/**
 * AuthContext - Manages authentication state across the application.
 * Provides login, logout functions and current user info.
 * // TODO: Replace mock auth with JWT token-based authentication via API
 */
const AuthContext = createContext(null)

/** Mock user credentials for development */
const MOCK_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
}

/**
 * AuthProvider - Wraps the app and provides authentication state.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Check localStorage for persisted session (remember me)
    const saved = localStorage.getItem('irrigation_user')
    return saved ? JSON.parse(saved) : null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Attempt to log in with username and password.
   * @param {string} username
   * @param {string} password
   * @param {boolean} rememberMe - Persist session in localStorage
   * @returns {boolean} Whether login was successful
   */
  // TODO: Replace with API call to POST /api/auth/login
  const login = useCallback(async (username, password, rememberMe = false) => {
    setIsLoading(true)
    setError(null)

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    if (
      username === MOCK_CREDENTIALS.username &&
      password === MOCK_CREDENTIALS.password
    ) {
      const userData = {
        id: 1,
        username,
        name: 'Admin User',
        role: 'admin',
        // TODO: Store JWT token here from API response
        token: 'mock-jwt-token-xyz',
      }
      setUser(userData)
      if (rememberMe) {
        localStorage.setItem('irrigation_user', JSON.stringify(userData))
      }
      setIsLoading(false)
      return true
    }

    setError('Invalid username or password')
    setIsLoading(false)
    return false
  }, [])

  /** Log out the current user and clear persisted session. */
  // TODO: Replace with API call to POST /api/auth/logout
  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('irrigation_user')
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
 * Hook to access auth context.
 * @returns {{ user: Object|null, isAuthenticated: boolean, isLoading: boolean, error: string|null, login: Function, logout: Function }}
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
