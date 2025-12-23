import fs from 'fs/promises'
import path from 'path'
import { GameEvent } from '@/types'

export async function getEvents(): Promise<GameEvent[]> {
  try {
    // Process.cwd() is safe in Next.js Server Components
    const filePath = path.join(process.cwd(), 'data', 'events.json')
    const fileContent = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(fileContent)
  } catch (error) {
    console.error('Failed to read events:', error)
    return []
  }
}