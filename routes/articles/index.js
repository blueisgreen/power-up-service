'use strict'

/**
 * For read-only access to library of articles by any user. Also
 * this will be a good place to receive ratings and feedback
 * about articles.
 *
 * @param {*} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
  const knex = fastify.knex
  const tableName = 'articles'

  const genericErrorMsg = {
    error: 'Bad news, kiddies. Something went wrong with the database.',
  }
  const columnsToReturn = [
    'id',
    'headline',
    'author_id as authorId',
    'byline',
    'cover_art_url as coverArtUrl',
    'synopsis',
    'content',
    'created_at as createdAt',
    'updated_at as updatedAt',
    'published_at as publishedAt',
    'archived_at as archivedAt',
  ]

  fastify.get('/', async (req, reply) => {
    const articles = await knex(tableName)
      .select(columnsToReturn)
      .orderBy('created_at', 'desc')
    reply.send(articles)
  })

  fastify.get('/published', async (req, reply) => {
    const articles = await knex(tableName)
      .whereNull('archived_at')
      .whereNotNull('published_at')
      .select(columnsToReturn)
      .orderBy('created_at', 'desc')
    reply.send(articles)
  })

  fastify.get('/archived', async (req, reply) => {
    const articles = await knex(tableName)
      .whereNotNull('archived_at')
      .select(columnsToReturn)
      .orderBy('created_at', 'desc')
    reply.send(articles)
  })

  fastify.get('/:id', async (req, reply) => {
    try {
      const result = await knex(tableName)
        .select(columnsToReturn)
        .where('id', req.params.id)
      if (result.length > 0) {
        reply.send(result[0])
      } else {
        reply.code(404).send()
      }
    } catch (err) {
      fastify.log.error(err)
      reply.code(500).send(genericErrorMsg)
    }
  })

}
