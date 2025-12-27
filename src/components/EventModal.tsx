'use client'

import { useState, useEffect } from 'react'
import { GameEvent } from '@/types'
import { getTheme, SUPPORTED_GAMES } from '@/lib/themes'

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: Partial<GameEvent>) => void
  initialData?: Partial<GameEvent>
  isEditing?: boolean
}

const TYPES = ['season', 'battlepass', 'event', 'info']
const SORTED_GAMELIST = SUPPORTED_GAMES.sort()

export default function EventModal({ isOpen, onClose, onSave, initialData, isEditing }: EventModalProps) {
  if (!isOpen) return null

  const [formData, setFormData] = useState<Partial<GameEvent>>({
    game: SUPPORTED_GAMES[0],
    type: 'season',
    status: 'active',
    notes: '',
    ...initialData
  })

  // Force reset when opening
  useEffect(() => {
    if (isOpen) {
      setFormData({
        game: SUPPORTED_GAMES[0],
        type: 'season',
        status: 'active',
        notes: '',
        ...initialData
      })
    }
  }, [isOpen, initialData])

  const theme = getTheme(formData.game || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Data cleanup for 'info' types
    const finalData = formData.type === 'info' 
      ? { ...formData, status: 'active' as const } 
      : formData
      
    onSave(finalData)
    onClose()
  }

  const set = (field: keyof GameEvent, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    // BACKDROP: click = close
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-pointer"
    >
      {/* MODAL CONTENT: Stop propagation so clicking inside doesn't close */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md bg-zinc-950 border ${theme.border} rounded-xl shadow-2xl overflow-hidden cursor-default`}
      >
        
        {/* Header */}
        <div className={`px-6 py-4 border-b border-zinc-800 ${theme.bg} flex justify-between items-center`}>
          <h2 className={`text-lg font-bold ${theme.text}`}>
            {isEditing ? 'Edit Event' : 'New Event'}
          </h2>
          <button type="button" onClick={onClose} className="text-zinc-500 hover:text-white cursor-pointer">✕</button>
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
              {SORTED_GAMELIST.map(g => <option key={g} value={g}>{g}</option>)}
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

          {/* UNIFIED GRID */}
          <div className="grid grid-cols-2 gap-4">
             {/* TYPE */}
             <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Type</label>
                <select 
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-zinc-200 cursor-pointer outline-none"
                  value={formData.type}
                  onChange={e => set('type', e.target.value)}
                >
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
             </div>
             
             {/* STATUS (Hidden for Info) */}
             {formData.type !== 'info' && (
               <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Status</label>
                  <select 
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-zinc-200 cursor-pointer outline-none"
                    value={formData.status}
                    onChange={e => set('status', e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="skipped">Skipped</option>
                  </select>
               </div>
             )}

            {/* START DATE */}
            <div>
               <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">
                 {formData.type === 'info' ? 'Date (UTC)' : 'Start (UTC)'}
               </label>
               <input 
                 type="datetime-local"
                 required
                 className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-zinc-200"
                 value={formData.startDate?.slice(0, 16) || ''}
                 onChange={e => set('startDate', new Date(e.target.value).toISOString())}
               />
            </div>

            {/* END DATE (Hidden for Info) */}
            {formData.type !== 'info' && (
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
            )}
          </div>

          {/* NOTES FIELD (Hidden for Info) */}
          {formData.type !== 'info' && (
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Notes</label>
              <textarea 
                className={`w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-zinc-200 ${theme.borderFocus} outline-none resize-none h-20`}
                value={formData.notes || ''}
                onChange={e => set('notes', e.target.value)}
                placeholder='e.g. Need to reach Rank 50...'
              />
            </div>
          )}

          {/* BUTTONS */}
          <div className="pt-4 flex gap-3">
             <button type="button" onClick={onClose} className="flex-1 py-2 text-sm text-zinc-400 hover:text-white cursor-pointer transition-colors">
               Cancel
             </button>
             {/* THEMED SAVE BUTTON */}
             <button 
               type="submit" 
               className={`flex-1 py-2 rounded text-sm font-bold border ${theme.btn} transition-all shadow-lg shadow-zinc-900/50 cursor-pointer`}
             >
               {isEditing ? 'Save Changes' : 'Create Event'}
             </button>
          </div>

        </form>
      </div>
    </div>
  )
}