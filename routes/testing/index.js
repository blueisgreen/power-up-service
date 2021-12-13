'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/doit', async function (request, reply) {
    const result = await fastify.datatree.identity.findUserWithPublicId(request.userId, 'github')
    fastify.log.info(fastify.datatree.support)
    // reply.send(JSON.stringify(fastify.lookups.platforms))
    // if (result) {
    //   reply.send(result)
    // } else {
    //   reply.code(404).send('Not found')
    // }
  })

  fastify.get('/getUser', async function (request, reply) {
    const user = await fastify.data.identity.getUser('c90249e3-9b4f-4dc3-8cc9-daa2ef0a806d')
    if (user) {
      reply.send(user)
    } else {
      reply.code(404).send('User not found')
    }
  })

  fastify.get('/blargy', async function (request, reply) {
    const roles = await fastify.data.grantRoles(
      '596b3081-6073-476c-bc9d-d9273ba70f0e',
      ['member', 'editorInChief', 'admin']
    )
    console.log(roles)
    if (roles) {
      reply.send(roles)
    } else {
      reply.code(500).send('Something is off')
    }
  })
}
