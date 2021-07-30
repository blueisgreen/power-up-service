'use strict'

const fp = require('fastify-plugin')

/**
 * This plugin handles helps enable CORS.
 *
 * @see https://github.com/fastify/fastify-cors
 */
module.exports = fp(async function (fastify, opts) {
  fastify.log.info('loading fastify-cors')
  fastify.register(require('fastify-cors'), { origin: '*' })
})
