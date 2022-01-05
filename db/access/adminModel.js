const { userColumns, actionColumns } = require('./modelFieldMap')

module.exports = (fastify) => {
  const { knex, log } = fastify

  const getUsers = async () => {
    log.debug('adminModel.getUsers')
    const users = await knex('users').select(userColumns).orderBy('alias')
    return users
  }

  const getUserRoles = async (userKey) => {
    log.debug('adminModel.getUserRoles')
    const rolesForUser = await knex('user_roles')
      .join('users', 'users.id', 'user_roles.user_id')
      .join('system_codes', 'system_codes.id', 'user_roles.role_id')
      .select('system_codes.code')
      .where('users.public_id', '=', userKey)
    const roles = rolesForUser.map((role) => role.code)
    return roles
  }

  // TODO: implement with paging
  const getActions = async () => {
    log.debug('adminModel.getActions')
    const results = await knex('actions')
      .select(actionColumns)
      .orderBy('createdAt', 'desc')
      .limit(100)
    return results
  }

  return {
    getUsers,
    getUserRoles,
    getActions,
  }
}
