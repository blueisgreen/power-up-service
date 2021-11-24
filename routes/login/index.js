'use strict'

const { findUserWithIdProvider } = require('../../db/access/identity')
const GOTO_HOME = 'home'
const validProviderIds = ['github']

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    if (!request.anonymous) {
      fastify.log.info(`sign in ${request.userId}`)

      // find user with given ID and identity provider
      const user = await findUserWithIdProvider(
        fastify,
        request.query.pid,
        request.userId
      )
      if (user !== null) {
        fastify.log.info(`found user ${JSON.stringify(user)}`)

        // do i have a session token?
        const token = user.session_token
        if (token) {
          fastify.log.info(`found session token ${token}`)

          const validToken = fastify.jwt.verify(token)
          if (validToken) {
            fastify.log.info(JSON.stringify(validToken))
            const who = validToken.who

            reply.setCookie('who', who, fastify.cookieOptions)
            reply.setCookie('token', token, fastify.cookieOptions)
            reply.header('Authorization', `Bearer ${token}`)
            reply.redirect(
              `${process.env.SPA_LANDING_URL}?token=${token}&goTo=${GOTO_HOME}`
            )
            return
          } else {
            fastify.log.warn('jwt token not valid')
            fastify.log.warn(validToken)
          }
        }

        // FIXME no token or not valid (i.e., refresh didn't work)?

        // redirect to authenticate

        reply.send({ user: user })
      }
    } else {
      fastify.log.info('sign in unknown user')
      const providerId = request.query.pid
      const isSupportedProvider = validProviderIds.includes(providerId)

      if (isSupportedProvider) {
        fastify.log.info(`authenticate with provider: ${providerId}`)
        reply.redirect(`/login/${providerId}`)
        return
      } else {
        const errorMsg = 'unsupported identity provider: ' + providerId
        fastify.log.error(errorMsg)
        reply.code(500)
        reply.send(errorMsg)
        return
      }
    }
  })
}
