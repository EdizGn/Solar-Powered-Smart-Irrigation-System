import { Power } from 'lucide-react'
import Card from '../common/Card'
import StatusBadge from '../common/StatusBadge'
import { useSystem } from '../../context/SystemContext'

/**
 * PumpStatusCard - Displays current pump ON/OFF status with color indicator.
 * Shows the current control mode (Automatic AI / Manual Override).
 */
export default function PumpStatusCard() {
  const { pumpStatus, controlMode } = useSystem()

  return (
    <Card hover>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${pumpStatus ? 'bg-green-50' : 'bg-gray-50'}`}>
            <Power className={`w-5 h-5 ${pumpStatus ? 'text-green-500' : 'text-gray-400'}`} />
          </div>
          <h3 className="text-sm font-medium text-gray-600">Pump Status</h3>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Animated status dot */}
          <div className={`w-4 h-4 rounded-full ${pumpStatus ? 'bg-green-500' : 'bg-red-500'}`}>
            {pumpStatus && (
              <div className="w-4 h-4 rounded-full bg-green-500 animate-ping opacity-50" />
            )}
          </div>
          <span className={`text-lg font-bold ${pumpStatus ? 'text-green-600' : 'text-red-600'}`}>
            {pumpStatus ? 'ON' : 'OFF'}
          </span>
        </div>
        <StatusBadge
          label={controlMode === 'automatic' ? 'Automatic (AI)' : 'Manual Override'}
          variant={controlMode === 'automatic' ? 'info' : 'warning'}
        />
      </div>
    </Card>
  )
}
