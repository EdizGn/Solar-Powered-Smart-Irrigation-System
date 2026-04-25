import { createContext, useContext, useState, useCallback } from 'react'

/**
 * AuthContext - Manages authentication state across the application.
 * Provides login, logout functions and current user info.
 */
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('irrigation_user')
    return saved ? JSON.parse(saved) : null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Attempt to log in with username and password via Backend API.
   */
  const login = useCallback(async (username, password, rememberMe = false) => {
    setIsLoading(true)
    setError(null)

    try {
      // Senin yazdığın server.js portuna (3001) istek atıyoruz
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Backend'den gelen kullanıcı bilgisini state'e kaydediyoruz
        const userData = {
          ...data.user,
          // İleride JWT eklersen buraya data.token da gelecek
          token: 'active-session-token'
        };

        setUser(userData);

        if (rememberMe) {
          localStorage.setItem('irrigation_user', JSON.stringify(userData));
        }

        setIsLoading(false);
        return true;
      } else {
        setError(data.message || 'Giriş başarısız. Lütfen bilgileri kontrol edin.');
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      setError('Sunucuya bağlanılamadı. Backend çalışıyor mu?');
      setIsLoading(false);
      return false;
    }
  }, [])

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

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}