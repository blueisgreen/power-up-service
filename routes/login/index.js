'use strict'

const { findUserWithIdProvider } = require('../../db/access/identity')

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
        fastify.log.info(`found user ${user}`)

        // do i have a session token?
        const token = user.session_token
        if (token) {
          fastify.log.info(`found session token ${token}`)

          // is it still valid?

          reply.setCookie('token', token, fastify.cookieOptions)
          reply.send({ token })
          return

          // FIXME need to refresh?
        }

        // no token or not valid (i.e., refresh didn't work)?

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
