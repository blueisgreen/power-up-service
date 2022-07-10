'use strict'

module.exports = async function (fastify, opts) {
  const { log } = fastify
  const genericErrorMsg = {
    error: 'Bad news, kiddies. Something went wrong.',
  }

  fastify.get('/', async (req, reply) => {
    const articles = await fastify.data.workbench.getArticles(
      req.userContext.userId
    )
    if (articles) {
      reply.send(articles)
    } else {
      reply.code(404).send('No articles found')
    }
  })

  fastify.get('/pending', async (req, reply) => {
    let articles = null
    if (req.userContext.roles.editor) {
      articles = await fastify.data.workbench.getArticlesPendingReview()
    }
    if (articles) {
      reply.send(articles)
    } else {
      reply.code(404).send('No articles found')
    }
  })

  fastify.post('/', async (req, reply) => {
    const userInfo = await fastify.data.identity.getUserWithPublicId(
      req.userKey
    )
    const headline = req.body.headline
    const byline = userInfo.alias || 'A. Nonymous'
    const articleInfo = await fastify.data.workbench.createArticle(
      headline,
      userInfo.id,
      byline
    )
    if (articleInfo) {
      reply.code(201).send(articleInfo)
    } else {
      reply.code(500).send(genericErrorMsg)
    }
  })

  fastify.get('/:id', async (req, reply) => {
    const article = req.userContext.roles.editor
      ? await fastify.data.workbench.getArticleContentForEditor(req.params.id)
      : await fastify.data.workbench.getArticleContent(
          req.params.id,
          req.userContext.userId
        )
    if (article) {
      reply.send(article)
    } else {
      reply.code(404).send()
    }
  })

  fastify.put('/:id', async (req, reply) => {
    try {
      log.debug('===called article update===')
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
      const articleId = req.params.id
      let result
      if (
        req.userContext.roles.editor ||
        (req.userContext.roles.author &&
          req.userContext.authorStatus === 'trusted')
      ) {
        result = await fastify.data.workbench.publishArticle(articleId)
      } else {
        result = await fastify.data.workbench.requestToPublishArticle(articleId)
      }

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
      const result = await fastify.data.workbench.retractArticle(req.params.id)
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
