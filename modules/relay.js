module.exports = ({ slugs, protection }) => {
  const viewers = {}

  const addViewer = (uuid, clientId, send) => {
    if (!viewers[uuid]) {
      viewers[uuid] = {}
    }

    viewers[uuid][clientId] = { send }
  }

  const removeViewer = (uuid, clientId) => {
    if (viewers[uuid] && viewers[uuid][clientId]) {
      delete viewers[uuid][clientId]
    }
  }

  const broadcast = (uuid, chunk) => {
    if (viewers[uuid]) {
      Object.keys(viewers[uuid]).forEach(clientId => {
        viewers[uuid][clientId].send(chunk)
      })
    }
  }

  const ingestPoint = uuid => {
    const receive = chunk => {
      broadcast(uuid, chunk)
    }

    return { receive }
  }

  const handleIngest = (req, res) => {
    const { uuid } = req.params
    const ingest = ingestPoint(uuid)

    req.on('data', (chunk) => {
      ingest.receive(chunk)
    })

    req.on('end', () => {
      res.end()
    })
  }

  const handleViewer = async (ws, req) => {
    const { viewerId, password } = req.params

    console.log(`[out] [#${viewerId}] viewer connected`)

    const uuid = await slugs.getUuid(viewerId)
    const clientId = Math.random().toString(16)

    if (uuid) {
      console.log(`[out] add viewer of ${viewerId} to stream ${uuid}`)
      if (await protection.isProtected({ uuid })) {
        const authorized = await protection.checkPassword({ uuid, password })
        if (!authorized) {
          console.log('[out] wrong password provided for', viewerId)
          ws.close()
        }
      }

      addViewer(uuid, clientId, chunk =>
        ws.send(chunk, () => {})
      )
    } else {
      console.error(`[relay] viewer of ${viewerId} attempted to stream non-existing uuid`)
    }

    ws.on('close', (code, msg) => {
      console.log(`[out] [#${viewerId}] viewer closed`)
      removeViewer(uuid, clientId)
    })
  }

  return {
    ingestPoint,
    addViewer,
    removeViewer,
    handleIngest,
    handleViewer
  }
}
