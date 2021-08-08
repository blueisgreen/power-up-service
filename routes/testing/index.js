'use strict'

const { findUser, getUser, grantRoles } = require('../../db/identity')

module.exports = async function (fastify, opts) {
  // fastify.get('/findUser', async function (request, reply) {
  //   const user = await findUser(fastify, 'github', '12345')
  //   if (user) {
  //     reply.send(user)
  //   } else {
  //     reply.code(404).send('User not found')
  //   }
  // })

  // fastify.get('/getUser', async function (request, reply) {
  //   const user = await getUser(fastify, 'c90249e3-9b4f-4dc3-8cc9-daa2ef0a806d')
  //   if (user) {
  //     reply.send(user)
  //   } else {
  //     reply.code(404).send('User not found')
  //   }
  // })

  fastify.get('/blargy', async function (request, reply) {
    const roles = await grantRoles(fastify, 'abcde-12345-abcde-12345-whaaa', [
      'member',
      'editorInChief',
      'admin',
    ])
    console.log(roles)
    if (roles) {
      reply.send(roles)
    } else {
      reply.code(500).send('Something is off')
    }
  })
}
