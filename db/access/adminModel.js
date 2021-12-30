const { userColumns, actionColumns } = require('./modelFieldMap')

module.exports = (fastify) => {
  const { knex, log } = fastify

  const getUsers = async () => {
    log.debug('adminModel.getUsers')
    const users = await knex('users').select(userColumns).orderBy('alias')
    return users
  }

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
    getActions,
  }
}
