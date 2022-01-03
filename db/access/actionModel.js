const { actionColumns } = require('./modelFieldMap')

module.exports = (fastify) => {
  const { knex, log } = fastify

  const capture = async (code, details, userKey) => {
    log.debug('actionModel.capture')
    await knex('actions').insert({
      action_code: code,
      details,
      user_public_id: userKey,
    })
    return
  }

  const getActions = async () => {
    log.debug('actionModel.getActions')
    const results = await knex('actions')
      .select(actionColumns)
      .orderBy('createdAt', 'desc')
      .limit(100)
    return results
  }

  return {
    capture,
    getActions,
  }
}
