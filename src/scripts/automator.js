import fs from 'fs/promises'
import path from 'path'
import { getHearthstoneEvents, getWoWEvents, getDiablo3Events } from '../lib/providers/blizzard.js'

const DATA_FILE = path.join(process.cwd(), 'data', 'events.json')

const runAutomation = async () => {
  console.log('[Automator] Started...')

  // Fetch Fresh Data
  const hsEvents = await getHearthstoneEvents()
  const wowEvents = await getWoWEvents()
  const d3Events = await getDiablo3Events()
  
  const incomingEvents = [...hsEvents, ...wowEvents, ...d3Events]
  
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

runAutomation()