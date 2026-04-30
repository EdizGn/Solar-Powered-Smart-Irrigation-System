import { useState } from 'react'
import { BarChart3 } from 'lucide-react'
import ConsumptionChart from '../components/reports/ConsumptionChart'
import ReportSummary from '../components/reports/ReportSummary'

const PERIODS = ['Daily', 'Weekly', 'Monthly']

/**
 * ReportsPage - Water consumption reports with period toggle, charts, and summary.
 * Displays a combined bar + line chart and summary stats.
 * // TODO: Replace mock data generators with API calls to fetch real report data
 */
export default function ReportsPage() {
  const [period, setPeriod] = useState('Daily')

  // Generate data based on selected period
  // TODO: Replace with API response using `period` state
  const data = []

  const summary = { total: 0, average: 0, highest: 0 }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">
            Water Consumption Reports
          </h2>
        </div>

        {/* Period toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                period === p
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="mb-6">
        <ReportSummary summary={summary} />
      </div>

      {/* Chart */}
      <ConsumptionChart data={data} period={period} />
    </div>
  )
}
