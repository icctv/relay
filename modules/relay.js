module.exports = ({ slugs }) => {
  const viewers = {}

  const addViewer = async (channel, send) => {
    const uuid = await slugs.getUuid(channel)

    console.log(`[relay] add viewer of channel ${channel} to stream ${uuid}`)

    if (uuid) {
      if (!viewers[uuid]) {
        viewers[uuid] = [send]
      } else {
        viewers[uuid].push(send)
      }
    } else {
      // TODO: Handle case when viewers join non-existing channel
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

  return { ingestPoint, addViewer }
}
