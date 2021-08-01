'use strict'

const { findUser, getUser, getUserRoles } = require('../../db/identity')

module.exports = async function (fastify, opts) {
  fastify.get('/findUser', async function (request, reply) {
    const user = await findUser(fastify, 'github', '12345')
    if (user) {
      reply.send(user)
    } else {
      reply.code(404).send('User not found')
    }
  })

  fastify.get('/getUser', async function (request, reply) {
    const user = await getUser(fastify, 'c90249e3-9b4f-4dc3-8cc9-daa2ef0a806d')
    if (user) {
      reply.send(user)
    } else {
      reply.code(404).send('User not found')
    }
  })

  fastify.get('/blarp', async function (request, reply) {
    const roles = await getUserRoles(fastify, 1)
    if (roles) {
      reply.send(roles)
    } else {
      reply.code(500).send('Something is off')
    }
  })
}
