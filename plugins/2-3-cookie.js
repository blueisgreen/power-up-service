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

  fastify.decorateRequest('userID', '')
  fastify.decorateRequest('anonymous', false)
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

  fastify.addHook('onRequest', async (request, reply) => {
    fastify.log.debug('evaluating cookies')

    // look for a cookie that IDs the user
    const userId = request.cookies.who
    if (userId && userId !== 'undefined') {
      fastify.log.info(`user is ${userId}`)
      request.anonymous = false
      request.userId = userId
    } else {
      // handle anonymous
      fastify.log.info('anonymous user')
      request.anonymous = true
    }

    reply.setCookie('latestApiCall', new Date(), fastify.cookieOptionsForUI)
  })
})
