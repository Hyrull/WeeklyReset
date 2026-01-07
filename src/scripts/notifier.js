import { readFileSync, writeFileSync, existsSync, createReadStream } from 'fs'
import path from 'path'
import { schedule } from 'node-cron'
import FormData from 'form-data'
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL
const EVENTS_PATH = path.join(process.cwd(), 'data', 'events.json')
const LOGOS_DIR = path.join(process.cwd(), 'public', 'logos')

const checkEvents = async () => {
  if (!WEBHOOK_URL) return console.error("No Webhook URL found.")

  try {
    const raw = readFileSync(EVENTS_PATH, 'utf-8')
    const events = JSON.parse(raw)
    const now = new Date()
    let hasChanges = false

    for (const event of events) {
      if (event.status === 'completed' || event.status === 'skipped') continue

      const start = new Date(event.startDate)
      const end = new Date(event.endDate)
      
      const hoursUntilEnd = (end - now) / (1000 * 60 * 60)
      const hoursSinceStart = (now - start) / (1000 * 60 * 60)

      // NEWS / INFO
      if (event.type === 'info') {
        if (hoursSinceStart >= 0 && hoursSinceStart < 168 && !event.hasNotifiedStart) {
           await sendWebhook(event, 'News', 0x00b0f4)
           event.hasNotifiedStart = true
           hasChanges = true
        }
      } 
      // STANDARD EVENTS (1h Window)
      else {
         if (hoursSinceStart >= 0 && hoursSinceStart < 1 && !event.hasNotifiedStart) {
            await sendWebhook(event, 'Starting', 0xffffff)
            event.hasNotifiedStart = true
            hasChanges = true
         }
      }

      // ENDING SOON (72h Window)
      if (hoursUntilEnd >= 71 && hoursUntilEnd < 72 && !event.hasNotifiedEnd) {
         await sendWebhook(event, 'Ending', 0xffa500)
         event.hasNotifiedEnd = true
         hasChanges = true
      }
    }

    // SAVE STATE if we sent anything
    if (hasChanges) {
      writeFileSync(EVENTS_PATH, JSON.stringify(events, null, 2))
    }

  } catch (err) {
    console.error('Notifier Error:', err)
  }
}

const sendWebhook = async (event, title, color) => {
  const cleanName = event.game.replace(/['\s:!]/g, '').toLowerCase()
  const fileName = `${cleanName}.png`
  const filePath = path.join(LOGOS_DIR, fileName)

  const form = new FormData()
  
  const embedPayload = {
    embeds: [{
      title: `${title}: ${event.title}`,
      description: `**${event.game}** - *${event.title}*`,
      color: color,
      thumbnail: { url: `attachment://${fileName}` }, 
      fields: [
        { name: 'Type', value: `${event.type}`, inline: true },
        { name: event.type === 'info' ? 'Released' : 'Ends', value: `<t:${Math.floor(new Date(event.startDate).getTime() / 1000)}:R>`, inline: true },
        { name: 'Dashboard', value: `[Weekly Reset](http://192.168.1.28:3000)`, inline: true },
        ...(event.notes ? [{ name: 'Notes', value: event.notes }] : [])
      ]
    }]
  }

  form.append('payload_json', JSON.stringify(embedPayload))

  if (existsSync(filePath)) {
    form.append('file', createReadStream(filePath), fileName)
  }

  try {
    await axios.post(WEBHOOK_URL, form, { headers: form.getHeaders() })
    console.log(`Notification sent for ${event.title}`)
  } catch (err) {
    console.error('Webhook failed', err.response?.data || err.message)
  }
}

schedule('0 * * * *', checkEvents)
checkEvents()
console.log("Discord Notifier (Stateful) booted!")