import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/common/ProtectedRoute'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ControlPage from './pages/ControlPage'
import ReportsPage from './pages/ReportsPage'
import HistoryPage from './pages/HistoryPage'
import NotificationsPage from './pages/NotificationsPage'
import SettingsPage from './pages/SettingsPage'
import SystemStatusPage from './pages/SystemStatusPage'

/**
 * App - Root component with route definitions.
 *
 * Route structure (TDR §8.2):
 *  /login         → LoginPage     (public)
 *  /              → DashboardPage (protected)
 *  /control       → ControlPage   (protected)
 *  /reports       → ReportsPage   (protected)
 *  /history       → HistoryPage   (protected)
 *  /notifications → NotificationsPage (protected)
 *  /settings      → SettingsPage  (protected)
 *  /system        → SystemStatusPage  (protected)
 *  *              → redirect to /
 *
 * All protected routes are wrapped in a single ProtectedRoute + Layout pair
 * so auth checking and the shell UI are applied consistently.
 */
export default function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes — auth check + common shell layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/control" element={<ControlPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/system" element={<SystemStatusPage />} />
      </Route>

      {/* Catch-all — unknown paths go to dashboard (which may redirect to login) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
