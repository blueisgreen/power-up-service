'use strict'

const { findUser, getUser, registerUser } = require('../../db/identity')

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
    const user = await getUser(
      fastify,
      'c90249e3-9b4f-4dc3-8cc9-daa2ef0a806d'
    )
    if (user) {
      reply.send(user)
    } else {
      reply.code(404).send('User not found')
    }
  })

  fastify.post('/blarp', async function (request, reply) {
    const user = await registerUser(fastify, 'github', {
      id: 12345,
      email: 'blargy@blargy.com',
      name: 'Blargy2 Blargy',
      avatar_url: 'http://avatarsrus.com/blargy2',
      extra: 'wampas',
      fun_fact: 'love exploring active underwater volcanos',
    })
    if (user) {
      reply.send(user)
    } else {
      reply.code(500).send('Something is off')
    }
  })
}
