module.exports = ({ generate, redis }) => {
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
      const newViewerId = await generate(1)
      await redis.set('uuid:' + uuid, newViewerId)
      await redis.set('viewer:' + newViewerId, uuid)

      console.log(`[slugs] [${uuid}] assigned new viewer id`, newViewerId)
      return newViewerId
    }
  }

  return { getIngestId, getViewerId, getUuid }
}
