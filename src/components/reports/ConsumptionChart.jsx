import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import Card from '../common/Card'

/**
 * ConsumptionChart - Combined bar + line chart for water consumption reports.
 * Bar chart shows water usage in liters, line chart shows irrigation duration in minutes.
 * @param {{ data: Array<{ date: string, liters: number, duration: number }>, period: string }} props
 */
export default function ConsumptionChart({ data, period }) {
  return (
    <Card className="col-span-full">
      <h3 className="text-sm font-medium text-gray-600 mb-4">
        Water Consumption ({period})
      </h3>

      <div className="h-72 sm:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={{ stroke: '#e2e8f0' }}
              interval={period === 'Daily' ? Math.floor(data.length / 8) : 0}
              angle={period === 'Daily' ? -35 : 0}
              textAnchor={period === 'Daily' ? 'end' : 'middle'}
              height={period === 'Daily' ? 60 : 40}
            />
            {/* Left Y-axis: Liters */}
            <YAxis
              yAxisId="liters"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickFormatter={(v) => `${v}L`}
            />
            {/* Right Y-axis: Duration */}
            <YAxis
              yAxisId="duration"
              orientation="right"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickFormatter={(v) => `${v}m`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value, name) => {
                if (name === 'liters') return [`${value} L`, 'Water Used']
                if (name === 'duration') return [`${value} min`, 'Duration']
                return [value, name]
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              formatter={(value) => {
                if (value === 'liters') return 'Water Used (L)'
                if (value === 'duration') return 'Duration (min)'
                return value
              }}
            />
            <Bar
              yAxisId="liters"
              dataKey="liters"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              barSize={period === 'Daily' ? 12 : 28}
              opacity={0.85}
            />
            <Line
              yAxisId="duration"
              type="monotone"
              dataKey="duration"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 3, fill: '#f59e0b' }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
