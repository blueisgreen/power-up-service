'use strict'

module.exports = async function (fastify, opts) {
  /**
   * Get all actions.
   */
  fastify.get('/', async (request, reply) => {
    const actions = await fastify.data.action.getActions()
    reply.send(actions)
  })

  /**
   * Record an action.
   */
  fastify.post('/', async (request, reply) => {
    const { actionCode, details } = request.body
    const userKey = request.user ? request.user.who : request.userKey || null

    fastify.log.debug(
      `record action: ${actionCode} by ${userKey} details: ${details}`
    )

    const inquiry = await fastify.data.action.capture(
      actionCode,
      details,
      userKey
    )
    reply.code(204).send()
  })
}
