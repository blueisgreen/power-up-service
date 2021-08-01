'use strict'

const { rebuildSchema } = require('../../../db')

module.exports = async function (fastify, opts) {
  const { log } = fastify

  fastify.put('/rebuildSchema', async (req, reply) => {
    let msgOut = { message: 'Unknown status', code: 500 }
    try {
      if (
        process.env.REBUILD_SCHEMA === 'true' ||
        process.env.REBUILD_SCHEMA === '1'
      ) {
        await rebuildSchema(fastify)
        msgOut = {
          message: 'Created shiny new schema.',
          code: 200,
        }
      } else {
        msgOut = {
          message: 'Rebuild not permitted at this time.',
          code: 200,
        }
      }
    } catch (err) {
      msgOut = {
        message: `Houston, we have a problem: ${err.message}`,
        code: 500
      }
      return
    } finally {
      log.info(msgOut)
      reply.code(msgOut.code).send(msgOut.message)
    }
  })
}
