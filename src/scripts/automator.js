import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { getHearthstoneEvents, getWoWEvents, getDiablo3Events } from '../lib/providers/blizzard.js'
import { getTFTEvents, getValorantEvents } from '../lib/providers/riot.js'
import { getWoWTradingPost } from '../lib/providers/math.js'

const DATA_FILE = path.join(process.cwd(), 'data', 'events.json')

const runAutomation = async () => {

  // Fetch Fresh Data
  const hsEvents = await getHearthstoneEvents()
  const wowEvents = await getWoWEvents()
  const d3Events = await getDiablo3Events()
  // const valoEvents = await getValorantEvents()
  const TFTEvents = await getTFTEvents()
  const wowTradingPost = await getWoWTradingPost()
  
  const incomingEvents = [
    ...(hsEvents || []), 
    ...(wowEvents || []), 
    ...(d3Events || []), 
    // ...(valoEvents || []), 
    ...(TFTEvents || []), 
    ...(wowTradingPost || [])
  ]
  
  if (incomingEvents.length === 0) {
    console.log('[Automator] No new data fetched. Exiting.')
    return
  }

  // Load Existing Data
  let currentEvents = []
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8')
    currentEvents = JSON.parse(raw)
  } catch (e) {
    console.log('[Automator] No existing data found, starting fresh.')
  }

  // Merge Logic
  // Update/add entries but don't without touching manually edited events
  let updatesCount = 0
  
  incomingEvents.forEach(newItem => {
    const existsIndex = currentEvents.findIndex(e => e.id === newItem.id)
    
    if (existsIndex === -1) {
      // NEW ENTRY
      console.log(`[Automator] New Event registered: ${newItem.title}`)
      currentEvents.push(newItem)
      updatesCount++
    } else {
      // For now, we assume if the entry exists, we skip it to preserve manual notes/dates
    }
  })

  // 4. Save
  if (updatesCount > 0) {
    await fs.writeFile(DATA_FILE, JSON.stringify(currentEvents, null, 2))
    console.log(`[Automator] Saved ${updatesCount} new events.`)
  } else {
    console.log('[Automator] Up to date.')
  }
}

// --- SELF-SCHEDULING LOGIC ---
// If run directly (not imported)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const INTERVAL = 60 * 60 * 1000 // 1 Hour

  const startLoop = async () => {
    console.log('[Automator] Service started. Running initial check...')
    
    // 1. Initial Run
    try { await runAutomation() } catch (e) { console.error(e) }

    // 2. Schedule Loop
    console.log(`[Automator] Next update in ${INTERVAL / 60000} minutes.`)
    setInterval(async () => {
      try {
        await runAutomation()
      } catch (e) {
        console.error('[Automator] Update failed:', e)
      }
    }, INTERVAL)
  }

  console.log('[Automator] Booted!');

  // Add a tiny delay if running in dev mode to avoid API spam on restarts
  setTimeout(startLoop, 5 * 60 * 1000) // 5mn
}

export { runAutomation }