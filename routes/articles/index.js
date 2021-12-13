'use strict'

module.exports = async function (fastify, opts) {
  const knex = fastify.knex
  const tableName = 'articles'

  const genericErrorMsg = {
    error: 'Bad news, kiddies. Something went wrong with the database.',
  }
  const columnsToReturn = [
    'id',
    'headline',
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

  fastify.post('/', async (req, reply) => {
    // look up alias or whatever a good default value for byline would be
    // const author = req.user | 'Lord of the Galaxy'
    const author = 'Lord of the Galaxy'
    console.log(author)
    // const alias = await knex('users')
    //   .select('alias')
    //   .where('public_id', '=', author.public_id)
    // console.log('screen name', alias)

    const given = req.body
    const row = {
      ...given,
      byline: author,
    }
    delete row.id
    try {
      const result = await knex(tableName).insert(row, columnsToReturn)
      reply.code(201).send(result[0])
    } catch (err) {
      fastify.log.error(err)
      reply.code(500).send(genericErrorMsg)
    }
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

  fastify.put('/:id', async (req, reply) => {
    try {
      const now = new Date()
      const given = req.body
      const result = await knex(tableName)
        .where('id', req.params.id)
        .update({
          headline: given.headline,
          byline: given.byline,
          cover_art_url: given.coverArtUrl,
          synopsis: given.synopsis,
          content: given.content,
          updated_at: now,
        })
        .returning(columnsToReturn)
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

  fastify.put('/:id/publish', async (req, reply) => {
    try {
      const now = new Date()
      const result = await knex(tableName)
        .where('id', req.params.id)
        .update({
          published_at: now,
        })
        .returning(columnsToReturn)
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

  fastify.put('/:id/retract', async (req, reply) => {
    try {
      const result = await knex(tableName)
        .where('id', req.params.id)
        .update({
          published_at: null,
        })
        .returning(columnsToReturn)
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

  fastify.put('/:id/revive', async (req, reply) => {
    try {
      const result = await knex(tableName)
        .where('id', req.params.id)
        .update({
          archived_at: null,
        })
        .returning(columnsToReturn)
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

  fastify.delete('/:id', async (req, reply) => {
    try {
      const now = new Date()
      const result = await knex(tableName)
        .where('id', req.params.id)
        .update({
          archived_at: now,
        })
        .returning(columnsToReturn)
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

  fastify.delete('/:id/purge', async (req, reply) => {
    try {
      const result = await knex(tableName).where('id', req.params.id).delete()
      reply.code(204).send()
    } catch (err) {
      fastify.log.error(err)
      reply.code(500).send(genericErrorMsg)
    }
  })
}
