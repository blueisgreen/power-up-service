const fp = require('fastify-plugin')
const cookiePlugin = require('fastify-cookie')

module.exports = fp(async function (fastify, opts) {
  const { log } = fastify

  log.info('loading fastify-cookie')

  fastify.register(cookiePlugin, {
    secret: 'chocolateChip', // for cookies signature
    parseOptions: {}, // options for parsing cookies
  })

  let expDate = new Date()
  expDate.setDate(expDate.getDate() + 365)

  fastify.decorate('secretCookieOptions', {
    path: '/',
    sameSite: 'Strict',
    httpOnly: true,
    expires: expDate,
  })
  fastify.decorate('uiCookieOptions', {
    path: '/',
    sameSite: 'Strict',
    expires: expDate,
  })
  fastify.decorateRequest('userKey', '') // user's public ID
  fastify.decorateRequest('anonymous', true)

  fastify.addHook('onRequest', async (request, reply) => {
    log.debug('evaluating cookies')

    // look for a cookie that IDs the user
    const userKey = request.cookies.who

    if (userKey && userKey !== 'undefined') {
      log.info(`user is ${userKey}`)
      request.anonymous = false
      request.userKey = userKey
    } else {
      // handle anonymous
      log.debug('anonymous user')
      request.anonymous = true
    }

    log.debug(`request: ${JSON.stringify(request.headers)}`)
    if (sessionToken) {
      request.tokenFromCookie = sessionToken
    }

    reply.setCookie('touched', new Date(), fastify.uiCookieOptions)
  })
})
