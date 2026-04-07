import { Droplets } from 'lucide-react'
import Card from '../common/Card'
import { useSystem } from '../../context/SystemContext'

/**
 * MoistureCard - Displays current soil moisture level as a percentage gauge.
 * Color-coded: green (>60%), amber (30-60%), red (<30%).
 */
export default function MoistureCard() {
  const { sensors } = useSystem()
  const moisture = Math.round(sensors.soilMoisture)

  const getColor = () => {
    if (moisture > 60) return { bar: 'bg-green-500', text: 'text-green-600' }
    if (moisture > 30) return { bar: 'bg-amber-500', text: 'text-amber-600' }
    return { bar: 'bg-red-500', text: 'text-red-600' }
  }

  const color = getColor()

  return (
    <Card hover>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-50">
            <Droplets className="w-5 h-5 text-blue-500" />
          </div>
          <h3 className="text-sm font-medium text-gray-600">Soil Moisture</h3>
        </div>
        <span className={`text-2xl font-bold ${color.text}`}>{moisture}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-700 ease-in-out ${color.bar}`}
          style={{ width: `${moisture}%` }}
        />
      </div>

      <p className="text-xs text-gray-400 mt-2">
        {moisture > 60
          ? 'Adequate moisture level'
          : moisture > 30
            ? 'Moderate - monitoring'
            : 'Low - irrigation needed'}
      </p>
    </Card>
  )
}
