const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const expressWs = require('express-ws')
const generate = require('adjective-adjective-animal')
const Redis = require('ioredis')
const makeHello = require('./hello')
const makeRelay = require('./relay')
const makeSlugs = require('./slugs')
const makeProtection = require('./protection')

const PORT = process.env.PORT || 8080
const relayBaseUrl = process.env.RELAY_BASE_URL || 'http://localhost:8080'
const viewerBaseUrl = process.env.VIEWER_BASE_URL || 'http://localhost:3000'

console.log(`Relay starting...`)
console.log('Relay base url', relayBaseUrl)
console.log('Viewer base url', viewerBaseUrl)

const redis = new Redis(process.env.REDIS_URL)

const slugs = makeSlugs({ generate, redis })
const hello = makeHello({ relayBaseUrl, viewerBaseUrl, slugs })
const protection = makeProtection({ redis })
const relay = makeRelay()

const app = express()
expressWs(app, null, { wsOptions: {
  perMessageDeflate: false
}})

const toJSON = obj => JSON.stringify(obj, null, 2) + '\n'

app.use(cors({ origin: viewerBaseUrl }))

app.post('/hello/:uuid', bodyParser.json(), async (req, res) => {
  const uuid = req.params.uuid
  console.log(`[hello] [${uuid}] from uuid`)
  const response = await hello({ uuid })
  console.log(`[hello] [${uuid}]`, response)
  res.end(toJSON(response))
})

app.ws('/out/:viewerId', async (ws, req) => {
  const viewerId = req.params.viewerId
  console.log(`[out] [#${viewerId}] viewer connected`)

  const uuid = await slugs.getUuid(viewerId)
  if (uuid) {
    console.log(`[relay] add viewer of ${viewerId} to stream ${uuid}`)
    if (await protection.isProtected({ uuid })) {
      // TODO: Check password?
    }

    relay.addViewer(uuid, chunk =>
      ws.send(chunk, () => {})
    )
  } else {
    console.error(`[relay] viewer of ${viewerId} attempted to stream non-existing uuid`)
  }

  ws.on('close', (code, msg) => {
    console.log(`[out] [#${viewerId}] viewer closed`)

    // TODO: Implement
    //relay.removeViewer(viewerId, ws)
  })
})

app.post('/in/:uuid', (req, res) => {
  const uuid = req.params.uuid

  const ingest = relay.ingestPoint(uuid)

  req.on('data', (chunk) => {
    ingest.receive(chunk)
  })

  req.on('end', () => {
    res.end()
  })
})

app.post('/protect/:uuid', bodyParser.json(), (req, res) => {
  const uuid = req.params.uuid
  const password = req.body.password

  console.log('[protect] uuid', uuid, 'password', req.body.password)

  protection.protect({ uuid, password })

  res.end()
})

app.delete('/protect/:uuid', bodyParser.json(), (req, res) => {
  const uuid = req.params.uuid

  protection.unprotect({ uuid })
  res.end()
})

app.get('/', async (req, res) => {
  const slug = await generate({ format: 'title', adjectives: 1 })
  res.end('🦄 ' + slug)
})

app.post('/reset', async (req, res) => {
  await redis.flushall()
  res.end('ok')
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Relay started on ${relayBaseUrl}`)
})
