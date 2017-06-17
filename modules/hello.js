module.exports = ({ relayBaseUrl, viewerBaseUrl, slugs }) => {
  const generateIngestPoints = async (uuid) => {
    const ingestId = await slugs.getIngestId(uuid)
    return [
      {
        protocol: 'http',
        url: [relayBaseUrl, 'in', ingestId].join('/'),
        width: 176,
        height: 144
      }
    ]
  }

  const hello = async ({ uuid }) => {
    const ingestPoints = await generateIngestPoints(uuid)
    const viewerId = await slugs.getViewerId(uuid)

    return {
      in: ingestPoints,
      out: [viewerBaseUrl, '#' + viewerId].join('/'),
      unicorn: '🦄'
    }
  }

  const handleRequest = async (req, res) => {
    const { uuid } = req.params
    const response = await hello({ uuid })
    const viewerId = await slugs.getViewerId(uuid)
    console.log(`[hello] from uuid ${uuid} streaming to channel ${viewerId}`)
    res.end(JSON.stringify(response))
  }

  return { handleRequest }
}
