'use strict'

module.exports = async function (fastify, opts) {
  const genericErrorMsg = {
    error: 'Bad news, kiddies. Something went wrong with the database.',
  }

  fastify.get(
    '/',
    {
      // FIXME: make sure user is admin
      preValidation: [fastify.preValidation],
    },
    async (req, reply) => {
      // const articles = await knex(tableName)
      //   .select(columnsToReturn)
      //   .orderBy('created_at', 'desc')
      // reply.send(articles)

      return request.userContext
    }
  )

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
    const userInfo = await fastify.data.identity.getUserWithPublicId(
      req.userKey
    )
    const author = userInfo.alias || 'A. Nonymous'
    console.log(author)

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
