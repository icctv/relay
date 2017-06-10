module.exports = () => {
  const viewers = {}

  const addViewer = (channel, send) => {
    if (!viewers[channel]) {
      viewers[channel] = [send]
    } else {
      viewers[channel].push(send)
    }
  }

  const broadcast = (channel, chunk) => {
    if (viewers[channel]) {
      viewers[channel].forEach(send => send(chunk))
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
