const fp = require('fastify-plugin')
const cookiePlugin = require('fastify-cookie')
const uuidv4 = require('uuid').v4

const anonPrefix = 'jd-'

module.exports = fp(async function (fastify, opts) {
  fastify.log.info('loading fastify-cookie')

  fastify.register(cookiePlugin, {
    secret: 'chocolateChip', // for cookies signature
    parseOptions: {}, // options for parsing cookies
  })

  fastify.decorateRequest('userID', '')
  fastify.decorateRequest('anonymous', false)

  fastify.addHook('onRequest', async (request, reply) => {
    fastify.log.info('evaluating cookies')

    // look for a cookie that IDs the user
    let userId = request.cookies.who

    // create an ID for anonymous users
    if (!userId) {
      fastify.log.info('unknown user - creating ID')
      userId = `${anonPrefix}${uuidv4()}`
      const cookieOptions = {
        path: '/',
        sameSite: 'Strict',
        httpOnly: true,
      }
      reply.setCookie('who', userId, cookieOptions)
    }

    // see if user is anonymous
    if (userId.startsWith(anonPrefix)) {
      request.anonymous = true
    }

    request.userID = userId
    fastify.log.info(`user ID is ${userId}`)
  })
})
