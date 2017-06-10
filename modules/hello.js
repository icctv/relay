module.exports = ({ relayBaseUrl, viewerBaseUrl }) => {
  const generateIngestId = uuid => uuid
  const generateViewerId = uuid => uuid

  const generateIngestPoints = (uuid) => [
    {
      protocol: 'http',
      url: [relayBaseUrl, 'in', generateIngestId(uuid)].join('/'),
      width: 176,
      height: 144
    }
  ]

  const hello = ({ uuid }) => {
    return {
      in: generateIngestPoints(uuid),
      out: [viewerBaseUrl, '#' + generateViewerId(uuid)].join('/'),
      unicorn: '🦄'
    }
  }

  return hello
}
