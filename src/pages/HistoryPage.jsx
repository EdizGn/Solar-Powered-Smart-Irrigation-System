import { useState, useMemo, useEffect } from 'react'
import { History, Filter, ArrowUpDown, Loader2 } from 'lucide-react'
import Card from '../components/common/Card'
import StatusBadge from '../components/common/StatusBadge'
import { formatDate } from '../utils/helpers'

const TRIGGER_FILTERS = ['All', 'Automatic AI', 'Manual', 'Skipped (Rain)']

export default function HistoryPage() {
  // KRİTİK DÜZELTME: setHistory burada tanımlanmalıydı
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [sortField, setSortField] = useState('date')
  const [sortAsc, setSortAsc] = useState(false)

  // Neon Veritabanından verileri çekiyoruz
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/history');
        const data = await response.json();

        // Veritabanı sütun isimlerini frontend'in beklediği isimlere çeviriyoruz
        const mapped = data.map(item => ({
          id: item.id,
          date: item.start_time,
          duration: Math.round(item.duration_minutes),
          trigger: item.trigger_type,
          // Sayıları en yakın tamsayıya yuvarlıyoruz
          moistureBefore: Math.round(item.moisture_before),
          moistureAfter: Math.round(item.moisture_after)
        }));

        setHistory(mapped);
        setLoading(false);
      } catch (error) {
        console.error("Geçmiş verisi çekilemedi:", error);
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false)
    }
  }

  const filteredAndSorted = useMemo(() => {
    if (!history) return [];
    let data = [...history]

    if (filter !== 'All') {
      data = data.filter((e) => e.trigger === filter)
    }

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
        default:
          valA = a.id
          valB = b.id
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

  // Yükleme ekranı ekledik ki beyaz ekran yerine kullanıcı bir şey görsün
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm text-gray-400">Sulama geçmişi yükleniyor...</p>
      </div>
    )
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

        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {TRIGGER_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${filter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trigger</th>
                <SortHeader field="moistureBefore">Before</SortHeader>
                <SortHeader field="moistureAfter">After</SortHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAndSorted.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-700">{formatDate(event.date)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{event.duration} min</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={event.trigger} variant={getTriggerVariant(event.trigger)} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{event.moistureBefore}%</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{event.moistureAfter}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAndSorted.length === 0 && (
            <div className="text-center py-12 text-gray-400">Kayıt bulunamadı.</div>
          )}
        </div>
      </Card>
    </div>
  )
}