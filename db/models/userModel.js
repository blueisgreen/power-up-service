const userTableName = 'users'
const userColumns = [
  'users.id',
  'public_id as userKey',
  'alias',
  'email',
  'avatar_url as avatarUrl',
  'account_status as accountStatus',
  'created_at as createdAt',
  'updated_at as updatedAt',
  'terms_accepted_at as termsAcceptedAt',
  'cookies_accepted_at as cookiesAcceptedAt',
  'email_comms_accepted_at as emailCommsAcceptedAt',
]
const userContextColumns = [
  'users.id as userId',
  'public_id as userKey',
  'alias',
  'account_status as accountStatus',
]

module.exports = (fastify) => {
  const { knex, log } = fastify

  const getAllUsers = async () => {
    log.debug('userModel.getAll')
    const users = await knex(userTableName).select(userColumns).orderBy('alias')
    return users
  }

  const getWithFilters = async () => {
    log.debug('userModel.getWithFilters')
    // TODO: implement
    const users = await knex(userTableName).select(userColumns).orderBy('alias')
    return users
  }

  const getUserDetails = async (userKey) => {
    log.debug('userModel.getUserDetails')
    // TODO: implement
    const users = await knex(userTableName).select(userColumns).orderBy('alias')
    return users
  }

  const updateUserDetails = async (userKey, updates) => {
    log.debug('userModel.updateUser')
    // TODO: implement
    const users = await knex(userTableName).select(userColumns).orderBy('alias')
    return users
  }

  const suspend = async (userKey) => {
    log.debug('userModel.suspend')
    // TODO: implement
    // call updateUser with updated status
  }

  const activate = async (userKey) => {
    log.debug('userModel.activate')
    // TODO: implement
    // call updateUser with updated status
  }

  const archive = async (userKey, updates) => {
    // TODO: how different from suspend? build user state map
    log.debug('userModel.archive')
    const users = await knex(userTableName).select(userColumns).orderBy('alias')
    return users
  }

  return {
    getAllUsers,
    getWithFilters,
    getUserDetails,
    updateUserDetails,
    suspend,
    activate,
    archive,
  }
}
