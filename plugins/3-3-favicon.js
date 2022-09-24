const fp = require('fastify-plugin')

const favicon = require('fastify-favicon')
/**
 * This plugin handles favicon service.
 *
 * @see https://github.com/smartiniOnGitHub/fastify-favicon
 */
module.exports = fp(async function (fastify, opts) {
  fastify.log.debug('loading fastify-favicon')
  fastify.register(favicon, {
    path: './public',
    name: 'favicon.ico',
    errorHandler: false,
  })
})
