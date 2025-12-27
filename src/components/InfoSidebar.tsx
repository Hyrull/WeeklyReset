import { getTheme } from '@/lib/themes'
import { GameEvent } from '@/types'

interface InfoSidebarProps {
  events: GameEvent[]
  isEditMode: boolean
  onEdit: (event: GameEvent) => void
  onDelete: (id: string) => void 
}

export default function InfoSidebar({ events, isEditMode, onEdit, onDelete }: InfoSidebarProps) {
  const infoEvents = events
    .filter(e => e.type === 'info')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

  if (infoEvents.length === 0) return null

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-gray-400 border-b border-gray-800 pb-2 flex justify-between items-center">
        <span>Upcoming / News</span>
        {/* Optional: Counter */}
        <span className="text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-500">{infoEvents.length}</span>
      </h2>
      
      <div className="flex flex-col gap-3">
        {infoEvents.map(event => {
          const theme = getTheme(event.game)
          const start = new Date(event.startDate)
          const isToday = start.toDateString() === new Date().toDateString()

          return (
            <div 
              key={event.id}
              // Add 'group' so we can do hover effects if needed
              className={`
                relative p-3 rounded-lg border-l-4 bg-gray-900/40 
                ${theme.border} ${theme.borderHover} transition-colors group
              `}
            >
              {/* --- EDIT MODE CONTROLS --- */}
              {isEditMode && (
                <div className="absolute top-2 right-2 flex gap-1 z-20">
                   <button 
                     onClick={(e) => { e.stopPropagation(); onEdit(event); }}
                     className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white p-1 rounded text-xs transition-colors"
                     title="Edit"
                   >
                     ✎
                   </button>
                   <button 
                     onClick={(e) => { e.stopPropagation(); onDelete(event.id); }}
                     className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white p-1 rounded text-xs transition-colors"
                     title="Delete"
                   >
                     ✕
                   </button>
                </div>
              )}

              {/* Date Header */}
              <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                <span>
                  {start.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                </span>
                {isToday && <span className="text-green-400 font-bold animate-pulse">TODAY</span>}
              </div>

              {/* Game & Title */}
              <h3 className={`font-semibold text-sm ${theme.text} mb-0.5 truncate pr-12`}>
                {event.game}
              </h3>
              <p className="text-gray-300 text-sm leading-tight">
                {event.title}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}