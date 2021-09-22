'use strict'

module.exports = async function (fastify, opts) {
  const knex = fastify.knex
  const tableName = 'system_codes'

  fastify.get('/', async (req, reply) => {
    const articles = await knex(tableName).select()
    reply.send(articles)
  })
}
