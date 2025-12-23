import { NextResponse } from 'next/server'
import { getEvents, saveEvents, EventSchema } from '@/lib/data'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

export async function GET() {
  const events = await getEvents()
  return NextResponse.json(events)
}

// 1. CREATE (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate body against the full schema, but ignore 'id' (we create it)
    const newEventData = EventSchema.omit({ id: true }).parse(body)
    
    const events = await getEvents()
    
    const newEvent = {
      id: uuidv4(), // Generate unique ID
      ...newEventData
    }
    
    // Add to top of list
    const updatedEvents = [newEvent, ...events]
    await saveEvents(updatedEvents)
    
    return NextResponse.json(newEvent)
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Validation', details: error.issues }, { status: 400 })
    return NextResponse.json({ error: 'Server Error' }, { status: 500 })
  }
}

// 2. UPDATE (PATCH)
// We use PATCH because we might only send { status: 'completed' }
const PatchSchema = z.object({
  id: z.string(),
  ...EventSchema.omit({ id: true }).partial().shape
})

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = PatchSchema.parse(body)
    
    const events = await getEvents()
    
    let found = false
    const updatedEvents = events.map(e => {
      if (e.id === id) {
        found = true
        return { ...e, ...updates }
      }
      return e
    })

    if (!found) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    
    await saveEvents(updatedEvents)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Update Failed' }, { status: 500 })
  }
}

// 3. DELETE
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const events = await getEvents()
    const filteredEvents = events.filter(e => e.id !== id)
    
    await saveEvents(filteredEvents)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Delete Failed' }, { status: 500 })
  }
}