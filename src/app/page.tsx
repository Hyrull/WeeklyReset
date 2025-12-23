'use client'

import { useState, useEffect, useMemo } from 'react'

// --- CONFIGURATION ---
// Direct mapping: Game Name -> Tailwind Classes
// You must use full strings here for Tailwind to detect them.

interface ThemeClasses {
  border: string
  borderHover: string
  text: string
  bg: string
  btn: string
  badge: string
  fallback: string
  logo: string
}

const DEFAULT_THEME: ThemeClasses = {
  border: 'border-emerald-900',
  borderHover: 'hover:border-emerald-500/50',
  text: 'text-emerald-400',
  bg: 'bg-emerald-900/10',
  btn: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
  badge: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50',
  fallback: 'bg-emerald-500/20',
  logo: '/logos/default.png'
}

const GAME_THEMES: Record<string, ThemeClasses> = {
  'World of Warcraft': {
    border: 'border-amber-800',
    borderHover: 'hover:border-amber-500/60',
    text: 'text-amber-300',
    bg: 'bg-amber-900/10',
    btn: 'bg-amber-600/10 text-amber-300 border-amber-600/30 hover:bg-amber-600/20',
    badge: 'bg-amber-800/40 text-amber-200 border-amber-700/50',
    fallback: 'bg-amber-700/20',
    logo: '/logos/wow.png'
  },
  'Diablo IV': {
    border: 'border-red-900',
    borderHover: 'hover:border-red-500/50',
    text: 'text-red-400',
    bg: 'bg-red-900/10',
    btn: 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20',
    badge: 'bg-red-900/40 text-red-300 border-red-700/50',
    fallback: 'bg-red-500/20',
    logo: '/logos/diabloiv.png'
  },
  'Fortnite': {
    border: 'border-cyan-900',
    borderHover: 'hover:border-cyan-500/50',
    text: 'text-cyan-400',
    bg: 'bg-cyan-900/10',
    btn: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20',
    badge: 'bg-cyan-900/40 text-cyan-300 border-cyan-700/50',
    fallback: 'bg-cyan-500/20',
    logo: '/logos/destiny2.png'
  },
  'Marvel Rivals': {
    border: 'border-red-700',
    borderHover: 'hover:border-red-500',
    text: 'text-red-400',
    bg: 'bg-red-950/20',
    btn: 'bg-red-600/20 text-red-300 border-red-500/40 hover:bg-red-600/30',
    badge: 'bg-red-800/50 text-red-200 border-red-600/50',
    fallback: 'bg-red-700/30',
    logo: '/logos/marvelrivals.png'
  },
  'Path of Exile 2': {
    border: 'border-neutral-800',
    borderHover: 'hover:border-neutral-500/50',
    text: 'text-neutral-400',
    bg: 'bg-neutral-900/10',
    btn: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20 hover:bg-neutral-500/20',
    badge: 'bg-neutral-900/40 text-neutral-300 border-neutral-700/50',
    fallback: 'bg-neutral-500/20',
    logo: '/logos/poe2.png'
  }
}

const getTheme = (gameName: string): ThemeClasses => {
  if (!gameName) return DEFAULT_THEME
  
  const normalizedInput = gameName.trim().toLowerCase()
  
  const matchedKey = Object.keys(GAME_THEMES).find(key => 
    key.toLowerCase() === normalizedInput
  )

  if (!matchedKey) {
    console.warn(`Theme missing for: "${gameName}" (Using Default)`)
    return DEFAULT_THEME
  }

  return GAME_THEMES[matchedKey]
}


// --- TYPES ---

interface GameEvent {
  id: string
  game: string
  type: 'season' | 'battlepass' | 'event'
  title: string
  startDate: string
  endDate: string
  status: 'active' | 'completed' | 'skipped'
  notes?: string
}

type SortOption = 'urgency' | 'game' | 'startDate'

// --- MAIN COMPONENT ---

