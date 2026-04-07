import { Wifi, WifiOff } from 'lucide-react'
import Card from '../common/Card'
import StatusBadge from '../common/StatusBadge'
import { useSystem } from '../../context/SystemContext'

/**
 * WifiStatusCard - Displays Wi-Fi connection status.
 * Shows Connected/Disconnected with color-coded badge.
 */
export default function WifiStatusCard() {
  const { sensors } = useSystem()
  const { wifiConnected } = sensors

  return (
    <Card hover>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${wifiConnected ? 'bg-green-50' : 'bg-red-50'}`}>
            {wifiConnected ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
          </div>
          <h3 className="text-sm font-medium text-gray-600">Wi-Fi Status</h3>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span
          className={`text-lg font-bold ${wifiConnected ? 'text-green-600' : 'text-red-600'}`}
        >
          {wifiConnected ? 'Connected' : 'Disconnected'}
        </span>
        <StatusBadge
          label={wifiConnected ? 'Online' : 'Offline'}
          variant={wifiConnected ? 'success' : 'danger'}
          pulse={wifiConnected}
        />
      </div>
    </Card>
  )
}
