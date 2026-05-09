import { Brain, Droplets, CloudRain, BatteryLow, Eye } from 'lucide-react'
import Card from '../common/Card'
import StatusBadge from '../common/StatusBadge'
import { useSystem } from '../../context/SystemContext'

/**
 * AiDecisionCard - Displays the current AI irrigation recommendation.
 * Shows contextual icon and color based on decision type:
 * - irrigate: green with water icon
 * - skip: amber with rain icon
 * - standby: red with battery icon
 * - monitoring: blue with eye icon
 */
export default function AiDecisionCard() {
  const { aiDecision } = useSystem()
  const { action, message } = aiDecision

  const config = {
    irrigate: {
      icon: Droplets,
      variant: 'success',
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    skip: {
      icon: CloudRain,
      variant: 'warning',
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50',
    },
    standby: {
      icon: BatteryLow,
      variant: 'danger',
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50',
    },
    monitoring: {
      icon: Eye,
      variant: 'info',
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
  }

  const { icon: ActionIcon, variant, iconColor, bgColor } = config[action] || config.monitoring

  return (
    <Card hover>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-50">
            <Brain className="w-5 h-5 text-purple-500" />
          </div>
          <h3 className="text-sm font-medium text-gray-600">AI Decision</h3>
        </div>
        <StatusBadge label={action.toUpperCase()} variant={variant} pulse />
      </div>

      <div className="flex items-center gap-3 mt-2">
        <div className={`p-2.5 rounded-lg ${bgColor}`}>
          <ActionIcon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <span className="text-base font-semibold text-gray-800">{message}</span>
      </div>

      <p className="text-xs text-gray-400 mt-3 italic">
        This recommendation is generated based on real-time sensor data and weather conditions.
      </p>
    </Card>
  )
}