export default function Home() {
  const [events, setEvents] = useState<GameEvent[]>([])
  const [loading, setLoading] = useState(true)
  
  // UI State
  const [showSkipped, setShowSkipped] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('urgency')

  useEffect(() => {
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        setEvents(data)
        setLoading(false)
      })
  }, [])

  const updateEvent = async (id: string, updates: Partial<GameEvent>) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)))
    await fetch('/api/events', { 
      method: 'POST', 
      body: JSON.stringify({ id, ...updates }) 
    })
  }

  // --- LOGIC CORE ---
  const processedData = useMemo(() => {
    const now = new Date()

    // 1. Filter
    let filtered = events.filter(e => showSkipped || e.status !== 'skipped')

    // 2. Sort
    filtered.sort((a, b) => {
      if (sortBy === 'game') return a.game.localeCompare(b.game)
      if (sortBy === 'startDate') return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      // Urgency: EndDate ascending (sooner first)
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
    })

    // 3. Categorize
    const ongoing: GameEvent[] = []
    const comingSoon: GameEvent[] = []
    const ended: GameEvent[] = []

    filtered.forEach(event => {
      const start = new Date(event.startDate)
      const end = new Date(event.endDate)

      if (now < start) comingSoon.push(event)
      else if (now > end) ended.push(event)
      else ongoing.push(event)
    })

    return { ongoing, comingSoon, ended }
  }, [events, showSkipped, sortBy])


  // --- SUB COMPONENT: CARD ---
  const EventCard = ({ event }: { event: GameEvent }) => {
    const theme = getTheme(event.game)
    const now = new Date()
    const daysLeft = Math.ceil((new Date(event.endDate).getTime() - now.getTime()) / (86400000))
    const isFuture = new Date(event.startDate) > now
    
    const isCompleted = event.status === 'completed'
    const isSkipped = event.status === 'skipped'
    const isDone = isCompleted || isSkipped

    return (
      <div className={`
        relative p-5 rounded-lg border flex flex-col gap-3 transition-all
        bg-zinc-900/80 backdrop-blur-sm
        ${isDone ? 'opacity-50 grayscale border-zinc-800' : `${theme.border} ${theme.borderHover} ${theme.bg}`}
      `}>
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-zinc-800 overflow-hidden relative">
               {/* Fallback color div */}
               <div className={`w-full h-full ${theme.fallback}`} /> 
            </div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{event.game}</span>
          </div>
          
          <span className={`text-sm font-mono font-bold ${isFuture ? 'text-zinc-500' : theme.text}`}>
            {isFuture ? 'SOON' : (daysLeft < 0 ? 'ENDED' : `${daysLeft}d`)}
          </span>
        </div>

        {/* Title & Badge */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border ${theme.badge}`}>
              {event.type}
            </span>
            {isSkipped && <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-red-900/30 text-grey border border-grey">Skipped</span>}
            {isCompleted && <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-emerald-900/30 text-emerald-500 border border-emerald-900/50">Done</span>}
          </div>
          <h3 className="text-lg font-medium leading-tight">{event.title}</h3>
        </div>

        {/* Notes */}
        {(
          <textarea 
            placeholder="+ Add notes..." 
            className="w-full bg-zinc-950/50 text-zinc-400 text-xs p-2 rounded border border-transparent hover:border-zinc-700 focus:border-zinc-600 focus:outline-none resize-none h-16 transition-colors"
            defaultValue={event.notes || ''}
            onBlur={(e) => updateEvent(event.id, { notes: e.target.value })}
          />
        )}

        {/* Actions */}
        <div className="mt-auto pt-3 flex gap-2">
          {!isDone && !isFuture && (
            <>
              <button 
                onClick={() => updateEvent(event.id, { status: 'completed' })}
                className={`flex-1 py-1.5 text-xs rounded border transition-colors font-medium ${theme.btn}`}
              >
                Complete
              </button>
              <button 
                onClick={() => updateEvent(event.id, { status: 'skipped' })}
                className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 border border-transparent hover:border-zinc-800 rounded"
              >
                Skip
              </button>
            </>
          )}
          {isDone && (
            <button 
              onClick={() => updateEvent(event.id, { status: 'active' })}
              className="ml-auto text-xs text-zinc-500 hover:text-zinc-300 underline"
            >
              Undo
            </button>
          )}
        </div>
      </div>
    )
  }

  if (loading) return <div className="p-12 text-zinc-500 font-mono text-center">Loading Data...</div>

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-b border-zinc-900 pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Weekly Reset
            </h1>
            <p className="text-zinc-500 mt-1 text-sm">Command Center v1.0</p>
          </div>

          {/* CONTROLS */}
          <div className="flex flex-wrap gap-4 items-center bg-zinc-900 p-2 rounded-lg border border-zinc-800">
            {/* Sort Buttons */}
            <div className="flex gap-1 bg-zinc-950 rounded p-1">
              {['urgency', 'game', 'startDate'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSortBy(opt as SortOption)}
                  className={`px-3 py-1.5 text-xs rounded capitalize transition-colors ${sortBy === opt ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  {opt === 'urgency' ? 'Expiring' : opt === 'startDate' ? 'Start Date' : opt}
                </button>
              ))}
            </div>
            
            <div className="w-px h-6 bg-zinc-800 mx-2"></div>
            
            {/* Toggle */}
            <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none hover:text-zinc-200">
              <input type="checkbox" checked={showSkipped} onChange={e => setShowSkipped(e.target.checked)} className="accent-emerald-500 rounded bg-zinc-800 border-zinc-700" />
              Show Skipped
            </label>
          </div>
        </header>

        <section className="space-y-12">
          {/* ONGOING */}
          {processedData.ongoing.length > 0 && (
            <div>
              <h2 className="text-zinc-400 text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                 Ongoing
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {processedData.ongoing.map(e => <EventCard key={e.id} event={e} />)}
              </div>
            </div>
          )}

          {/* COMING SOON */}
          {processedData.comingSoon.length > 0 && (
            <div>
              <h2 className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-4">Incoming</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {processedData.comingSoon.map(e => <EventCard key={e.id} event={e} />)}
              </div>
            </div>
          )}
           
           {/* HISTORY / ENDED */}
           {processedData.ended.length > 0 && (
            <div className="opacity-60 hover:opacity-100 transition-opacity">
              <h2 className="text-zinc-600 text-sm font-bold uppercase tracking-widest mb-4">Ended</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {processedData.ended.map(e => <EventCard key={e.id} event={e} />)}
              </div>
            </div>
          )}

           {/* EMPTY STATE */}
           {processedData.ongoing.length === 0 && processedData.comingSoon.length === 0 && (
             <div className="text-center py-20 text-zinc-600 italic">
                No active chores found. Time to play?
             </div>
           )}
        </section>
      </div>
    </main>
  )
}