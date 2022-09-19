module.exports = (fastify) => {
  const { knex, log } = fastify

  /**
   * Returns an array of the given user's role codes
   */
  const getRoles = async (userKey) => {
    log.debug('userRoleModel.getRoles')
    const rolesForUser = await knex('user_roles')
      .join('users', 'users.id', 'user_roles.user_id')
      .join('system_codes', 'system_codes.id', 'user_roles.role_id')
      .select('system_codes.code')
      .where('users.public_id', '=', userKey)
    const roles = rolesForUser.map((role) => role.code)
    return roles
  }

  const addRole = async (userKey, role) => {
    log.debug('userRoleModel.addRoles')
    const userResult = await knex('users')
      .select('id')
      .where({ public_id: userKey })
    const userId = userResult[0].id
    const roleId = fastify.lookups.codeLookup('role', role).id
    await knex('user_roles')
      .insert({
        user_id: userId,
        role_id: roleId,
      })
      .onConflict()
      .ignore()
  }

  const removeRole = async (userKey, role) => {
    log.debug('userRoleModel.removeRoles')
    const userResult = await knex('users')
      .select('id')
      .where({ public_id: userKey })
    const userId = userResult[0].id
    const roleId = fastify.lookups.codeLookup('role', role).id
    await knex('user_roles').where({ user_id: userId, role_id: roleId }).del()
  }

  return {
    getRoles,
    addRole,
    removeRole,
  }
}
