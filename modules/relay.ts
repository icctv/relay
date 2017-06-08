const generateIngestId = uuid => uuid
const generateViewerId = uuid => uuid

const generateIngestPoints = (uuid) => [
  {
    protocol: 'http',
    url: `/in/${generateIngestId(uuid)}`,
    width: 176,
    height: 144
  }
]

export const hello = ({ uuid }) => {
  return {
    in: generateIngestPoints(uuid),
    out: generateViewerId(uuid),
    unicorn: "🦄"
  }
}
