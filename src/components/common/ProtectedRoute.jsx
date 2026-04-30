import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

/**
 * ProtectedRoute - Guards all authenticated routes.
 *
 * Behaviour (TDR §8.5):
 *  - If auth state is still being resolved (isLoading = true, e.g. during
 *    a silent token refresh on page reload), show a full-screen spinner so
 *    the user is never flash-redirected to /login.
 *  - If the user is not authenticated after the load completes, redirect to
 *    /login with `replace` so the back-button cannot return to a protected page.
 *  - If the user is authenticated, render the children normally.
 *
 * @param {{ children: React.ReactNode }} props
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  // Wait for silent refresh / initial auth check to finish before deciding
  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Checking authentication…"
        className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-50"
      >
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
