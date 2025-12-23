'use client'

import { useState, useMemo } from 'react'
import { GameEvent, SortOption } from '@/types'
import { EventCard } from '@/components/EventCard'

interface DashboardProps {
  initialEvents: GameEvent[]
}

export default function Dashboard({ initialEvents }: DashboardProps) {
  const [events, setEvents] = useState<GameEvent[]>(initialEvents)
  const [showSkipped, setShowSkipped] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('urgency')

  const updateEvent = async (id: string, updates: Partial<GameEvent>) => {
    // Optimistic UI
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)))
    // API Call
    await fetch('/api/events', { 
      method: 'POST', 
      body: JSON.stringify({ id, ...updates }) 
    })
  }

  const processedData = useMemo(() => {
    const now = new Date()
    let filtered = events.filter(e => showSkipped || e.status !== 'skipped')

    filtered.sort((a, b) => {
      if (sortBy === 'game') return a.game.localeCompare(b.game)
      if (sortBy === 'startDate') return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
    })

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

  // Helper for Section Rendering
  const Section = ({ title, items, color = 'zinc' }: { title: string, items: GameEvent[], color?: string }) => {
    if (items.length === 0) return null
    return (
      <div className={title === 'Ended' ? 'opacity-60 hover:opacity-100 transition-opacity' : ''}>
        <h2 className={`text-${color}-400 text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2`}>
           {title === 'Ongoing' && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
           {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map(e => <EventCard key={e.id} event={e} onUpdate={updateEvent} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-b border-zinc-900 pb-6">
        <div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Weekly Reset</h1>
          <p className="text-zinc-500 mt-1 text-sm">Command Center v1.0</p>
        </div>

        <div className="flex flex-wrap gap-4 items-center bg-zinc-900 p-2 rounded-lg border border-zinc-800">
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
          <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none hover:text-zinc-200">
            <input type="checkbox" checked={showSkipped} onChange={e => setShowSkipped(e.target.checked)} className="accent-emerald-500 rounded bg-zinc-800 border-zinc-700" />
            Show Skipped
          </label>
        </div>
      </header>

      <div className="space-y-12">
        <Section title="Ongoing" items={processedData.ongoing} color="zinc" />
        <Section title="Incoming" items={processedData.comingSoon} color="zinc" />
        <Section title="Ended" items={processedData.ended} color="zinc" />
        
        {processedData.ongoing.length === 0 && processedData.comingSoon.length === 0 && (
          <div className="text-center py-20 text-zinc-600 italic">No active chores found. Time to play?</div>
        )}
      </div>
    </div>
  )
}