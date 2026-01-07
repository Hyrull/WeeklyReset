import { readFileSync, existsSync, createReadStream } from 'fs'
import path from 'path'
import { schedule } from 'node-cron'
import FormData from 'form-data'
import axios from 'axios'
import dotenv from 'dotenv'

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL
const EVENTS_PATH = path.join(process.cwd(), 'data', 'events.json')
const LOGOS_DIR = path.join(process.cwd(), 'public', 'logos')

const checkEvents = () => {
  if (!WEBHOOK_URL) return console.error("No Webhook URL found.")

  try {
    const raw = readFileSync(EVENTS_PATH, 'utf-8')
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
         if (event.type === 'info') {
              sendWebhook(event, 'News', 0x00b0f4)
          } else {
              sendWebhook(event, 'Starting', 0xffffff)
          }
      }

      // Ends in 3 Days (71h - 72h window)
      if (hoursUntilEnd >= 71 && hoursUntilEnd < 72) {
         sendWebhook(event, 'Ending', 0xffa500)
      }
    })

  } catch (err) {
    console.error('Notifier Error:', err)
  }
}

const sendWebhook = async (event, title, color) => {
  // "Diablo IV" -> "diabloiv"
  const cleanName = event.game.replace(/['\s:!]/g, '').toLowerCase()
  const fileName = `${cleanName}.png`
  const filePath = path.join(LOGOS_DIR, fileName)

  const form = new FormData()
  
  // Constructing the Embed json
  const embedPayload = {
    embeds: [{
      title: `${title}: ${event.title}`,
      description: `**${event.game}** - *${event.title}*`,
      color: color,
      thumbnail: { url: `attachment://${fileName}` }, 
      fields: [
        { name: 'Type', value: `${event.type}`, inline: true },
        { name: 'Ends', value: `<t:${Math.floor(new Date(event.endDate).getTime() / 1000)}:R>`, inline: true },
        { name: 'Dashboard', value: `[Weekly Reset](http://192.168.1.28:3000)`, inline: true },
        ...(event.notes ? [{ name: 'Notes', value: event.notes }] : [])
      ]
    }]
  }

  form.append('payload_json', JSON.stringify(embedPayload))

  // Attaching file
  if (existsSync(filePath)) {
    form.append('file', createReadStream(filePath), fileName)
  } else {
    console.warn(`Logo not found for: ${event.game} (looked for ${fileName})`)
  }

  try {
    await axios.post(WEBHOOK_URL, form, {
      headers: form.getHeaders()
    })
    console.log(`Notification sent for ${event.title}`)
  } catch (err) {
    console.error('Webhook failed', err.response?.data || err.message)
  }
}

// Schedule: Run every hour at minute 0
schedule('0 * * * *', checkEvents)
checkEvents()
console.log("Discord Notifier booted!")