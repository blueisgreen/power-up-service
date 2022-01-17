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

  const assignUserRole = async (userKey, role) => {
    log.debug('adminModel.assignUserRole')
    // FIXME: not finished - need handy ways to convert from public keys and codes to internal IDs
    const userId = await knex('users').select(id).where({ public_id: userKey })
    const results = await knex('user_roles').insert({
      user_id: userId,
      role_: role,
    })
  }

  const removeUserRole = async (userKey, role) => {
    log.debug('adminModel.removeUserRole')
    // FIXME: not finished - need handy ways to convert from public keys and codes to internal IDs
    await knex('user_roles').where({ userId: userKey }).del()
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
