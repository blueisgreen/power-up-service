const fp = require('fastify-plugin')
const fastifyGuard = require('fastify-guard')

/**
 * @see https://github.com/hsynlms/fastify-guard
 */
module.exports = fp(async function (fastify, opts) {
  const { log } = fastify
  log.debug('loading fastify-guard')

  fastify.register(fastifyGuard, {
    requestProperty: 'userContext',
    roleProperty: 'roles',
    errorHandler: (result, req, reply) => {
      return reply.send('I hear you knocking, but no soup for you.')
    },
  })
})
