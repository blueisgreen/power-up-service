'use strict'

module.exports = async function (fastify, opts) {
  /**
   * Record an action.
   */
  fastify.post('/', async (request, reply) => {
    const { actionCode, details } = request.body
    const tracker = request.tracker
    const userKey = request.userKey

    fastify.log.debug(
      `record action: ${actionCode} by ${userKey} details: ${details}`
    )

    fastify.log.debug(
      `${request.headers['user-agent']} | ${request.headers['referer']}`
    )

    fastify.data.action.capture(actionCode, tracker, userKey, details)
    reply.code(204).send()
  })

  /**
   * Browse user action log.
   * By default, return all rows starting now and going backward in time.
   *
   * Query options:
   * Filter by user key.
   * Filter by action code.
   * Filter by date: start and end ('YYYY-MM-DD'), which can be open ended.
   *
   * Specify limit: 100 by default.
   * Specify offset: 0 by default.
   */
  fastify.get('/', async (request, reply) => {
    const { start, end, user, action, limit, offset } = request.query
    const queryParams = {
      start,
      end,
      user,
      action,
      limit: limit || 100,
      offset: offset || 0,
    }
    const actions = await fastify.data.action.getActions(queryParams)
    reply.send(actions)
  })
}
