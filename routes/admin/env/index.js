'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/', (req, reply) => {
    reply.send(fastify.config)
  })
}
