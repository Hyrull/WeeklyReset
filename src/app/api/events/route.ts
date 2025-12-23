import { NextResponse } from 'next/server'
import { getEvents, saveEvents, EventSchema } from '@/lib/data'
import { z } from 'zod'

export async function GET() {
  const events = await getEvents()
  return NextResponse.json(events)
}

// Schema for the PATCH request (updating a single item)
const UpdateSchema = z.object({
  id: z.string(),
  // We're now only allowing ot edit this
  ...EventSchema.pick({ status: true, notes: true }).partial().shape
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // 1. Validate Input
    // If body is garbage, this throws an error immediately
    const { id, ...updates } = UpdateSchema.parse(body)

    // 2. Read DB
    const events = await getEvents()

    // 3. Update Logic
    let found = false
    const updatedEvents = events.map(event => {
      if (event.id === id) {
        found = true
        return { ...event, ...updates }
      }
      return event
    })

    if (!found) {
      return NextResponse.json({ error: 'Event ID not found' }, { status: 404 })
    }

    // 4. Atomic Save
    await saveEvents(updatedEvents)
    
    return NextResponse.json({ success: true })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Failed', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}