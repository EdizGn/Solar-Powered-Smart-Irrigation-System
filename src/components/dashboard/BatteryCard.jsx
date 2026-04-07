import { Battery, BatteryLow, BatteryMedium, BatteryFull } from 'lucide-react'
import Card from '../common/Card'
import { useSystem } from '../../context/SystemContext'
import { getBatteryColor, getBatteryBgColor } from '../../utils/helpers'

/**
 * BatteryCard - Displays battery level with color-coded progress bar.
 * Green (>50%), amber (20-50%), red (<20%).
 * Also shows battery voltage.
 */
export default function BatteryCard() {
  const { sensors } = useSystem()
  const level = Math.round(sensors.batteryLevel)
  const voltage = sensors.batteryVoltage

  const BatteryIcon = level > 50 ? BatteryFull : level > 20 ? BatteryMedium : BatteryLow
  const colorText = getBatteryColor(level)
  const colorBg = getBatteryBgColor(level)

  return (
    <Card hover>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-green-50">
            <BatteryIcon className={`w-5 h-5 ${colorText}`} />
          </div>
          <h3 className="text-sm font-medium text-gray-600">Battery Level</h3>
        </div>
        <span className={`text-2xl font-bold ${colorText}`}>{level}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-700 ease-in-out ${colorBg}`}
          style={{ width: `${level}%` }}
        />
      </div>

      <p className="text-xs text-gray-400 mt-2">
        Voltage: {voltage.toFixed(2)}V
        {level < 20 && ' - Low battery warning'}
      </p>
    </Card>
  )
}
