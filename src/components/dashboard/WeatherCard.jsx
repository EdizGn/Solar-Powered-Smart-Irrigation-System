import { Thermometer, Droplets, CloudRain } from 'lucide-react'
import Card from '../common/Card'
import { useSystem } from '../../context/SystemContext'

/**
 * WeatherCard - Displays current weather information.
 * Shows temperature (C), humidity (%), and rain probability (%).
 * // TODO: Replace with real weather API data (OpenWeatherMap, etc.)
 */
export default function WeatherCard() {
  const { sensors } = useSystem()
  const { temperature, humidity, rainProbability } = sensors

  const stats = [
    {
      icon: Thermometer,
      label: 'Temperature',
      value: `${temperature.toFixed(1)}`,
      unit: 'C',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      icon: Droplets,
      label: 'Humidity',
      value: `${humidity}`,
      unit: '%',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      icon: CloudRain,
      label: 'Rain Prob.',
      value: `${Math.round(rainProbability)}`,
      unit: '%',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
    },
  ]

  return (
    <Card hover className="col-span-1 sm:col-span-2 lg:col-span-1">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-sky-50">
          <Thermometer className="w-5 h-5 text-sky-500" />
        </div>
        <h3 className="text-sm font-medium text-gray-600">Weather Info</h3>
      </div>

      <div className="space-y-3">
        {stats.map(({ icon: Icon, label, value, unit, color, bgColor }) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-md ${bgColor}`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <span className="text-sm text-gray-500">{label}</span>
            </div>
            <span className="text-sm font-semibold text-gray-800">
              {value}
              <span className="text-xs text-gray-400 ml-0.5">{unit}</span>
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
