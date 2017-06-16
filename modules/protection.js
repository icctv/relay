const KEY = 'protection:'

module.exports = ({ redis }) => {
  const protect = ({ uuid, password }) => {
    if (!password) {
      return unprotect({ uuid })
    }

    return redis.set(KEY + uuid, password)
  }

  const unprotect = ({ uuid }) => {
    return redis.delete(KEY + uuid)
  }

  const isProtected = ({ uuid }) => {
    return !!redis.get(KEY + uuid)
  }

  const checkPassword = ({ uuid, password }) => {
    const savedPassword = redis.get(KEY + uuid)
    return savedPassword === password
  }

  return { protect, unprotect, isProtected, checkPassword }
}
