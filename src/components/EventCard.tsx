import { GameEvent } from '@/types'
import { getTheme } from '@/lib/themes'
import Image from 'next/image'

interface EventCardProps {
  event: GameEvent
  onUpdate: (id: string, updates: Partial<GameEvent>) => void
}

export const EventCard = ({ event, onUpdate }: EventCardProps) => {
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
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-zinc-800 overflow-hidden relative">
            <div className={`w-full h-full absolute inset-0 ${theme.fallback}`} /> 
            <Image 
              src={theme.logo} 
              alt={event.game}
              fill
              className="object-cover"
              sizes="24px"
            />
          </div>
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{event.game}</span>
        </div>
        <span className={`text-sm font-mono font-bold ${isFuture ? 'text-zinc-500' : theme.text}`}>
          {isFuture ? 'SOON' : (daysLeft < 0 ? 'ENDED' : `${daysLeft}d`)}
        </span>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border ${theme.badge}`}>{event.type}</span>
          {isSkipped && <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-red-900/30 text-red-500 border border-red-900/50">Skipped</span>}
          {isCompleted && <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-emerald-900/30 text-emerald-500 border border-emerald-900/50">Done</span>}
        </div>
        <h3 className="text-lg font-medium leading-tight">{event.title}</h3>
      </div>

      {!isDone && (
        <textarea 
          placeholder="+ Add notes..." 
          className="w-full bg-zinc-950/50 text-zinc-400 text-xs p-2 rounded border border-transparent hover:border-zinc-700 focus:border-zinc-600 focus:outline-none resize-none h-16 transition-colors"
          defaultValue={event.notes || ''}
          onBlur={(e) => onUpdate(event.id, { notes: e.target.value })}
        />
      )}

      <div className="mt-auto pt-3 flex gap-2">
        {!isDone && !isFuture && (
          <>
            <button onClick={() => onUpdate(event.id, { status: 'completed' })} className={`flex-1 py-1.5 text-xs rounded border transition-colors font-medium ${theme.btn}`}>Complete</button>
            <button onClick={() => onUpdate(event.id, { status: 'skipped' })} className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 border border-transparent hover:border-zinc-800 rounded">Skip</button>
          </>
        )}
        {isDone && (
          <button onClick={() => onUpdate(event.id, { status: 'active' })} className="ml-auto text-xs text-zinc-500 hover:text-zinc-300 underline">Undo</button>
        )}
      </div>
    </div>
  )
}