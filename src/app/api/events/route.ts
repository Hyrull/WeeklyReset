import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'data', 'events.json')

export async function GET() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8')
    return NextResponse.json(JSON.parse(data))
  } catch (error) {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, status, notes } = body

    const fileContent = await fs.readFile(DB_PATH, 'utf-8')
    const events = JSON.parse(fileContent)

    const updatedEvents = events.map((event: any) => {
      if (event.id === id) {
        // Only update fields that are present in the request
        return {
          ...event,
          status: status !== undefined ? status : event.status,
          notes: notes !== undefined ? notes : event.notes
        }
      }
      return event
    })

    await fs.writeFile(DB_PATH, JSON.stringify(updatedEvents, null, 2))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update DB' }, { status: 500 })
  }
}