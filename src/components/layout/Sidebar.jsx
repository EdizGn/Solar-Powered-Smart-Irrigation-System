import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Joystick,
  BarChart3,
  History,
  Bell,
  Settings,
  Droplets,
} from 'lucide-react'

/**
 * Navigation items configuration.
 * Each item maps to a route in the application.
 */
const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/control', icon: Joystick, label: 'Manual Control' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

/**
 * Sidebar - Dark side navigation menu for page routing.
 * Highlights the active route and collapses on mobile via props.
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether sidebar is visible (mobile)
 * @param {Function} props.onClose - Callback to close sidebar on mobile
 */
export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700">
          <Droplets className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-lg font-bold leading-tight">Smart Irrigation</h1>
            <p className="text-xs text-gray-400">Solar Powered System</p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="mt-4 px-3 space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
              end={to === '/'}
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-gray-700">
          <p className="text-xs text-gray-500">CENG318 Project</p>
          <p className="text-xs text-gray-500">v1.0.0</p>
        </div>
      </aside>
    </>
  )
}
