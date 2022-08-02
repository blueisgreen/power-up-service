const fp = require('fastify-plugin')
const jwt = require('@fastify/jwt')

/**
 * @see https://github.com/fastify/fastify-jwt
 */
module.exports = fp(async function (fastify, opts) {
  const { log } = fastify
  log.debug('loading fastify-jwt')

  fastify.register(jwt, {
    secret: process.env.JWT_SECRET,
    sign: {
      issuer: 'HappySpiritPublishing.com',
      expiresIn: '365d',
    },
    verify: {
      issuer: 'HappySpiritPublishing.com',
    },
    cookie: {
      cookieName: 'token',
    },
  })

  fastify.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.send(err)
    }
  })
})
