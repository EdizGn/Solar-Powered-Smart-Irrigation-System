import { useState, useEffect } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import MoistureCard from '../components/dashboard/MoistureCard'
import PumpStatusCard from '../components/dashboard/PumpStatusCard'
import RainStatusCard from '../components/dashboard/RainStatusCard'
import WifiStatusCard from '../components/dashboard/WifiStatusCard'
import WeatherCard from '../components/dashboard/WeatherCard'
import AiDecisionCard from '../components/dashboard/AiDecisionCard'
import MoistureChart from '../components/dashboard/MoistureChart'
import { useSystem } from '../context/SystemContext'

export default function DashboardPage() {
  const { sensors, systemHealth } = useSystem()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm text-gray-500">Waiting for real sensor data...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">System Overview</h2>
        {systemHealth === 'error' && (
          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full animate-pulse">
            DEVICE OFFLINE
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        <MoistureCard />
        <PumpStatusCard />
        <RainStatusCard />
        <WifiStatusCard />
        <WeatherCard />
        <AiDecisionCard />
      </div>

      <MoistureChart />
    </div>
  )
}