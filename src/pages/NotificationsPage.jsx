import { useState } from 'react'
import { Bell, CheckCheck, Info, CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react'
import Card from '../components/common/Card'
import { useSystem } from '../context/SystemContext'
import { timeAgo, getNotificationColors } from '../utils/helpers'

const TYPE_ICONS = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  danger: AlertOctagon,
}

const FILTER_OPTIONS = ['All', 'Unread', 'info', 'success', 'warning', 'danger']

/**
 * NotificationsPage - Real-time notification feed with severity-coded alerts.
 * Supports mark-as-read (individual and all), filtering by type and read status.
 * // TODO: Replace with real-time notifications from WebSocket/SSE
 */
export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead, unreadCount } = useSystem()
  const [filter, setFilter] = useState('All')

  const filtered = notifications.filter((n) => {
    if (filter === 'All') return true
    if (filter === 'Unread') return !n.read
    return n.type === filter
  })

  const getFilterLabel = (f) => {
    if (f === 'All') return `All (${notifications.length})`
    if (f === 'Unread') return `Unread (${unreadCount})`
    return f.charAt(0).toUpperCase() + f.slice(1)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <Bell className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
          {unreadCount > 0 && (
            <span className="flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {FILTER_OPTIONS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              filter === f
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {getFilterLabel(f)}
          </button>
        ))}
      </div>

      {/* Notification feed */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <Card>
            <div className="text-center py-12 text-gray-400">
              No notifications match this filter.
            </div>
          </Card>
        )}

        {filtered.map((notification) => {
          const colors = getNotificationColors(notification.type)
          const Icon = TYPE_ICONS[notification.type] || Info

          return (
            <div
              key={notification.id}
              className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                notification.read
                  ? 'bg-white border-gray-100'
                  : `${colors.bg} ${colors.border} border`
              }`}
            >
              {/* Icon */}
              <div className={`p-2 rounded-lg shrink-0 ${notification.read ? 'bg-gray-50' : colors.bg}`}>
                <Icon className={`w-4 h-4 ${notification.read ? 'text-gray-400' : colors.icon}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={`text-sm font-semibold ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                      {notification.title}
                    </p>
                    <p className={`text-sm mt-0.5 ${notification.read ? 'text-gray-400' : 'text-gray-600'}`}>
                      {notification.message}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-400">{timeAgo(notification.timestamp)}</span>
                    {!notification.read && (
                      <button
                        onClick={() => markNotificationRead(notification.id)}
                        className="p-1 rounded hover:bg-white/50 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Mark as read"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Unread dot */}
              {!notification.read && (
                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
