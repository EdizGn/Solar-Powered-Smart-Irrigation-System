/**
 * Mock water consumption report data.
 * // TODO: Replace with API call to fetch real consumption data from backend
 */

/**
 * Generate daily report data for the last N days.
 * @param {number} days - Number of days to generate
 * @returns {Array<{ date: string, liters: number, duration: number, rainSkips: number }>}
 */
export function generateDailyData(days = 30) {
  const data = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    const isRainyDay = Math.random() > 0.7
    const baseLiters = isRainyDay ? Math.random() * 5 : 15 + Math.random() * 25
    const baseDuration = isRainyDay ? Math.random() * 3 : 8 + Math.random() * 15
    const rainSkips = isRainyDay ? Math.floor(Math.random() * 3) + 1 : 0

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: date.toISOString().split('T')[0],
      liters: Math.round(baseLiters * 10) / 10,
      duration: Math.round(baseDuration * 10) / 10,
      rainSkips,
    })
  }

  return data
}

/**
 * Generate weekly aggregated data from daily data.
 * @param {number} weeks - Number of weeks
 * @returns {Array<{ date: string, liters: number, duration: number, rainSkips: number }>}
 */
export function generateWeeklyData(weeks = 12) {
  const dailyData = generateDailyData(weeks * 7)
  const weeklyData = []

  for (let i = 0; i < dailyData.length; i += 7) {
    const weekSlice = dailyData.slice(i, i + 7)
    if (weekSlice.length === 0) break

    const startDate = weekSlice[0].date
    const endDate = weekSlice[weekSlice.length - 1].date

    weeklyData.push({
      date: `${startDate} - ${endDate}`,
      liters: Math.round(weekSlice.reduce((s, d) => s + d.liters, 0) * 10) / 10,
      duration: Math.round(weekSlice.reduce((s, d) => s + d.duration, 0) * 10) / 10,
      rainSkips: weekSlice.reduce((s, d) => s + d.rainSkips, 0),
    })
  }

  return weeklyData
}

/**
 * Generate monthly aggregated data.
 * @param {number} months - Number of months
 * @returns {Array<{ date: string, liters: number, duration: number, rainSkips: number }>}
 */
export function generateMonthlyData(months = 6) {
  const data = []
  const now = new Date()

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

    const avgDailyLiters = 15 + Math.random() * 15
    const avgDailyDuration = 8 + Math.random() * 10
    const rainDays = Math.floor(daysInMonth * (0.2 + Math.random() * 0.2))

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      liters: Math.round(avgDailyLiters * (daysInMonth - rainDays)),
      duration: Math.round(avgDailyDuration * (daysInMonth - rainDays)),
      rainSkips: rainDays,
    })
  }

  return data
}

/**
 * Calculate summary statistics from report data.
 * @param {Array} data - Report data array
 * @returns {{ totalLiters: number, avgDailyLiters: number, totalDuration: number, totalRainSkips: number, savedLiters: number }}
 */
export function calculateSummary(data) {
  const totalLiters = data.reduce((s, d) => s + d.liters, 0)
  const totalDuration = data.reduce((s, d) => s + d.duration, 0)
  const totalRainSkips = data.reduce((s, d) => s + d.rainSkips, 0)
  const avgDailyLiters = data.length > 0 ? totalLiters / data.length : 0
  // Estimate: each rain skip saves ~20 liters
  const savedLiters = totalRainSkips * 20

  return {
    totalLiters: Math.round(totalLiters),
    avgDailyLiters: Math.round(avgDailyLiters * 10) / 10,
    totalDuration: Math.round(totalDuration),
    totalRainSkips,
    savedLiters,
  }
}
