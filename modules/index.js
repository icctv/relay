import express from 'express'
import bodyParser from 'body-parser'
import expressWs from 'express-ws'
import hello from './hello'

const PORT = process.env.PORT || 8080
const HOSTNAME = process.env.HOSTNAME || 'icctv.gq'
const PROTOCOL = process.env.PROTOCOL || 'http'

const relayBaseUrl = [PROTOCOL, '://', HOSTNAME, ':', PORT].join('')
const viewerBaseUrl = process.env.VIEWER_BASE_URL || 'http://localhost:3000'

const app = express()
expressWs(app)

const toJSON = obj => JSON.stringify(obj, null, 2) + '\n'

app.post('/hello/:uuid', bodyParser.json(), (req, res) => {
  const uuid = req.params.uuid
  const response = hello({ relayBaseUrl, viewerBaseUrl })({ uuid })
  console.log('[hello] from uuid', uuid)
  res.end(toJSON(response))
})

app.ws('/echo', (ws, req) => {
  ws.on('message', msg => {
    ws.send(msg)
  })
})

app.post('/in/:uuid', (req, res) => {
  const uuid = req.params.uuid

  req.on('data', (chunk) => {
    console.log('[IN DATA]', uuid, chunk.length, 'bytes')
    // TODO: Broadcast chunk over websocket
  })

  req.on('end', () => {
    res.end()
  })
})

app.listen(PORT, () => {
  console.log(`Relay started on ${relayBaseUrl}`)
})
