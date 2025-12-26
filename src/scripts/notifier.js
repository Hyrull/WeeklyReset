const fs = require('fs')
const path = require('path')
const cron = require('node-cron')

// Load env vars explicitly since we aren't in Next.js context here
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') })

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL
const EVENTS_PATH = path.join(process.cwd(), 'data', 'events.json')

const checkEvents = () => {
  if (!WEBHOOK_URL) return console.error("No Webhook URL found.")

  try {
    const raw = fs.readFileSync(EVENTS_PATH, 'utf-8')
    const events = JSON.parse(raw)
    const now = new Date()

    events.forEach(event => {
      // Skip completed events
      if (event.status === 'completed' || event.status === 'skipped') return

      const start = new Date(event.startDate)
      const end = new Date(event.endDate)
      
      const msUntilEnd = end - now
      const hoursUntilEnd = msUntilEnd / (1000 * 60 * 60)
      
      const msSinceStart = now - start
      const hoursSinceStart = msSinceStart / (1000 * 60 * 60)

      // Event Just Started (within last hour)
      if (hoursSinceStart >= 0 && hoursSinceStart < 1) {
         sendWebhook(event, 'Event Started:', 0x00ff00)
      }

      // Ends in 3 Days (71h - 72h window)
      // yes, i'm aware that if the bot is down right during the -71-72h window, it won't notify. well. send a pr
      if (hoursUntilEnd >= 71 && hoursUntilEnd < 72) {
         sendWebhook(event, '⏳ Ending in 3 Days!', 0xffa500)
      }
    })

  } catch (err) {
    console.error('Notifier Error:', err)
  }
}

const sendWebhook = async (event, title, color) => {
  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: `${title}: ${event.game}`,
          url: 'http://192.168.1.28:3000',
          description: `**${event.title}**`,
          color: color,
          fields: [
            { name: 'Ends', value: `<t:${Math.floor(new Date(event.endDate).getTime() / 1000)}:R>`, inline: true },
            { name: 'Type', value: `${event.type}`, inline: true },
            ...(event.notes ? [{ name: 'Notes', value: event.notes }] : [])
          ],
          footer: { 
             text: 'Weekly Reset Dashboard'
             // icon_url: '...' // someday WR will have an icon
          }
        }]
      })
    })
    console.log(`Notification sent for ${event.title}`)
  } catch (err) {
    console.error('Webhook failed', err)
  }
}

// Schedule: Run every hour at minute 0
cron.schedule('0 * * * *', checkEvents)
checkEvents()
console.log("Discord Notifier booted!")