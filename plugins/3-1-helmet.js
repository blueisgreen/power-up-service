const fp = require('fastify-plugin')
const helmet = require('@fastify/helmet')

/**
 * This plugin handles things in the header.
 *
 * @see https://github.com/fastify/fastify-helmet
 */
module.exports = fp(async function (fastify, opts) {
  fastify.log.debug('loading fastify-helmet')
  fastify.register(
    helmet,
    // Example disables the `contentSecurityPolicy` middleware but keeps the rest.
    { global: true }
  )
})
