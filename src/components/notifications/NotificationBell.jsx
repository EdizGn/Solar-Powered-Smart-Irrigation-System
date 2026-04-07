import { Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSystem } from '../../context/SystemContext'

/**
 * NotificationBell - Bell icon with unread notification count badge.
 * Clicking navigates to the notifications page.
 */
export default function NotificationBell() {
  const { unreadCount } = useSystem()
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate('/notifications')}
      className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600"
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}
