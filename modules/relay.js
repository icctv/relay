module.exports = ({ slugs, protection }) => {
  const viewers = {}

  const addViewer = async (uuid, send) => {
    if (!viewers[uuid]) {
      viewers[uuid] = [send]
    } else {
      viewers[uuid].push(send)
    }
  }

  const broadcast = (uuid, chunk) => {
    if (viewers[uuid]) {
      viewers[uuid].forEach(send => send(chunk))
    }
  }

  const ingestPoint = uuid => {
    const receive = chunk => {
      broadcast(uuid, chunk)
    }

    return { receive }
  }

  const handleIngest = async (req, res) => {
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

    if (uuid) {
      console.log(`[out] add viewer of ${viewerId} to stream ${uuid}`)
      if (await protection.isProtected({ uuid })) {
        const authorized = await protection.checkPassword({ uuid, password })
        if (!authorized) {
          console.log('[out] wrong password provided for', viewerId)
          ws.close()
        }
      }

      addViewer(uuid, chunk =>
        ws.send(chunk, () => {})
      )
    } else {
      console.error(`[relay] viewer of ${viewerId} attempted to stream non-existing uuid`)
    }

    ws.on('close', (code, msg) => {
      console.log(`[out] [#${viewerId}] viewer closed`)
      // TODO: Implement
      // removeViewer(viewerId, ws)
    })
  }

  return { ingestPoint, addViewer, handleIngest, handleViewer }
}
