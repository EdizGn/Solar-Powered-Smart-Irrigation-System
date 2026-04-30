import { useState, useEffect } from 'react'
import { Loader2, AlertCircle, WifiOff, Radio } from 'lucide-react'
import MoistureCard from '../components/dashboard/MoistureCard'
import PumpStatusCard from '../components/dashboard/PumpStatusCard'
import RainStatusCard from '../components/dashboard/RainStatusCard'
import BatteryCard from '../components/dashboard/BatteryCard'
import WifiStatusCard from '../components/dashboard/WifiStatusCard'
import WeatherCard from '../components/dashboard/WeatherCard'
import AiDecisionCard from '../components/dashboard/AiDecisionCard'
import MoistureChart from '../components/dashboard/MoistureChart'
import { useSystem } from '../context/SystemContext'
import { WS_STATUS } from '../hooks/useWebSocket'

/**
 * DashboardPage - Main dashboard with real-time sensor overview (TDR §8.2).
 *
 * Data source strategy:
 *  - When VITE_WS_URL is set and the backend is reachable, all sensor cards
 *    update via SystemContext which is driven by the /ws/live WebSocket.
 *  - When VITE_WS_URL is set but the connection is lost, a "Reconnecting"
 *    banner is shown and the last known values remain on screen.
 */
export default function DashboardPage() {
  const { wsStatus, isLiveMode } = useSystem()

  // Determine whether we have a configured WebSocket endpoint
  const wsConfigured = !!import.meta.env.VITE_WS_URL

  // Show spinner only on initial page load (not on every reconnect)
  const [initialLoading, setInitialLoading] = useState(true)
  useEffect(() => {
    // In live mode: wait for first WS connection or a short timeout
    const timer = setTimeout(() => setInitialLoading(false), wsConfigured ? 2000 : 0)
    return () => clearTimeout(timer)
  }, [wsConfigured])

  // ── Loading screen ──────────────────────────────────────────────────────
  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm text-gray-500">
          {wsConfigured ? 'Connecting to sensor network…' : 'Loading sensor data…'}
        </p>
      </div>
    )
  }

  // ── Compute banner state ────────────────────────────────────────────────
  const isReconnecting = wsConfigured &&
    (wsStatus === WS_STATUS.RECONNECTING || wsStatus === WS_STATUS.CONNECTING)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>

        {/* Connection status pill */}
        {isLiveMode && wsStatus === WS_STATUS.CONNECTED && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
            <Radio className="w-3 h-3" />
            Live
          </span>
        )}
      </div>

      {/* Reconnecting banner (TDR §8.8 — user must never be confused about offline mode) */}
      {isReconnecting && (
        <div className="flex items-center gap-2 px-4 py-2.5 mb-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>
            <strong>Reconnecting to sensor network…</strong> — AI decisions may be
            terser until the connection is restored.
          </span>
        </div>
      )}

      {/* Configuration warning banner */}
      {!wsConfigured && (
        <div className="flex items-center gap-2 px-4 py-2.5 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            <strong>Missing configuration</strong> — set{' '}
            <code className="font-mono text-xs bg-red-100 px-1 rounded">VITE_WS_URL</code>{' '}
            in <code className="font-mono text-xs bg-red-100 px-1 rounded">.env</code>{' '}
            to connect to the real sensor network.
          </span>
        </div>
      )}

      {/* Sensor cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        <MoistureCard />
        <PumpStatusCard />
        <RainStatusCard />
        <BatteryCard />
        <WifiStatusCard />
        <WeatherCard />
        <AiDecisionCard />
      </div>

      {/* Real-time moisture chart */}
      <MoistureChart />
    </div>
  )
}
