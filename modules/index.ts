import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as relay from './relay'

const PORT = process.env.PORT || 8080

const app = express()

const toJSON = obj => JSON.stringify(obj, null, 2) + '\n'

app.post('/hello/:uuid', bodyParser.json(), (req, res) => {
  const uuid = req.params.uuid
  const response = relay.hello({ uuid })
  console.log('[hello] from uuid', uuid)
  res.end(toJSON(response))
})

app.post('/in/:uuid', (req, res) => {
  const uuid = req.params.uuid

  req.on('data', (chunk: Buffer) => {
    console.log('[IN DATA]', uuid, chunk.length, 'bytes')
    // TODO: Broadcast chunk over websocket
  })

  req.on('end', () => {
    res.end()
  })
})

app.listen(PORT, () => {
  console.log(`Relay started on port ${PORT}`)
})
