const fp = require('fastify-plugin')
const cookiePlugin = require('fastify-cookie')

module.exports = fp(async function (fastify, opts) {
  fastify.log.info('loading fastify-cookie')

  fastify.register(cookiePlugin, {
    secret: 'chocolateChip', // for cookies signature
    parseOptions: {}, // options for parsing cookies
  })

  let expDate = new Date()
  expDate.setDate(expDate.getDate() + 30)

  fastify.decorate('cookieOptions', {
    path: '/',
    sameSite: 'Strict',
    httpOnly: true,
    expires: expDate,
  })
  fastify.decorate('cookieOptionsForUI', {
    path: '/',
    sameSite: 'Strict',
    expires: expDate,
  })
  fastify.decorateRequest('userKey', '')  // user's public ID
  fastify.decorateRequest('anonymous', true)

  fastify.addHook('onRequest', async (request, reply) => {
    fastify.log.debug('evaluating cookies')

    // look for a cookie that IDs the user
    const userKey = request.cookies.who
    if (userKey && userKey !== 'undefined') {
      fastify.log.info(`user is ${userKey}`)
      request.anonymous = false
      request.userKey = userKey
    } else {
      // handle anonymous
      fastify.log.info('anonymous user')
      request.anonymous = true
    }

    reply.setCookie('latestApiCall', new Date(), fastify.cookieOptionsForUI)
  })
})
