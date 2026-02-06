import fs from 'fs/promises'
import path from 'path'
import { z } from 'zod'
import { GameEvent } from '@/types'

const DB_PATH = path.join(process.cwd(), 'data', 'events.json')

// Making sure we don't parse stupid things in the json
export const EventSchema = z.object({
  id: z.string(),
  game: z.string(),
  type: z.enum(['season', 'battlepass', 'event', 'info', 'backlog']),
  title: z.string(),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid start date format",
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid end date format",
  }),
  status: z.enum(['active', 'completed', 'skipped']),
  notes: z.string().optional()
})

export const EventsArraySchema = z.array(EventSchema)

export async function getEvents(): Promise<GameEvent[]> {
  try {
    const fileContent = await fs.readFile(DB_PATH, 'utf-8')
    const data = JSON.parse(fileContent)
    
    return EventsArraySchema.parse(data)
  } catch (error) {
    console.error('DB Read Error:', error)
    // If file doesn't exist, return empty array 
    return []
  }
}

// 2. Atomic Write Function
export async function saveEvents(events: GameEvent[]): Promise<void> {
  // Validate before trying to write
  const safeData = EventsArraySchema.parse(events)
  
  const tempPath = `${DB_PATH}.tmp`
  
  try {
    // A. Write to .tmp file first
    await fs.writeFile(tempPath, JSON.stringify(safeData, null, 2))
    
    // B. Atomic Rename (overwrites the real file instantly)
    await fs.rename(tempPath, DB_PATH)
  } catch (error) {
    // Cleanup temp file if write failed
    try { await fs.unlink(tempPath) } catch {} 
    throw error
  }
}