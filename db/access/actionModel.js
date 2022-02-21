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

  /**
   * Return all activities records that match given filters.
   * @param {*} on Date to restrict view or unrestricted if not passed
   * @returns
   */
  const getActions = async (on) => {
    log.debug('actionModel.getActions')
    // figure out the right format for date in query
    const start = on || new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + 1
    )
    const results = await knex('actions')
      .select(actionColumns)
      .where('created_at', '>=', start.toISOString())
      .andWhere('created_at', '<', end.toISOString())
      .orderBy('createdAt', 'desc')
      .limit(100)
    return results
  }

  return {
    capture,
    getActions,
  }
}
