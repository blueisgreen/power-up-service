'use strict'

const GOTO_HOME = 'home'  // FIXME: extract method from github login to determine redirect target
const validProviderIds = ['github']

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    const { log } = fastify
    const pid = request.query.pid

    if (!request.anonymous) {
      log.info(`sign in ${request.userKey}`)

      // find user with given ID and identity provider
      const user = await fastify.data.identity.findUserWithPublicId(
        request.userKey,
        pid
      )
      if (user !== null) {
        log.debug(`found user ${JSON.stringify(user)}`)

        // do i have a session token?
        const token = await fastify.data.identity.findSessionToken(
          user.userKey
        )
        if (token) {
          log.debug(`found session token ${token}`)
          const validToken = fastify.jwt.verify(token)
          if (validToken) {
            log.debug(`session token found: ${JSON.stringify(validToken)}`)
            const who = validToken.who

            reply.setCookie('who', who, fastify.uiCookieOptions)
            reply.setCookie('token', token, fastify.secreteCookieOptions)
            reply.header('Authorization', `Bearer ${token}`)
            reply.redirect(
              `${process.env.SPA_LANDING_URL}?token=${token}&goTo=${GOTO_HOME}`
            )
            return
          } else {
            log.warn(`stored session token not valid: ${JSON.stringify(token)}`)
          }
        } else {
          log.debug(`no session token found for ${request.userKey}`)
        }
      }
    }

    // if not handled, fall through to last resort
    log.info('sign in unknown user')
    const isSupportedProvider = validProviderIds.includes(pid)

    if (isSupportedProvider) {
      log.debug(`authenticate with provider: ${pid}`)
      reply.clearCookie('who')
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
