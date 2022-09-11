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

      // TODO: check for expirations; refresh auth tokens

      const token = fastify.jwt.sign({
        user: {
          who: userKey,
          alias,
          roles,
        },
      })
      await fastify.data.identity.setSessionToken(userKey, token)
      reply.setCookie('token', token, fastify.secretCookieOptions)
      reply.redirect(`${process.env.SPA_LANDING_URL}?goTo=home&token=${token}`)
    },
  })
}
