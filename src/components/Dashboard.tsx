'use client'

import { useState, useMemo } from 'react'
import { GameEvent, SortOption } from '@/types'
import { EventCard } from '@/components/EventCard'
import { SUPPORTED_GAMES } from '@/lib/themes'
import EventModal from '@/components/EventModal'
import InfoSidebar from '@/components/InfoSidebar'
import Image from 'next/image'


interface DashboardProps {
  initialEvents: GameEvent[]
}

export default function Dashboard({ initialEvents }: DashboardProps) {
  const [events, setEvents] = useState<GameEvent[]>(initialEvents)
  
  // UI State
  const [showSkipped, setShowSkipped] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('urgency')
  const [selectedGame, setSelectedGame] = useState<string>('All')

  // Manager Mode State
  const [isEditMode, setIsEditMode] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Partial<GameEvent> | undefined>(undefined)

  // --- CRUD ACTIONS ---

  // 1. UPDATE (Status/Notes) - Quick actions from card
  const handleQuickUpdate = async (id: string, updates: Partial<GameEvent>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
    await fetch('/api/events', { method: 'PATCH', body: JSON.stringify({ id, ...updates }) })
  }

  // 2. SAVE (Create or Edit from Modal)
  const handleSave = async (data: Partial<GameEvent>) => {
    if (editingEvent?.id) {
      // EDIT EXISTING
      const updates = { ...data, id: editingEvent.id }
      setEvents(prev => prev.map(e => e.id === updates.id ? { ...e, ...updates } as GameEvent : e))
      await fetch('/api/events', { method: 'PATCH', body: JSON.stringify(updates) })
    } else {
      // CREATE NEW
      const res = await fetch('/api/events', { method: 'POST', body: JSON.stringify(data) })
      const newEvent = await res.json()
      setEvents(prev => [newEvent, ...prev])
    }
    setIsModalOpen(false)
    setEditingEvent(undefined)
  }

  // 3. DELETE
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return
    setEvents(prev => prev.filter(e => e.id !== id))
    await fetch(`/api/events?id=${id}`, { method: 'DELETE' })
  }

  // 4. OPEN MODAL
  const openNew = () => {
    setEditingEvent({})
    setIsModalOpen(true)
  }
  
  const openEdit = (event: GameEvent) => {
    setEditingEvent(event)
    setIsModalOpen(true)
  }

  // --- PROCESSING ---
  const processedData = useMemo(() => {
    const now = new Date()
    let filtered = events
    .filter(e => e.id) // Bypassing any event that has no ID (json corruption)
    .filter(e => 
      (showSkipped || e.status !== 'skipped' && e.status !== 'completed') && 
      e.type !== 'info'
      && e.type !== 'backlog'
    )

    if (selectedGame !== 'All') {
      filtered = filtered.filter(e => e.game === selectedGame)
    }

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
  }, [events, showSkipped, sortBy, selectedGame])

  // Helper for Section Rendering
  const Section = ({ title, items, color = 'zinc' }: { title: string, items: GameEvent[], color?: string }) => {
    if (items.length === 0) return null
    return (
      <div className={title === 'Ended' ? 'opacity-60 hover:opacity-100 transition-opacity' : ''}>
        <h2 className={`text-${color}-400 text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2`}>
           {title === 'Ongoing' && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
           {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map(e => (
            <div key={e.id} className="relative group">
              <EventCard event={e} onUpdate={handleQuickUpdate} isEditMode={isEditMode}/>
              
              {/* EDIT MODE OVERLAY */}
              {isEditMode && (
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                   <button onClick={() => openEdit(e)} className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white p-1 rounded text-xs transition-colors">✎</button>
                   <button onClick={() => handleDelete(e.id)} className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white p-1 rounded text-xs transition-colors">✕</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-b border-zinc-900 pb-6">
        <div className='flex'>
          <Image 
            src={'/logos/default.png'} 
            alt='Weekly Reset logo'
            width={64}
            height={64}
            className="mr-4"
          />
          <div>
            <h1 className="text-3xl font-bold bg-blue-600 bg-clip-text text-transparent">Weekly Reset</h1>
            <p className="text-zinc-500 mt-1 text-sm">Let's get these gaming chores down!</p>
          </div>
        </div>


        <div className="flex flex-wrap gap-4 items-center bg-zinc-900 p-2 rounded-lg border border-zinc-800">
          {/* Sort */}
          <div className="flex gap-1 bg-zinc-950 rounded p-1">
            {['urgency', 'game', 'startDate'].map((opt) => (
              <button
                key={opt}
                onClick={() => setSortBy(opt as SortOption)}
                className={`px-3 py-1.5 text-xs rounded capitalize transition-colors cursor-pointer ${sortBy === opt ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {opt === 'urgency' ? 'Expiring' : opt === 'startDate' ? 'Start Date' : opt}
              </button>
            ))}
          </div>

            {/* Separator */}
          <div className="w-px h-6 bg-zinc-800 mx-2"></div>
          
          {/* Game Filter */}
          <select 
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="bg-zinc-950 text-zinc-400 text-xs border border-zinc-800 rounded px-2 py-1.5 outline-none focus:border-zinc-600 cursor-pointer"
          >
            <option value="All">All Games</option>
            {SUPPORTED_GAMES.sort().map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <div className="w-px h-6 bg-zinc-800 mx-2"></div>

          {/* Toggles */}
          <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none hover:text-zinc-200">
            <input type="checkbox" checked={showSkipped} onChange={e => setShowSkipped(e.target.checked)} className="accent-emerald-500 rounded bg-zinc-800 border-zinc-700 cursor-pointer" />
            Show Completed
          </label>

          <div className="w-px h-6 bg-zinc-800 mx-2"></div>

          {/* EDIT MODE TOGGLE */}
          <button 
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-colors cursor-pointer ${isEditMode ? 'bg-amber-500/20 text-amber-500 border border-amber-500/50' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            {isEditMode ? 'Done Editing' : 'Manage'}
          </button>
        </div>
      </header>

      {/* ADD NEW button (only in Edit Mode) */}
      {isEditMode && (
        <div className="mb-8 p-4 border-2 border-dashed border-zinc-800 rounded-xl flex justify-center items-center hover:border-zinc-700 hover:bg-zinc-900/30 transition-all cursor-pointer" onClick={openNew}>
           <span className="text-zinc-500 font-bold">+ Add New Event</span>
        </div>
      )}

      {/* CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Main Tasks (3/4 space) */}
        <div className="lg:col-span-3 space-y-12">
          <Section title="Ongoing" items={processedData.ongoing} color="zinc" />
          <Section title="Incoming" items={processedData.comingSoon} color="zinc" />
          <Section title="Ended" items={processedData.ended} color="zinc" />
          
          {processedData.ongoing.length === 0 && processedData.comingSoon.length === 0 && (
            <div className="text-center py-20 text-zinc-600 italic">No active chores found. Time to play?</div>
          )}
        </div>

        {/* Sidebar (1/4 space) */}
        <div className="lg:col-span-1 w-full sticky top-8">
           <InfoSidebar 
             events={events}
             isEditMode={isEditMode}
             onEdit={openEdit}
             onDelete={handleDelete}
             onUpdate={handleQuickUpdate}
           />
        </div>

      </div>

      {/* MODAL */}
      <EventModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingEvent || {}}
        isEditing={!!editingEvent?.id}
      />
    </div>
  )
}