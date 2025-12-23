import { getEvents } from '@/lib/data'
import Dashboard from '@/components/Dashboard'

// This makes the page dynamic (since data changes often), 
// effectively behaving like SSR for every request.
export const dynamic = 'force-dynamic'

export default async function Home() {
  const events = await getEvents()

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-6 md:p-12">
      <Dashboard initialEvents={events} />
    </main>
  )
}