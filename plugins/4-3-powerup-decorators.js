'use strict'
const fp = require('fastify-plugin')

module.exports = fp(
  async function (fastify, options, next) {
    const { log } = fastify
    log.info('loading useful decorators')

    fastify.decorateRequest('anonymous', true)
    fastify.decorateRequest('userKey', '')

    fastify.addHook('onRequest', async (request, reply) => {
      // see if we know who this is
      // TODO: expand to help track anonymous users
      try {
        await request.jwtVerify()
        log.debug('found valid session token')
        request.anonymous = false
        request.userKey = request.user.user.who
      } catch (err) {
        log.debug('session token not found or invalid')
        request.anonymous = true
      }

      // leave cookies as a reminder
      reply.setCookie('touched', new Date(), fastify.uiCookieOptions)
    })
  },
  {
    fastify: '3.x',
    name: 'powerup-decorators',
  }
)
