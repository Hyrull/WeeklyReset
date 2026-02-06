import { getTheme } from '@/lib/themes'
import { GameEvent } from '@/types'

interface InfoSidebarProps {
  events: GameEvent[]
  isEditMode: boolean
  onEdit: (event: GameEvent) => void
  onDelete: (id: string) => void 
  onUpdate: (id: string, updates: Partial<GameEvent>) => void
}

export default function InfoSidebar({ events, isEditMode, onEdit, onDelete, onUpdate }: InfoSidebarProps) {
  const now = new Date()
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000

  const backlogEvents = events
    .filter(e => e.type === 'backlog' && e.status === 'active')
    .sort((a, b) => a.game.localeCompare(b.game))

  const infoEvents = events
  .filter(e => {
       if (e.type !== 'info') return false
       
       // If it released > 7 days ago, we hide it
       const start = new Date(e.startDate)
       const expirationDate = new Date(start.getTime() + oneWeekMs)
       
       // Keep only fresh news, and upcoming stuff
       return now < expirationDate
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

  if (infoEvents.length === 0 && backlogEvents.length === 0) return null

return (
    <div className="flex flex-col gap-8">
      
      {/* --- SECTION A: QUEST LOG (TOP) --- */}
      {backlogEvents.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-amber-500/90 border-b border-amber-900/30 pb-2 flex justify-between items-center uppercase tracking-wider">
            <span>Quest Log</span>
            <span className="text-[10px] bg-amber-900/20 text-amber-500 px-1.5 py-0.5 rounded border border-amber-900/50">{backlogEvents.length}</span>
          </h2>
          
          <div className="flex flex-col gap-2">
            {backlogEvents.map(event => {
              return (
                <div 
                  key={event.id}
                  className="group relative p-3 rounded bg-zinc-900/40 border border-zinc-800 hover:border-zinc-600 transition-all flex items-start gap-3"
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => onUpdate(event.id, { status: 'completed' })}
                    className="mt-0.5 w-4 h-4 rounded-sm border border-zinc-600 hover:border-emerald-500 hover:bg-emerald-500/20 transition-colors shrink-0"
                    title="Complete Quest"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-0.5">{event.game}</h4>
                        {isEditMode && (
                           <button onClick={(e) => { e.stopPropagation(); onEdit(event); }} className="text-blue-400 hover:text-white text-xs">✎</button>
                        )}
                    </div>
                    <p className="text-sm text-zinc-300 leading-tight">{event.title}</p>
                    {event.notes && <p className="text-xs text-zinc-600 mt-1 italic">{event.notes}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* --- SECTION B: NEWS (BOTTOM) --- */}
      {infoEvents.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-zinc-500 border-b border-zinc-800 pb-2 flex justify-between items-center uppercase tracking-wider">
            <span>UPCOMING</span>
            <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">{infoEvents.length}</span>
          </h2>
          
          <div className="flex flex-col gap-3">
            {infoEvents.map(event => {
              const theme = getTheme(event.game)
              const start = new Date(event.startDate)
              const isPastStart = now >= start
              
              // Countdown Logic
              let timeString = ''
              if (!isPastStart) {
                 const msLeft = start.getTime() - now.getTime()
                 const days = Math.floor(msLeft / (1000 * 60 * 60 * 24))
                 const hours = Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                 if (days > 0) timeString = `in ${days}d`
                 else if (hours > 0) timeString = `in ${hours}h`
                 else timeString = `soon`
              }

              return (
                <div 
                  key={event.id}
                  className={`
                    relative p-3 rounded-lg border-l-2 bg-zinc-900/20 
                    ${theme.border} ${theme.borderHover} transition-colors group
                  `}
                >
                  {/* Edit Controls */}
                  {isEditMode && (
                    <div className="absolute top-2 right-2 flex gap-1 z-20">
                       <button onClick={(e) => { e.stopPropagation(); onEdit(event); }} className="text-blue-400 hover:text-white text-xs">✎</button>
                       <button onClick={(e) => { e.stopPropagation(); onDelete(event.id); }} className="text-red-400 hover:text-white text-xs">✕</button>
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex justify-between items-center text-xs text-zinc-500 mb-1">
                    <span>{start.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}</span>
                    {!isEditMode && (
                      isPastStart 
                        ? <span className="text-cyan-500/80 font-mono text-[10px] animate-pulse">NEW</span>
                        : <span className="text-zinc-600 font-mono text-[10px]">{timeString}</span>
                    )}
                  </div>

                  {/* Content */}
                  <h3 className={`font-semibold text-xs ${theme.text} mb-0.5 truncate pr-8`}>{event.game}</h3>
                  <p className="text-zinc-400 text-sm leading-tight">{event.title}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}