const { userColumns } = require('./modelFieldMap')

module.exports = (fastify) => {
  const { knex, log } = fastify

  const getUsers = async () => {
    log.debug('adminModel.getUsers')
    const users = await knex('users').select(userColumns).orderBy('alias')
    return users
  }

  return {
    getUsers,
  }
}
