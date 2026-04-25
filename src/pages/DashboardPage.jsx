import { useState, useEffect } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import MoistureCard from '../components/dashboard/MoistureCard'
import PumpStatusCard from '../components/dashboard/PumpStatusCard'
import RainStatusCard from '../components/dashboard/RainStatusCard'
import BatteryCard from '../components/dashboard/BatteryCard'
import WifiStatusCard from '../components/dashboard/WifiStatusCard'
import WeatherCard from '../components/dashboard/WeatherCard'
import AiDecisionCard from '../components/dashboard/AiDecisionCard'
import MoistureChart from '../components/dashboard/MoistureChart'
import { useSimulatedData } from '../hooks/useSimulatedData'

/**
 * DashboardPage - Main dashboard with real-time sensor overview.
 * Displays card-based layout of all sensor readings, AI decision,
 * and a real-time moisture line chart.
 * Includes loading and error states for production readiness.
 * The useSimulatedData hook drives mock data updates every 5 seconds.
 */
export default function DashboardPage() {
  // TODO: Replace with real loading/error state from API calls
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Simulate initial data fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
      // setError('Failed to connect to sensor network') // Uncomment to test error state
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  // Activate real-time data simulation
  //useSimulatedData()

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm text-gray-500">Loading sensor data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <p className="text-sm text-red-600 font-medium">Something went wrong</p>
        <p className="text-xs text-gray-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-1.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Dashboard</h2>

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
