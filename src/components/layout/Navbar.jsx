import { Menu, LogOut, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../notifications/NotificationBell'

/**
 * Navbar - Top navigation bar with hamburger menu, notification bell, and user info.
 * @param {Object} props
 * @param {Function} props.onMenuClick - Callback to toggle sidebar on mobile
 */
export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left: hamburger menu (mobile only) */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Center spacer */}
        <div className="flex-1" />

        {/* Right: notification bell + user menu */}
        <div className="flex items-center gap-3">
          <NotificationBell />

          <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700">
              {user?.name || 'User'}
            </span>
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-500"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
