'use strict'

const { findUserWithIdProvider, findSessionToken } = require('../../db/access/identity')
const GOTO_HOME = 'home'
const validProviderIds = ['github']

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    const { log } = fastify
    const pid = request.query.pid

    if (!request.anonymous) {
      log.info(`sign in ${request.userId}`)

      // find user with given ID and identity provider
      const user = await findUserWithIdProvider(fastify, pid, request.userId)
      if (user !== null) {
        log.info(`found user ${JSON.stringify(user)}`)

        // do i have a session token?
        const token = await findSessionToken(user.public_id)
        if (token) {
          log.info(`found session token ${token}`)

          const validToken = fastify.jwt.verify(token)

          // TODO: verify that who in token matches user id in request (from cookie)
          if (validToken) {
            log.info(JSON.stringify(validToken))
            const who = validToken.who

            reply.setCookie('who', who, fastify.cookieOptions)
            reply.setCookie('token', token, fastify.cookieOptions)
            reply.header('Authorization', `Bearer ${token}`)
            reply.redirect(
              `${process.env.SPA_LANDING_URL}?token=${token}&goTo=${GOTO_HOME}`
            )
            return
          } else {
            log.warn(`stored token not valid: ${JSON.stringify(token)}`)
          }
        } else {
          log.info('no token found')
        }
      }
    }

    // if not handled, fall through to last resort
    log.info('sign in unknown user')
    const isSupportedProvider = validProviderIds.includes(pid)

    if (isSupportedProvider) {
      log.info(`authenticate with provider: ${pid}`)
      reply.redirect(`/login/${pid}`)
      return
    } else {
      const errorMsg = 'unsupported identity provider: ' + pid
      log.error(errorMsg)
      reply.code(500)
      reply.send(errorMsg)
      return
    }
  })
}
