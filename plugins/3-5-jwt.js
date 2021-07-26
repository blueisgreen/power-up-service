'use strict'

const fp = require('fastify-plugin')

/**
 * @see https://github.com/fastify/fastify-jwt
 */
module.exports = fp(async function (fastify, opts) {
  fastify.log.info('loading fastify-jwt')
  fastify.register(require('fastify-jwt'), {
    secret: 'supersecret',
  })
})