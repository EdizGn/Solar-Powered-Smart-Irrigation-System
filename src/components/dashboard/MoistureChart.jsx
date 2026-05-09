import { useState, useEffect, useRef } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import Card from '../common/Card'
import { useSystem } from '../../context/SystemContext'
import { generateMoistureHistory } from '../../data/mockSensorData'

/**
 * MoistureChart - Real-time line chart showing soil moisture over the last 24 hours.
 * Updates every 5 seconds by appending the latest sensor reading.
 * Displays threshold reference lines from settings.
 * // TODO: Replace mock data generation with real historical data from API
 */
export default function MoistureChart() {
  const { sensors, settings } = useSystem()
  const [data, setData] = useState(() => generateMoistureHistory())
  const intervalRef = useRef(null)

  // Append new data point every 5 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const now = new Date()
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })

      setData((prev) => {
        const updated = [...prev, { time: timeStr, moisture: Math.round(sensors.soilMoisture) }]
        // Keep last 288 points (24 hours at 5-min intervals)
        if (updated.length > 300) {
          return updated.slice(-288)
        }
        return updated
      })
    }, 5000)

    return () => clearInterval(intervalRef.current)
  }, [sensors.soilMoisture])

  // Show only every Nth label to avoid overcrowding
  const tickInterval = Math.floor(data.length / 8)

  return (
    <Card className="col-span-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-blue-50">
          <TrendingUp className="w-5 h-5 text-blue-500" />
        </div>
        <h3 className="text-sm font-medium text-gray-600">
          Soil Moisture - Last 24 Hours
        </h3>
      </div>

      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              interval={tickInterval}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value) => [`${value}%`, 'Moisture']}
            />
            {/* Low threshold reference line */}
            <ReferenceLine
              y={settings.moistureThresholdLow}
              stroke="#ef4444"
              strokeDasharray="5 5"
              label={{
                value: `Low (${settings.moistureThresholdLow}%)`,
                position: 'right',
                fontSize: 10,
                fill: '#ef4444',
              }}
            />
            {/* High threshold reference line */}
            <ReferenceLine
              y={settings.moistureThresholdHigh}
              stroke="#3b82f6"
              strokeDasharray="5 5"
              label={{
                value: `High (${settings.moistureThresholdHigh}%)`,
                position: 'right',
                fontSize: 10,
                fill: '#3b82f6',
              }}
            />
            <Line
              type="monotone"
              dataKey="moisture"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#3b82f6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
