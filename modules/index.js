const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const expressWs = require('express-ws')
const hello = require('./hello')
const makeRelay = require('./relay')

const PORT = process.env.PORT || 8080
const HOSTNAME = process.env.HOSTNAME || 'icctv.gq'
const PROTOCOL = process.env.PROTOCOL || 'http'

const relayBaseUrl = [PROTOCOL, '://', HOSTNAME, ':', PORT].join('')
const viewerBaseUrl = process.env.VIEWER_BASE_URL || 'http://localhost:3000'

const relay = makeRelay()

const app = express()
expressWs(app, null, { wsOptions: {
  perMessageDeflate: false
}})

const toJSON = obj => JSON.stringify(obj, null, 2) + '\n'

app.use(cors({ origin: viewerBaseUrl }))

app.post('/hello/:uuid', bodyParser.json(), (req, res) => {
  const uuid = req.params.uuid
  const response = hello({ relayBaseUrl, viewerBaseUrl })({ uuid })
  console.log(`[hello] [${uuid}] from uuid`)
  res.end(toJSON(response))
})

app.ws('/out/:channel', (ws, req) => {
  const channel = req.params.channel
  console.log(`[out] [#${channel}] viewer connected`)

  relay.addViewer(channel, (chunk) => {
    try {
      ws.send(chunk)
    } catch (e) {}
  })

  ws.on('close', (code, msg) => {
    console.log(`[out] [#${channel}] viewer closed`)

    // TODO: Implement
    //relay.removeViewer(channel, ws)
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

app.listen(PORT, () => {
  console.log(`Relay started on ${relayBaseUrl}`)
})
