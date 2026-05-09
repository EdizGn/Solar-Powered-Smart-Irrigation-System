import { Droplets, Clock, CloudRain, TrendingDown } from 'lucide-react'
import Card from '../common/Card'

/**
 * ReportSummary - Summary statistics cards for water consumption reports.
 * Shows total water used, average daily usage, total duration, and rain savings.
 * @param {{ summary: { totalLiters: number, avgDailyLiters: number, totalDuration: number, totalRainSkips: number, savedLiters: number } }} props
 */
export default function ReportSummary({ summary }) {
  const stats = [
    {
      icon: Droplets,
      label: 'Total Water Used',
      value: `${summary.totalLiters} L`,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      icon: TrendingDown,
      label: 'Avg. Daily Usage',
      value: `${summary.avgDailyLiters} L`,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
    },
    {
      icon: Clock,
      label: 'Total Duration',
      value: `${summary.totalDuration} min`,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
    },
    {
      icon: CloudRain,
      label: 'Rain Savings',
      value: `${summary.savedLiters} L saved`,
      subtext: `${summary.totalRainSkips} postponements`,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ icon: Icon, label, value, subtext, color, bgColor }) => (
        <Card key={label} hover>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${bgColor}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-lg font-bold text-gray-800">{value}</p>
              {subtext && <p className="text-xs text-gray-400">{subtext}</p>}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
