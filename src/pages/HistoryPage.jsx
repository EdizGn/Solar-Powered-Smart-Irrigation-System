import { useState, useMemo } from 'react'
import { History, Filter, ArrowUpDown } from 'lucide-react'
import Card from '../components/common/Card'
import StatusBadge from '../components/common/StatusBadge'
import { generateIrrigationHistory } from '../data/mockHistory'
import { formatDate } from '../utils/helpers'

const TRIGGER_FILTERS = ['All', 'Automatic AI', 'Manual', 'Skipped (Rain)']

/**
 * HistoryPage - Filterable, sortable table of past irrigation events.
 * Shows date, duration, trigger type, and moisture before/after.
 * // TODO: Replace generateIrrigationHistory with API call to GET /api/irrigation/history
 */
export default function HistoryPage() {
  const [history] = useState(() => generateIrrigationHistory(50))
  const [filter, setFilter] = useState('All')
  const [sortField, setSortField] = useState('date')
  const [sortAsc, setSortAsc] = useState(false)

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false)
    }
  }

  const filteredAndSorted = useMemo(() => {
    let data = [...history]

    // Filter
    if (filter !== 'All') {
      data = data.filter((e) => e.trigger === filter)
    }

    // Sort
    data.sort((a, b) => {
      let valA, valB
      switch (sortField) {
        case 'date':
          valA = new Date(a.date).getTime()
          valB = new Date(b.date).getTime()
          break
        case 'duration':
          valA = a.duration
          valB = b.duration
          break
        case 'moistureBefore':
          valA = a.moistureBefore
          valB = b.moistureBefore
          break
        case 'moistureAfter':
          valA = a.moistureAfter
          valB = b.moistureAfter
          break
        default:
          valA = new Date(a.date).getTime()
          valB = new Date(b.date).getTime()
      }
      return sortAsc ? valA - valB : valB - valA
    })

    return data
  }, [history, filter, sortField, sortAsc])

  const getTriggerVariant = (trigger) => {
    switch (trigger) {
      case 'Automatic AI': return 'info'
      case 'Manual': return 'warning'
      case 'Skipped (Rain)': return 'neutral'
      default: return 'neutral'
    }
  }

  const SortHeader = ({ field, children }) => (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className={`w-3 h-3 ${sortField === field ? 'text-blue-500' : 'text-gray-300'}`} />
      </div>
    </th>
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <History className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">Irrigation History</h2>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <div className="flex bg-gray-100 rounded-lg p-1">
            {TRIGGER_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  filter === f
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100">
              <tr>
                <SortHeader field="date">Date & Time</SortHeader>
                <SortHeader field="duration">Duration</SortHeader>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trigger
                </th>
                <SortHeader field="moistureBefore">Before</SortHeader>
                <SortHeader field="moistureAfter">After</SortHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAndSorted.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {formatDate(event.date)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">
                    {event.duration > 0 ? `${event.duration} min` : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge label={event.trigger} variant={getTriggerVariant(event.trigger)} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {event.moistureBefore}%
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {event.moistureAfter}%
                    {event.moistureAfter > event.moistureBefore && (
                      <span className="text-green-500 text-xs ml-1">
                        +{event.moistureAfter - event.moistureBefore}%
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAndSorted.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No irrigation events found for this filter.
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filteredAndSorted.length} of {history.length} events
        </div>
      </Card>
    </div>
  )
}
