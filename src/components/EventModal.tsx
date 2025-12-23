'use client'

import { useState } from 'react'
import { GameEvent } from '@/types'
import { getTheme, SUPPORTED_GAMES } from '@/lib/themes'

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: Partial<GameEvent>) => void
  initialData?: Partial<GameEvent>
  isEditing?: boolean
}

// Hardcoded for now, but could be dynamic
const TYPES = ['season', 'battlepass', 'event']

export default function EventModal({ isOpen, onClose, onSave, initialData, isEditing }: EventModalProps) {
  if (!isOpen) return null

  const [formData, setFormData] = useState<Partial<GameEvent>>({
    game: SUPPORTED_GAMES[0],
    type: 'season',
    status: 'active',
    ...initialData
  })

  const theme = getTheme(formData.game || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  // Generic input handler
  const set = (field: keyof GameEvent, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className={`w-full max-w-md bg-zinc-950 border ${theme.border} rounded-xl shadow-2xl overflow-hidden`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b border-zinc-800 ${theme.bg} flex justify-between items-center`}>
          <h2 className={`text-lg font-bold ${theme.text}`}>
            {isEditing ? 'Edit Event' : 'New Event'}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Game Select */}
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Game</label>
            <select 
              className={`w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-zinc-200 ${theme.borderFocus} outline-none cursor-pointer`}
              value={formData.game}
              onChange={e => set('game', e.target.value)}
            >
              {SUPPORTED_GAMES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Title</label>
            <input 
              required
              className={`w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-zinc-200 ${theme.borderFocus} outline-none`}
              value={formData.title || ''}
              onChange={e => set('title', e.target.value)}
              placeholder="e.g. Season of the Construct"
            />
          </div>

          {/* Type & Status Row */}
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Type</label>
                <select 
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-zinc-200 cursor-pointer"
                  value={formData.type}
                  onChange={e => set('type', e.target.value)}
                >
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
             </div>
             <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Status</label>
                <select 
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-zinc-200 cursor-pointer"
                  value={formData.status}
                  onChange={e => set('status', e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="skipped">Skipped</option>
                </select>
             </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Start (UTC)</label>
               <input 
                 type="datetime-local"
                 required
                 className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-zinc-200"
                 // Tricky, but datetime-local needs YYYY-MM-DDThh:mm format
                 value={formData.startDate?.slice(0, 16) || ''}
                 onChange={e => set('startDate', new Date(e.target.value).toISOString())}
               />
            </div>
            <div>
               <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">End (UTC)</label>
               <input 
                 type="datetime-local"
                 required
                 className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-zinc-200"
                 value={formData.endDate?.slice(0, 16) || ''}
                 onChange={e => set('endDate', new Date(e.target.value).toISOString())}
               />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
             <button type="button" onClick={onClose} className="flex-1 py-2 text-sm text-zinc-400 hover:text-white cursor-pointer">Cancel</button>
             <button type="submit" className={`flex-1 py-2 rounded text-sm font-bold bg-zinc-100 text-black hover:bg-white cursor-pointer`}>
               {isEditing ? 'Save Changes' : 'Create Event'}
             </button>
          </div>
        </form>
      </div>
    </div>
  )
}