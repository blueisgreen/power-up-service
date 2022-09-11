const fp = require('fastify-plugin')
const cors = require('@fastify/cors')

/**
 * This plugin handles helps enable CORS.
 *
 * @see https://github.com/fastify/fastify-cors
 */
module.exports = fp(async function (fastify, opts) {
  fastify.log.debug('loading fastify-cors')
  fastify.register(cors, { origin: '*' })
})
