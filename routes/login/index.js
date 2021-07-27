'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/test', async function (request, reply) {

    const identity = require('../../db/identity')
    const user = await identity.findUser(fastify, 'github', 1234)
    reply.send(user.data)
  })
}
