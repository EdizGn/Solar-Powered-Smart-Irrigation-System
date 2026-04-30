import { useState, useEffect } from 'react'
import { Power, ToggleLeft, ToggleRight, AlertTriangle, Timer } from 'lucide-react'
import Card from '../components/common/Card'
import StatusBadge from '../components/common/StatusBadge'
import { useSystem } from '../context/SystemContext'

/**
 * ControlPage - Manual pump control panel.
 * Provides ON/OFF buttons, shows current mode (Auto/Manual),
 * a running timer for manual mode, and a warning about auto-return.
 * // TODO: Replace togglePump with API call to POST /api/pump/control
 */
export default function ControlPage() {
  const { pumpStatus, controlMode, manualStartTime, togglePump, sensors } = useSystem()
  const [elapsed, setElapsed] = useState(0)

  // Timer for manual mode duration — tick every second to refresh displayElapsed
  useEffect(() => {
    if (controlMode !== 'manual' || !manualStartTime) return

    const tick = setInterval(() => {
      setElapsed(Math.floor((Date.now() - manualStartTime) / 1000))
    }, 1000)

    return () => clearInterval(tick)
  }, [controlMode, manualStartTime])

  // Derive current display value without calling setState in the effect body
  const displayElapsed =
    controlMode === 'manual' && manualStartTime
      ? elapsed
      : 0

  const formatElapsed = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Manual Control Panel</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pump Control Card */}
        <Card>
          <h3 className="text-sm font-medium text-gray-600 mb-6">Pump Control</h3>

          <div className="flex flex-col items-center gap-6">
            {/* Current status indicator */}
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full ${pumpStatus ? 'bg-green-500' : 'bg-red-500'}`}>
                {pumpStatus && (
                  <div className="w-5 h-5 rounded-full bg-green-500 animate-ping opacity-50" />
                )}
              </div>
              <span className={`text-2xl font-bold ${pumpStatus ? 'text-green-600' : 'text-red-600'}`}>
                Pump is {pumpStatus ? 'ON' : 'OFF'}
              </span>
            </div>

            {/* Control buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => togglePump(true)}
                disabled={pumpStatus}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all ${
                  pumpStatus
                    ? 'bg-green-300 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 active:scale-95 shadow-lg shadow-green-200'
                }`}
              >
                <Power className="w-5 h-5" />
                Turn ON
              </button>

              <button
                onClick={() => togglePump(false)}
                disabled={!pumpStatus}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all ${
                  !pumpStatus
                    ? 'bg-red-300 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 active:scale-95 shadow-lg shadow-red-200'
                }`}
              >
                <Power className="w-5 h-5" />
                Turn OFF
              </button>
            </div>

            {/* Soil moisture context */}
            <p className="text-sm text-gray-500">
              Current soil moisture: <span className="font-semibold">{Math.round(sensors.soilMoisture)}%</span>
            </p>
          </div>
        </Card>

        {/* Mode & Timer Card */}
        <Card>
          <h3 className="text-sm font-medium text-gray-600 mb-6">Mode & Timer</h3>

          {/* Current mode */}
          <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              {controlMode === 'automatic' ? (
                <ToggleLeft className="w-6 h-6 text-blue-500" />
              ) : (
                <ToggleRight className="w-6 h-6 text-amber-500" />
              )}
              <div>
                <p className="text-sm text-gray-500">Current Mode</p>
                <p className="text-lg font-bold text-gray-800">
                  {controlMode === 'automatic' ? 'Automatic (AI)' : 'Manual Override'}
                </p>
              </div>
            </div>
            <StatusBadge
              label={controlMode === 'automatic' ? 'AUTO' : 'MANUAL'}
              variant={controlMode === 'automatic' ? 'info' : 'warning'}
              pulse
            />
          </div>

          {/* Manual timer */}
          {controlMode === 'manual' && (
            <div className="flex items-center gap-3 mb-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <Timer className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-sm text-gray-500">Manual Mode Active</p>
                <p className="text-2xl font-mono font-bold text-amber-600">
                  {formatElapsed(displayElapsed)}
                </p>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <AlertTriangle className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800">Auto-return Notice</p>
              <p className="text-xs text-blue-600 mt-1">
                System returns to automatic mode after manual session ends.
                The AI will resume making irrigation decisions based on sensor data.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
