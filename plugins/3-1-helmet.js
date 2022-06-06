'use strict'

const fp = require('fastify-plugin')

/**
 * This plugin handles things in the header.
 *
 * @see https://github.com/fastify/fastify-helmet
 */
module.exports = fp(async function (fastify, opts) {
  fastify.log.info('loading fastify-helmet')
  fastify.register(
    require('@fastify/helmet'),
    // Example disables the `contentSecurityPolicy` middleware but keeps the rest.
    { contentSecurityPolicy: false }
  )
})
