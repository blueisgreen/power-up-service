'use strict'
const fp = require('fastify-plugin')

module.exports = fp(
  async function (fastify, options, next) {
    const uuidv4 = require('uuid').v4
    const { log } = fastify
    log.info('loading useful decorators')

    fastify.decorateRequest('anonymous', true)
    fastify.decorateRequest('userKey', null)
    fastify.decorateRequest('userContext', null)
    fastify.decorateRequest('tracker', 'coming soon')

    fastify.addHook('onRequest', async (request, reply) => {
      try {
        log.debug(`client sent these cookies: ${JSON.stringify(request.cookies)}`)
        await request.jwtVerify()
        log.debug(`found valid session token ${JSON.stringify(request.user)}`)
        request.anonymous = false
        request.userKey = request.user.who
        request.userContext = await fastify.data.identity.getUserContext(
          request.user.who
        )
        log.debug('user context: ' + request.userContext)
      } catch (err) {
        log.debug(err)
      }

      // FIXME: tracker cookie is not being returned
      request.tracker = request.cookies.tracker
      if (!request.tracker) {
        // request.tracker = `tr:${uuidv4()}`
        request.tracker = 'boo'
        reply.setCookie('tracker', request.tracker, fastify.uiCookieOptions)
      }

      // leave proof that were we there
      reply.setCookie('touched', new Date(), fastify.uiCookieOptions)
    })

    fastify.decorate('preValidation', async (request, reply) => {
      // TODO: expand to role-based access
      log.debug('require known user')
      if (!request.userContext.userKey) {
        reply.code(401)
        reply.send('You must be signed in for that')
      }
    })
  },
  {
    fastify: '3.x',
    name: 'powerup-decorators',
  }
)
