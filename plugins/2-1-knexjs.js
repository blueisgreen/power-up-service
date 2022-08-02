const fp = require('fastify-plugin')
const knex = require('fastify-knexjs')

/**
 * @see https://github.com/smartiniOnGitHub/fastify-knexjs
 */
module.exports = fp(async function (fastify, opts) {
  const { log } = fastify
  log.debug('loading fastify-knexjs')
  fastify.register(
    knex,
    {
      client: 'pg',
      debug: true,
      version: '8.7',
      connection: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    },
    (err) => {
      log.error(err)
    }
  )
})
