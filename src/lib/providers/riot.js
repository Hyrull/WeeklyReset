const path = require('path')
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') })

const API_KEY = process.env.RIOT_API_KEY
const REGION = 'eu'

const fetchRiot = async (url) => {
  if (!API_KEY) {
    console.error("[RIOT PROVIDER] MISSING KEY: RIOT_API_KEY.")
    return null
  }

  const resp = await fetch(url, {
    headers: { 'X-Riot-Token': API_KEY }
  })

  if (!resp.ok) {
    console.error(`[RIOT PROVIDER] Riot API Fail [${resp.status}] at: ${url}`)
    return null
  }
  return resp.json()
}
// ----------------
// --- VALORANT ---
// ----------------
const getValorantEvents = async () => {
  const url = `https://${REGION}.api.riotgames.com/val/content/v1/contents`
  
  const data = await fetchRiot(url)
  if (!data || !data.acts) return []

  // Filter: Find the active ACT (type: 'act')
  const activeAct = data.acts.find(a => a.type === 'act' && a.isActive)

  if (!activeAct) return []

  // Find Parent Episode
  const episode = data.acts.find(a => a.id === activeAct.parentId)
  
  // TITLE LOGIC
  const title = episode 
    ? `${episode.name}: ${activeAct.name}`
    : activeAct.name

  // Priority: Act Date -> Episode Date -> Fallback
  const rawStart = activeAct.startTime || episode?.startTime
  const rawEnd = activeAct.endTime || episode?.endTime

  const startDate = rawStart ? new Date(rawStart).toISOString() : new Date().toISOString()
  
  // If end date is missing, guess 90 days
  const endDate = rawEnd 
    ? new Date(rawEnd).toISOString() 
    : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()

  return [{
    id: `val-act-${activeAct.id}`,
    game: 'Valorant',
    title: title,
    type: 'battlepass',
    status: 'active',
    startDate: startDate,
    endDate: endDate,
    notes: ``
  }]
}

// ---------------------------------
// --- TFT (via CommunityDragon) ---
// ---------------------------------

const getTFTEvents = async () => {
  const url = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/tftsets.json'
  // thanks a LOT to cdrake for this. doing god (mortdog)'s work here.
  
  try {
    const resp = await fetch(url)
    if (!resp.ok) return []

    const rawData = await resp.json()
    
    // Safety check for the structure, in case it'd change
    if (!rawData.LCTFTModeData || !rawData.LCTFTModeData.mDefaultSet) {
      console.log("[Riot Provider] CDrake data structure changed! Waiting for a code update now.")
      return []
    }

    const activeSet = rawData.LCTFTModeData.mDefaultSet

    const setId = activeSet.SetName

    return [{
      id: `tft-season-${setId}`,
      game: 'Teamfight Tactics',
      title: `TFT: ${activeSet.SetDisplayName}`,
      type: 'season',
      status: 'active',
      startDate: new Date().toISOString(), // Fallback: "Today"
      endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(), // 4 months
      notes: `${activeSet.SetDisplayName} pt.1+2. Check pt.1 end date!`
    }]

  } catch (e) {
    console.error('[RIOT PROVIDER] TFT CDragon Error:', e)
    return []
  }
}

module.exports = { getValorantEvents, getTFTEvents }