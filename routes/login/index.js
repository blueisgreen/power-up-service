'use strict'

const GOTO_HOME = 'home'
const GOTO_REGISTER = 'register'
const supportedIdentityProviders = ['github', 'google', 'linkedin']

const isProviderSupported = (pid) => {
  return supportedIdentityProviders.includes(pid)
}

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    const { log } = fastify
    const pid = request.query.pid

    if (!isProviderSupported(pid)) {
      // FIXME: would be best to redirect to main URL; or don't redirect in the first place by handling this as an API call
      log.warn(`login attempted with unsupported identity provider ${pid}`)
      reply.code(401)
      reply.send("I hear you knocking, but you can't come in.")
      return
    }

    // no go - unknown user and requesting ID provider that is not supported
    if (request.anonymous) {
      // redirect to login route for provider
      reply.redirect(`/login/${pid}`)
      return
    }

    // user is known; refresh token and cookie, and redirect to landing

    // look up social record for given provider
    const user = await fastify.data.identity.findUserWithPublicId(
      request.userKey,
      pid
    )

    // first time with this identity provider?
    if (!user) {
      reply.redirect(`/login/${pid}`)
      return
    }

    log.debug('able to skip identity provider')

    // record login activity - capture user browser context
    const browserContext = `${request.headers['user-agent']} | ${request.headers['referer']}`
    const actionResponse = await fastify.data.action.capture(
      'login',
      browserContext,
      user.public_id
    )

    // refresh token
    const roles = await fastify.data.identity.getUserRoles(user.id)
    const token = fastify.jwt.sign({
      user: {
        who: user.public_id,
        alias: user.alias,
        roles,
      },
    })
    await fastify.data.identity.setSessionToken(user.public_id, token)
    reply.setCookie('token', token, fastify.secretCookieOptions)
    reply.redirect(`${process.env.SPA_LANDING_URL}?goTo=home&token=${token}`)
  })
}

// TODO: handle return-to route name from client and redirect back to that - keep user in place
