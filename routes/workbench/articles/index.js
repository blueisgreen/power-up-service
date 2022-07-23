'use strict'

module.exports = async function (fastify, opts) {
  const { log } = fastify
  const genericErrorMsg = {
    error: 'Bad news, kiddies. Something went wrong.',
  }

  fastify.get('/', async (req, reply) => {
    const articles = await fastify.data.article.getMyArticles(
      req.userContext.userId
    )
    if (articles) {
      reply.send(articles)
    } else {
      reply.code(404).send('No articles found')
    }
  })

  fastify.get('/full', async (req, reply) => {
    const articles = await fastify.data.article.getArticlesFullInfo()
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
    const articleInfo = await fastify.data.article.createArticle(
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
      ? await fastify.data.article.getArticleContentForEditor(req.params.id)
      : await fastify.data.article.getArticleContent(
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
    const { params, body } = req
    try {
      const changes = {
        headline: body.headline,
        byline: body.byline,
        coverArtUrl: body.coverArtUrl,
        synopsis: body.synopsis,
        content: body.content,
      }
      const result = await fastify.data.article.updateArticle(
        params.id,
        changes
      )
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
        result = await fastify.data.article.publishArticle(articleId)
      } else {
        result = await fastify.data.article.requestToPublishArticle(articleId)
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
      const result = await fastify.data.article.retractArticle(req.params.id)
      if (result) {
        reply.send(result)
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
      const result = await fastify.data.article.reviveArticle(req.params.id)
      if (result) {
        reply.send(result)
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
      const result = await fastify.data.article.archiveArticle(req.params.id)
      if (result) {
        reply.send(result)
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
      await fastify.data.article.purgeArticle(req.params.id)
      reply.code(204).send()
    } catch (err) {
      fastify.log.error(err)
      reply.code(500).send(genericErrorMsg)
    }
  })
}
