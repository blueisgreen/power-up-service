'use strict'

module.exports = async function (fastify, opts) {
  /**
   * Record an action.
   */
  fastify.post('/', async (request, reply) => {
    const { actionCode, details } = request.body
    const userKey = request.userKey

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
