'use strict'
const fp = require('fastify-plugin')

module.exports = fp(
  async function (fastify, options, next) {
    const uuidv4 = require('uuid').v4
    const { log } = fastify
    log.info('loading useful decorators')

    fastify.decorateRequest('anonymous', true)
    fastify.decorateRequest('userKey', null)
    fastify.decorateRequest('tracker', null)
    fastify.decorateRequest('userContext', null)

    fastify.addHook('onRequest', async (request, reply) => {
      // see if we know who this is
      try {
        await request.jwtVerify()
        log.debug(`found valid session token ${JSON.stringify(request.user)}`)
        request.anonymous = false
        request.userKey = request.user.user.who
        log.debug(request.userKey + ' is the public key of the user')
        request.userContext = await fastify.data.identity.getUserContext(
          request.user.user.who
        )
        log.debug('user ' + request.userContext)
      } catch (err) {
        log.debug('session token not found or invalid: ' + err)
        request.anonymous = true
      }

      request.tracker = request.cookies.tracker
      if (!request.tracker) {
        request.tracker = `tr:${uuidv4()}`
        reply.setCookie('tracker', request.tracker, fastify.uiCookieOptions)
      }

      // leave cookies as a reminder
      reply.setCookie('touched', new Date(), fastify.uiCookieOptions)
    })

    fastify.decorate('preValidation', async (request, reply) => {
      // TODO: expand to role-based access
      log.debug('checking for userKey on request')
      if (!request.userContext.userKey) {
        reply.code(401)
        reply.send('You must be signed in for that')
      }
    })
  },
  {
    fastify: '4.x',
    name: 'powerup-decorators',
  }
)
