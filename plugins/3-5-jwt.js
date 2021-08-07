'use strict'

const fp = require('fastify-plugin')

/**
 * @see https://github.com/fastify/fastify-jwt
 */
module.exports = fp(async function (fastify, opts) {
  fastify.log.info('loading fastify-jwt')
  fastify.register(require('fastify-jwt'), {
    secret: process.env.JWT_SECRET,
    sign: {
      issuer: 'HappySpiritPublishing.com',
    },
    verify: {
      issuer: 'HappySpiritPublishing.com',
    },
  })

  // fastify.addHook('onRequest', async (request, reply) => {
  //   try {
  //     await request.jwtVerify()
  //   } catch (err) {
  //     reply.send(err)
  //   }
  // })

  fastify.addHook('preValidation', async (request, reply) => {
    try {
      const payload = await request.jwtVerify()
      request.user = payload
      console.log('payload', payload)
    } catch (err) {
      return err
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
