'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/platforms', async (req, reply) => {
    reply.send(fastify.lookups.socialPlatform)
  })

  fastify.get('/categories', async (req, reply) => {
    reply.send(fastify.lookups.categoriesForUI)
  })

  fastify.get('/roles', async (req, reply) => {
    reply.send(fastify.lookups.role)
  })
}
