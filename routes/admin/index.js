'use strict'

module.exports = async function (fastify, opts) {
  const { log } = fastify
  fastify.get(
    '/users',
    {
      preValidation: [fastify.authenticate],
    },
    async function (request, reply) {
      const users = await fastify.data.admin.getUsers()
      log.debug(`found ${users.length} users`)
      reply.send(users)
    }
  )
}
