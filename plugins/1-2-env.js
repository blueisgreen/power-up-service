const fp = require('fastify-plugin')
const env = require('@fastify/env')

const options = {
  dotenv: true,
  schema: {
    type: 'object',
    required: ['PORT', 'DATABASE_URL', 'JWT_SECRET', 'COOKIE_DOMAIN'],
    properties: {
      PORT: {
        type: 'string',
        default: 3000,
      },
      DATABASE_URL: {
        type: 'string',
        default: 'noDB',
      },
      JWT_SECRET: {
        type: 'string',
      },
      COOKIE_DOMAIN: {
        type: 'string',
      },
    },
  },
}

/**
 * @see https://github.com/fastify/fastify-env
 */
module.exports = fp(async function (fastify, opts) {
  fastify.log.debug('loading @fastify/env')
  fastify.register(env, options)
})
