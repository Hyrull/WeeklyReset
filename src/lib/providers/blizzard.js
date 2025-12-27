const path = require('path')
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') })

const CLIENT_ID = process.env.BLIZZARD_CLIENT_ID
const CLIENT_SECRET = process.env.BLIZZARD_CLIENT_SECRET
const REGION = 'eu'
const LOCALE = 'en_GB'

let cachedToken = null
let tokenExpiry = 0

// --- AUTHENTICATION ---
// Blizzard's api is OAuth. Gotta login, get the token which we then use for API calls.
// I cache the token, but it's not persistent between sessions
const getAccessToken = async () => {
  if (!CLIENT_ID || !CLIENT_SECRET) return null
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken

  const authString = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')

  try {
    const resp = await fetch(`https://${REGION}.battle.net/oauth/token`, {
      method: 'POST',
      body: 'grant_type=client_credentials',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    if (!resp.ok) throw new Error(`Status: ${resp.status}`)

    const data = await resp.json()
    cachedToken = data.access_token
    tokenExpiry = Date.now() + ((data.expires_in - 100) * 1000)
    return cachedToken
  } catch (err) {
    console.error('[Blizzard Provider] Blizzard Auth Failed:', err.message)
    return null
  }
}

// --- DRY: GENERIC FETCH ---
const fetchBlizzard = async (url, token) => {
  const resp = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!resp.ok) {
    console.error(`[Blizzard Provider] API Fail [${resp.status}] at: ${url}`)
    return null
  }
  return resp.json()
}
// -------------------
// --- HEARTHSTONE ---
// -------------------
const getHearthstoneEvents = async () => {
  const token = await getAccessToken()
  if (!token) return []

  const url = `https://${REGION}.api.blizzard.com/hearthstone/metadata/sets?locale=${LOCALE}`
  const data = await fetchBlizzard(url, token)
  
  if (!data || data.length === 0) return []

  const latestSet = data[0]

  // Temporary events are NOT in this API, and that fckn sucks. 
  // We can only fetch "Sets" (Expansions/Mini-sets)
  // Need to find a way, from another api or through website scrapping,
  // to get the temporary events too
  
  return [{
    id: `hs-set-${latestSet.id}`,
    game: 'Hearthstone',
    title: `Tavern Pass: ${latestSet.name}`,
    type: 'season',
    status: 'active',
    startDate: new Date().toISOString(), // the api actually doesn't tell us, so. 
    endDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString(), // we just assume 5 months. i checked and it's usually 4 to 5 months per expa
    notes: ``
  }]
}
// ----------------------------
// ----- WORLD OF WARCRAFT ----
// -------- (retail) ----------

// hey, blizzard devs. an api for WoW Anniversary release dates (raid openings, expacs) would be cool, ty
const getWoWEvents = async () => {
  const token = await getAccessToken()
  if (!token) return []

  // Get Index
  const indexUrl = `https://${REGION}.api.blizzard.com/data/wow/mythic-keystone/season/index?namespace=dynamic-${REGION}&locale=${LOCALE}`
  const indexData = await fetchBlizzard(indexUrl, token)

  if (!indexData || !indexData.current_season) return []

  // Get Details (Timestamps!)
  const detailUrl = indexData.current_season.key.href // specific season endpoint
  const detailData = await fetchBlizzard(detailUrl, token)
  
  if (!detailData) return []

  const globalId = detailData.id

  const fullSeasonName = detailData.season_name.en_US
  const seasonNameFormatted = fullSeasonName
  // e.g. keeping only "The War Within Season 3" from "Mythic+ Dungeons (The War Within Season 3)"
    .replace(/^Mythic\+ Dungeons \(/, '')
    .replace(/\)$/, '')

  const startTime = detailData.start_timestamp 
    ? new Date(detailData.start_timestamp).toISOString() 
    : new Date().toISOString()

  // API often omits end_timestamp for active seasons. Fallback if missing.
  const endTime = detailData.end_timestamp 
    ? new Date(detailData.end_timestamp).toISOString() 
    : new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString()

  return [{
    id: `wow-season-${globalId}`,
    game: 'World of Warcraft',
    title: seasonNameFormatted,
    type: 'season',
    status: 'active',
    startDate: startTime,
    endDate: endTime, 
    notes: `Mythic+ Season ${detailData.id}`
  }]
}


// ------------------
// --- DIABLO III ---
// ------------------

const getDiablo3Events = async () => {
  const token = await getAccessToken()
  if (!token) return []

  const indexUrl = `https://${REGION}.api.blizzard.com/data/d3/season/?access_token=${token}`
  const indexData = await fetchBlizzard(indexUrl, token)

  if (!indexData || !indexData.current_season) return []

  const currentId = indexData.current_season
  
  const startTime = indexData.start_date 
    ? new Date(indexData.start_date).toISOString() 
    : new Date().toISOString() // Fallback if missing

  return [{
    id: `d3-season-${currentId}`,
    game: 'Diablo III',
    title: `Season ${currentId}`,
    type: 'season',
    status: 'active',
    startDate: startTime,
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    notes: ``
  }]
}

module.exports = { getHearthstoneEvents, getWoWEvents, getDiablo3Events }