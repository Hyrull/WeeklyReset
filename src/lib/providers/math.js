// Pure Math - No APIs
// Trading Post / Traveler's Log (Monthly)

const getWoWTradingPost = async () => {
  const now = new Date()
  const events = []

  // Helper to generate the event for a given Date reference
  const generateMonthEvent = (targetYear, targetMonth) => {
    
    // 1. Let Date object handle the math (Year rollover)
    // Date.UTC(2025, 12, 1) automatically becomes Jan 1st, 2026
    const startDate = new Date(Date.UTC(targetYear, targetMonth, 1))
    // Lousy Smarch wheather... 
    
    // 2. Extract REAL Year/Month from the calculated date
    const realYear = startDate.getUTCFullYear()
    const realMonth = startDate.getUTCMonth() // 0-11

    // 3. Calculate End Date (Last second of this month)
    const endDate = new Date(Date.UTC(realYear, realMonth + 1, 0, 23, 59, 59))
    
    // 4. Formatting
    const monthName = startDate.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' })
    const idStr = `${realYear}-${String(realMonth + 1).padStart(2, '0')}`

    return {
      id: `wow-trading-${idStr}`,
      game: 'World of Warcraft',
      title: `Trading Post - ${monthName} ${realYear}`,
      type: 'season',
      status: 'active',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      notes: `Traveler's Log for ${monthName} ${realYear}.`
    }
  }

  // 1. Current Month
  events.push(generateMonthEvent(now.getUTCFullYear(), now.getUTCMonth()))

  // 2. Next Month (Trigger: 5 days before end)
  const currentMonthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0))
  const msUntilEnd = currentMonthEnd - now
  const daysUntilEnd = msUntilEnd / (1000 * 60 * 60 * 24)

  if (daysUntilEnd <= 5) { // Kept your 5-day test value
    events.push(generateMonthEvent(now.getUTCFullYear(), now.getUTCMonth() + 1))
  }

  return events
}

export { getWoWTradingPost }