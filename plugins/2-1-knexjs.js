'use strict'

const fp = require('fastify-plugin')
const db = require('../db')

/**
 * @see https://github.com/smartiniOnGitHub/fastify-knexjs
 */
module.exports = fp(async function (fastify, opts) {
  fastify.log.info('loading fastify-knexjs')
  fastify.register(
    require('fastify-knexjs'),
    {
      client: 'pg',
      debug: true,
      version: '8.6',
      connection: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    },
    (err) => {
      fastify.log.error(err)
    }
  )
  // if (process.env.REBUILD_SCHEMA) db.rebuildSchema()
})
