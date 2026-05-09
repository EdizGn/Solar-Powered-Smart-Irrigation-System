import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Joystick, BarChart3, Bell, Settings } from 'lucide-react'
import { useSystem } from '../../context/SystemContext'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/control', icon: Joystick, label: 'Control' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/notifications', icon: Bell, label: 'Alerts' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function BottomNav() {
  const { unreadCount } = useSystem()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 lg:hidden safe-bottom">
      <div className="flex items-center justify-around px-1 py-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl text-[10px] font-medium transition-colors min-w-[56px] relative ${
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-400 active:bg-gray-100'
              }`
            }
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {label === 'Alerts' && unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 text-[9px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
