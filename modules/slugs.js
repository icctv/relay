const MAX_VIEWER_ID_LENGTH = 22

module.exports = ({ generate, redis }) => {
  const getUnusedViewerId = async () => {
    let candidate = null
    let isExisting = false
    do {
      candidate = await generate(1)
      isExisting = await getUuid(candidate)
    } while (isExisting || candidate.length > MAX_VIEWER_ID_LENGTH)

    return candidate
  }

  const getIngestId = async uuid => uuid

  const getUuid = async viewerId => {
    const uuid = await redis.get('viewer:' + viewerId)
    return uuid
  }

  const getViewerId = async uuid => {
    const viewerId = await redis.get('uuid:' + uuid)

    if (viewerId) {
      return viewerId
    } else {
      const newViewerId = await getUnusedViewerId()
      await redis.set('uuid:' + uuid, newViewerId)
      await redis.set('viewer:' + newViewerId, uuid)

      console.log(`[slugs] [${uuid}] assigned new viewer id`, newViewerId)
      return newViewerId
    }
  }

  return { getIngestId, getViewerId, getUuid }
}
