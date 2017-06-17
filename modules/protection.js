const PREFIX = 'protection:'

const key = k => PREFIX + k

module.exports = ({ redis, slugs }) => {
  const protect = ({ uuid, password }) => {
    if (!password) {
      return unprotect({ uuid })
    }

    return redis.set(key(uuid), password)
  }

  const unprotect = ({ uuid }) => {
    return redis.del(key(uuid))
  }

  const isProtected = async ({ uuid }) => {
    const password = await redis.get(key(uuid))
    return !!password
  }

  const checkPassword = async ({ uuid, password }) => {
    const savedPassword = await redis.get(key(uuid))
    return savedPassword === password
  }

  const handleProtect = async (req, res) => {
    const { uuid } = req.params
    const password = req.body.password
    console.log('[protect] uuid', uuid, 'password', req.body.password)
    await protect({ uuid, password })
    res.end()
  }

  const handleUnprotect = async (req, res) => {
    const { uuid } = req.params
    console.log('[protect] uuid', uuid, 'removed password protection')
    await unprotect({ uuid })
    res.end()
  }

  const handleAuthorize = async (req, res) => {
    const { viewerId, password } = req.params
    const uuid = await slugs.getUuid(viewerId)
    const is = await checkPassword({ uuid, password })
    if (!is) console.log('[protect] failed authorization', { viewerId, uuid })
    res.end(JSON.stringify({ isAuthorized: is }))
  }

  const handleIsProtected = async (req, res) => {
    const { viewerId } = req.params
    const uuid = await slugs.getUuid(viewerId)
    const is = await isProtected({ uuid })
    res.end(JSON.stringify({ isProtected: is }))
  }

  return {
    protect,
    unprotect,
    isProtected,
    checkPassword,
    handleProtect,
    handleUnprotect,
    handleAuthorize,
    handleIsProtected
  }
}
