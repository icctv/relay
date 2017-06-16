const express = require('express')
const cors = require('cors')
const expressWs = require('express-ws')
const generate = require('adjective-adjective-animal')
const Redis = require('ioredis')
const makeHello = require('./hello')
const makeRelay = require('./relay')
const makeSlugs = require('./slugs')
const makeProtection = require('./protection')
const setupRoutes = require('./routes')

const PORT = process.env.PORT || 8080

// The Relay (this project) is meant to be hosted separately from the viewer
const relayBaseUrl = process.env.RELAY_BASE_URL || 'http://localhost:8080'
const viewerBaseUrl = process.env.VIEWER_BASE_URL || 'http://localhost:3000'

console.log(`Relay starting...`)
console.log('Relay base url', relayBaseUrl)
console.log('Viewer base url', viewerBaseUrl)

const redis = new Redis(process.env.REDIS_URL)

const slugs = makeSlugs({ generate, redis })
const hello = makeHello({ relayBaseUrl, viewerBaseUrl, slugs })
const protection = makeProtection({ redis })
const relay = makeRelay({ slugs, protection })

const app = express()

// Enhance express with websocket capabilities
// and disable additional compression because we'll send compressed video anyway
expressWs(app, null, { wsOptions: {
  perMessageDeflate: false
}})

// Allow the viewer to connect from a different origin
app.use(cors({ origin: viewerBaseUrl }))

// See routes.js
setupRoutes({ app, hello, slugs, protection, relay })

// Add a default route to quickly check if the system is reachable
app.get('/', async (req, res) => {
  const slug = await generate({ format: 'title', adjectives: 1 })
  res.end('🦄 ' + slug)
})

// Finally, start the server and listen on all interfaces (0.0.0.0)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Relay started on ${relayBaseUrl}`)
})
