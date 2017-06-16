module.exports = () => {
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

  return { ingestPoint, addViewer }
}
