'use strict'

const fp = require('fastify-plugin')

/**
 * @see https://github.com/fastify/fastify-jwt
 */
module.exports = fp(async function (fastify, opts) {
  const { log } = fastify

  log.info('loading fastify-jwt')
  fastify.register(require('fastify-jwt'), {
    secret: process.env.JWT_SECRET,
    sign: {
      issuer: 'HappySpiritPublishing.com',
    },
    verify: {
      issuer: 'HappySpiritPublishing.com',
    },
    cookie: {
      cookieName: 'token',
    },
  })

  fastify.addHook('preValidation', async (request, reply) => {
    try {
      const payload = await request.jwtVerify()
      log.debug(`payload: ${JSON.stringify(payload)}`)
      request.user = payload.user
    } catch (err) {
      // reply.send(err)
    }
  })

  fastify.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.send(err)
    }
  })
})
