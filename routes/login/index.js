const { loginParams } = require('./schema')

module.exports = async function (fastify, opts) {
  const { log } = fastify

  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['authentication'],
      description: 'ID user and establish session.',
      query: loginParams,
      response: {},
    },
    handler: async (request, reply) => {
      const { pid } = request.query
      if (request.anonymous) {
        // user needs to be authenticated
        reply.redirect(`/login/${pid}`)
        return
      }

      const { userKey, alias, roles } = request.userContext
      const foundOnPlatform = await fastify.data.identity.isUserOnPlatform(
        userKey,
        pid
      )
      if (!foundOnPlatform) {
        // user needs to be authenticated by requested auth platform
        reply.redirect(`/login/${pid}`)
        return
      }
      log.debug('we know who this is')
      fastify.auth.handleLoginReply(reply, userKey, alias, roles, 'home')

      // TODO: check for expirations; refresh auth tokens
      // TODO: track login - see auth plugin for related TODO
    },
  })
}
