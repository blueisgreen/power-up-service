const fp = require('fastify-plugin')
const axios = require('fastify-axios')

/**
 * @see https://www.npmjs.com/package/fastify-axios
 */
module.exports = fp(async function (fastify, opts) {
  fastify.log.debug('loading fastify-axios')
  fastify.register(axios)
})
