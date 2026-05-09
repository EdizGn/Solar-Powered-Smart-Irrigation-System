import { CloudRain, Sun } from 'lucide-react'
import Card from '../common/Card'
import { useSystem } from '../../context/SystemContext'

/**
 * RainStatusCard - Displays current rain detection status.
 * Shows "Rain Detected" or "Dry" with appropriate icon and color.
 */
export default function RainStatusCard() {
  const { sensors } = useSystem()
  const { isRaining } = sensors

  return (
    <Card hover>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${isRaining ? 'bg-blue-50' : 'bg-amber-50'}`}>
            {isRaining ? (
              <CloudRain className="w-5 h-5 text-blue-500" />
            ) : (
              <Sun className="w-5 h-5 text-amber-500" />
            )}
          </div>
          <h3 className="text-sm font-medium text-gray-600">Rain Status</h3>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`text-lg font-bold ${isRaining ? 'text-blue-600' : 'text-amber-600'}`}
        >
          {isRaining ? 'Rain Detected' : 'Dry'}
        </span>
      </div>

      <p className="text-xs text-gray-400 mt-2">
        {isRaining
          ? 'Irrigation will be postponed'
          : 'No precipitation detected'}
      </p>
    </Card>
  )
}
