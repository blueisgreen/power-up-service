'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/bloop', async function (request, reply) {

    const identity = require('../../db/identity')
    const user = await identity.findUser(fastify, 'github', 1234)
    if (user) {
    reply.send(user.data)
    } else {
      reply.callNotFound()
    }
  })
}
