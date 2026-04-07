import { useState, useEffect } from 'react'
import {
  Activity,
  Cpu,
  Droplets,
  CloudRain,
  Power,
  Sun,
  Battery,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react'
import Card from '../components/common/Card'
import StatusBadge from '../components/common/StatusBadge'
import { useSystem } from '../context/SystemContext'
import { formatDate } from '../utils/helpers'

/**
 * Component status configuration for display.
 */
const COMPONENTS = [
  { key: 'esp32', label: 'ESP32 Controller', icon: Cpu, onLabel: 'Online', offLabel: 'Offline' },
  { key: 'moistureSensor', label: 'Moisture Sensor', icon: Droplets, onLabel: 'Active', offLabel: 'Fault' },
  { key: 'rainSensor', label: 'Rain Sensor', icon: CloudRain, onLabel: 'Active', offLabel: 'Fault' },
  { key: 'pump', label: 'Water Pump', icon: Power, onLabel: 'Active', offLabel: 'Fault' },
  { key: 'solarPanel', label: 'Solar Panel', icon: Sun, onLabel: 'Charging', offLabel: 'Not Charging' },
  { key: 'battery', label: 'Battery', icon: Battery, onLabel: 'Healthy', offLabel: 'Low' },
]

const HEALTH_CONFIG = {
  operational: { label: 'Operational', variant: 'success', icon: ShieldCheck, color: 'text-green-500' },
  warning: { label: 'Warning', variant: 'warning', icon: ShieldAlert, color: 'text-amber-500' },
  fault: { label: 'Fault', variant: 'danger', icon: ShieldAlert, color: 'text-red-500' },
  safe_mode: { label: 'Safe Mode', variant: 'danger', icon: ShieldAlert, color: 'text-red-600' },
}

/**
 * SystemStatusPage - System health overview and fault handling.
 * Shows overall health, individual component statuses, fault log,
 * and safe mode alert when battery drops below 3.3V.
 * // TODO: Replace with real system status from API GET /api/system/status
 */
export default function SystemStatusPage() {
  const { systemHealth, setSystemHealth, componentStatus, setComponentStatus, faultLog, setFaultLog, sensors } = useSystem()
  const [mockFaultLog] = useState(() => generateMockFaultLog())

  // Simulate system health based on sensors
  useEffect(() => {
    if (sensors.batteryVoltage < 3.3) {
      setSystemHealth('safe_mode')
      setComponentStatus((prev) => ({ ...prev, pump: 'fault', solarPanel: 'not_charging' }))
    } else if (sensors.batteryLevel < 20 || !sensors.wifiConnected) {
      setSystemHealth('warning')
    } else {
      setSystemHealth('operational')
    }
  }, [sensors, setSystemHealth, setComponentStatus])

  const healthConfig = HEALTH_CONFIG[systemHealth] || HEALTH_CONFIG.operational
  const HealthIcon = healthConfig.icon

  const isComponentOk = (key) => {
    const status = componentStatus[key]
    return ['online', 'active', 'charging', 'healthy'].includes(status)
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-semibold text-gray-900">System Status</h2>
      </div>

      {/* Safe Mode Alert */}
      {systemHealth === 'safe_mode' && (
        <div className="flex items-start gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">System Entered Safe Mode</p>
            <p className="text-xs text-red-600 mt-1">
              Battery voltage below 3.3V. Pump is disabled to preserve power.
              Ensure the solar panel is receiving sunlight for recharging.
            </p>
          </div>
        </div>
      )}

      {/* Overall Health */}
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${systemHealth === 'operational' ? 'bg-green-50' : systemHealth === 'warning' ? 'bg-amber-50' : 'bg-red-50'}`}>
              <HealthIcon className={`w-7 h-7 ${healthConfig.color}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Overall System Health</p>
              <p className="text-xl font-bold text-gray-900">{healthConfig.label}</p>
            </div>
          </div>
          <StatusBadge label={healthConfig.label} variant={healthConfig.variant} pulse />
        </div>

        {/* Battery voltage */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">Battery Voltage</span>
          <span className={`text-sm font-semibold ${sensors.batteryVoltage < 3.3 ? 'text-red-600' : sensors.batteryVoltage < 3.5 ? 'text-amber-600' : 'text-green-600'}`}>
            {sensors.batteryVoltage.toFixed(2)}V
          </span>
        </div>
      </Card>

      {/* Component Status Grid */}
      <h3 className="text-sm font-medium text-gray-600 mb-3">Component Status</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {COMPONENTS.map(({ key, label, icon: Icon, onLabel, offLabel }) => {
          const ok = isComponentOk(key)
          return (
            <Card key={key} hover>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${ok ? 'bg-green-50' : 'bg-red-50'}`}>
                    <Icon className={`w-5 h-5 ${ok ? 'text-green-500' : 'text-red-500'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{label}</p>
                    <p className={`text-xs ${ok ? 'text-green-600' : 'text-red-600'}`}>
                      {ok ? onLabel : offLabel}
                    </p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${ok ? 'bg-green-500' : 'bg-red-500'}`}>
                  {ok && <div className="w-3 h-3 rounded-full bg-green-500 animate-ping opacity-40" />}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Fault Log */}
      <h3 className="text-sm font-medium text-gray-600 mb-3">Fault Log</h3>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Component</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mockFaultLog.map((fault) => (
                <tr key={fault.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(fault.timestamp)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">{fault.component}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={fault.severity} variant={fault.severity === 'Critical' ? 'danger' : fault.severity === 'Warning' ? 'warning' : 'info'} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{fault.description}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {mockFaultLog.length === 0 && (
            <div className="text-center py-12 text-gray-400">No faults recorded.</div>
          )}
        </div>
      </Card>
    </div>
  )
}

/**
 * Generate mock fault log entries.
 * // TODO: Replace with real fault log from API GET /api/system/faults
 */
function generateMockFaultLog() {
  const now = Date.now()
  return [
    { id: 1, timestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString(), component: 'Moisture Sensor', severity: 'Warning', description: 'Sensor response time exceeded 500ms threshold' },
    { id: 2, timestamp: new Date(now - 8 * 60 * 60 * 1000).toISOString(), component: 'Wi-Fi Module', severity: 'Warning', description: 'Connection dropped - auto reconnected after 12s' },
    { id: 3, timestamp: new Date(now - 24 * 60 * 60 * 1000).toISOString(), component: 'Battery', severity: 'Critical', description: 'Voltage dropped to 3.28V - safe mode activated' },
    { id: 4, timestamp: new Date(now - 36 * 60 * 60 * 1000).toISOString(), component: 'Pump', severity: 'Info', description: 'Max runtime limit reached (20 min) - pump auto shut-off' },
    { id: 5, timestamp: new Date(now - 48 * 60 * 60 * 1000).toISOString(), component: 'Rain Sensor', severity: 'Warning', description: 'Inconsistent readings detected - recalibrating' },
    { id: 6, timestamp: new Date(now - 72 * 60 * 60 * 1000).toISOString(), component: 'ESP32', severity: 'Info', description: 'Watchdog timer reset triggered - system restarted normally' },
  ]
}
