'use strict'

const { findUserWithIdProvider } = require('../../db/access/identity')
const GOTO_HOME = 'home'

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    if (!request.anonymous) {
      fastify.log.info(`i see you ${request.userId}`)

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

          // FIXME is it still valid?
          const validToken = await fastify.jwt.verify(token)
          if (validToken) {
            fastify.log.info(validToken)

            reply.setCookie('who', user.public_id, fastify.cookieOptions)
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
      const providerId = request.query.pid
      fastify.log.info(`identity provider to use ${providerId}`)

      reply.send({ isAnonymous: request.anonymous })
    }
  })
}
